import { prisma } from "@/lib/db/prisma";
import { redis, setScanProgress } from "@/lib/redis";
import { extractZip, cleanupExtractedDir } from "@/lib/scanners/zipExtractor";
import { detectFramework } from "@/lib/scanners/frameworkDetector";
import { runSecretScanner } from "@/lib/scanners/secretScanner";
import { runCodePatternScanner } from "@/lib/scanners/codePatternScanner";
import { runCustomRuleEngine } from "@/lib/scanners/customRuleEngine";
import { runNpmAudit } from "@/lib/scanners/npmAuditScanner";
import { calculateScore, getSeverityCounts } from "@/lib/scanners/scoreCalculator";
import { explainFinding, generateDeploymentAdvice } from "@/lib/gemini";
import type { ScanFinding } from "@/lib/scanners/secretScanner";

export async function runScanPipeline(
  scanId: string,
  zipBuffer: Buffer
): Promise<void> {
  let extractedDir: string | null = null;

  try {
    // ── Stage 1: Extracting ──────────────────────────────────────────────────
    await setScanProgress(scanId, "extracting", "Extracting and validating project files...", 10);
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "PROCESSING" },
    });

    const { fileMap, extractedDir: dir, warnings } = await extractZip(zipBuffer);
    extractedDir = dir;

    // ── Stage 2: Framework Detection ─────────────────────────────────────────
    await setScanProgress(scanId, "detecting", "Detecting framework and project structure...", 25);
    const framework = detectFramework(fileMap);
    const frameworkLabel = [
      ...framework.frontend,
      ...framework.backend,
      ...framework.tools,
    ].join(", ") || "JavaScript";

    await prisma.scan.update({
      where: { id: scanId },
      data: {
        project: {
          update: { framework: frameworkLabel },
        },
      },
    });

    // ── Stage 3: Security Scanning ───────────────────────────────────────────
    await setScanProgress(scanId, "scanning", "Running security analysis engines...", 45);

    const [secretFindings, codeFindings, customFindings] =
      await Promise.all([
        Promise.resolve(runSecretScanner(fileMap)),
        Promise.resolve(runCodePatternScanner(fileMap)),
        Promise.resolve(runCustomRuleEngine(fileMap)),
        // Vercel serverless doesn't have npm installed, so we must disable this
        // runNpmAudit(extractedDir),
      ]);

    const allFindings: ScanFinding[] = [
      ...secretFindings,
      ...codeFindings,
      ...customFindings,
    ];

    // ── Stage 4: AI Explanation ───────────────────────────────────────────────
    await setScanProgress(scanId, "ai_analysis", "Generating AI explanations...", 70);

    // Only enrich top 2 findings with AI to prevent Vercel 60s serverless timeouts
    const priorityFindings = allFindings
      .sort((a, b) => {
        const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
        return order[a.severity] - order[b.severity];
      })
      .slice(0, 2);

    const enrichedFindings = await Promise.all(
      allFindings.map(async (finding) => {
        const shouldEnrich = priorityFindings.includes(finding);
        const aiExplanation = shouldEnrich
          ? await explainFinding(finding, frameworkLabel)
          : null;
        return { ...finding, aiExplanation };
      })
    );

    // ── Stage 5: Calculate Score & Save ──────────────────────────────────────
    await setScanProgress(scanId, "complete", "Generating security report...", 90);

    const score = calculateScore(allFindings);
    const severityCounts = getSeverityCounts(allFindings);
    const deploymentAdvice = await generateDeploymentAdvice(frameworkLabel, severityCounts);

    // Save all findings to DB
    await prisma.$transaction([
      prisma.finding.createMany({
        data: enrichedFindings.map((f) => ({
          scanId,
          severity: f.severity,
          title: f.title,
          description: f.description,
          filePath: f.filePath || null,
          lineNumber: f.lineNumber || null,
          codeSnippet: f.codeSnippet || null,
          fixSuggestion: f.fixSuggestion || null,
          aiExplanation: f.aiExplanation || null,
          source: f.source,
        })),
      }),
      prisma.scan.update({
        where: { id: scanId },
        data: {
          status: "COMPLETED",
          score,
        },
      }),
    ]);

    // Store deployment advice in Redis (not in DB schema for MVP)
    await redis.set(
      `scan:advice:${scanId}`,
      JSON.stringify({ advice: deploymentAdvice, warnings }),
      { ex: 86400 } // 24 hours
    );

    await setScanProgress(scanId, "complete", "Scan complete!", 100);
  } catch (err) {
    console.error("Scan pipeline error:", err);
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "FAILED" },
    });
    await setScanProgress(scanId, "failed", "Scan failed. Please try again.", 0);
    throw err;
  } finally {
    if (extractedDir) {
      cleanupExtractedDir(extractedDir);
    }
  }
}
