import { NextRequest, NextResponse } from "next/server";
import { redis, SCAN_PROGRESS_KEY } from "@/lib/redis";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const { scanId } = await params;

  try {
    const [progressRaw, scan] = await Promise.all([
      redis.get(SCAN_PROGRESS_KEY(scanId)),
      prisma.scan.findUnique({
        where: { id: scanId },
        select: { status: true, score: true },
      }),
    ]);

    if (!scan) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    const progress = progressRaw
      ? typeof progressRaw === "string"
        ? JSON.parse(progressRaw)
        : progressRaw
      : { stage: "queued", message: "Waiting to start...", percent: 0 };

    return NextResponse.json({
      status: scan.status,
      score: scan.score,
      progress,
    });
  } catch (err) {
    console.error("Status check error:", err);
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 });
  }
}
