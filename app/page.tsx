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
  Wifi,
  WifiOff,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useBingoSound } from "@/hooks/use-bingo-sound";

export default function Home() {
  const { user, ready } = useTelegram();
  const { send, isConnected } = useWebSocket(user?.id);
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
    timer,
    boardCount,
    called,
  } = useGameStore();

  const [autoMarkEnabled, setAutoMarkEnabled] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(3);
  const [countdownPhase, setCountdownPhase] = useState<"countdown" | "go" | "">(
    "",
  );

  const lastCalledRef = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "finished" || nextGameTimer <= 0) return;
    const interval = setInterval(() => {
      setNextGameTimer(Math.max(0, nextGameTimer - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [status, nextGameTimer, setNextGameTimer]);

  // ✅ Countdown animation - stays until game starts
  useEffect(() => {
    if (status === "calling") {
      setShowCountdown(false);
      setCountdownPhase("");
      return;
    }

    if (status !== "waiting") {
      setShowCountdown(false);
      setCountdownPhase("");
      return;
    }

    if (timer <= 1 && timer >= 0) {
      if (!showCountdown) {
        setShowCountdown(true);
        setCountdownNumber(3);
        setCountdownPhase("countdown");
      }

      const countdownInterval = setInterval(() => {
        setCountdownNumber((prev) => {
          if (prev === 1) {
            setCountdownPhase("go");
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 600);

      return () => clearInterval(countdownInterval);
    } else {
      if (showCountdown && timer > 1) {
        setShowCountdown(false);
        setCountdownPhase("");
      }
    }
  }, [timer, status]);

  const handleClaimBingo = useCallback(() => {
    if (myCards.length === 0) return;
    send({ type: "bingo.claim", card_id: myCards[0].id });
  }, [myCards, send]);

  const toggleAutoMark = useCallback(() => {
    setAutoMarkEnabled((prev) => !prev);
  }, []);

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

      {/* ✅ Beautiful Countdown Overlay */}
      <AnimatePresence>
        {showCountdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-black/95 to-[#0a0a0f] backdrop-blur-md"
          >
            <div className="flex flex-col items-center">
              {countdownPhase === "countdown" && countdownNumber > 0 && (
                <motion.div
                  key={countdownNumber}
                  initial={{ scale: 3, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.5, opacity: 0, y: -50 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    duration: 0.5,
                  }}
                  className="relative"
                >
                  {/* ✅ Glowing circle behind number */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 2, opacity: 0.3 }}
                      transition={{ duration: 0.5 }}
                      className="w-48 h-48 rounded-full bg-yellow-400/20 blur-3xl"
                    />
                  </div>

                  {/* ✅ Large number with gradient */}
                  <div className="relative text-[200px] sm:text-[280px] font-black leading-none tracking-tighter">
                    <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      {countdownNumber}
                    </span>
                  </div>

                  {/* ✅ Subtle number shadow */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent blur-xl" />
                </motion.div>
              )}

              {countdownPhase === "go" && (
                <motion.div
                  initial={{ scale: 2, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    duration: 0.6,
                  }}
                  className="flex flex-col items-center"
                >
                  {/* ✅ Glowing ring */}
                  <div className="relative">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-64 h-64 rounded-full border-4 border-green-400/20 blur-2xl" />
                    </motion.div>

                    <div className="text-[150px] sm:text-[200px] font-black leading-none tracking-tighter">
                      <span className="bg-gradient-to-r from-green-300 via-green-400 to-emerald-400 bg-clip-text text-transparent">
                        GO!
                      </span>
                    </div>
                  </div>

                  {/* ✅ Pulsing "Waiting" text */}
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="mt-6 text-sm text-gray-400 font-medium tracking-widest uppercase"
                  >
                    ⏳ Game Starting...
                  </motion.div>
                </motion.div>
              )}

              {/* ✅ Animated progress bar */}
              {countdownPhase === "countdown" && (
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 1.8, ease: "linear" }}
                  className="mt-12 h-1.5 bg-gradient-to-r from-yellow-400 via-orange-400 to-green-400 rounded-full max-w-[300px] w-full shadow-[0_0_20px_rgba(250,204,21,0.3)]"
                />
              )}

              {/* ✅ Particle effects (small dots) */}
              {countdownPhase === "countdown" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        scale: 0,
                        opacity: 0,
                      }}
                      animate={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        scale: [0, 1, 0],
                        opacity: [0, 0.5, 0],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                      className="absolute w-1 h-1 rounded-full bg-yellow-400/30"
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {isLobby && <GameHeader />}

      <AnimatePresence mode="wait">
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
                    Your cards ({myCards.length}/{4})
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

        {isGameActive && (
          <motion.div
            key="game"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
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

            <div className="flex gap-2.5 px-3 mt-3">
              <div className="w-[42%]">
                <BingoBoard />
              </div>

              <div className="flex-1 flex flex-col gap-3">
                <LastCalled />

                {myCards.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleAutoMark}
                          className="flex items-center gap-1.5 text-[10px] font-medium transition-colors duration-200 text-gray-400 hover:text-white"
                        >
                          {autoMarkEnabled ? (
                            <ToggleRight size={18} className="text-green-400" />
                          ) : (
                            <ToggleLeft size={18} className="text-gray-500" />
                          )}
                          <span
                            className={
                              autoMarkEnabled
                                ? "text-green-400"
                                : "text-gray-500"
                            }
                          >
                            Auto Mark
                          </span>
                        </button>
                      </div>
                    </div>

                    {myCards.map((card) => (
                      <BingoCard
                        key={card.id}
                        card={card}
                        calledNumbers={calledNumbers}
                        size="sm"
                        autoMarkEnabled={autoMarkEnabled}
                      />
                    ))}

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

      <WinnerModal />
    </main>
  );
}
