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
import { Volume2, VolumeX, RefreshCw } from "lucide-react";
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
    pool,
    players,
    stake,
    boardCount,
    called,
  } = useGameStore();

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

  const calledNumbers = (called ?? []).map((c) => parseInt(c.slice(1)));

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

  const isGameActive = status === "calling";
  const isLobby = status === "waiting" || status === "idle";

  return (
    <main className="min-h-screen bg-[#0a0a0f] pb-24">
      {/* ✅ Only show top bar in LOBBY, hide during game */}
      {!isGameActive && (
        <div className="flex items-center justify-between px-4 py-2 sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-10 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-black">B</span>
            </div>
            <div>
              <span className="font-bold text-sm leading-tight text-white">
                BabiBingo
              </span>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[8px] text-gray-400">
                  {isLobby ? "Lobby" : "Live"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-white transition-colors p-1">
              <RefreshCw size={16} />
            </button>
            <button
              onClick={toggleSound}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* ✅ Game Stats - Using REAL data from store */}
      {isLobby && (
        <div className="grid grid-cols-4 gap-1 px-2 py-2 bg-[#151725]/50 mx-2 mt-2 rounded-xl">
          <div className="text-center">
            <div className="text-[10px] text-gray-500 font-medium">WINNER</div>
            <div className="text-sm font-bold text-green-400">
              {pool > 0 ? `${pool.toFixed(0)} ETB` : "—"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-500 font-medium">PLAYERS</div>
            <div className="text-sm font-bold text-white">{players || 0}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-500 font-medium">STAKE</div>
            <div className="text-sm font-bold text-white">{stake} ETB</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-500 font-medium">CALL</div>
            <div className="text-sm font-bold text-yellow-400">
              {called ? `${called.length}/75` : "0/75"}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ===== LOBBY / CARD SELECTION ===== */}
        {isLobby && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
            className="h-[calc(100vh-180px)] flex flex-col"
          >
            {/* Card selection */}
            <div className="h-[55%] overflow-hidden">
              <CardGrid send={send} />
            </div>

            {/* My cards */}
            <div className="h-[45%] overflow-y-auto px-3 pb-4">
              {myCards.length > 0 ? (
                <>
                  <div className="text-center text-xs text-gray-400 font-medium mb-2">
                    Your cards ({myCards.length}/{2})
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {myCards.map((card) => (
                      <BingoCard key={card.id} card={card} size="xs" />
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-600 text-sm">
                  Reserve a card to start playing
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ===== LIVE GAME ===== */}
        {isGameActive && (
          <motion.div
            key="game"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="px-2 mt-2"
          >
            {/* ✅ Game Stats during game - Using REAL data */}
            <div className="grid grid-cols-4 gap-1 px-2 py-2 bg-[#151725]/50 rounded-xl mb-3">
              <div className="text-center">
                <div className="text-[10px] text-gray-500 font-medium">
                  WINNER
                </div>
                <div className="text-sm font-bold text-green-400">
                  {pool > 0 ? `${pool.toFixed(0)} ETB` : "—"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500 font-medium">
                  PLAYERS
                </div>
                <div className="text-sm font-bold text-white">
                  {players || 0}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500 font-medium">
                  STAKE
                </div>
                <div className="text-sm font-bold text-white">{stake} ETB</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500 font-medium">
                  CALL
                </div>
                <div className="text-sm font-bold text-yellow-400">
                  {called ? `${called.length}/75` : "0/75"}
                </div>
              </div>
            </div>

            {/* Last Called - Large display */}
            <div className="mb-3">
              <LastCalled />
            </div>

            {/* Game Grid - Bingo Board + Cards side by side */}
            <div className="flex gap-2">
              {/* LEFT - Bingo Board */}
              <div className="w-[42%]">
                <BingoBoard />
              </div>

              {/* RIGHT - Player Cards */}
              <div className="flex-1 flex flex-col gap-2">
                {myCards.length > 0 && (
                  <>
                    {myCards.map((card) => (
                      <BingoCard
                        key={card.id}
                        card={card}
                        calledNumbers={calledNumbers}
                        size="sm"
                      />
                    ))}

                    {/* Auto Mark & BINGO Button */}
                    <div className="flex gap-2">
                      <button className="flex-1 bg-[#1a1d2e] hover:bg-[#252a3d] text-gray-300 font-bold py-2 rounded-lg text-sm transition-colors border border-white/5">
                        AUTO MARK
                      </button>
                      <button
                        onClick={handleClaimBingo}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 active:scale-[0.97] text-white font-black py-2 rounded-lg text-sm tracking-wider transition-all shadow-lg shadow-purple-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={myCards.length === 0}
                      >
                        BINGO!
                      </button>
                    </div>
                  </>
                )}

                {myCards.length === 0 && (
                  <div className="flex items-center justify-center h-full text-gray-600 text-sm">
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
