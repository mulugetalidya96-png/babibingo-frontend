"use client"

import { motion } from "framer-motion"
import { useGameStore } from "@/hooks/use-game-store"

// Mock sold cards - in production this comes from API
const SOLD_CARDS = new Set([
  8, 10, 17, 19, 20, 29, 30, 34, 55, 57, 59, 60, 61, 66, 68,
  73, 74, 82, 84, 91, 93, 95, 96, 99, 100, 108
])

export function CardGrid() {
  const { selectedCards, myCards, status, selectCard, deselectCard } = useGameStore()

  const myCardNumbers = new Set(myCards.map((c) => c.card_number))
  const isSelectable = status === "waiting"

  const handleClick = (num: number) => {
    if (!isSelectable) return
    if (selectedCards.includes(num)) {
      deselectCard(num)
    } else if (myCardNumbers.has(num) || SOLD_CARDS.has(num)) {
      return
    } else {
      selectCard(num)
    }
  }

  const getCellClass = (num: number) => {
    if (selectedCards.includes(num)) return "bg-bingo-yellow text-black shadow-[0_0_10px_rgba(245,197,66,0.6)]"
    if (myCardNumbers.has(num)) return "bg-bingo-orange text-white"
    if (SOLD_CARDS.has(num)) return "bg-bingo-orange/60 text-white/80"
    return "bg-[#1a1d2e] text-gray-400 hover:bg-[#252a3d]"
  }

  return (
    <div className="px-3 py-2">
      <div className="text-center text-sm text-gray-400 mb-3">
        Select Your Cards —{" "}
        <span className="text-white font-bold">{selectedCards.length}/2</span> selected
      </div>
      <div className="grid grid-cols-10 gap-[3px]">
        {Array.from({ length: 150 }, (_, i) => i + 1).map((num) => (
          <motion.button
            key={num}
            whileTap={isSelectable && !SOLD_CARDS.has(num) && !myCardNumbers.has(num) ? { scale: 0.85 } : {}}
            onClick={() => handleClick(num)}
            className={`
              aspect-square flex items-center justify-center rounded-[4px] text-[10px] font-bold
              transition-all duration-150 ${getCellClass(num)}
              ${isSelectable && !SOLD_CARDS.has(num) && !myCardNumbers.has(num) ? "cursor-pointer active:scale-95" : "cursor-default"}
            `}
          >
            {num}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
