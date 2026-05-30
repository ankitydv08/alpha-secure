import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import type { ScanFinding } from "./secretScanner";

const execAsync = promisify(exec);

interface NpmAuditResult {
  vulnerabilities?: Record<
    string,
    {
      name: string;
      severity: string;
      via: Array<string | { title?: string; url?: string }>;
      range: string;
      nodes: string[];
      fixAvailable: boolean | { name: string; version: string };
    }
  >;
  metadata?: {
    vulnerabilities: {
      critical: number;
      high: number;
      moderate: number;
      low: number;
      info: number;
      total: number;
    };
  };
}

function npmSeverityToFinding(
  npmSeverity: string
): ScanFinding["severity"] {
  switch (npmSeverity.toLowerCase()) {
    case "critical":
      return "CRITICAL";
    case "high":
      return "HIGH";
    case "moderate":
      return "MEDIUM";
    case "low":
      return "LOW";
    default:
      return "INFO";
  }
}

export async function runNpmAudit(
  extractedDir: string
): Promise<ScanFinding[]> {
  const findings: ScanFinding[] = [];

  // Check if package.json exists
  const pkgPath = path.join(extractedDir, "package.json");
  if (!fs.existsSync(pkgPath)) {
    return findings;
  }

  try {
    // Install dependencies first (without running scripts for safety)
    await execAsync("npm install --ignore-scripts --prefer-offline", {
      cwd: extractedDir,
      timeout: 60000,
    }).catch(() => {
      // Ignore install errors, audit may still work with existing node_modules
    });

    const { stdout } = await execAsync("npm audit --json --audit-level=low", {
      cwd: extractedDir,
      timeout: 30000,
    }).catch((err) => {
      // npm audit exits with non-zero when vulnerabilities found — that's expected
      return { stdout: err.stdout || "{}", stderr: "" };
    });

    const auditData: NpmAuditResult = JSON.parse(stdout);

    if (!auditData.vulnerabilities) return findings;

    for (const [pkgName, vuln] of Object.entries(auditData.vulnerabilities)) {
      const viaDetails = vuln.via
        .filter((v) => typeof v === "object")
        .map((v) => {
          const detail = v as { title?: string; url?: string };
          return detail.title || "";
        })
        .filter(Boolean);

      const title =
        viaDetails[0] ||
        `Vulnerable dependency: ${pkgName}`;

      const cveUrls = vuln.via
        .filter((v) => typeof v === "object")
        .map((v) => (v as { url?: string }).url)
        .filter(Boolean)
        .slice(0, 2)
        .join(", ");

      const fixInfo =
        typeof vuln.fixAvailable === "object"
          ? `Update to ${vuln.fixAvailable.name}@${vuln.fixAvailable.version}`
          : vuln.fixAvailable
          ? "Run `npm audit fix`"
          : "No automatic fix available — consider an alternative package";

      findings.push({
        severity: npmSeverityToFinding(vuln.severity),
        title,
        description: `Package "${pkgName}" (versions ${vuln.range}) has a ${vuln.severity} severity vulnerability.${cveUrls ? ` Reference: ${cveUrls}` : ""} Vulnerable packages can be exploited by attackers even if your own code is secure.`,
        filePath: "package.json",
        fixSuggestion: fixInfo,
        source: "npm-audit",
      });
    }
  } catch (err) {
    console.error("npm audit failed:", err);
    // Don't throw — return empty findings if audit fails
  }

  return findings;
}
