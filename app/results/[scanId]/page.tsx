"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Code2,
  Lightbulb,
  FileText,
  Rocket,
  ArrowLeft,
  Copy,
  Check,
  Package,
  Eye,
  Lock,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface Finding {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  title: string;
  description: string;
  filePath: string | null;
  lineNumber: number | null;
  codeSnippet: string | null;
  fixSuggestion: string | null;
  aiExplanation: string | null;
  source: string;
}

interface ScanResult {
  scan: { id: string; status: string; score: number | null; createdAt: string };
  project: { name: string; framework: string | null };
  findings: Finding[];
  severityCounts: Record<string, number>;
  deploymentAdvice: string[];
  warnings: string[];
  totalFindings: number;
}

// ── Severity config ───────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
  CRITICAL: { label: "Critical", cssClass: "severity-critical", order: 0 },
  HIGH: { label: "High", cssClass: "severity-high", order: 1 },
  MEDIUM: { label: "Medium", cssClass: "severity-medium", order: 2 },
  LOW: { label: "Low", cssClass: "severity-low", order: 3 },
  INFO: { label: "Info", cssClass: "severity-info", order: 4 },
};

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  "secret-scanner": <Eye size={12} />,
  "code-pattern-scanner": <Code2 size={12} />,
  "custom-rules": <Lock size={12} />,
  "npm-audit": <Package size={12} />,
};

// ── Score gauge ───────────────────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const grade =
    score >= 90 ? { g: "A", label: "Excellent", color: "#22c55e" }
    : score >= 75 ? { g: "B", label: "Good", color: "#84cc16" }
    : score >= 60 ? { g: "C", label: "Fair", color: "#eab308" }
    : score >= 40 ? { g: "D", label: "Poor", color: "#f97316" }
    : { g: "F", label: "Critical Risk", color: "#ef4444" };

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
      <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
        <svg width={140} height={140} viewBox="0 0 140 140">
          <circle
            cx={70} cy={70} r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={12}
          />
          <circle
            cx={70} cy={70} r={radius}
            fill="none"
            stroke={grade.color}
            strokeWidth={12}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
            style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s ease", filter: `drop-shadow(0 0 8px ${grade.color}60)` }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 32, fontWeight: 900, color: grade.color, lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>/100</span>
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 900,
            color: grade.color,
            lineHeight: 1,
            marginBottom: 4,
          }}
        >
          {grade.g}
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{grade.label}</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Security Grade</div>
      </div>
    </div>
  );
}

// ── Finding card ──────────────────────────────────────────────────────────────

