"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { TelegramUser } from "@/types/game"

interface TelegramContextType {
  user: TelegramUser | null
  ready: boolean
  expand: () => void
  close: () => void
  initData: string
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  ready: false,
  expand: () => {},
  close: () => {},
  initData: "",
})

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [ready, setReady] = useState(false)
  const [initData, setInitData] = useState("")

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (!tg) {
      // Development fallback
      setUser({ id: 123456789, first_name: "Test", username: "testuser" })
      setReady(true)
      return
    }

    tg.ready()
    tg.expand()
    tg.setHeaderColor("#0a0a0f")
    tg.setBackgroundColor("#0a0a0f")
    tg.enableClosingConfirmation()

    if (tg.initDataUnsafe?.user) {
      setUser(tg.initDataUnsafe.user)
    }
    setInitData(tg.initData || "")
    setReady(true)
  }, [])

  const expand = () => {
    const tg = (window as any).Telegram?.WebApp
    tg?.expand()
  }

  const close = () => {
    const tg = (window as any).Telegram?.WebApp
    tg?.close()
  }

  return (
    <TelegramContext.Provider value={{ user, ready, expand, close, initData }}>
      {children}
    </TelegramContext.Provider>
  )
}

export const useTelegram = () => useContext(TelegramContext)
