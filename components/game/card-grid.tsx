"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/hooks/use-game-store";
import { useState, useCallback, useEffect } from "react";
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

  const MAX_CARDS = 4;

  const myCardNumbers = new Set(myCards.map((c) => c.card_number));
  const reservedSet = new Set(reservedCards);

  const isSelectable = status === "waiting";

  // ✅ Handle reservation error
  const handleReservationError = useCallback(
    (error: string) => {
      console.log("❌ Reservation error:", error);
      setIsReserving(false);
      if (pendingCard !== null) {
        deselectCard(pendingCard);
        setPendingCard(null);
      }
      toast.error(error);
    },
    [pendingCard, deselectCard],
  );

  // ✅ Handle reservation success
  const handleReservationSuccess = useCallback(() => {
    console.log("✅ Reservation success");
    setIsReserving(false);
    setPendingCard(null);
  }, []);

  // ✅ Expose handlers to window for WebSocket to call
  useEffect(() => {
    (window as any).__cardGridHandlers = {
      onReservationError: handleReservationError,
      onReservationSuccess: handleReservationSuccess,
    };
    return () => {
      delete (window as any).__cardGridHandlers;
    };
  }, [handleReservationError, handleReservationSuccess]);

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

    // Max 4 cards
    if (selectedCards.length >= MAX_CARDS) {
      toast.warning(`Maximum ${MAX_CARDS} cards per player`);
      return;
    }

    // Local selection first for optimistic UI
    console.log(`📝 Selecting card ${num}`);
    selectCard(num);
    setPendingCard(num);
    setIsReserving(true);

    // Send reservation to backend
    send({
      type: "card.reserve",
      card_number: num,
    });

    // Set a timeout to clear reserving state if no response (10 seconds)
    setTimeout(() => {
      if (isReserving && pendingCard === num) {
        console.log("⏰ Reservation timeout for card", num);
        setIsReserving(false);
        setPendingCard(null);
      }
    }, 10000);
  };

  const getCellClass = (num: number) => {
    // ✅ Selected (pending reservation) - Green glow
    if (selectedCards.includes(num)) {
      return "bg-green-500 text-white shadow-[0_0_12px_rgba(34,197,94,0.6)] border border-green-400";
    }

    // ✅ Owned by me - Green
    if (myCardNumbers.has(num)) {
      return "bg-gradient-to-br from-green-600 to-green-700 text-white shadow-[0_0_8px_rgba(34,197,94,0.3)] border border-green-500/30";
    }

    // ✅ Reserved by other players - Orange
    if (reservedSet.has(num)) {
      return "bg-orange-600/40 text-orange-300 cursor-not-allowed border border-orange-500/30";
    }

    // ✅ Available - Dark with hover effect
    return "bg-[#1a1d2e] text-gray-300 hover:bg-[#252a3d] hover:text-white transition-colors";
  };

  const canSelect = (num: number) =>
    isSelectable &&
    !myCardNumbers.has(num) &&
    !reservedSet.has(num) &&
    !selectedCards.includes(num) &&
    !isReserving;

  return (
    <div className="px-2 sm:px-3 py-2 flex flex-col h-full">
      <div className="text-center text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 flex-shrink-0">
        Select Your Cards —{" "}
        <span className="text-white font-bold">
          {selectedCards.length}/{MAX_CARDS}
        </span>{" "}
        selected
        {selectedCards.length > 0 && (
          <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-yellow-400">
            (Click again to cancel)
          </span>
        )}
        {isReserving && (
          <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-blue-400 animate-pulse">
            ⏳ Reserving...
          </span>
        )}
      </div>

      {/* Scrollable grid - Responsive sizing */}
      <div
        className="
          flex-1
          overflow-y-auto
          pr-0.5 sm:pr-1
          scrollbar-thin
          scrollbar-thumb-gray-700
          scrollbar-track-transparent
          min-h-[250px] sm:min-h-[300px]
        "
        style={{
          maxHeight: "calc(60vh - 40px)",
        }}
      >
        {/* Responsive grid: 8 columns on mobile, 10 on larger screens */}
        <div className="grid grid-cols-8 sm:grid-cols-10 gap-[2px] sm:gap-[3px]">
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
                rounded-[4px] sm:rounded-[6px]
                text-[13px] sm:text-[16px] md:text-[18px] lg:text-[20px] font-bold
                transition-all
                duration-150
                ${getCellClass(num)}
                ${
                  canSelect(num) || selectedCards.includes(num)
                    ? "cursor-pointer active:scale-95"
                    : "cursor-default"
                }
                ${isReserving && pendingCard === num ? "opacity-50" : ""}
                hover:scale-105
                hover:z-10
              `}
            >
              {num}
              {isReserving && pendingCard === num && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[4px] sm:rounded-[6px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
