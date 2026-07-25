"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/hooks/use-game-store";

export function CardGrid() {
  const {
    selectedCards,
    myCards,
    reservedCards,
    status,
    selectCard,
    deselectCard,
    reserveCard,
  } = useGameStore();

  const myCardNumbers = new Set(myCards.map((c) => c.card_number));
  const reservedSet = new Set(reservedCards);

  const isSelectable = status === "waiting";

  const handleClick = (num: number) => {
    if (!isSelectable) return;

    // Remove selection
    if (selectedCards.includes(num)) {
      deselectCard(num);
      return;
    }

    // Already owned or reserved
    if (myCardNumbers.has(num) || reservedSet.has(num)) {
      return;
    }

    // Max 2 cards
    if (selectedCards.length >= 2) {
      return;
    }

    // Local selection
    selectCard(num);

    // Update reservation state
    reserveCard(num);
  };

  const getCellClass = (num: number) => {
    if (selectedCards.includes(num)) {
      return "bg-bingo-yellow text-black shadow-[0_0_10px_rgba(245,197,66,0.6)]";
    }

    if (myCardNumbers.has(num)) {
      return "bg-bingo-orange text-white";
    }

    if (reservedSet.has(num)) {
      return "bg-gray-600 text-gray-300 cursor-not-allowed";
    }

    return "bg-[#1a1d2e] text-gray-400 hover:bg-[#252a3d]";
  };

  const canSelect = (num: number) =>
    isSelectable && !myCardNumbers.has(num) && !reservedSet.has(num);

  return (
    <div className="px-3 py-2">
      <div className="text-center text-sm text-gray-400 mb-3">
        Select Your Cards —{" "}
        <span className="text-white font-bold">{selectedCards.length}/2</span>{" "}
        selected
      </div>

      <div className="grid grid-cols-10 gap-[3px]">
        {Array.from({ length: 150 }, (_, i) => i + 1).map((num) => (
          <motion.button
            key={num}
            disabled={!canSelect(num)}
            whileTap={canSelect(num) ? { scale: 0.85 } : {}}
            onClick={() => handleClick(num)}
            className={`
              aspect-square
              flex
              items-center
              justify-center
              rounded-[4px]
              text-[10px]
              font-bold
              transition-all
              duration-150
              ${getCellClass(num)}
              ${
                canSelect(num)
                  ? "cursor-pointer active:scale-95"
                  : "cursor-default"
              }
            `}
          >
            {num}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
