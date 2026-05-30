import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecureCheck — AI-Powered Security Review Platform",
  description:
    "Upload your React or Express.js project and get an instant AI-powered security audit. Find vulnerabilities, exposed secrets, and insecure code patterns before you deploy.",
  keywords: [
    "security audit",
    "code review",
    "vulnerability scanner",
    "React security",
    "Express security",
    "npm audit",
    "secret detection",
  ],
  openGraph: {
    title: "SecureCheck — AI-Powered Security Review",
    description: "Find security vulnerabilities in your code before attackers do.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
