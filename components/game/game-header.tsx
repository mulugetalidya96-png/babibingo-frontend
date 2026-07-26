"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/hooks/use-game-store";
import { useTelegram } from "@/components/providers/telegram-provider";
import { Wallet, Users, Grid3X3, Timer, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

export function GameHeader() {
  const { stake, boardCount, timer, pool, players } = useGameStore();
  const { user } = useTelegram();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Fetch user balance from backend
  useEffect(() => {
    if (!user?.id) return;

    const fetchBalance = async () => {
      try {
        const response = await fetch(
          `/api/user/balance?telegram_id=${user.id}`,
        );
        if (response.ok) {
          const data = await response.json();
          setBalance(data.balance);
        } else {
          console.error("Failed to fetch balance");
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [user?.id]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const stats = [
    {
      icon: Wallet,
      label: "BALANCE",
      value: isLoading ? "..." : `${balance.toFixed(0)} ETB`,
      color: "text-yellow-400",
    },
    {
      icon: Grid3X3,
      label: "STAKE",
      value: `${stake} ETB`,
      color: "text-gray-300",
    },
    {
      icon: Users,
      label: "BOARD",
      value: `${boardCount}/400`,
      color: "text-gray-300",
    },
    {
      icon: Timer,
      label: "TIMER",
      value: formatTime(timer),
      color: timer <= 10 ? "text-red-400 animate-pulse" : "text-gray-300",
    },
    {
      icon: Trophy,
      label: "PRIZE",
      value: `${pool.toFixed(0)} ETB`,
      color: "text-green-400",
    },
  ];

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="grid grid-cols-5 gap-1 px-2 py-3 bg-[#151725]/80 backdrop-blur-sm rounded-xl mx-2 mt-2"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex flex-col items-center gap-0.5"
        >
          <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
            <stat.icon size={10} />
            <span>{stat.label}</span>
          </div>
          <span className={`text-sm font-bold ${stat.color}`}>
            {stat.value}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
