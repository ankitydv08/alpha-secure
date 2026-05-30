import type { FileMap } from "./frameworkDetector";
import type { ScanFinding } from "./secretScanner";

// ─── Express.js Security Rule Engine ─────────────────────────────────────────

function hasExpressBackend(files: FileMap): boolean {
  return Object.entries(files).some(([path, content]) => {
    if (path.includes("node_modules/")) return false;
    return (
      content.includes("require('express')") ||
      content.includes('require("express")') ||
      content.includes("from 'express'") ||
      content.includes('from "express"')
    );
  });
}

function getDependencies(files: FileMap): Record<string, string> {
  const pkgEntry = Object.entries(files).find(
    ([p]) =>
      p === "package.json" ||
      (p.endsWith("/package.json") && p.split("/").length <= 3)
  );
  if (!pkgEntry) return {};
  try {
    const pkg = JSON.parse(pkgEntry[1]);
    return {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };
  } catch {
    return {};
  }
}

function getExpressEntryFiles(files: FileMap): [string, string][] {
  const entryNames = [
    "index.js",
    "server.js",
    "app.js",
    "main.js",
    "index.ts",
    "server.ts",
    "app.ts",
  ];
  return Object.entries(files).filter(([path]) => {
    if (path.includes("node_modules/")) return false;
    const fname = path.split("/").pop() || "";
    return entryNames.includes(fname);
  });
}

