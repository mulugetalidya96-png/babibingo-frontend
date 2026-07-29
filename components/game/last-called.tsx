"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/hooks/use-game-store";
import { Volume2 } from "lucide-react";

const LETTER_COLORS: Record<string, string> = {
  B: "bg-red-500/20 text-red-400 border-red-500/30 shadow-red-500/20",
  I: "bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-blue-500/20",
  N: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-yellow-500/20",
  G: "bg-green-500/20 text-green-400 border-green-500/30 shadow-green-500/20",
  O: "bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-purple-500/20",
};

export function LastCalled() {
  const { called, currentCall } = useGameStore();
  const lastThree = called.slice(-3);

  const getColor = (display: string) => {
    const letter = display[0];
    return (
      LETTER_COLORS[letter] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
    );
  };

  return (
    <div className="px-1 py-1">
      <div
        className="
          text-[9px] sm:text-[10px]
          text-gray-400
          mb-1.5 sm:mb-2
          text-center
          tracking-[0.2em]
          uppercase
          font-semibold
        "
      >
        Last Called
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <AnimatePresence mode="popLayout">
          {lastThree.map((display, i) => (
            <motion.div
              key={`${display}-${i}`}
              layout
              initial={{ scale: 0, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 30, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
              }}
              className={`
                relative
                w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14
                rounded-full
                flex
                items-center
                justify-center
                text-[13px] sm:text-[15px] md:text-[18px]
                font-black
                border-2
                shadow-lg
                ${getColor(display)}
                ${display === currentCall ? "ring-2 ring-white/40 scale-110" : ""}
              `}
            >
              {display}
              {display === currentCall && (
                <motion.div
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-1 -right-1"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {Array.from({
          length: Math.max(0, 3 - lastThree.length),
        }).map((_, i) => (
          <motion.div
            key={`empty-${i}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="
              w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14
              rounded-full
              border-2
              border-dashed
              border-gray-700/50
              flex
              items-center
              justify-center
              text-gray-600
              text-xs
              font-medium
            "
          >
            —
          </motion.div>
        ))}
      </div>
    </div>
  );
}
