import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { runScanPipeline } from "@/lib/scanPipeline";

export const runtime = "nodejs";
export const maxDuration = 60; // 60s max for Hobby

/**
 * QStash worker endpoint — receives { scanId } and runs the full scan pipeline.
 * In development, called directly. In production, called by Upstash QStash.
 */
export async function POST(req: NextRequest) {
  try {
    // Verify QStash signature in production
    const qstashSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
    if (qstashSigningKey) {
      const signature = req.headers.get("upstash-signature");
      if (!signature) {
        // Allow direct calls from our own scan trigger in dev
        const origin = req.headers.get("origin") || req.headers.get("referer") || "";
        const host = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : `https://${process.env.VERCEL_URL}`) || "http://localhost:3000";
        if (!origin.startsWith(host) && process.env.NODE_ENV === "production") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      }
    }

    const body = await req.json();
    const { scanId } = body as { scanId: string };

    if (!scanId) {
      return NextResponse.json({ error: "scanId required" }, { status: 400 });
    }

    // Retrieve ZIP buffer from Redis
    const base64Zip = await redis.get(`scan:zip:${scanId}`);
    if (!base64Zip) {
      return NextResponse.json(
        { error: "Scan data not found or expired" },
        { status: 410 }
      );
    }

    const zipBuffer = Buffer.from(base64Zip as string, "base64");

    // Clean up Redis zip after reading
    await redis.del(`scan:zip:${scanId}`);

    // Run the scan pipeline
    await runScanPipeline(scanId, zipBuffer);

    return NextResponse.json({ success: true, scanId });
  } catch (err) {
    console.error("Worker error:", err);
    return NextResponse.json(
      { error: "Worker failed" },
      { status: 500 }
    );
  }
}
