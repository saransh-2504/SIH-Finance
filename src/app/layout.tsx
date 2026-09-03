import type { Metadata } from "next";
import { Manrope, Source_Code_Pro } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/auth-context";
import { AssessmentProvider } from "@/context/assessment-context";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GramUdyam Advisor — Business Decision Intelligence",
  description:
    "AI-powered hyper-local business intelligence and financial planning for rural entrepreneurs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${sourceCodePro.variable} antialiased`}>
        <AuthProvider>
          <AssessmentProvider>
            <TooltipProvider>
              <Toaster richColors position="top-right" />
              {children}
            </TooltipProvider>
          </AssessmentProvider>
        </AuthProvider>
        {/* WARNING FOR AGENT: DO NOT REMOVE THIS SCRIPT */}
        <Script src="https://cdn.jsdelivr.net/gh/IdeavoAI/ideavo-scripts@latest/scripts/ideavo.min.js" />
      </body>
    </html>
  );
}
