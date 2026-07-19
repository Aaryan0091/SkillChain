import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillChain AI",
  description:
    "AI-powered GitHub repository analysis and blockchain-backed skill verification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}
