import type { ScanFinding } from "./secretScanner";

/**
 * Calculate a security score from 0–100 based on finding severity counts.
 * Starts at 100, deducts points per finding severity.
 */
export function calculateScore(findings: ScanFinding[]): number {
  const DEDUCTIONS: Record<ScanFinding["severity"], number> = {
    CRITICAL: 20,
    HIGH: 10,
    MEDIUM: 5,
    LOW: 2,
    INFO: 0,
  };

  let score = 100;
  for (const finding of findings) {
    score -= DEDUCTIONS[finding.severity];
    if (score <= 0) return 0;
  }
  return Math.max(0, Math.min(100, score));
}

export function getScoreGrade(score: number): {
  grade: string;
  label: string;
  color: string;
} {
  if (score >= 90) return { grade: "A", label: "Excellent", color: "#22c55e" };
  if (score >= 75) return { grade: "B", label: "Good", color: "#84cc16" };
  if (score >= 60) return { grade: "C", label: "Fair", color: "#eab308" };
  if (score >= 40) return { grade: "D", label: "Poor", color: "#f97316" };
  return { grade: "F", label: "Critical", color: "#ef4444" };
}

export function getSeverityCounts(findings: ScanFinding[]) {
  return findings.reduce(
    (acc, f) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}
