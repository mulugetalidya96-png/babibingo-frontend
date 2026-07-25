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
  const [debug, setDebug] = useState("");

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    alert(
      JSON.stringify({
        hasTelegram: !!window.Telegram,
        hasWebApp: !!tg,
        initData: tg?.initData?.length,
        user: tg?.initDataUnsafe?.user,
      }),
    );

    if (!tg) {
      console.log("Not running inside Telegram");
      setReady(true);
      return;
    }

    tg.ready();
    tg.expand();

    const telegramUser = tg.initDataUnsafe?.user;

    if (!telegramUser) {
      console.log("Telegram user not available");
      setReady(true);
      return;
    }

    console.log("Telegram User:", telegramUser);
    setDebug(
      JSON.stringify({
        initData: tg.initData,
        user,
      }),
    );
    setUser({
      id: telegramUser.id,
      first_name: telegramUser.first_name,
      last_name: telegramUser.last_name,
      username: telegramUser.username,
      language_code: telegramUser.language_code,
    });

    setInitData(tg.initData);
    setReady(true);
  }, []);

  const expand = () => {
    window.Telegram?.WebApp?.expand();
  };

  const close = () => {
    window.Telegram?.WebApp?.close();
  };

  return (
    <TelegramContext.Provider
      value={{
        user,
        ready,
        expand,
        close,
        initData,
      }}
    >
      <>
        {children}

        <pre className="fixed bottom-0 left-0 right-0 bg-black text-white text-xs z-50">
          {debug}
        </pre>
      </>
    </TelegramContext.Provider>
  );
}

export const useTelegram = () => useContext(TelegramContext);
