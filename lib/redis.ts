import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const SCAN_STATUS_KEY = (scanId: string) => `scan:status:${scanId}`;
export const SCAN_PROGRESS_KEY = (scanId: string) => `scan:progress:${scanId}`;

export type ScanProgressStage =
  | "queued"
  | "extracting"
  | "detecting"
  | "scanning"
  | "ai_analysis"
  | "complete"
  | "failed";

export async function setScanProgress(
  scanId: string,
  stage: ScanProgressStage,
  message: string,
  percent: number
) {
  await redis.set(
    SCAN_PROGRESS_KEY(scanId),
    JSON.stringify({ stage, message, percent, updatedAt: Date.now() }),
    { ex: 3600 } // expire after 1 hour
  );
}
