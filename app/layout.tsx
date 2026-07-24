import type { Metadata, Viewport } from "next"
import "./globals.css"
import { TelegramProvider } from "@/components/providers/telegram-provider"

export const metadata: Metadata = {
  title: "BabiBingo",
  description: "Multiplayer BINGO on Telegram",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0f",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0f] text-white antialiased overflow-x-hidden">
        <TelegramProvider>{children}</TelegramProvider>
      </body>
    </html>
  )
}
