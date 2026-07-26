"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/hooks/use-game-store";
import { BingoCard } from "./bingo-card";
import { Trophy, Users, Crown } from "lucide-react";

export function WinnerModal() {
  const { winner, winners, nextGameTimer } = useGameStore();

  // If no winner and game is still going, don't show
  if (!winner && winners.length === 0) return null;

  // Use winners array if available, otherwise use single winner
  const allWinners = winners.length > 0 ? winners : winner ? [winner] : [];
  const hasMultipleWinners = allWinners.length > 1;

  // Build winning card mock data
  const winningCard = {
    id: "winner-card",
    card_number: winner?.card_number || 0,
    card_data: {
      B: [2, 7, 11, 15, 9],
      I: [25, 28, 16, 27, 29],
      N: [38, 34, null, 39, 44],
      G: [50, 51, 59, 60, 46],
      O: [61, 67, 70, 62, 66],
      card_id: winner?.card_number || 0,
    },
    marked_numbers: [9, 29, 44, 46, 66, 27, 51, 61, 50, 34],
    is_winner: true,
  };

  const winningCells = new Set(["4-0", "4-1", "4-2", "4-3", "4-4"]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.5, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Trophy */}
          <div className="flex justify-center mb-1 sm:mb-2">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0], y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              {hasMultipleWinners ? (
                <Users
                  size={40}
                  className="text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]"
                />
              ) : (
                <Trophy
                  size={48}
                  className="text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]"
                />
              )}
            </motion.div>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl sm:text-3xl font-black text-center text-yellow-400 mb-3 sm:mb-4 tracking-wider"
          >
            {hasMultipleWinners
              ? `🎉 ${allWinners.length} WINNERS!`
              : "🎉 BINGO!"}
          </motion.h2>

          {/* ✅ Winners List - Scrollable for many winners */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1a1d2e] rounded-2xl p-3 sm:p-5 border border-white/5 mb-3 sm:mb-4 max-h-[40vh] overflow-y-auto"
          >
            {allWinners.map((w, index) => (
              <motion.div
                key={w.user_id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.08 }}
                className={`py-2 sm:py-2.5 ${index > 0 ? "border-t border-white/5" : ""}`}
              >
                <div className="flex items-center justify-between gap-2 px-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Crown for first winner */}
                    {index === 0 && (
                      <Crown
                        size={14}
                        className="text-yellow-400 flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm sm:text-base font-semibold text-white truncate">
                        {w.name}
                      </div>
                      <div className="text-xs text-gray-400 font-mono truncate">
                        {w.phone}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-base sm:text-lg font-bold text-green-400">
                      +{w.prize.toFixed(0)} ETB
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500">
                      #{w.card_number}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* ✅ Show winning cards - Responsive grid for multiple cards */}
          {winner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[#1a1d2e] rounded-2xl p-3 sm:p-5 border border-white/5"
            >
              <div className="text-xs sm:text-sm text-gray-400 mb-2 text-center">
                Winning Card{hasMultipleWinners ? "s" : ""}
              </div>

              {/* ✅ Responsive grid for multiple cards */}
              <div
                className={`
                grid gap-2 sm:gap-3
                ${hasMultipleWinners ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}
              `}
              >
                {/* Show up to 2 winning cards */}
                {allWinners.slice(0, 2).map((w, idx) => (
                  <motion.div
                    key={w.user_id || idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="bg-[#111424] rounded-xl p-2 sm:p-3 border border-white/5"
                  >
                    <div className="text-[10px] text-gray-500 text-center mb-1">
                      {w.name} • #{w.card_number}
                    </div>
                    <div className="scale-75 sm:scale-90 transform origin-top">
                      <BingoCard
                        card={winningCard}
                        calledNumbers={winningCard.marked_numbers}
                        highlightWin={true}
                        winningCells={winningCells}
                        size="sm"
                      />
                    </div>
                    <div className="text-[10px] text-gray-500 text-center mt-1">
                      {w.pattern || "Horizontal"}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ✅ Show "more" indicator if more than 2 winners */}
              {hasMultipleWinners && allWinners.length > 2 && (
                <div className="text-center text-xs text-gray-500 mt-2">
                  + {allWinners.length - 2} more winner
                  {allWinners.length - 2 > 1 ? "s" : ""}
                </div>
              )}
            </motion.div>
          )}

          {/* Next game countdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 sm:mt-6 text-center"
          >
            <div className="text-xs sm:text-sm text-gray-400 mb-1">
              Next game in
            </div>
            <motion.div
              key={nextGameTimer}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl sm:text-5xl font-black text-white mb-2"
            >
              {nextGameTimer}s
            </motion.div>
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: nextGameTimer, ease: "linear" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
