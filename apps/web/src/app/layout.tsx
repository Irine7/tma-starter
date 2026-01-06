import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MockTelegramProvider } from "@/components/providers/MockTelegramProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TMA Boilerplate",
  description: "Production-ready Telegram Mini App Boilerplate",
  keywords: ["Telegram", "Mini App", "TMA", "Boilerplate", "Next.js"],
  authors: [{ name: "TMA Boilerplate" }],
  openGraph: {
    title: "TMA Boilerplate",
    description: "Production-ready Telegram Mini App Boilerplate",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Optimize for Telegram WebApp
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Telegram WebApp Script */}
        <script
          src="https://telegram.org/js/telegram-web-app.js"
          async
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <MockTelegramProvider>{children}</MockTelegramProvider>
      </body>
    </html>
  );
}
