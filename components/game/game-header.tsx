"use client"

import { motion } from "framer-motion"
import { useGameStore } from "@/hooks/use-game-store"
import { Wallet, Users, Grid3X3, Timer, Trophy } from "lucide-react"

export function GameHeader() {
  const { stake, boardCount, timer, pool, players } = useGameStore()

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const stats = [
    { icon: Wallet, label: "BALANCE", value: "2 ETB", color: "text-gray-300" },
    { icon: Grid3X3, label: "STAKE", value: `${stake} ETB`, color: "text-gray-300" },
    { icon: Users, label: "BOARD", value: `${boardCount}/400`, color: "text-gray-300" },
    { icon: Timer, label: "TIMER", value: formatTime(timer), color: timer <= 10 ? "text-red-400" : "text-gray-300" },
    { icon: Trophy, label: "WINNER", value: `${pool.toFixed(0)} ETB`, color: "text-green-400" },
  ]

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="grid grid-cols-5 gap-1 px-2 py-3 bg-[#151725]/80 backdrop-blur-sm rounded-xl mx-2 mt-2"
    >
      {stats.map((stat, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
            <stat.icon size={10} />
            <span>{stat.label}</span>
          </div>
          <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
        </div>
      ))}
    </motion.div>
  )
}
