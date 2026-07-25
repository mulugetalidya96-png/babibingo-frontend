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
}

export function BingoCard({
  card,
  onRemove,
  calledNumbers = [],
  highlightWin,
  winningCells,
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

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-[#1e2130] rounded-xl p-3 mx-3 border border-white/5"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-medium">
          Card #{card.card_number}
        </span>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 p-1"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Header */}
      <div className="grid grid-cols-5 gap-[3px] mb-[3px]">
        {LETTERS.map((letter) => (
          <div
            key={letter}
            className={`${LETTER_COLORS[letter]} rounded-md py-1 text-center text-sm font-bold`}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-[3px]">
        {grid.map((row, rowIdx) =>
          row.map((num, colIdx) => (
            <motion.div
              key={`${rowIdx}-${colIdx}`}
              initial={isMarked(num) ? { scale: 0 } : false}
              animate={isMarked(num) ? { scale: 1 } : {}}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`
                aspect-square flex items-center justify-center rounded-md text-xs font-bold
                transition-all duration-300 ${getCellStyle(rowIdx, colIdx, num)}
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
