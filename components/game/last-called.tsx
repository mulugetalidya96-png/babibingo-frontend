"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/hooks/use-game-store";

const LETTER_COLORS: Record<string, string> = {
  B: "bg-red-500/20 text-red-400 border-red-500/30",
  I: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  N: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  G: "bg-green-500/20 text-green-400 border-green-500/30",
  O: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export function LastCalled() {
  const { called, currentCall } = useGameStore();
  const lastThree = called.slice(-3);

  const getColor = (display: string) => {
    const letter = display[0];
    return LETTER_COLORS[letter] || "bg-gray-500/20 text-gray-400";
  };

  return (
    <div className="px-1 py-1">
      <div
        className="
        text-[9px]
        text-gray-500
        mb-1
        text-center
        tracking-[0.15em]
        uppercase
        font-medium
      "
      >
        Last Called
      </div>

      <div className="flex items-center justify-center gap-1.5">
        <AnimatePresence mode="popLayout">
          {lastThree.map((display, i) => (
            <motion.div
              key={`${display}-${i}`}
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className={`
                w-9
                h-9
                rounded-full
                flex
                items-center
                justify-center
                text-[11px]
                font-black
                border
                ${getColor(display)}
                ${display === currentCall ? "ring-1 ring-white/30" : ""}
              `}
            >
              {display}
            </motion.div>
          ))}
        </AnimatePresence>

        {Array.from({
          length: Math.max(0, 3 - lastThree.length),
        }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="
              w-9
              h-9
              rounded-full
              border
              border-dashed
              border-gray-800
            "
          />
        ))}
      </div>
    </div>
  );
}
