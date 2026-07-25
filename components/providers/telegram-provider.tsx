"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { TelegramUser } from "@/types/game";

interface TelegramContextType {
  user: TelegramUser | null;
  ready: boolean;
  expand: () => void;
  close: () => void;
  initData: string;
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  ready: false,
  expand: () => {},
  close: () => {},
  initData: "",
});

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [ready, setReady] = useState(false);
  const [initData, setInitData] = useState("");

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      console.log("Telegram WebApp not available");
      setReady(true);
      return;
    }

    tg.ready();
    tg.expand();

    tg.setHeaderColor("#0a0a0f");
    tg.setBackgroundColor("#0a0a0f");
    tg.enableClosingConfirmation();

    const telegramUser = tg.initDataUnsafe?.user;

    if (telegramUser) {
      console.log("Telegram user:", telegramUser);
      setUser({
        id: telegramUser.id,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        language_code: telegramUser.language_code,
      });
    } else {
      console.log("No Telegram user found");
    }

    setInitData(tg.initData || "");
    setReady(true);
  }, []);

  const expand = () => {
    const tg = (window as any).Telegram?.WebApp;
    tg?.expand();
  };

  const close = () => {
    const tg = (window as any).Telegram?.WebApp;
    tg?.close();
  };

  return (
    <TelegramContext.Provider value={{ user, ready, expand, close, initData }}>
      {children}
    </TelegramContext.Provider>
  );
}

export const useTelegram = () => useContext(TelegramContext);
