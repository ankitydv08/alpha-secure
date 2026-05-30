import AdmZip from "adm-zip";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import type { FileMap } from "./frameworkDetector";

// Extensions to read as text
const TEXT_EXTENSIONS = [
  ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs",
  ".json", ".env", ".env.local", ".env.production", ".env.development",
  ".html", ".css", ".scss", ".sass", ".less",
  ".md", ".txt", ".yaml", ".yml", ".toml",
  ".sh", ".bash", ".zsh", ".fish",
  ".gitignore", ".eslintrc", ".prettierrc", ".babelrc",
  ".vue", ".svelte",
];

// Paths to completely skip during extraction
const SKIP_PATHS = [
  "node_modules/",
  ".git/",
  "dist/",
  "build/",
  ".next/",
  "coverage/",
  "__pycache__/",
];

// Blocked file extensions (executables, compiled binaries)
const BLOCKED_EXTENSIONS = [
  ".exe", ".dll", ".so", ".dylib", ".bin",
  ".com", ".bat", ".cmd", ".ps1",
  ".deb", ".rpm", ".pkg", ".dmg", ".iso",
  ".class", ".pyc", ".pyo",
];

const MAX_FILE_SIZE = 1024 * 1024; // 1MB per file
const MAX_FILES = 500;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB

export interface ExtractionResult {
  fileMap: FileMap;
  extractedDir: string;
  fileCount: number;
  totalSize: number;
  warnings: string[];
}

export async function extractZip(
  zipBuffer: Buffer
): Promise<ExtractionResult> {
  const warnings: string[] = [];
  const fileMap: FileMap = {};

  // Create temp directory
  const extractedDir = path.join(os.tmpdir(), `scan-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  fs.mkdirSync(extractedDir, { recursive: true });

  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();

  let fileCount = 0;
  let totalSize = 0;

  for (const entry of entries) {
    if (fileCount >= MAX_FILES) {
      warnings.push(`Only first ${MAX_FILES} files were scanned.`);
      break;
    }

    const entryPath = entry.entryName.replace(/\\/g, "/");

    // Skip directories
    if (entry.isDirectory) continue;

    // Skip paths we don't care about
    if (SKIP_PATHS.some((skip) => entryPath.includes(skip))) continue;

    // Check for path traversal
    const normalizedPath = path.normalize(entryPath);
    if (normalizedPath.startsWith("..")) {
      warnings.push(`Skipped suspicious path: ${entryPath}`);
      continue;
    }

    // Get file extension
    const ext = path.extname(entryPath).toLowerCase();

    // Block executables
    if (BLOCKED_EXTENSIONS.includes(ext)) {
      warnings.push(`Skipped executable file: ${entryPath}`);
      continue;
    }

    const entrySize = entry.header.size;
    totalSize += entrySize;

    if (totalSize > MAX_TOTAL_SIZE) {
      warnings.push("Total extracted size limit reached (50MB).");
      break;
    }

    if (entrySize > MAX_FILE_SIZE) {
      warnings.push(`Skipped large file (>1MB): ${entryPath}`);
      continue;
    }

    try {
      // Extract to disk (for npm audit)
      const fullPath = path.join(extractedDir, entryPath);
      const dir = path.dirname(fullPath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(fullPath, entry.getData());

      // Read text files into memory for regex scanning
      const isText = TEXT_EXTENSIONS.includes(ext) ||
        TEXT_EXTENSIONS.includes(path.basename(entryPath)) ||
        !ext; // files without extension (like Dockerfile, Makefile)

      if (isText) {
        const content = entry.getData().toString("utf8");
        // Strip the common zip root folder prefix (e.g., "myapp-main/index.js" → "index.js")
        const cleanPath = stripZipRootFolder(entryPath, entries.map((e) => e.entryName));
        fileMap[cleanPath] = content;
      }

      fileCount++;
    } catch {
      warnings.push(`Could not read file: ${entryPath}`);
    }
  }

  return { fileMap, extractedDir, fileCount, totalSize, warnings };
}

/**
 * Many ZIPs have a single root folder (e.g. "myapp-main/") — strip it for cleaner paths.
 */
function stripZipRootFolder(entryPath: string, allEntries: string[]): string {
  const topLevelDirs = new Set(
    allEntries.map((e) => e.split("/")[0]).filter(Boolean)
  );
  if (topLevelDirs.size === 1) {
    const rootDir = [...topLevelDirs][0] + "/";
    if (entryPath.startsWith(rootDir)) {
      return entryPath.slice(rootDir.length);
    }
  }
  return entryPath;
}

export function cleanupExtractedDir(dir: string): void {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    // Best effort cleanup
  }
}
