"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useGameStore } from "@/hooks/use-game-store"
import { BingoCard } from "./bingo-card"
import { Trophy } from "lucide-react"

export function WinnerModal() {
  const { winner, nextGameTimer } = useGameStore()

  if (!winner) return null

  // Build winning card mock data based on screenshot pattern
  const winningCard = {
    id: "winner-card",
    card_number: winner.card_number,
    card_data: {
      B: [2, 7, 11, 15, 9],
      I: [25, 28, 16, 27, 29],
      N: [38, 34, null, 39, 44],
      G: [50, 51, 59, 60, 46],
      O: [61, 67, 70, 62, 66],
      card_id: winner.card_number,
    },
    marked_numbers: [9, 29, 44, 46, 66, 27, 51, 61, 50, 34],
    is_winner: true,
  }

  // Bottom row horizontal win
  const winningCells = new Set(["4-0", "4-1", "4-2", "4-3", "4-4"])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.5, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-full max-w-sm"
        >
          {/* Trophy */}
          <div className="flex justify-center mb-2">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0], y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <Trophy size={56} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            </motion.div>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-black text-center text-yellow-400 mb-4 tracking-wider"
          >
            WINNER!
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1e2130] rounded-2xl p-5 text-center border border-white/5"
          >
            <div className="text-xl font-bold text-white mb-1">{winner.name}</div>
            <div className="text-sm text-gray-400 mb-3 font-mono">{winner.phone}</div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-3xl font-black text-green-400 mb-4"
            >
              +{winner.prize.toFixed(0)} ETB
            </motion.div>

            <div className="mb-2">
              <BingoCard
                card={winningCard}
                calledNumbers={winningCard.marked_numbers}
                highlightWin={true}
                winningCells={winningCells}
              />
            </div>
          </motion.div>

          {/* Next game countdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center"
          >
            <div className="text-sm text-gray-400 mb-2">Next game in</div>
            <motion.div
              key={nextGameTimer}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-black text-white mb-3"
            >
              {nextGameTimer}
            </motion.div>
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="bg-yellow-400 h-full rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: nextGameTimer, ease: "linear" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
