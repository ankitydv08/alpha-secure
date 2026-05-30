import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ScanFinding } from "./scanners/secretScanner";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash", // Available on free tier
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 500,
  },
});

function buildPrompt(finding: ScanFinding, framework: string): string {
  return `You are a senior security engineer explaining a vulnerability to a beginner developer.
Be clear, friendly, and practical. Avoid jargon. Use simple language.

Framework: ${framework || "JavaScript/Node.js"}
Issue found: ${finding.title}
Severity: ${finding.severity}
File: ${finding.filePath || "Unknown"}
${finding.codeSnippet ? `\nRelevant code:\n\`\`\`\n${finding.codeSnippet.slice(0, 400)}\n\`\`\`` : ""}

Write a 3-4 sentence explanation covering:
1. What this vulnerability is (in plain English, no jargon)
2. How an attacker could actually exploit it (give a real-world scenario)
3. Why it matters for this specific type of application

Do NOT include the fix in this response — just the explanation. Be concise.`;
}

export async function explainFinding(
  finding: ScanFinding,
  framework: string
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return `${finding.description} This is a ${finding.severity.toLowerCase()} severity issue that should be addressed before deploying to production.`;
  }

  try {
    const result = await model.generateContent(buildPrompt(finding, framework));
    const text = result.response.text().trim();
    return text || finding.description;
  } catch (err) {
    console.error("Gemini API error:", err);
    return finding.description; // Graceful fallback
  }
}

export async function generateDeploymentAdvice(
  framework: string,
  severityCounts: Record<string, number>
): Promise<string[]> {
  if (!process.env.GEMINI_API_KEY) {
    return getStaticDeploymentAdvice(framework);
  }

  const prompt = `You are a security engineer giving deployment advice to a beginner developer.
Their app uses: ${framework || "Node.js + React"}
Security scan results: ${JSON.stringify(severityCounts)}

Give exactly 5 specific, actionable deployment security tips for this stack.
Each tip should be one sentence. Be beginner-friendly.
Format as a JSON array of strings. Only output the JSON array, nothing else.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Fall through to static advice
  }

  return getStaticDeploymentAdvice(framework);
}

function getStaticDeploymentAdvice(framework: string): string[] {
  const common = [
    "Store all secrets (API keys, database passwords) as environment variables — never hardcode them in your source code.",
    "Enable HTTPS everywhere — Vercel handles this automatically, but ensure all API calls use https://",
    "Set up database connection pooling and never expose your database directly to the internet.",
    "Implement proper error handling that doesn't expose stack traces or internal details to users.",
    "Regularly run `npm audit` and update vulnerable dependencies before deploying.",
  ];

  if (framework.includes("Express")) {
    return [
      "Add `app.use(helmet())` to your Express app to set secure HTTP headers automatically.",
      "Use `express-rate-limit` on all authentication endpoints to prevent brute force attacks.",
      ...common.slice(0, 3),
    ];
  }

  return common;
}
