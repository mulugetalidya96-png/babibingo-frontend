"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTelegram } from "@/components/providers/telegram-provider";
import { useGameStore } from "@/hooks/use-game-store";
import { useWebSocket } from "@/hooks/use-websocket";
import { GameHeader } from "@/components/game/game-header";
import { CardGrid } from "@/components/game/card-grid";
import { BingoCard } from "@/components/game/bingo-card";
import { BingoBoard } from "@/components/game/bingo-board";
import { LastCalled } from "@/components/game/last-called";
import { WinnerModal } from "@/components/game/winner-modal";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useBingoSound } from "@/hooks/use-bingo-sound";

export default function Home() {
  const { user, ready } = useTelegram();
  const { send } = useWebSocket(user?.id);
  const { playNumber } = useBingoSound();

  const {
    status,
    myCards,
    winner,
    soundEnabled,
    nextGameTimer,
    toggleSound,
    setNextGameTimer,
  } = useGameStore();
  const called = useGameStore((s) => s.called);

  const lastCalledRef = useRef<string | null>(null);

  // Countdown timer for next game
  useEffect(() => {
    if (status !== "finished" || nextGameTimer <= 0) return;
    const interval = setInterval(() => {
      setNextGameTimer(Math.max(0, nextGameTimer - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [status, nextGameTimer, setNextGameTimer]);

  const handleClaimBingo = useCallback(() => {
    if (myCards.length === 0) return;
    send({ type: "bingo.claim", card_id: myCards[0].id });
  }, [myCards, send]);

  const calledNumbers = useGameStore((s) =>
    (s.called ?? []).map((c) => parseInt(c.slice(1))),
  );
  useEffect(() => {
    if (!called || called.length === 0) return;

    const latest = called[called.length - 1];

    // avoid replay on reload / initial websocket state
    if (lastCalledRef.current === latest) return;

    lastCalledRef.current = latest;

    playNumber(latest);
  }, [called, playNumber]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="animate-pulse">Loading BabiBingo...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] pb-24">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-sm font-black">B</span>
          </div>
          <div>
            <span className="font-bold text-lg leading-tight">BabiBingo</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-gray-400">Connected</span>
            </div>
          </div>
        </div>
        <button
          onClick={toggleSound}
          className="text-gray-400 hover:text-white transition-colors p-2"
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      <GameHeader />

      <AnimatePresence mode="wait">
        {/* ===== LOBBY / CARD SELECTION ===== */}
        {(status === "waiting" || status === "idle") && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
            className="h-[calc(100vh-120px)] flex flex-col"
          >
            {/* Card selection - 50% */}
            <div className="h-1/2 overflow-hidden">
              <CardGrid send={send} />
            </div>

            {/* My cards - 50% */}
            <div className="h-1/2 overflow-y-auto px-3 pb-4">
              {myCards.length > 0 ? (
                <>
                  <div className="text-center text-sm text-gray-400 font-medium mb-3">
                    Your cards
                  </div>

                  <div className="space-y-3">
                    {myCards.map((card) => (
                      <BingoCard key={card.id} card={card} />
                    ))}
                  </div>
                </>
              ) : (
                <div
                  className="
          h-full
          flex
          items-center
          justify-center
          text-gray-600
          text-sm
        "
                >
                  Reserve a card to start playing
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ===== LIVE GAME ===== */}
        {/* ===== LIVE GAME ===== */}
        {status === "calling" && (
          <motion.div
            key="game"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {/* Game area */}
            <div className="flex gap-2.5 px-3 mt-3">
              {/* LEFT - Bingo Board */}
              <div className="w-[42%]">
                <BingoBoard />
              </div>

              {/* RIGHT - Player Cards */}
              <div className="flex-1 flex flex-col gap-3">
                {/* Last Called */}
                <LastCalled />

                {/* Cards */}
                {myCards.length > 0 && (
                  <div className="space-y-3">
                    {myCards.map((card) => (
                      <BingoCard
                        key={card.id}
                        card={card}
                        calledNumbers={calledNumbers}
                      />
                    ))}

                    <button
                      onClick={handleClaimBingo}
                      className="
                w-full
                bg-gradient-to-r
                from-purple-600
                to-purple-500
                hover:from-purple-500
                hover:to-purple-400
                active:scale-[0.98]
                text-white
                font-black
                py-3.5
                rounded-xl
                text-lg
                tracking-widest
                transition-all
                shadow-lg
                shadow-purple-900/40
              "
                    >
                      BINGO!
                    </button>
                  </div>
                )}

                {myCards.length === 0 && (
                  <div className="flex items-center justify-center h-full text-gray-600">
                    Waiting for card...
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
        {/* ===== FINISHED / WAITING ===== */}
        {status === "finished" && !winner && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-gray-600"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-12 h-12 border-2 border-gray-700 border-t-gray-400 rounded-full mb-4"
            />
            <p className="text-lg font-medium tracking-wide">
              WAIT FOR NEXT GAME
            </p>
            {nextGameTimer > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Starting in {nextGameTimer}s
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winner Modal Overlay */}
      <WinnerModal />
    </main>
  );
}
