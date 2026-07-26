"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
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
  size?: "sm" | "md" | "lg"; // ✅ New size prop
}

export function BingoCard({
  card,
  onRemove,
  calledNumbers = [],
  highlightWin,
  winningCells,
  size = "md",
}: BingoCardProps) {
  const isMarked = (num: number | null) => {
    if (num === null) return true;
    return calledNumbers.includes(num) || card.marked_numbers?.includes(num);
  };

  const getCellStyle = (row: number, col: number, num: number | null) => {
    const key = `${row}-${col}`;
    const marked = isMarked(num);
    const isWinning = winningCells?.has(key);

    if (isWinning && highlightWin) {
      return "bg-bingo-yellow text-black border-2 border-yellow-300 shadow-[0_0_15px_rgba(245,197,66,0.8)]";
    }
    if (marked) {
      return "bg-green-500/70 text-white";
    }
    return "bg-[#1a1d2e] text-gray-300";
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
          row.map((num, colIdx) => (
            <motion.div
              key={`${rowIdx}-${colIdx}`}
              initial={isMarked(num) ? { scale: 0 } : false}
              animate={isMarked(num) ? { scale: 1 } : {}}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`
                aspect-square flex items-center justify-center rounded-md font-bold
                transition-all duration-300 ${getCellStyle(rowIdx, colIdx, num)}
                ${config.cell}
              `}
            >
              {num === null ? "★" : num}
            </motion.div>
          )),
        )}
      </div>
    </motion.div>
  );
}
