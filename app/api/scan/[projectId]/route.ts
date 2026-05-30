import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { scans: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const scan = project.scans[0];
    if (!scan) {
      return NextResponse.json({ error: "No scan found for project" }, { status: 404 });
    }

    if (scan.status === "PROCESSING") {
      return NextResponse.json(
        { error: "Scan already in progress" },
        { status: 409 }
      );
    }

    // Check zip is in Redis
    const zipExists = await redis.exists(`scan:zip:${scan.id}`);
    if (!zipExists) {
      return NextResponse.json(
        { error: "Upload data expired. Please re-upload your project." },
        { status: 410 }
      );
    }

    const isProduction = process.env.NODE_ENV === "production";
    const protocol = isProduction ? "https:" : req.nextUrl.protocol;
    const host = `${protocol}//${req.nextUrl.host}`;
    const workerUrl = `${host}/api/worker`;
    const qstashToken = process.env.QSTASH_TOKEN?.replace(/^["']|["']$/g, '').trim();

    if (isProduction && qstashToken) {
      // Production: dispatch via QStash for true async execution
      const qstashBaseUrl = process.env.QSTASH_URL || "https://qstash.upstash.io";
      const response = await fetch(
        `${qstashBaseUrl}/v2/publish/${encodeURIComponent(workerUrl)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${qstashToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ scanId: scan.id }),
        }
      );
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`QStash error: ${response.status} — ${errText.slice(0, 200)}`);
      }
    } else {
      // Development: call worker directly (fire and forget — no await)
      fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId: scan.id }),
      }).catch(console.error);
    }

    return NextResponse.json({ scanId: scan.id, message: "Scan started" });
  } catch (err: any) {
    console.error("Start scan error:", err);
    return NextResponse.json(
      { error: "Failed to start scan. Please try again.", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
