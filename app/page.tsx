"use client";

import Link from "next/link";
import { Shield, Zap, Eye, Lock, ArrowRight, CheckCircle, AlertTriangle, Code2, Package } from "lucide-react";

const FEATURES = [
  {
    icon: Eye,
    title: "Secret Detection",
    description: "Finds hardcoded API keys, passwords, and tokens before they leak to GitHub.",
    color: "#ef4444",
  },
  {
    icon: Code2,
    title: "Code Pattern Analysis",
    description: "Detects eval(), SQL injection risks, XSS vectors, and command injection.",
    color: "#f97316",
  },
  {
    icon: Lock,
    title: "Express.js Security",
    description: "Checks for missing Helmet, rate limiting, CORS misconfig, and weak JWT secrets.",
    color: "#a855f7",
  },
  {
    icon: Package,
    title: "Dependency Audit",
    description: "Runs npm audit to find CVEs in your packages and suggests safe versions.",
    color: "#06b6d4",
  },
  {
    icon: Zap,
    title: "AI Explanations",
    description: "Gemini AI translates technical findings into plain English any developer can understand.",
    color: "#10b981",
  },
  {
    icon: Shield,
    title: "Security Score",
    description: "Get a 0–100 security score with letter grade and actionable improvement plan.",
    color: "#eab308",
  },
];

const CHECKS = [
  "Hardcoded API keys & passwords",
  "Missing Helmet.js middleware",
  "No rate limiting on APIs",
  "Weak or hardcoded JWT secrets",
  "CORS wildcard misconfiguration",
  "eval() and dangerous code patterns",
  "SQL injection vulnerabilities",
  "Vulnerable npm dependencies",
  "Debug mode in production",
  "Plaintext password storage",
  "Sensitive files committed (.env)",
  "Missing input validation",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* ── Navigation ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid var(--border)",
          background: "rgba(10, 10, 15, 0.85)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={18} color="white" />
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
              SecureCheck
            </span>
          </div>

          <Link href="/upload" className="btn-primary" style={{ padding: "9px 20px", fontSize: 14 }}>
            Start Free Scan
            <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "100px 24px 80px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(124, 58, 237, 0.1)",
            border: "1px solid rgba(124, 58, 237, 0.2)",
            borderRadius: 100,
            padding: "6px 16px",
            marginBottom: 32,
            fontSize: 13,
            color: "#a78bfa",
            fontWeight: 500,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#a855f7",
              display: "inline-block",
            }}
            className="pulse-dot"
          />
          AI-Assisted Security Review Platform
        </div>

        <h1
          style={{
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: 24,
          }}
        >
          Find security flaws{" "}
          <span className="gradient-text">before attackers do</span>
        </h1>

        <p
          style={{
            fontSize: 20,
            color: "var(--text-secondary)",
            maxWidth: 620,
            margin: "0 auto 48px",
            lineHeight: 1.7,
            fontWeight: 400,
          }}
        >
          Upload your React or Express.js project. Get an instant AI-powered
          security audit with plain-English explanations and actionable fixes.
          No security expertise required.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/upload" className="btn-primary" style={{ fontSize: 16, padding: "14px 32px" }}>
            Upload Your Project
            <ArrowRight size={18} />
          </Link>
          <a
            href="#how-it-works"
            className="btn-secondary"
            style={{ fontSize: 16, padding: "14px 32px" }}
          >
            See How It Works
          </a>
        </div>

        {/* Social proof */}
        <div
          style={{
            marginTop: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            flexWrap: "wrap",
            color: "var(--text-muted)",
            fontSize: 13,
          }}
        >
          {["No account required", "Results in under 60 seconds", "100% free for MVP"].map(
            (text) => (
              <span key={text} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle size={14} color="#10b981" />
                {text}
              </span>
            )
          )}
        </div>
      </section>

      {/* ── Features grid ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 100px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {FEATURES.map(({ icon: Icon, title, description, color }) => (
            <div key={title} className="glass-card" style={{ padding: 28 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `${color}18`,
                  border: `1px solid ${color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Icon size={20} color={color} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>
                {title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65 }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What we check ── */}
      <section
        id="how-it-works"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 100px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 60,
          alignItems: "center",
        }}
      >
        <div>
          <p style={{ color: "#a855f7", fontWeight: 600, marginBottom: 12, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Security Checks
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 20 }}>
            12+ checks run on{" "}
            <span className="gradient-text">every scan</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
            Our scanner runs through your entire codebase looking for the most
            common security mistakes made by developers building React and
            Express.js applications.
          </p>
          <Link href="/upload" className="btn-primary">
            Scan Your Project
            <ArrowRight size={16} />
          </Link>
        </div>

        <div
          className="glass-card"
          style={{ padding: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          {CHECKS.map((check) => (
            <div
              key={check}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                fontSize: 13,
                color: "var(--text-secondary)",
              }}
            >
              <AlertTriangle
                size={13}
                color="#f97316"
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              {check}
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          padding: "80px 24px",
          textAlign: "center",
          background: "var(--bg-secondary)",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, marginBottom: 16 }}>
            Get results in{" "}
            <span className="gradient-text-green">under 60 seconds</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 60 }}>
            No setup. No account. Just upload and get your security report.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 20,
            }}
          >
            {[
              { step: "01", title: "Upload ZIP", desc: "Drag & drop your project" },
              { step: "02", title: "Auto-Scan", desc: "4 engines analyze your code" },
              { step: "03", title: "AI Explains", desc: "Plain-English descriptions" },
              { step: "04", title: "Fix & Deploy", desc: "Actionable recommendations" },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                style={{
                  padding: "28px 20px",
                  borderRadius: 16,
                  border: "1px solid var(--border)",
                  background: "var(--bg-card)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#7c3aed",
                    marginBottom: 12,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {step}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "100px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, marginBottom: 16, lineHeight: 1.15 }}>
            Ready to secure{" "}
            <span className="gradient-text">your code?</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 36 }}>
            It&apos;s free, instant, and requires no account. Upload your ZIP and
            get your security report in seconds.
          </p>
          <Link href="/upload" className="btn-primary" style={{ fontSize: 16, padding: "15px 36px" }}>
            Start Your Free Scan
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "28px 24px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: 13,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          <Shield size={14} color="#7c3aed" />
          <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>SecureCheck</span>
        </div>
        <p>AI-Assisted Security Review — Not a guarantee of security.</p>
      </footer>
    </main>
  );
}
