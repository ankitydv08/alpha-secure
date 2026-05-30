import type { FileMap } from "./frameworkDetector";
import type { ScanFinding } from "./secretScanner";

// ─── Dangerous Code Patterns ─────────────────────────────────────────────────

interface CodePattern {
  name: string;
  pattern: RegExp;
  severity: ScanFinding["severity"];
  description: string;
  fix: string;
}

const DANGEROUS_PATTERNS: CodePattern[] = [
  {
    name: "eval() with dynamic input",
    pattern: /eval\s*\(\s*(?!['"`])[^)]+\)/g,
    severity: "HIGH",
    description:
      "eval() executes arbitrary JavaScript code. If user-controlled data is passed to eval(), attackers can run any code on your server — this is Remote Code Execution (RCE).",
    fix: 'Never use eval(). Use JSON.parse() for JSON data, or restructure your logic to avoid dynamic code execution.',
  },
  {
    name: "child_process.exec() usage",
    pattern: /child_process\s*\.\s*exec\s*\(/g,
    severity: "HIGH",
    description:
      "child_process.exec() runs shell commands. If any part of the command includes user input, attackers can inject OS commands (Command Injection).",
    fix: "Use child_process.execFile() instead, which doesn't spawn a shell. If you must run commands, whitelist allowed commands and never interpolate user input.",
  },
  {
    name: "child_process.execSync() usage",
    pattern: /child_process\s*\.\s*execSync\s*\(/g,
    severity: "HIGH",
    description:
      "execSync() runs shell commands synchronously and blocks the event loop. Combined with user input, this enables Command Injection attacks.",
    fix: "Use execFileSync() instead. Avoid shell execution with user input entirely.",
  },
  {
    name: "setTimeout/setInterval with string argument",
    pattern: /(?:setTimeout|setInterval)\s*\(\s*['"`][^'"]+['"`]/g,
    severity: "MEDIUM",
    description:
      "Passing a string to setTimeout/setInterval is equivalent to eval() — it executes arbitrary code.",
    fix: "Always pass a function reference to setTimeout/setInterval, never a string.",
  },
  {
    name: "SQL query with string concatenation",
    pattern:
      /(?:query|execute|run)\s*\(\s*(?:['"`][^'"`]*['"`]\s*\+|`[^`]*\$\{(?!['"`]))/g,
    severity: "HIGH",
    description:
      "Building SQL queries with string concatenation or template literals containing variables enables SQL Injection attacks, allowing attackers to read or delete your database.",
    fix: "Use parameterized queries or prepared statements. With pg: db.query('SELECT * FROM users WHERE id = $1', [userId])",
  },
  {
    name: "innerHTML with dynamic data",
    pattern: /\.innerHTML\s*=\s*(?!['"`])[^;]+/g,
    severity: "MEDIUM",
    description:
      "Setting innerHTML with dynamic (user-controlled) data enables Cross-Site Scripting (XSS) attacks, where attackers inject malicious JavaScript into your page.",
    fix: "Use textContent instead of innerHTML for user data. If you need HTML, use DOMPurify to sanitize first.",
  },
  {
    name: "document.write() usage",
    pattern: /document\.write\s*\(/g,
    severity: "MEDIUM",
    description:
      "document.write() can overwrite the entire page and is a potential XSS vector when used with dynamic data.",
    fix: "Use DOM manipulation methods (createElement, appendChild) instead of document.write().",
  },
  {
    name: "Prototype pollution risk",
    pattern: /\[['"`]__proto__['"`]\]|\.__proto__\s*=/g,
    severity: "HIGH",
    description:
      "Direct __proto__ manipulation can lead to Prototype Pollution — where attackers corrupt JavaScript object prototypes affecting all objects in your application.",
    fix: "Never allow user input to set __proto__, constructor, or prototype keys. Use Object.create(null) for dictionaries.",
  },
  {
    name: "Unvalidated redirect",
    pattern: /res\s*\.\s*redirect\s*\(\s*req\s*\.\s*(?:query|body|params)/g,
    severity: "HIGH",
    description:
      "Redirecting users to a URL from request data (Open Redirect) lets attackers craft phishing links that appear legitimate but redirect to malicious sites.",
    fix: "Validate redirect URLs against an allowlist of trusted domains. Never redirect to arbitrary user-supplied URLs.",
  },
  {
    name: "process.env exposed to client",
    pattern: /process\.env\.[A-Z_]+/g,
    severity: "INFO",
    description:
      "Server-side environment variables may be accidentally exposed to client-side code. NEXT_PUBLIC_ prefix variables are intentionally public; others should stay server-side.",
    fix: "Ensure non-public env vars are only accessed in server-side code (API routes, getServerSideProps, etc.).",
  },
];

const SKIP_PATHS = [
  "node_modules/",
  ".git/",
  "dist/",
  "build/",
  ".next/",
  "coverage/",
];
const CODE_EXTENSIONS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".vue",
];

export function runCodePatternScanner(files: FileMap): ScanFinding[] {
  const findings: ScanFinding[] = [];

  for (const [filePath, content] of Object.entries(files)) {
    if (SKIP_PATHS.some((p) => filePath.includes(p))) continue;
    if (!CODE_EXTENSIONS.some((ext) => filePath.endsWith(ext))) continue;

    const lines = content.split("\n");

    for (const { name, pattern, severity, description, fix } of DANGEROUS_PATTERNS) {
      pattern.lastIndex = 0;
      let match;
      const seenLines = new Set<number>();

      while ((match = pattern.exec(content)) !== null) {
        const upToMatch = content.substring(0, match.index);
        const lineNumber = upToMatch.split("\n").length;

        if (seenLines.has(lineNumber)) continue;
        seenLines.add(lineNumber);

        const lineContent = lines[lineNumber - 1]?.trim() || "";

        findings.push({
          severity,
          title: name,
          description,
          filePath,
          lineNumber,
          codeSnippet: lineContent.slice(0, 200),
          fixSuggestion: fix,
          source: "code-pattern-scanner",
        });
      }
    }
  }

  return findings;
}
