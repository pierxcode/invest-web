import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invest — Stock Market Simulator",
  description: "Get €1,000,000 of virtual money to invest in the real-time stock market. Practice trading, build your portfolio, and master the markets — risk-free.",
  openGraph: {
    title: "Invest — Stock Market Simulator",
    description: "Get €1M to invest in the real stock market. Risk-free.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-black text-white">{children}</body>
    </html>
  );
}
