"use client";

import Link from "next/link";
import Image from "next/image";
import { Shield, Zap, Eye, Lock, ArrowRight, CheckCircle, AlertTriangle, Code2, Package } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: Eye,
    image: "/images/secret_detection.png",
    title: "Secret Detection",
    description: "Finds hardcoded API keys, passwords, and tokens before they leak to GitHub. This is critical because exposed secrets are the number one cause of cloud breaches. Protecting your credentials prevents catastrophic unauthorized access to your databases and services.",
    color: "#ef4444",
  },
  {
    icon: Code2,
    image: "/images/code_pattern.png",
    title: "Code Pattern Analysis",
    description: "Detects eval(), SQL injection risks, XSS vectors, and command injection. Identifying these insecure code patterns is essential to stop attackers from executing malicious scripts on your server. Proactive pattern analysis secures your application's foundation and user data.",
    color: "#f97316",
  },
  {
    icon: Lock,
    image: "/images/express_security.png",
    title: "Express.js Security",
    description: "Checks for missing Helmet, rate limiting, CORS misconfig, and weak JWT secrets. Express apps are vulnerable by default if not properly configured with security headers. Enforcing these server-level protections ensures your backend is resilient against automated attacks.",
    color: "#a855f7",
  },
  {
    icon: Package,
    image: "/images/dependency_audit.png",
    title: "Dependency Audit",
    description: "Runs npm audit to find CVEs in your packages and suggests safe versions. Software supply chains are a major attack vector for modern web applications. Keeping your dependencies up-to-date and vulnerability-free is crucial for maintaining compliance and trust.",
    color: "#06b6d4",
  },
  {
    icon: Zap,
    image: "/images/ai_explanations.png",
    title: "AI Explanations",
    description: "Gemini AI translates technical findings into plain English any developer can understand. This bridges the gap between complex security jargon and actionable insights. It empowers your entire engineering team to confidently understand and fix vulnerabilities fast.",
    color: "#10b981",
  },
  {
    icon: Shield,
    image: "/images/security_score.png",
    title: "Security Score",
    description: "Get a 0–100 security score with letter grade and actionable improvement plan. This high-level metric is vital for tracking your security posture over time. It gives stakeholders immediate visibility into your application's health and prioritizes what needs fixing first.",
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
                background: "rgba(234, 179, 8, 0.1)",
                border: "1px solid rgba(234, 179, 8, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 16,
                letterSpacing: "-0.05em",
              }}
            >
              <span
                style={{
                  background: "linear-gradient(135deg, #fef08a, #eab308)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                BX
              </span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
              BegXSecure
            </span>
          </div>

          <Link href="/upload" className="btn-primary" style={{ padding: "9px 20px", fontSize: 14 }}>
            Start Free Scan
            <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "100px 24px 80px",
          textAlign: "center",
          position: "relative",
          zIndex: 10
        }}
      >
        {/* Floating background elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: 40, left: -40, width: 200, height: 200, background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)", zIndex: -1 }}
        />
        <motion.div
          animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", bottom: -20, right: -60, width: 300, height: 300, background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)", zIndex: -1 }}
        />


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
      </motion.section>

      {/* ── Features grid ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 100px", perspective: 1000 }}>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 120,
            paddingTop: 40,
          }}
        >
          {FEATURES.map(({ icon: Icon, image, title, description, color }, index) => {
            const isEven = index % 2 === 0;
            return (
            <motion.div 
              key={title} 
              variants={{
                hidden: { opacity: 0, y: 40, rotateX: 5 },
                show: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 200, damping: 24 } }
              }}
              style={{
                display: "flex",
                flexDirection: isEven ? "row" : "row-reverse",
                alignItems: "center",
                gap: "8vw",
                flexWrap: "wrap",
              }}
            >
              {/* Illustration Side */}
              <div style={{ flex: "1 1 300px", display: "flex", justifyContent: "center" }}>
                <div 
                  className="glass-card" 
                  style={{ 
                    width: "100%", 
                    maxWidth: 320, 
                    aspectRatio: "1/1", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    background: `linear-gradient(135deg, ${color}10 0%, rgba(0,0,0,0) 100%)`,
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <motion.div 
                    animate={{ y: [0, -15, 0], scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                       position: "absolute",
                       width: "70%",
                       height: "70%",
                       background: color,
                       filter: "blur(70px)",
                       opacity: 0.15
                    }}
                  />
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    whileHover={{ scale: 1.1, rotateY: 10, y: 0 }}
                    style={{ zIndex: 10, perspective: 1000, position: "relative", width: 160, height: 160, borderRadius: "50%", overflow: "hidden", border: `3px solid ${color}40` }}
                  >
                    <Image src={image} alt={title} fill style={{ objectFit: "cover" }} />
                  </motion.div>
                </div>
              </div>

              {/* Text Side */}
              <div style={{ flex: "1 1 300px", textAlign: isEven ? "left" : "right" }}>
                <h3 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, marginBottom: 16, color: "var(--text-primary)", lineHeight: 1.2 }}>
                  {title}
                </h3>
                <p style={{ fontSize: 17, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 500, marginLeft: isEven ? 0 : "auto" }}>
                  {description}
                </p>
              </div>
            </motion.div>
            );
          })}
        </motion.div>
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

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
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
        </motion.div>
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
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              background: "rgba(234, 179, 8, 0.1)",
              border: "1px solid rgba(234, 179, 8, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 10,
              letterSpacing: "-0.05em",
            }}
          >
            <span
              style={{
                background: "linear-gradient(135deg, #fef08a, #eab308)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              BX
            </span>
          </div>
          <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>BegXSecure</span>
        </div>
        <p>AI-Assisted Security Review — Not a guarantee of security.</p>
      </footer>
    </main>
  );
}
