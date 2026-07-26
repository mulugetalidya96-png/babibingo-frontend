"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/hooks/use-game-store";

export function CardGrid({ send }: { send: (data: object) => void }) {
  const {
    selectedCards,
    myCards,
    reservedCards,
    status,
    selectCard,
    deselectCard,
  } = useGameStore();

  const myCardNumbers = new Set(myCards.map((c) => c.card_number));
  const reservedSet = new Set(reservedCards);

  const isSelectable = status === "waiting";

  const handleClick = (num: number) => {
    if (!isSelectable) return;

    // ✅ If already selected, deselect AND cancel reservation
    if (selectedCards.includes(num)) {
      deselectCard(num);

      // ✅ Send cancellation to backend
      send({
        type: "card.cancel",
        card_number: num,
      });

      return;
    }

    // Already owned or reserved (skip)
    if (myCardNumbers.has(num) || reservedSet.has(num)) {
      return;
    }

    // Max 2 cards
    if (selectedCards.length >= 2) {
      return;
    }

    // Local selection
    selectCard(num);

    // Send reservation to backend
    send({
      type: "card.reserve",
      card_number: num,
    });
  };

  const getCellClass = (num: number) => {
    // ✅ Selected (pending reservation)
    if (selectedCards.includes(num)) {
      return "bg-bingo-yellow text-black shadow-[0_0_10px_rgba(245,197,66,0.6)]";
    }

    // ✅ Owned cards (reserved and confirmed)
    if (myCardNumbers.has(num)) {
      return "bg-bingo-orange text-white";
    }

    // ✅ Reserved by other players
    if (reservedSet.has(num)) {
      return "bg-gray-600 text-gray-300 cursor-not-allowed";
    }

    // Available
    return "bg-[#1a1d2e] text-gray-400 hover:bg-[#252a3d]";
  };

  const canSelect = (num: number) =>
    isSelectable &&
    !myCardNumbers.has(num) &&
    !reservedSet.has(num) &&
    !selectedCards.includes(num); // ✅ Can't select if already selected

  return (
    <div className="px-3 py-2">
      <div className="text-center text-sm text-gray-400 mb-3">
        Select Your Cards —{" "}
        <span className="text-white font-bold">{selectedCards.length}/2</span>{" "}
        selected
        {selectedCards.length > 0 && (
          <span className="ml-2 text-xs text-yellow-400">
            (Click again to cancel)
          </span>
        )}
      </div>

      {/* Scrollable 400 cards */}
      <div
        className="
        max-h-[60vh]
        overflow-y-auto
        pr-1
        scrollbar-thin
        scrollbar-thumb-gray-700
        scrollbar-track-transparent
      "
      >
        <div className="grid grid-cols-10 gap-[3px]">
          {Array.from({ length: 400 }, (_, i) => i + 1).map((num) => (
            <motion.button
              key={num}
              disabled={!canSelect(num) && !selectedCards.includes(num)}
              whileTap={
                canSelect(num) || selectedCards.includes(num)
                  ? { scale: 0.85 }
                  : {}
              }
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
                canSelect(num) || selectedCards.includes(num)
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
    </div>
  );
}
