"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/hooks/use-game-store";

const LETTERS = ["B", "I", "N", "G", "O"] as const;

const LETTER_COLORS: Record<string, string> = {
  B: "bg-red-500",
  I: "bg-blue-500",
  N: "bg-yellow-500 text-black",
  G: "bg-green-500",
  O: "bg-purple-500",
};

function getLetter(num: number) {
  if (num <= 15) return "B";
  if (num <= 30) return "I";
  if (num <= 45) return "N";
  if (num <= 60) return "G";
  return "O";
}

export function BingoBoard() {
  const { called } = useGameStore();

  const calledSet = new Set(called);

  const isCalled = (num: number) => calledSet.has(`${getLetter(num)}${num}`);

  return (
    <div className="w-full">
      <div
        className="
          bg-gradient-to-br from-[#13141f] to-[#1a1b2e]
          rounded-2xl
          p-2 sm:p-3
          border
          border-white/5
          shadow-[0_0_30px_rgba(0,0,0,0.3)]
        "
      >
        {/* Letters */}
        <div
          className="
            grid
            grid-cols-5
            gap-[3px]
            mb-2 sm:mb-3
          "
        >
          {LETTERS.map((letter) => (
            <motion.div
              key={letter}
              whileHover={{ scale: 1.05 }}
              className={`
                ${LETTER_COLORS[letter]}
                w-7 h-7 sm:w-8 sm:h-8
                rounded-full
                flex
                items-center
                justify-center
                text-[11px] sm:text-[13px]
                font-black
                mx-auto
                shadow-lg
                shadow-black/30
                border border-white/10
              `}
            >
              {letter}
            </motion.div>
          ))}
        </div>

        {/* Board */}
        <div
          className="
            grid
            grid-cols-5
            gap-[2px] sm:gap-[3px]
          "
        >
          {Array.from({ length: 15 }, (_, row) =>
            LETTERS.map((_, col) => {
              const num = col * 15 + row + 1;
              const letter = getLetter(num);
              const active = isCalled(num);

              return (
                <motion.div
                  key={num}
                  animate={active ? { scale: [1, 1.15, 1] } : {}}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                  className={`
                    aspect-square
                    flex
                    items-center
                    justify-center
                    rounded-[4px] sm:rounded-[6px]
                    text-[13px] sm:text-[16px] md:text-[18px]
                    font-bold
                    transition-all
                    duration-200

                    ${
                      active
                        ? `
                          ${LETTER_COLORS[letter]}
                          text-white
                          shadow-lg
                          shadow-black/40
                          scale-105
                          border border-white/20
                        `
                        : `
                          bg-[#1a1b26]
                          text-gray-500
                          hover:bg-[#22233a]
                          hover:text-gray-300
                          hover:scale-105
                          cursor-default
                        `
                    }
                  `}
                >
                  {num}
                </motion.div>
              );
            }),
          )}
        </div>

        {/* ✅ Called count */}
        <div className="mt-2 sm:mt-3 text-center">
          <span className="text-[10px] sm:text-xs text-gray-500">
            Called:{" "}
            <span className="text-yellow-400 font-bold">{called.length}</span>
            {" / 75"}
          </span>
        </div>
      </div>
    </div>
  );
}
