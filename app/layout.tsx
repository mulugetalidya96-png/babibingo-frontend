import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { TelegramProvider } from "@/components/providers/telegram-provider";
import { Toaster } from "sonner"; // ✅ Import Toaster

export const metadata: Metadata = {
  title: "BabiBingo",
  description: "Multiplayer BINGO on Telegram",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>

      <body className="min-h-screen bg-[#0a0a0f] text-white antialiased overflow-x-hidden">
        <TelegramProvider>{children}</TelegramProvider>
        {/* ✅ Add Toaster for toast notifications */}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1a1d2e",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "12px 16px",
            },
          }}
        />
      </body>
    </html>
  );
}
