"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/hooks/use-game-store";
import { useState, useCallback } from "react";
import { toast } from "sonner";

export function CardGrid({ send }: { send: (data: object) => void }) {
  const {
    selectedCards,
    myCards,
    reservedCards,
    status,
    selectCard,
    deselectCard,
  } = useGameStore();

  const [isReserving, setIsReserving] = useState(false);
  const [pendingCard, setPendingCard] = useState<number | null>(null);

  const myCardNumbers = new Set(myCards.map((c) => c.card_number));
  const reservedSet = new Set(reservedCards);

  const isSelectable = status === "waiting";

  // ✅ Expose error handler to WebSocket
  const handleReservationError = useCallback(
    (error: string) => {
      setIsReserving(false);
      if (pendingCard !== null) {
        // ✅ Deselect the specific card that failed
        deselectCard(pendingCard);
        setPendingCard(null);
      }
      toast.error(error);
    },
    [pendingCard, deselectCard],
  );

  // ✅ Expose success handler
  const handleReservationSuccess = useCallback(() => {
    setIsReserving(false);
    setPendingCard(null);
  }, []);

  const handleClick = (num: number) => {
    if (!isSelectable || isReserving) return;

    // If already selected, deselect AND cancel reservation
    if (selectedCards.includes(num)) {
      deselectCard(num);
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
      toast.warning("Maximum 2 cards per player");
      return;
    }

    // Local selection first for optimistic UI
    selectCard(num);
    setPendingCard(num);
    setIsReserving(true);

    // Send reservation to backend
    send({
      type: "card.reserve",
      card_number: num,
    });
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
    isSelectable &&
    !myCardNumbers.has(num) &&
    !reservedSet.has(num) &&
    !selectedCards.includes(num) &&
    !isReserving;

  return (
    <div className="px-3 py-2 flex flex-col h-full">
      <div className="text-center text-sm text-gray-400 mb-3 flex-shrink-0">
        Select Your Cards —{" "}
        <span className="text-white font-bold">{selectedCards.length}/2</span>{" "}
        selected
        {selectedCards.length > 0 && (
          <span className="ml-2 text-xs text-yellow-400">
            (Click again to cancel)
          </span>
        )}
        {isReserving && (
          <span className="ml-2 text-xs text-blue-400 animate-pulse">
            ⏳ Reserving...
          </span>
        )}
      </div>

      {/* Scrollable grid */}
      <div
        className="
          flex-1
          overflow-y-auto
          pr-1
          scrollbar-thin
          scrollbar-thumb-gray-700
          scrollbar-track-transparent
          min-h-[300px]
        "
        style={{
          maxHeight: "calc(60vh - 40px)",
        }}
      >
        <div className="grid grid-cols-10 gap-[2px] sm:gap-[3px]">
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
                relative
                aspect-square
                flex
                items-center
                justify-center
                rounded-[2px] sm:rounded-[4px]
                text-[6px] sm:text-[8px] md:text-[10px]
                font-bold
                transition-all
                duration-150
                ${getCellClass(num)}
                ${
                  canSelect(num) || selectedCards.includes(num)
                    ? "cursor-pointer active:scale-95"
                    : "cursor-default"
                }
                ${isReserving && pendingCard === num ? "opacity-50" : ""}
              `}
            >
              {num}
              {isReserving && pendingCard === num && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-[2px] sm:rounded-[4px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
