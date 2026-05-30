import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { redis, setScanProgress } from "@/lib/redis";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const projectName = formData.get("projectName") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.endsWith(".zip")) {
      return NextResponse.json(
        { error: "Only ZIP files are accepted" },
        { status: 400 }
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 400 }
      );
    }

    const name =
      projectName?.trim() ||
      file.name.replace(".zip", "").replace(/[^a-zA-Z0-9\s-_]/g, "") ||
      "My Project";

    // Create project and scan records
    const project = await prisma.project.create({
      data: {
        name,
        scans: {
          create: {
            status: "PENDING",
          },
        },
      },
      include: { scans: true },
    });

    const scanId = project.scans[0].id;

    // Store zip buffer in Redis temporarily (for the worker to pick up)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // Store up to 45MB in Redis (base64 inflated ~33%), expire after 10 minutes
    await redis.set(`scan:zip:${scanId}`, base64, { ex: 600 });
    await setScanProgress(scanId, "queued", "Project uploaded. Starting scan...", 5);

    return NextResponse.json({
      projectId: project.id,
      scanId,
      message: "Project uploaded successfully. Start the scan to continue.",
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