export function runCustomRuleEngine(files: FileMap): ScanFinding[] {
  const findings: ScanFinding[] = [];
  const deps = getDependencies(files);
  const isExpressApp = hasExpressBackend(files);
  const entryFiles = getExpressEntryFiles(files);
  const allContent = Object.entries(files)
    .filter(([p]) => !p.includes("node_modules/"))
    .map(([, c]) => c)
    .join("\n");

  // ── RULE 1: Missing Helmet ──────────────────────────────────────────────────
  if (isExpressApp) {
    const hasHelmet =
      deps["helmet"] !== undefined ||
      allContent.includes("helmet") ||
      allContent.includes("require('helmet')") ||
      allContent.includes('require("helmet")');

    if (!hasHelmet) {
      findings.push({
        severity: "HIGH",
        title: "Missing Helmet.js — HTTP security headers not set",
        description:
          "Your Express app doesn't use Helmet.js, which means critical HTTP security headers (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, etc.) are missing. Attackers can exploit this for clickjacking, MIME sniffing, and XSS attacks.",
        filePath: entryFiles[0]?.[0],
        fixSuggestion:
          "Install and use Helmet: `npm install helmet`. Then add `app.use(helmet())` at the top of your Express middleware stack, before any routes.",
        source: "custom-rules",
      });
    }

    // ── RULE 2: Missing Rate Limiting ─────────────────────────────────────────
    const hasRateLimit =
      deps["express-rate-limit"] !== undefined ||
      allContent.includes("rateLimit") ||
      allContent.includes("rate-limit") ||
      allContent.includes("rate_limit");

    if (!hasRateLimit) {
      findings.push({
        severity: "HIGH",
        title: "Missing rate limiting — API endpoints are wide open",
        description:
          "Without rate limiting, attackers can send unlimited requests to your API. This enables brute force attacks on login endpoints, credential stuffing, and denial-of-service (DoS) attacks that can take down your server.",
        filePath: entryFiles[0]?.[0],
        fixSuggestion:
          "Install express-rate-limit: `npm install express-rate-limit`. Apply it to auth routes:\n```js\nconst limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });\napp.use('/api/auth', limiter);\n```",
        source: "custom-rules",
      });
    }

    // ── RULE 3: CORS Wildcard ─────────────────────────────────────────────────
    const corsWildcard =
      /cors\s*\(\s*\{[\s\S]*?origin\s*:\s*['"`]\*['"`]/.test(allContent) ||
      /cors\s*\(\s*\)/.test(allContent);

    if (corsWildcard && deps["cors"] !== undefined) {
      findings.push({
        severity: "MEDIUM",
        title: "CORS configured with wildcard origin (*)",
        description:
          "Allowing all origins (*)  with CORS means any website can make API requests to your backend. This is dangerous for authenticated endpoints — it enables Cross-Origin attacks.",
        fixSuggestion:
          "Restrict CORS to your actual frontend URL:\n```js\napp.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));\n```",
        source: "custom-rules",
      });
    }

    // ── RULE 4: No Input Validation ───────────────────────────────────────────
    const hasValidation =
      deps["joi"] !== undefined ||
      deps["zod"] !== undefined ||
      deps["express-validator"] !== undefined ||
      deps["yup"] !== undefined ||
      allContent.includes("z.object") ||
      allContent.includes("Joi.object") ||
      allContent.includes("body('") ||
      allContent.includes("validationResult");

    if (!hasValidation && isExpressApp) {
      findings.push({
        severity: "MEDIUM",
        title: "No input validation library detected",
        description:
          "Without input validation, your API accepts any data from users — including malicious payloads. This can lead to injection attacks, unexpected crashes, and security bypasses.",
        fixSuggestion:
          "Add Zod for type-safe validation:\n```js\nimport { z } from 'zod';\nconst schema = z.object({ email: z.string().email(), password: z.string().min(8) });\nconst data = schema.parse(req.body);\n```",
        source: "custom-rules",
      });
    }

    // ── RULE 5: Debug Mode / NODE_ENV ─────────────────────────────────────────
    const envFiles = Object.entries(files).filter(([p]) =>
      p.includes(".env")
    );
    for (const [filePath, content] of envFiles) {
      if (
        content.includes("NODE_ENV=development") &&
        (filePath.includes(".env.production") ||
          filePath === ".env")
      ) {
        findings.push({
          severity: "MEDIUM",
          title: "NODE_ENV set to development in production config",
          description:
            "Running Node.js in development mode in production exposes detailed error stack traces to users and disables performance optimizations. Error messages can reveal your file structure, library versions, and internal logic to attackers.",
          filePath,
          fixSuggestion:
            "Set NODE_ENV=production in your production environment. On Vercel/Railway this is set automatically. Never commit .env files with production values.",
          source: "custom-rules",
        });
      }
    }

    // ── RULE 6: Weak/Short JWT Secret ─────────────────────────────────────────
    const jwtSignMatches = allContent.matchAll(
      /jwt\.sign\s*\([^,]+,\s*(['"`])([^'"`]{1,20})\1/g
    );
    for (const match of jwtSignMatches) {
      const secret = match[2];
      if (secret.length < 20) {
        // Find which file
        const fileEntry = Object.entries(files).find(([, c]) =>
          c.includes(match[0])
        );
        findings.push({
          severity: "HIGH",
          title: "Weak JWT secret — token can be brute-forced",
          description: `Your JWT secret is only ${secret.length} characters long. Attackers can brute-force short JWT secrets, forge authentication tokens, and gain unauthorized access to any user account.`,
          filePath: fileEntry?.[0],
          codeSnippet: match[0].slice(0, 150),
          fixSuggestion:
            "Use a cryptographically random secret of at least 64 characters:\n```js\nconst secret = process.env.JWT_SECRET; // min 64 chars random string\n// Generate: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"\n```",
          source: "custom-rules",
        });
      }
    }

    // ── RULE 7: Plaintext Password Storage ───────────────────────────────────
    const pwdWithoutHash =
      /(?:password|passwd)\s*[:=]\s*(?:req\.body|user\.|data\.)/g.test(
        allContent
      ) && !allContent.includes("bcrypt") && !allContent.includes("argon2");

    if (pwdWithoutHash) {
      findings.push({
        severity: "HIGH",
        title: "Passwords may be stored without hashing",
        description:
          "Your code appears to store or compare passwords without hashing (no bcrypt or argon2 detected). Plaintext password storage means a database breach exposes every user's password immediately.",
        fixSuggestion:
          "Always hash passwords before storing:\n```js\nimport bcrypt from 'bcrypt';\nconst hash = await bcrypt.hash(password, 12);\n// Verify: await bcrypt.compare(inputPassword, storedHash)\n```",
        source: "custom-rules",
      });
    }
  }

  // ── RULE 8: HTTP (not HTTPS) hardcoded URLs ────────────────────────────────
  const httpMatches = allContent.matchAll(
    /['"`]http:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0)[a-z0-9.-]+/g
  );
  const seenUrls = new Set<string>();
  for (const match of httpMatches) {
    const url = match[0];
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      findings.push({
        severity: "LOW",
        title: "HTTP URL used instead of HTTPS",
        description: `An unencrypted HTTP URL was found: ${url.slice(1, 60)}. HTTP connections are not encrypted and can be intercepted (Man-in-the-Middle attacks), exposing data transmitted to and from this endpoint.`,
        fixSuggestion:
          "Replace all HTTP URLs with HTTPS equivalents. In production, all external communication should use HTTPS.",
        source: "custom-rules",
      });
    }
  }

  // ── RULE 9: Console.log with potential secret data ─────────────────────────
  const sensLogPattern =
    /console\.log\s*\([^)]*(?:password|secret|token|key|auth)[^)]*\)/gi;
  const logMatches = allContent.matchAll(sensLogPattern);
  for (const match of logMatches) {
    const fileEntry = Object.entries(files).find(
      ([p, c]) => !p.includes("node_modules") && c.includes(match[0])
    );
    findings.push({
      severity: "LOW",
      title: "Sensitive data potentially logged to console",
      description:
        "A console.log() statement appears to log sensitive data (password, secret, token, or key). Console logs can appear in server logs, monitoring systems, and are visible to anyone with server access.",
      filePath: fileEntry?.[0],
      codeSnippet: match[0].slice(0, 150),
      fixSuggestion:
        "Remove all console.log statements containing sensitive data before deploying. Use a proper logger (winston, pino) with appropriate log levels and redaction.",
      source: "custom-rules",
    });
  }

  return findings;
}
