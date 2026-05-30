import type { FileMap } from "./frameworkDetector";

export interface ScanFinding {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  title: string;
  description: string;
  filePath?: string;
  lineNumber?: number;
  codeSnippet?: string;
  fixSuggestion?: string;
  source: string;
}

// ─── Secret Patterns ────────────────────────────────────────────────────────

const SECRET_PATTERNS: {
  name: string;
  pattern: RegExp;
  severity: ScanFinding["severity"];
}[] = [
  {
    name: "OpenAI API Key",
    pattern: /sk-[a-zA-Z0-9]{20,}/g,
    severity: "CRITICAL",
  },
  {
    name: "AWS Access Key",
    pattern: /AKIA[0-9A-Z]{16}/g,
    severity: "CRITICAL",
  },
  {
    name: "AWS Secret Key",
    pattern: /aws_secret_access_key\s*=\s*['"]?[A-Za-z0-9/+=]{40}['"]?/gi,
    severity: "CRITICAL",
  },
  {
    name: "Google API Key",
    pattern: /AIza[0-9A-Za-z\-_]{35}/g,
    severity: "CRITICAL",
  },
  {
    name: "Firebase Database URL",
    pattern: /https:\/\/[a-z0-9-]+\.firebaseio\.com/g,
    severity: "HIGH",
  },
  {
    name: "Stripe Secret Key",
    pattern: /sk_live_[0-9a-zA-Z]{24,}/g,
    severity: "CRITICAL",
  },
  {
    name: "Stripe Test Key",
    pattern: /sk_test_[0-9a-zA-Z]{24,}/g,
    severity: "MEDIUM",
  },
  {
    name: "GitHub Token",
    pattern: /ghp_[a-zA-Z0-9]{36}/g,
    severity: "CRITICAL",
  },
  {
    name: "JWT Secret Hardcoded",
    pattern:
      /jwt\.sign\s*\([^,]+,\s*['"`]([^'"`]{1,50})['"`]/g,
    severity: "HIGH",
  },
  {
    name: "Database Password in URL",
    pattern:
      /(?:postgres|mysql|mongodb):\/\/[^:]+:([^@\s]{6,})@/gi,
    severity: "CRITICAL",
  },
  {
    name: "Generic Password Assignment",
    pattern:
      /(?:password|passwd|pwd)\s*[=:]\s*['"`]([^'"`]{6,})['"`]/gi,
    severity: "HIGH",
  },
  {
    name: "Hardcoded API Key Variable",
    pattern:
      /(?:api_key|apikey|api_secret|secret_key)\s*[=:]\s*['"`][a-zA-Z0-9_\-]{10,}['"`]/gi,
    severity: "HIGH",
  },
  {
    name: "SendGrid API Key",
    pattern: /SG\.[a-zA-Z0-9\-_]{22}\.[a-zA-Z0-9\-_]{43}/g,
    severity: "CRITICAL",
  },
  {
    name: "Twilio Auth Token",
    pattern: /SK[a-z0-9]{32}/g,
    severity: "CRITICAL",
  },
];

// Files to skip scanning (binary, build artifacts, etc.)
const SKIP_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".ico",
  ".svg",
  ".mp4",
  ".mp3",
  ".zip",
  ".tar",
  ".gz",
  ".lock",
  ".map",
];
const SKIP_PATHS = [
  "node_modules/",
  ".git/",
  "dist/",
  "build/",
  ".next/",
  "coverage/",
];

// Sensitive filenames that should never be committed
const SENSITIVE_FILES = [
  ".env",
  ".env.production",
  ".env.local",
  ".env.development",
  "id_rsa",
  "id_dsa",
  "*.pem",
  "*.key",
  "*.p12",
  "*.pfx",
  "credentials.json",
  "serviceAccountKey.json",
];

export function runSecretScanner(files: FileMap): ScanFinding[] {
  const findings: ScanFinding[] = [];

  for (const [filePath, content] of Object.entries(files)) {
    // Skip binary/build files
    if (SKIP_PATHS.some((p) => filePath.includes(p))) continue;
    if (SKIP_EXTENSIONS.some((ext) => filePath.endsWith(ext))) continue;

    // Check for sensitive file names
    const fileName = filePath.split("/").pop() || "";
    const isSensitiveFile = SENSITIVE_FILES.some((pattern) => {
      if (pattern.startsWith("*")) {
        return fileName.endsWith(pattern.slice(1));
      }
      return fileName === pattern;
    });

    if (isSensitiveFile && filePath !== ".env.example") {
      findings.push({
        severity: "CRITICAL",
        title: `Sensitive file committed: ${fileName}`,
        description: `The file "${filePath}" contains secrets and should NEVER be committed to version control. This exposes credentials to anyone who can view your repository.`,
        filePath,
        fixSuggestion: `Add "${fileName}" to your .gitignore file. Use environment variables and a secrets manager instead. Immediately rotate any credentials in this file.`,
        source: "secret-scanner",
      });
    }

    // Scan file content for secret patterns
    const lines = content.split("\n");
    for (const { name, pattern, severity } of SECRET_PATTERNS) {
      pattern.lastIndex = 0; // reset regex state
      let match;
      while ((match = pattern.exec(content)) !== null) {
        // Find line number
        const upToMatch = content.substring(0, match.index);
        const lineNumber = upToMatch.split("\n").length;
        const lineContent = lines[lineNumber - 1]?.trim() || "";

        // Redact the actual secret value in snippet
        const redactedSnippet = lineContent.replace(
          /(['"`])([^'"`]{8,})(['"`])/,
          "$1[REDACTED]$3"
        );

        findings.push({
          severity,
          title: `${name} detected`,
          description: `A ${name} was found hardcoded in your source code. If this key is real, it is now exposed and must be rotated immediately.`,
          filePath,
          lineNumber,
          codeSnippet: redactedSnippet,
          fixSuggestion: `Move this value to an environment variable: process.env.${name.toUpperCase().replace(/ /g, "_")}. Never hardcode secrets in source files.`,
          source: "secret-scanner",
        });

        // Avoid duplicate findings on same line
        break;
      }
    }
  }

  return findings;
}
