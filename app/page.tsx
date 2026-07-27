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
import {
  Volume2,
  VolumeX,
  CheckSquare,
  Square,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useBingoSound } from "@/hooks/use-bingo-sound";

export default function Home() {
  const { user, ready } = useTelegram();
  const { send, isConnected } = useWebSocket(user?.id); // ✅ Get isConnected from WebSocket hook
  const { playNumber, toggleMute, isMuted } = useBingoSound();

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

  // ✅ Auto Mark state
  const [autoMarkEnabled, setAutoMarkEnabled] = useState(true);

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

  // ✅ Toggle Auto Mark
  const toggleAutoMark = useCallback(() => {
    setAutoMarkEnabled((prev) => !prev);
    send({ type: "auto_mark_toggle", enabled: !autoMarkEnabled });
  }, [autoMarkEnabled, send]);

  const calledNumbers = useGameStore((s) =>
    (s.called ?? []).map((c) => parseInt(c.slice(1))),
  );
  useEffect(() => {
    if (!called || called.length === 0) return;

    const latest = called[called.length - 1];

    if (lastCalledRef.current === latest) return;

    lastCalledRef.current = latest;

    playNumber(latest);
  }, [called, playNumber]);

  const isGameActive = status === "calling";
  const isLobby = status === "waiting" || status === "idle";

  const handleSoundToggle = useCallback(() => {
    toggleSound();
    toggleMute();
  }, [toggleSound, toggleMute]);

  const isSoundOn = soundEnabled && !isMuted;

  // ✅ Loading state: Wait for Telegram ready AND WebSocket connected
  const isLoading = !ready || !isConnected;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] text-gray-500">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-12 h-12 border-2 border-gray-700 border-t-yellow-400 rounded-full mb-4"
        />
        <p className="text-lg font-medium text-gray-400">
          Connecting to BabiBingo...
        </p>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
          {!ready ? (
            <>
              <span className="animate-pulse">⏳</span> Loading Telegram...
            </>
          ) : !isConnected ? (
            <>
              <WifiOff size={14} className="text-red-400 animate-pulse" />
              Connecting to game server...
            </>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] pb-24">
      {/* ✅ Connection Status Indicator */}
      <div className="flex items-center justify-end px-4 py-1">
        <div className="flex items-center gap-1 text-[10px] text-gray-500">
          {isConnected ? (
            <>
              <Wifi size={10} className="text-green-400" />
              <span className="text-green-400/70">Connected</span>
            </>
          ) : (
            <>
              <WifiOff size={10} className="text-red-400 animate-pulse" />
              <span className="text-red-400/70">Disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* Top bar - ONLY in LOBBY */}
      {isLobby && (
        <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-10 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-black">B</span>
            </div>
            <div>
              <span className="font-bold text-lg leading-tight text-white">
                BabiBingo
              </span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-gray-400">Lobby</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleSoundToggle}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            {isSoundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      )}

      {/* GameHeader - ONLY in LOBBY state */}
      {isLobby && <GameHeader />}

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
            <div className="h-[55%] overflow-hidden">
              <CardGrid send={send} />
            </div>

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
          >
            {/* Game Stats with Sound Button */}
            <div className="flex items-center gap-2 px-2 py-2 bg-[#151725]/50 mx-2 mt-2 rounded-xl">
              <div className="flex-1 grid grid-cols-4 gap-1">
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
                  <div className="text-sm font-bold text-white">
                    {stake} ETB
                  </div>
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

              <button
                onClick={handleSoundToggle}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors p-1.5 bg-[#1a1d2e] rounded-lg border border-white/5"
                title={isSoundOn ? "Mute" : "Unmute"}
              >
                {isSoundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>

            {/* Game area */}
            <div className="flex gap-2.5 px-3 mt-3">
              {/* LEFT - Bingo Board */}
              <div className="w-[42%]">
                <BingoBoard />
              </div>

              {/* RIGHT - Player Cards */}
              <div className="flex-1 flex flex-col gap-3">
                {/* ✅ Last Called */}
                <LastCalled />

                {/* ✅ Cards */}
                {myCards.length > 0 && (
                  <div className="space-y-3">
                    {myCards.map((card) => (
                      <BingoCard
                        key={card.id}
                        card={card}
                        calledNumbers={calledNumbers}
                        size="sm"
                        autoMarkEnabled={autoMarkEnabled}
                      />
                    ))}

                    {/* ✅ Auto Mark Toggle - Under Last Called, Above Cards */}
                    <div className="flex items-center justify-between gap-2 px-1 py-1.5 bg-[#1a1d2e] rounded-lg border border-white/5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleAutoMark}
                          className={`
                            flex items-center justify-center gap-2
                            px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200
                            ${
                              autoMarkEnabled
                                ? "bg-green-600 hover:bg-green-500 text-white"
                                : "bg-[#252a3d] hover:bg-[#2d3348] text-gray-400"
                            }
                          `}
                        >
                          {autoMarkEnabled ? (
                            <CheckSquare size={14} className="text-green-300" />
                          ) : (
                            <Square size={14} className="text-gray-400" />
                          )}
                          {autoMarkEnabled ? "AUTO MARK ON" : "AUTO MARK OFF"}
                        </button>
                        <span className="text-[10px] text-gray-500">
                          {autoMarkEnabled
                            ? "Numbers are auto-marked"
                            : "Mark numbers manually"}
                        </span>
                      </div>
                    </div>

                    {/* BINGO Button */}
                    <button
                      onClick={handleClaimBingo}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 active:scale-[0.97] text-white font-black py-2.5 rounded-lg text-sm tracking-wider transition-all shadow-lg shadow-purple-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={myCards.length === 0}
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