function FindingCard({ finding }: { finding: Finding }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const cfg = SEVERITY_CONFIG[finding.severity];

  const copyFix = () => {
    if (finding.fixSuggestion) {
      navigator.clipboard.writeText(finding.fixSuggestion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: 0,
        overflow: "hidden",
        borderLeft: `3px solid ${
          finding.severity === "CRITICAL" ? "#ef4444"
          : finding.severity === "HIGH" ? "#f97316"
          : finding.severity === "MEDIUM" ? "#eab308"
          : finding.severity === "LOW" ? "#3b82f6"
          : "#6b7280"
        }`,
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          padding: "16px 20px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          className={cfg.cssClass}
          style={{
            padding: "3px 10px",
            borderRadius: 5,
            fontSize: 11,
            fontWeight: 700,
            flexShrink: 0,
            letterSpacing: "0.04em",
          }}
        >
          {cfg.label.toUpperCase()}
        </span>

        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
          {finding.title}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {finding.filePath && (
            <span
              style={{
                fontSize: 11,
                fontFamily: "JetBrains Mono, monospace",
                color: "var(--text-muted)",
                background: "rgba(255,255,255,0.04)",
                padding: "2px 8px",
                borderRadius: 4,
                maxWidth: 200,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {finding.filePath}
              {finding.lineNumber ? `:${finding.lineNumber}` : ""}
            </span>
          )}
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 10,
              color: "var(--text-muted)",
              padding: "2px 7px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: 4,
              border: "1px solid var(--border)",
            }}
          >
            {SOURCE_ICONS[finding.source]}
            {finding.source.replace(/-/g, " ")}
          </span>
          <span style={{ color: "var(--text-muted)" }}>
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div
          style={{
            padding: "0 20px 20px",
            borderTop: "1px solid var(--border)",
          }}
        >
          {/* AI Explanation */}
          {finding.aiExplanation && (
            <div
              style={{
                padding: "14px 16px",
                background: "rgba(124, 58, 237, 0.06)",
                border: "1px solid rgba(124, 58, 237, 0.15)",
                borderRadius: 10,
                margin: "16px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#a78bfa",
                }}
              >
                <Lightbulb size={13} />
                AI Explanation
              </div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                {finding.aiExplanation}
              </p>
            </div>
          )}

          {/* Description */}
          {!finding.aiExplanation && (
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, margin: "16px 0" }}>
              {finding.description}
            </p>
          )}

          {/* Code snippet */}
          {finding.codeSnippet && (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                }}
              >
                <Code2 size={13} />
                Affected Code
              </div>
              <pre
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "12px 16px",
                  fontSize: 12,
                  fontFamily: "JetBrains Mono, monospace",
                  color: "#fde047",
                  overflowX: "auto",
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {finding.codeSnippet}
              </pre>
            </div>
          )}

          {/* Fix suggestion */}
          {finding.fixSuggestion && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6ee7b7",
                  }}
                >
                  <FileText size={13} />
                  How to Fix
                </div>
                <button
                  onClick={copyFix}
                  style={{
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    borderRadius: 6,
                    padding: "3px 10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11,
                    color: "#6ee7b7",
                  }}
                >
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.06)",
                  border: "1px solid rgba(16, 185, 129, 0.15)",
                  borderRadius: 8,
                  padding: "12px 16px",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  fontFamily: finding.fixSuggestion.includes("```")
                    ? "JetBrains Mono, monospace"
                    : "Inter, sans-serif",
                }}
              >
                {finding.fixSuggestion}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main results page ─────────────────────────────────────────────────────────

