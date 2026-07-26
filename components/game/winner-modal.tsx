"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/hooks/use-game-store";
import { BingoCard } from "./bingo-card";
import { Trophy } from "lucide-react";

export function WinnerModal() {
  const { winner, winners, nextGameTimer, myCards, called } = useGameStore();

  // If no winner, don't show
  if (!winner && winners.length === 0) return null;

  // Use winners array if available, otherwise use single winner
  const allWinners = winners.length > 0 ? winners : winner ? [winner] : [];
  const primaryWinner = allWinners[0];

  // ✅ Find the actual winning card from user's cards
  const winningCardData = myCards.find(
    (card) => card.card_number === primaryWinner?.card_number,
  );

  // ✅ Get called numbers as integers for marking
  const calledNumbers = called.map((c) => parseInt(c.slice(1)));

  // ✅ Use real card data if available, otherwise fallback
  const winningCard = winningCardData || {
    id: "winner-card",
    card_number: primaryWinner?.card_number || 0,
    card_data: {
      B: [2, 7, 11, 15, 9],
      I: [25, 28, 16, 27, 29],
      N: [38, 34, null, 39, 44],
      G: [50, 51, 59, 60, 46],
      O: [61, 67, 70, 62, 66],
      card_id: primaryWinner?.card_number || 0,
    },
    marked_numbers: [],
    is_winner: true,
  };

  // ✅ Calculate winning cells based on the pattern
  const getWinningCells = (card: typeof winningCard) => {
    const cells = new Set<string>();
    const grid = [
      card.card_data.B,
      card.card_data.I,
      card.card_data.N,
      card.card_data.G,
      card.card_data.O,
    ];

    // Check horizontal wins
    for (let row = 0; row < 5; row++) {
      let win = true;
      for (let col = 0; col < 5; col++) {
        const num = grid[col][row];
        if (
          num !== null &&
          !calledNumbers.includes(num) &&
          !winningCard.marked_numbers?.includes(num)
        ) {
          win = false;
          break;
        }
      }
      if (win) {
        for (let col = 0; col < 5; col++) {
          cells.add(`${row}-${col}`);
        }
        return cells;
      }
    }

    // Check vertical wins
    for (let col = 0; col < 5; col++) {
      let win = true;
      for (let row = 0; row < 5; row++) {
        const num = grid[col][row];
        if (
          num !== null &&
          !calledNumbers.includes(num) &&
          !winningCard.marked_numbers?.includes(num)
        ) {
          win = false;
          break;
        }
      }
      if (win) {
        for (let row = 0; row < 5; row++) {
          cells.add(`${row}-${col}`);
        }
        return cells;
      }
    }

    // Check diagonal (top-left to bottom-right)
    let win = true;
    for (let i = 0; i < 5; i++) {
      const num = grid[i][i];
      if (
        num !== null &&
        !calledNumbers.includes(num) &&
        !winningCard.marked_numbers?.includes(num)
      ) {
        win = false;
        break;
      }
    }
    if (win) {
      for (let i = 0; i < 5; i++) {
        cells.add(`${i}-${i}`);
      }
      return cells;
    }

    // Check diagonal (top-right to bottom-left)
    win = true;
    for (let i = 0; i < 5; i++) {
      const num = grid[4 - i][i];
      if (
        num !== null &&
        !calledNumbers.includes(num) &&
        !winningCard.marked_numbers?.includes(num)
      ) {
        win = false;
        break;
      }
    }
    if (win) {
      for (let i = 0; i < 5; i++) {
        cells.add(`${i}-${4 - i}`);
      }
      return cells;
    }

    return cells;
  };

  const winningCells = getWinningCells(winningCard);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-sm bg-[#1a1d2e] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
        >
          {/* Header - WINNER! */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 py-4 px-6 text-center border-b border-white/5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center mb-1"
            >
              <Trophy size={36} className="text-yellow-400" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-black text-yellow-400 tracking-wider"
            >
              WINNER!
            </motion.h2>
          </div>

          {/* Winner Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-5 text-center"
          >
            {/* Name */}
            <div className="text-xl font-bold text-white mb-0.5">
              {primaryWinner?.name || "Unknown"}
            </div>

            {/* Phone */}
            <div className="text-sm text-gray-400 font-mono mb-3">
              {primaryWinner?.phone || "N/A"}
            </div>

            {/* Prize */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-3xl font-black text-green-400 mb-3"
            >
              +{primaryWinner?.prize?.toFixed(0) || 0} ETB
            </motion.div>

            {/* Card Number */}
            <div className="text-xs text-gray-500 mb-3">
              Card #{primaryWinner?.card_number || 0}
            </div>

            {/* Bingo Card - Using real data */}
            <div className="bg-[#111424] rounded-xl p-3 border border-white/5">
              <BingoCard
                card={winningCard}
                calledNumbers={calledNumbers}
                highlightWin={true}
                winningCells={winningCells}
                size="sm"
              />
            </div>

            {/* Pattern Display */}
            {primaryWinner?.pattern && (
              <div className="mt-2 text-xs text-gray-500">
                Pattern: {primaryWinner.pattern}
              </div>
            )}

            {/* Multiple winners indicator */}
            {allWinners.length > 1 && (
              <div className="mt-3 text-xs text-yellow-400/70">
                + {allWinners.length - 1} more winner
                {allWinners.length - 1 > 1 ? "s" : ""}
              </div>
            )}
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="px-5 pb-5 text-center"
          >
            <div className="text-xs text-gray-500 mb-1">Next game in</div>
            <div className="text-4xl font-black text-white">
              {nextGameTimer || 0}
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1 mt-2 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: nextGameTimer || 10, ease: "linear" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
