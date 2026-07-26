"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/hooks/use-game-store";
import { BingoCard } from "./bingo-card";
import { Trophy, Users } from "lucide-react";

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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.5, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-full max-w-sm"
        >
          {/* Trophy */}
          <div className="flex justify-center mb-2">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0], y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              {hasMultipleWinners ? (
                <Users
                  size={48}
                  className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                />
              ) : (
                <Trophy
                  size={56}
                  className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                />
              )}
            </motion.div>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-black text-center text-yellow-400 mb-4 tracking-wider"
          >
            {hasMultipleWinners
              ? `🎉 ${allWinners.length} WINNERS!`
              : "WINNER!"}
          </motion.h2>

          {/* ✅ Show all winners */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1e2130] rounded-2xl p-5 text-center border border-white/5 mb-4"
          >
            {allWinners.map((w, index) => (
              <motion.div
                key={w.user_id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`py-2 ${index > 0 ? "border-t border-white/5" : ""}`}
              >
                <div className="flex items-center justify-between px-2">
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white">
                      {w.name}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      {w.phone}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      +{w.prize.toFixed(0)} ETB
                    </div>
                    <div className="text-xs text-gray-500">
                      Card #{w.card_number}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Show first winner's card */}
          {winner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[#1e2130] rounded-2xl p-5 text-center border border-white/5"
            >
              <div className="text-sm text-gray-400 mb-2">Winning Card</div>
              <div className="mb-2">
                <BingoCard
                  card={winningCard}
                  calledNumbers={winningCard.marked_numbers}
                  highlightWin={true}
                  winningCells={winningCells}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Pattern: {winner.pattern || "Horizontal"}
              </div>
            </motion.div>
          )}

          {/* Next game countdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center"
          >
            <div className="text-sm text-gray-400 mb-2">Next game in</div>
            <motion.div
              key={nextGameTimer}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-black text-white mb-3"
            >
              {nextGameTimer}
            </motion.div>
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="bg-yellow-400 h-full rounded-full"
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
