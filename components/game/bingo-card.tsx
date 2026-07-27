"use client";

import { motion } from "framer-motion";
import { X, Circle, CircleCheck } from "lucide-react";
import type { GameCard } from "@/types/game";

const LETTERS = ["B", "I", "N", "G", "O"] as const;
const LETTER_COLORS: Record<string, string> = {
  B: "bg-red-500",
  I: "bg-blue-500",
  N: "bg-yellow-500 text-black",
  G: "bg-green-500",
  O: "bg-purple-500",
};

interface BingoCardProps {
  card: GameCard;
  onRemove?: () => void;
  calledNumbers?: number[];
  highlightWin?: boolean;
  winningCells?: Set<string>;
  size?: "xs" | "sm" | "md" | "lg";
  autoMarkEnabled?: boolean; // ✅ New prop
}

export function BingoCard({
  card,
  onRemove,
  calledNumbers = [],
  highlightWin,
  winningCells,
  size = "md",
  autoMarkEnabled = true, // ✅ Default to true
}: BingoCardProps) {
  // ✅ Check if a number is marked
  const isMarked = (num: number | null) => {
    if (num === null) return true; // Free space is always marked

    // ✅ If auto mark is disabled, only show manually marked numbers
    if (!autoMarkEnabled) {
      return card.marked_numbers?.includes(num) || false;
    }

    // ✅ Auto mark enabled: show both called and manually marked
    return calledNumbers.includes(num) || card.marked_numbers?.includes(num);
  };

  // ✅ Check if a number was manually marked by the user
  const isManuallyMarked = (num: number | null) => {
    if (num === null) return false;
    return card.marked_numbers?.includes(num) || false;
  };

  const getCellStyle = (row: number, col: number, num: number | null) => {
    const key = `${row}-${col}`;
    const marked = isMarked(num);
    const manuallyMarked = isManuallyMarked(num);
    const isWinning = winningCells?.has(key);

    // ✅ Winning cells - highest priority
    if (isWinning && highlightWin) {
      return "bg-bingo-yellow text-black border-2 border-yellow-300 shadow-[0_0_15px_rgba(245,197,66,0.8)]";
    }

    // ✅ Marked cells - different style based on manual vs auto
    if (marked) {
      if (manuallyMarked) {
        return "bg-blue-500/70 text-white border border-blue-400/30"; // Manual mark
      }
      return "bg-green-500/70 text-white"; // Auto mark
    }

    return "bg-[#1a1d2e] text-gray-300";
  };

  // ✅ Get mark indicator (dot/circle) for manual marks
  const getMarkIndicator = (num: number | null) => {
    if (num === null) return null;
    if (!autoMarkEnabled && card.marked_numbers?.includes(num)) {
      return (
        <CircleCheck
          size={8}
          className="text-blue-400 absolute -top-0.5 -right-0.5"
        />
      );
    }
    return null;
  };

  const grid: (number | null)[][] = [];
  for (let row = 0; row < 5; row++) {
    grid[row] = [
      card.card_data.B[row],
      card.card_data.I[row],
      card.card_data.N[row],
      card.card_data.G[row],
      card.card_data.O[row],
    ];
  }

  // ✅ Size configurations
  const sizeConfig = {
    xs: {
      container: "p-1",
      cardNumber: "text-[6px]",
      header: "text-[6px] py-0.5",
      cell: "text-[5px]",
      gap: "gap-[1px]",
      icon: 8,
    },
    sm: {
      container: "p-1.5 sm:p-2 mx-1 sm:mx-2",
      cardNumber: "text-[10px] sm:text-xs",
      header: "text-[10px] sm:text-xs py-0.5 sm:py-1",
      cell: "text-[8px] sm:text-[10px] md:text-xs",
      gap: "gap-[2px] sm:gap-[3px]",
      icon: 12,
    },
    md: {
      container: "p-2 sm:p-3 mx-2 sm:mx-3",
      cardNumber: "text-xs sm:text-sm",
      header: "text-[11px] sm:text-sm py-1 sm:py-1.5",
      cell: "text-[10px] sm:text-xs md:text-sm",
      gap: "gap-[2px] sm:gap-[3px]",
      icon: 14,
    },
    lg: {
      container: "p-3 sm:p-4 mx-3 sm:mx-4",
      cardNumber: "text-sm sm:text-base",
      header: "text-sm sm:text-base py-1.5 sm:py-2",
      cell: "text-xs sm:text-sm md:text-base",
      gap: "gap-[3px] sm:gap-[4px]",
      icon: 16,
    },
  };

  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`bg-[#1e2130] rounded-xl border border-white/5 ${config.container}`}
    >
      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
        <span className={`text-gray-500 font-medium ${config.cardNumber}`}>
          #{card.card_number}
          {!autoMarkEnabled && (
            <span className="ml-1.5 text-[8px] text-yellow-400/60">🔒</span>
          )}
        </span>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 p-0.5 sm:p-1 transition-colors"
          >
            <X size={config.icon} />
          </button>
        )}
      </div>

      {/* Header */}
      <div className={`grid grid-cols-5 ${config.gap} mb-[2px] sm:mb-[3px]`}>
        {LETTERS.map((letter) => (
          <div
            key={letter}
            className={`${LETTER_COLORS[letter]} rounded-md text-center font-bold ${config.header}`}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className={`grid grid-cols-5 ${config.gap}`}>
        {grid.map((row, rowIdx) =>
          row.map((num, colIdx) => {
            const marked = isMarked(num);
            const manuallyMarked = isManuallyMarked(num);

            return (
              <motion.div
                key={`${rowIdx}-${colIdx}`}
                initial={marked ? { scale: 0 } : false}
                animate={marked ? { scale: 1 } : {}}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`
                  relative aspect-square flex items-center justify-center rounded-md font-bold
                  transition-all duration-300 ${getCellStyle(rowIdx, colIdx, num)}
                  ${config.cell}
                `}
              >
                {num === null ? "★" : num}
                {/* ✅ Show manual mark indicator */}
                {manuallyMarked && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_6px_rgba(96,165,250,0.5)]" />
                )}
                {/* ✅ Show "manual" label on hover (optional) */}
                {manuallyMarked && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[4px] text-blue-400/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    M
                  </div>
                )}
              </motion.div>
            );
          }),
        )}
      </div>

      {/* ✅ Auto Mark Status Indicator */}
      {!autoMarkEnabled && (
        <div className="mt-1 text-center text-[6px] text-yellow-400/40">
          Manual mark mode • Click numbers to mark manually
        </div>
      )}
    </motion.div>
  );
}
