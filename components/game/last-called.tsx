"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useGameStore } from "@/hooks/use-game-store"

const LETTER_COLORS: Record<string, string> = {
  B: "bg-red-500/20 text-red-400 border-red-500/30",
  I: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  N: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  G: "bg-green-500/20 text-green-400 border-green-500/30",
  O: "bg-purple-500/20 text-purple-400 border-purple-500/30",
}

export function LastCalled() {
  const { called, currentCall } = useGameStore()
  const lastThree = called.slice(-3)

  const getColor = (display: string) => {
    const letter = display[0]
    return LETTER_COLORS[letter] || "bg-gray-500/20 text-gray-400"
  }

  return (
    <div className="px-3 py-3">
      <div className="text-xs text-gray-500 mb-3 text-center tracking-[0.2em] uppercase font-medium">
        Last Called
      </div>
      <div className="flex items-center justify-center gap-3">
        <AnimatePresence mode="popLayout">
          {lastThree.map((display, i) => (
            <motion.div
              key={`${display}-${i}`}
              layout
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`
                w-14 h-14 rounded-full flex items-center justify-center text-base font-bold border-2
                ${getColor(display)}
                ${display === currentCall ? "ring-2 ring-white/20" : ""}
              `}
            >
              {display}
            </motion.div>
          ))}
        </AnimatePresence>
        {/* Empty slots */}
        {Array.from({ length: Math.max(0, 3 - lastThree.length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-14 h-14 rounded-full border-2 border-dashed border-gray-800"
          />
        ))}
      </div>
    </div>
  )
}
