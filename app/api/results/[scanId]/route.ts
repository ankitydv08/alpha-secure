import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const { scanId } = await params;

  try {
    const scan = await prisma.scan.findUnique({
      where: { id: scanId },
      include: {
        project: true,
        findings: {
          orderBy: { severity: "asc" },
        },
      },
    });

    if (!scan) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    // Get deployment advice from Redis
    const adviceRaw = await redis.get(`scan:advice:${scanId}`);
    const adviceData = adviceRaw
      ? typeof adviceRaw === "string"
        ? JSON.parse(adviceRaw)
        : adviceRaw
      : { advice: [], warnings: [] };

    // Sort findings: CRITICAL → HIGH → MEDIUM → LOW → INFO
    const severityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
    const sortedFindings = [...scan.findings].sort(
      (a, b) =>
        (severityOrder[a.severity] ?? 5) -
        (severityOrder[b.severity] ?? 5)
    );

    const severityCounts = scan.findings.reduce(
      (acc: Record<string, number>, f) => {
        acc[f.severity] = (acc[f.severity] || 0) + 1;
        return acc;
      },
      {}
    );

    return NextResponse.json({
      scan: {
        id: scan.id,
        status: scan.status,
        score: scan.score,
        createdAt: scan.createdAt,
      },
      project: {
        id: scan.project.id,
        name: scan.project.name,
        framework: scan.project.framework,
      },
      findings: sortedFindings,
      severityCounts,
      deploymentAdvice: adviceData.advice || [],
      warnings: adviceData.warnings || [],
      totalFindings: scan.findings.length,
    });
  } catch (err) {
    console.error("Results error:", err);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
