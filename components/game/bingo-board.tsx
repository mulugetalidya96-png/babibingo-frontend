"use client"

import { motion } from "framer-motion"
import { useGameStore } from "@/hooks/use-game-store"

const LETTERS = ["B", "I", "N", "G", "O"] as const
const RANGES = [
  [1, 15],
  [16, 30],
  [31, 45],
  [46, 60],
  [61, 75],
]

const LETTER_COLORS: Record<string, string> = {
  B: "bg-red-500",
  I: "bg-blue-500",
  N: "bg-yellow-500 text-black",
  G: "bg-green-500",
  O: "bg-purple-500",
}

function getLetter(num: number): string {
  if (num <= 15) return "B"
  if (num <= 30) return "I"
  if (num <= 45) return "N"
  if (num <= 60) return "G"
  return "O"
}

export function BingoBoard() {
  const { called } = useGameStore()
  const calledSet = new Set(called)

  const isCalled = (num: number) => calledSet.has(`${getLetter(num)}${num}`)

  return (
    <div className="px-3 py-2">
      <div className="bg-[#1e2130] rounded-xl p-3 border border-white/5">
        {/* Header */}
        <div className="grid grid-cols-5 gap-[3px] mb-2">
          {LETTERS.map((letter) => (
            <div
              key={letter}
              className={`${LETTER_COLORS[letter]} rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mx-auto`}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Numbers grid */}
        <div className="grid grid-cols-5 gap-[3px]">
          {Array.from({ length: 15 }, (_, row) =>
            RANGES.map(([min], col) => {
              const num = min + row
              const called = isCalled(num)
              const letter = getLetter(num)

              return (
                <motion.div
                  key={`${col}-${num}`}
                  animate={called ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className={`
                    aspect-square flex items-center justify-center rounded-md text-xs font-medium
                    transition-all duration-300
                    ${called
                      ? `${LETTER_COLORS[letter]} shadow-lg font-bold`
                      : "bg-[#0a0a0f] text-gray-600"
                    }
                  `}
                >
                  {num}
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
