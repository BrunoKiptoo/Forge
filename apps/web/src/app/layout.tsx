import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Forge — AI-Powered Software Engineering",
  description:
    "Build production-ready software with autonomous AI agents. Code generation, testing, and deployment at the speed of thought.",
  icons: {
    icon: "/images/forge_official_logo.png",
    apple: "/images/forge_official_logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geist.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
