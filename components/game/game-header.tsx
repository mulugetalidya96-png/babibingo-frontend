"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/hooks/use-game-store";
import {
  Wallet,
  Users,
  Grid3X3,
  Timer,
  Trophy,
  TrendingUp,
} from "lucide-react";

export function GameHeader() {
  const { stake, boardCount, timer, pool, players, balance } = useGameStore();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const stats = [
    {
      icon: Wallet,
      label: "BALANCE",
      value: `${balance.toFixed(0)} ETB`,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      border: "border-yellow-400/20",
    },
    {
      icon: Grid3X3,
      label: "STAKE",
      value: `${stake} ETB`,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20",
    },
    {
      icon: Users,
      label: "PLAYERS",
      value: `${players || 0}`,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/20",
    },
    {
      icon: Timer,
      label: "TIMER",
      value: formatTime(timer),
      color: timer <= 10 ? "text-red-400 animate-pulse" : "text-cyan-400",
      bg: timer <= 10 ? "bg-red-400/10" : "bg-cyan-400/10",
      border: timer <= 10 ? "border-red-400/20" : "border-cyan-400/20",
    },
    {
      icon: Trophy,
      label: "PRIZE",
      value: `${pool.toFixed(0)} ETB`,
      color: "text-green-400",
      bg: "bg-green-400/10",
      border: "border-green-400/20",
    },
  ];

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="grid grid-cols-5 gap-1.5 sm:gap-2 px-2 py-3 sm:py-4 bg-gradient-to-r from-[#151725]/90 to-[#1a1d2e]/90 backdrop-blur-md rounded-2xl mx-2 mt-2 border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.8, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{
            delay: i * 0.06,
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className={`
            flex flex-col items-center gap-0.5 sm:gap-1
            px-1 py-1.5 sm:py-2 rounded-xl
            ${stat.bg}
            border ${stat.border}
            transition-all duration-200
            hover:scale-105 hover:shadow-lg
          `}
        >
          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-400 font-medium uppercase tracking-wider">
            <stat.icon size={12} className="opacity-70" />
            <span>{stat.label}</span>
          </div>
          <span
            className={`
            text-sm sm:text-base font-bold tracking-wide
            ${stat.color}
            ${stat.label === "TIMER" && timer <= 10 ? "animate-pulse" : ""}
          `}
          >
            {stat.value}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
