"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, CheckCircle, Loader2, AlertCircle, ArrowLeft } from "lucide-react";

interface ScanProgress {
  stage: string;
  message: string;
  percent: number;
}

const STAGES = [
  { key: "queued", label: "Queued", description: "Waiting for scan to begin" },
  { key: "extracting", label: "Extracting", description: "Unpacking and validating your project files" },
  { key: "detecting", label: "Detecting", description: "Identifying framework and project structure" },
  { key: "scanning", label: "Scanning", description: "Running 4 security analysis engines" },
  { key: "ai_analysis", label: "AI Analysis", description: "Gemini AI generating plain-English explanations" },
  { key: "complete", label: "Complete", description: "Security report ready!" },
];

export default function ScanPage({ params }: { params: Promise<{ scanId: string }> }) {
  const { scanId } = use(params);
  const router = useRouter();
  const [status, setStatus] = useState("PENDING");
  const [progress, setProgress] = useState<ScanProgress>({
    stage: "queued",
    message: "Starting scan...",
    percent: 0,
  });
  const [failed, setFailed] = useState(false);
  const [dots, setDots] = useState(".");

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Poll scan status
  useEffect(() => {
    let stopped = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/scan/status/${scanId}`);
        if (!res.ok) {
          setFailed(true);
          return;
        }
        const data = await res.json();

        setStatus(data.status);
        if (data.progress) setProgress(data.progress);

        if (data.status === "COMPLETED") {
          stopped = true;
          // Brief delay so user sees "Complete!" state
          setTimeout(() => router.push(`/results/${scanId}`), 1200);
          return;
        }

        if (data.status === "FAILED") {
          stopped = true;
          setFailed(true);
          return;
        }
      } catch {
        // Keep polling on network hiccup
      }

      if (!stopped) {
        setTimeout(poll, 2000); // Poll every 2 seconds
      }
    };

    poll();
    return () => { stopped = true; };
  }, [scanId, router]);

  const currentStageIndex = STAGES.findIndex((s) => s.key === progress.stage);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 580 }}>
        <Link
          href="/upload"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text-muted)",
            fontSize: 14,
            textDecoration: "none",
            marginBottom: 48,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <ArrowLeft size={14} />
          Upload another project
        </Link>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          {failed ? (
            <>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <AlertCircle size={30} color="#ef4444" />
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>
                Scan Failed
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 24 }}>
                Something went wrong during the scan. Please try again.
              </p>
              <Link href="/upload" className="btn-primary">
                Try Again
              </Link>
            </>
          ) : status === "COMPLETED" ? (
            <>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <CheckCircle size={30} color="#10b981" />
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
                Scan Complete!
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
                Redirecting to your security report{dots}
              </p>
            </>
          ) : (
            <>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(6, 182, 212, 0.2))",
                  border: "1px solid rgba(124, 58, 237, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <Shield size={28} color="#a855f7" />
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
                Scanning Your Project{dots}
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
                {progress.message}
              </p>
            </>
          )}
        </div>

        {/* Progress bar */}
        {!failed && status !== "COMPLETED" && (
          <div className="glass-card" style={{ padding: 32 }}>
            {/* Overall progress bar */}
            <div style={{ marginBottom: 32 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                  fontSize: 13,
                  color: "var(--text-muted)",
                }}
              >
                <span>Overall Progress</span>
                <span style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  {progress.percent}%
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: "rgba(255, 255, 255, 0.06)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  className="progress-bar"
                  style={{ width: `${progress.percent}%`, height: "100%" }}
                />
              </div>
            </div>

            {/* Stage list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {STAGES.filter((s) => s.key !== "complete").map((stage, idx) => {
                const isCompleted = idx < currentStageIndex;
                const isActive = stage.key === progress.stage;
                const isPending = idx > currentStageIndex;

                return (
                  <div
                    key={stage.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: isActive
                        ? "rgba(124, 58, 237, 0.08)"
                        : "transparent",
                      border: isActive
                        ? "1px solid rgba(124, 58, 237, 0.15)"
                        : "1px solid transparent",
                      transition: "all 0.3s",
                    }}
                  >
                    {/* Status icon */}
                    <div style={{ flexShrink: 0 }}>
                      {isCompleted ? (
                        <CheckCircle size={18} color="#10b981" />
                      ) : isActive ? (
                        <Loader2
                          size={18}
                          color="#a855f7"
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: "2px solid var(--border)",
                          }}
                        />
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: isActive ? 600 : 500,
                          color: isCompleted
                            ? "var(--text-secondary)"
                            : isActive
                            ? "var(--text-primary)"
                            : "var(--text-muted)",
                        }}
                      >
                        {stage.label}
                      </div>
                      {isActive && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text-muted)",
                            marginTop: 2,
                          }}
                        >
                          {stage.description}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scan ID */}
            <div
              style={{
                marginTop: 24,
                padding: "8px 12px",
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: 6,
                fontSize: 11,
                fontFamily: "JetBrains Mono, monospace",
                color: "var(--text-muted)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Scan ID</span>
              <span>{scanId}</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
