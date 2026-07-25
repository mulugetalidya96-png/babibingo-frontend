"use client";

import { useEffect, useState, useCallback } from "react";
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

export default function Home() {
  const { user, ready } = useTelegram();
  const { send } = useWebSocket(user?.id);

  const {
    status,
    selectedCards,
    myCards,
    winner,
    soundEnabled,
    nextGameTimer,
    toggleSound,
    setNextGameTimer,
  } = useGameStore();

  // Countdown timer for next game
  useEffect(() => {
    if (status !== "finished" || nextGameTimer <= 0) return;
    const interval = setInterval(() => {
      setNextGameTimer(Math.max(0, nextGameTimer - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [status, nextGameTimer, setNextGameTimer]);

  const handleBuyCards = useCallback(() => {
    if (selectedCards.length === 0) return;
    send({ type: "card.select", card_numbers: selectedCards });
  }, [selectedCards, send]);

  const handleClaimBingo = useCallback(() => {
    if (myCards.length === 0) return;
    send({ type: "bingo.claim", card_id: myCards[0].id });
  }, [myCards, send]);

  const calledNumbers = useGameStore((s) =>
    (s.called ?? []).map((c) => parseInt(c.slice(1))),
  );

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
          >
            <CardGrid />

            {/* My purchased cards */}
            {myCards.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="text-center text-sm text-gray-400 font-medium">
                  Your selected cards
                </div>
                {myCards.map((card) => (
                  <BingoCard key={card.id} card={card} />
                ))}
              </div>
            )}

            {/* Buy button */}
            <AnimatePresence>
              {selectedCards.length > 0 && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent z-20"
                >
                  <button
                    onClick={handleBuyCards}
                    className="w-full bg-[#e8793c] hover:bg-orange-600 active:bg-orange-700 text-white font-black py-4 rounded-xl text-lg transition-all shadow-lg shadow-orange-500/20"
                  >
                    Buy {selectedCards.length} Card
                    {selectedCards.length > 1 ? "s" : ""} —{" "}
                    {selectedCards.length * 20} ETB
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ===== LIVE GAME ===== */}
        {status === "calling" && (
          <motion.div
            key="game"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <LastCalled />

            {/* Game stats bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#151725] mx-3 rounded-lg mb-2 text-xs">
              <div className="text-gray-400">
                CALL <span className="text-white font-bold ml-1">22/75</span>
              </div>
              <div className="text-gray-400">
                PLAYERS <span className="text-white font-bold ml-1">69</span>
              </div>
              <div className="text-gray-400">
                STAKE <span className="text-white font-bold ml-1">20 ETB</span>
              </div>
            </div>

            <BingoBoard />

            {/* My cards during game */}
            {myCards.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="text-center text-sm text-gray-400 font-medium">
                  Your cards
                </div>
                {myCards.map((card) => (
                  <BingoCard
                    key={card.id}
                    card={card}
                    calledNumbers={calledNumbers}
                  />
                ))}

                <div className="px-3 pb-4">
                  <button
                    onClick={handleClaimBingo}
                    className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-black py-4 rounded-xl text-lg transition-all shadow-lg shadow-green-500/20 animate-pulse"
                  >
                    🎉 CLAIM BINGO!
                  </button>
                </div>
              </div>
            )}

            {myCards.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-gray-600">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-12 h-12 border-2 border-gray-700 border-t-gray-400 rounded-full mb-4"
                />
                <p className="text-lg font-medium tracking-wide">
                  WAIT FOR NEXT GAME
                </p>
              </div>
            )}
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
