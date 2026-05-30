"use client";

import { useState, useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  FileArchive,
  X,
  Shield,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Loader2,
} from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    setError(null);
    if (rejected.length > 0) {
      setError("Only ZIP files are accepted. Please compress your project into a .zip archive.");
      return;
    }
    if (accepted[0]) {
      setFile(accepted[0]);
      if (!projectName) {
        setProjectName(accepted[0].name.replace(".zip", "").replace(/[-_]/g, " "));
      }
    }
  }, [projectName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/zip": [".zip"] },
    maxSize: 50 * 1024 * 1024,
    multiple: false,
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const handleScan = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectName", projectName || file.name.replace(".zip", ""));

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "Upload failed");
      }

      const { projectId, scanId } = uploadData;

      // Start the scan
      const scanRes = await fetch(`/api/scan/${projectId}`, { method: "POST" });
      const scanData = await scanRes.json();
      if (!scanRes.ok) {
        throw new Error(scanData.error || "Failed to start scan");
      }

      // Redirect to scan progress page
      router.push(`/scan/${scanId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setUploading(false);
    }
  };

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
      {/* Header */}
      <div style={{ width: "100%", maxWidth: 620 }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text-muted)",
            fontSize: 14,
            textDecoration: "none",
            marginBottom: 40,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <ArrowLeft size={15} />
          Back to home
        </Link>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <Shield size={26} color="white" />
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 10 }}>
            Upload Your Project
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6 }}>
            ZIP your React or Express.js project and get an instant security audit.
            <br />
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
              node_modules will be ignored automatically.
            </span>
          </p>
        </div>

        {/* Upload Card */}
        <div className="glass-card" style={{ padding: 32, marginBottom: 20 }}>
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`upload-zone ${isDragActive ? "drag-active" : ""}`}
            style={{
              padding: "48px 24px",
              textAlign: "center",
              cursor: "pointer",
              marginBottom: 24,
            }}
          >
            <input {...getInputProps()} id="zip-file-input" />

            {file ? (
              <div>
                <CheckCircle size={40} color="#10b981" style={{ margin: "0 auto 12px" }} />
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{file.name}</p>
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  {formatSize(file.size)}
                </p>
              </div>
            ) : (
              <div>
                {isDragActive ? (
                  <>
                    <Upload
                      size={40}
                      color="#7c3aed"
                      style={{ margin: "0 auto 12px", animation: "bounce 0.5s ease infinite alternate" }}
                    />
                    <p style={{ fontWeight: 600, color: "#a855f7" }}>
                      Drop your ZIP file here!
                    </p>
                  </>
                ) : (
                  <>
                    <FileArchive
                      size={40}
                      color="var(--text-muted)"
                      style={{ margin: "0 auto 16px" }}
                    />
                    <p style={{ fontWeight: 600, marginBottom: 6, fontSize: 16 }}>
                      Drag & drop your project ZIP
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>
                      or click to browse files
                    </p>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 16px",
                        background: "rgba(124, 58, 237, 0.1)",
                        border: "1px solid rgba(124, 58, 237, 0.2)",
                        borderRadius: 6,
                        color: "#a78bfa",
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      .zip only · max 50MB
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* File selected — show change option */}
          {file && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                borderRadius: 8,
                marginBottom: 20,
                fontSize: 13,
              }}
            >
              <span style={{ color: "#6ee7b7" }}>File ready to scan</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setError(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                <X size={12} />
                Change
              </button>
            </div>
          )}

          {/* Project Name */}
          <div style={{ marginBottom: 24 }}>
            <label
              htmlFor="project-name"
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: 8,
              }}
            >
              Project Name (optional)
            </label>
            <input
              id="project-name"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Express API"
              maxLength={80}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                color: "var(--text-primary)",
                fontSize: 15,
                outline: "none",
                transition: "border-color 0.2s",
                fontFamily: "Inter, sans-serif",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                padding: "12px 16px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                borderRadius: 8,
                marginBottom: 20,
                fontSize: 13,
                color: "#fca5a5",
              }}
            >
              <AlertCircle size={15} style={{ marginTop: 1, flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* CTA Button */}
          <button
            id="start-scan-btn"
            onClick={handleScan}
            disabled={!file || uploading}
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "14px 24px", fontSize: 15 }}
          >
            {uploading ? (
              <>
                <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                Uploading & starting scan...
              </>
            ) : (
              <>
                <Shield size={18} />
                Run Security Scan
              </>
            )}
          </button>
        </div>

        {/* Info notes */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          {[
            "Your code is never stored permanently",
            "node_modules are automatically skipped",
            "No account or login required",
            "Results are ready in under 60 seconds",
          ].map((note) => (
            <div key={note} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle size={12} color="#10b981" />
              {note}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-4px); } }
      `}</style>
    </main>
  );
}
