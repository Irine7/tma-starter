import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MockTelegramProvider } from "@/components/providers/MockTelegramProvider";
import { TelegramThemeProvider } from "@/components/providers/TelegramThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { TonConnectProvider } from "@/components/providers/TonConnectProvider";
import { BottomNav } from "@/components/BottomNav";
import { DesktopBlocker } from "@/components/DesktopBlocker";
import { ClosingConfirmation } from "@/components/ClosingConfirmation";
import { Toaster } from "sonner";

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
        {/* Prevent flash of light/pink theme by applying theme before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme-preference');
                  var isDark = stored === 'dark' ||
                    (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <MockTelegramProvider>
          {/* <DesktopBlocker botUsername="tma_starter_bot" /> */}
          <ClosingConfirmation />
          <TelegramThemeProvider>
            <TonConnectProvider>
              <AuthProvider>
                {children}
                <BottomNav />
                <Toaster 
                  position="top-center" 
                  offset="96px"
                  mobileOffset="96px"
                />
              </AuthProvider>
            </TonConnectProvider>
          </TelegramThemeProvider>
        </MockTelegramProvider>
      </body>
    </html>
  );
}