export default function ResultsPage({ params }: { params: Promise<{ scanId: string }> }) {
  const { scanId } = use(params);
  const [data, setData] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  useEffect(() => {
    fetch(`/api/results/${scanId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load results");
        setLoading(false);
      });
  }, [scanId]);

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "var(--bg-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: "3px solid var(--border)",
              borderTopColor: "#7c3aed",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "var(--text-muted)" }}>Loading results...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "var(--bg-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#fca5a5", marginBottom: 16 }}>{error || "Results not found"}</p>
          <Link href="/upload" className="btn-primary">Upload Another Project</Link>
        </div>
      </main>
    );
  }

  const { scan, project, findings, severityCounts, deploymentAdvice, totalFindings } = data;

  const filteredFindings =
    activeFilter === "ALL"
      ? findings
      : findings.filter((f) => f.severity === activeFilter);

  const filterOptions = [
    { key: "ALL", label: `All (${totalFindings})` },
    ...Object.keys(SEVERITY_CONFIG)
      .filter((s) => severityCounts[s] > 0)
      .map((s) => ({
        key: s,
        label: `${SEVERITY_CONFIG[s as keyof typeof SEVERITY_CONFIG].label} (${severityCounts[s] || 0})`,
      })),
  ];

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* ── Top Nav ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid var(--border)",
          background: "rgba(10, 10, 15, 0.9)",
          backdropFilter: "blur(16px)",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/upload"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text-muted)",
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          <ArrowLeft size={14} />
          New Scan
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={16} color="#7c3aed" />
          <span style={{ fontWeight: 700, fontSize: 15 }}>SecureCheck</span>
        </div>

        <div
          style={{
            fontSize: 12,
            fontFamily: "JetBrains Mono, monospace",
            color: "var(--text-muted)",
          }}
        >
          {scanId.slice(0, 12)}...
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {/* ── Project header ── */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
                {project.name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {project.framework && (
                  <span
                    style={{
                      padding: "3px 12px",
                      background: "rgba(124, 58, 237, 0.1)",
                      border: "1px solid rgba(124, 58, 237, 0.2)",
                      borderRadius: 20,
                      fontSize: 12,
                      color: "#a78bfa",
                      fontWeight: 500,
                    }}
                  >
                    {project.framework}
                  </span>
                )}
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  Scanned on {new Date(scan.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Summary cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 20,
            marginBottom: 40,
            alignItems: "start",
          }}
        >
          {/* Score */}
          <div
            className="glass-card glow-purple"
            style={{ padding: "28px 32px", minWidth: 280 }}
          >
            <ScoreGauge score={scan.score ?? 0} />
          </div>

          {/* Severity breakdown */}
          <div className="glass-card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Finding Breakdown
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 16 }}>
              {Object.entries(SEVERITY_CONFIG).map(([sev, cfg]) => {
                const count = severityCounts[sev] || 0;
                return (
                  <div
                    key={sev}
                    style={{
                      textAlign: "center",
                      padding: "16px 12px",
                      borderRadius: 10,
                      background: count > 0 ? "rgba(255,255,255,0.03)" : "transparent",
                      border: count > 0 ? "1px solid var(--border)" : "1px solid transparent",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color:
                          sev === "CRITICAL" ? "#ef4444"
                          : sev === "HIGH" ? "#f97316"
                          : sev === "MEDIUM" ? "#eab308"
                          : sev === "LOW" ? "#3b82f6"
                          : "#6b7280",
                        marginBottom: 4,
                      }}
                    >
                      {count}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                      {cfg.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Findings ── */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>
              Security Findings
              {totalFindings === 0 && (
                <span style={{ marginLeft: 12, fontSize: 14, color: "#10b981", fontWeight: 500 }}>
                  🎉 No issues found!
                </span>
              )}
            </h2>

            {/* Filter tabs */}
            {totalFindings > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                }}
              >
                {filterOptions.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveFilter(key)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      border: "1px solid",
                      transition: "all 0.15s",
                      background: activeFilter === key ? "rgba(124, 58, 237, 0.15)" : "transparent",
                      borderColor: activeFilter === key ? "rgba(124, 58, 237, 0.4)" : "var(--border)",
                      color: activeFilter === key ? "#a78bfa" : "var(--text-muted)",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {totalFindings === 0 ? (
            <div
              className="glass-card"
              style={{ padding: 48, textAlign: "center" }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                No security issues found!
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
                Your project passed all security checks. Great job!
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredFindings.map((f) => (
                <FindingCard key={f.id} finding={f} />
              ))}
              {filteredFindings.length === 0 && (
                <div
                  className="glass-card"
                  style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}
                >
                  No {activeFilter.toLowerCase()} severity findings.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Deployment advice ── */}
        {deploymentAdvice.length > 0 && (
          <div className="glass-card" style={{ padding: 28, marginBottom: 40 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "rgba(6, 182, 212, 0.1)",
                  border: "1px solid rgba(6, 182, 212, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Rocket size={16} color="#06b6d4" />
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700 }}>Deployment Security Advice</h2>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Before you go live, make sure to address these points
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {deploymentAdvice.map((advice, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 16px",
                    background: "rgba(6, 182, 212, 0.04)",
                    border: "1px solid rgba(6, 182, 212, 0.1)",
                    borderRadius: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#06b6d4",
                      fontFamily: "JetBrains Mono, monospace",
                      marginTop: 1,
                      flexShrink: 0,
                      width: 20,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {advice}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Disclaimer ── */}
        <div
          style={{
            padding: "14px 20px",
            background: "rgba(107, 114, 128, 0.08)",
            border: "1px solid rgba(107, 114, 128, 0.15)",
            borderRadius: 10,
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <AlertTriangle size={15} color="#6b7280" style={{ marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
            <strong style={{ color: "var(--text-secondary)" }}>AI-Assisted Review:</strong>{" "}
            This report is generated by automated tools and AI analysis. It is not a guarantee of
            security. False positives may occur. Always have your code reviewed by a qualified
            security engineer before deploying sensitive applications.
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
