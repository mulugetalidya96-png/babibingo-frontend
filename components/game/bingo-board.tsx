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
          bg-[#13141f]
          rounded-xl
          p-1.5
          border
          border-white/5
        "
      >
        {/* Letters */}
        <div
          className="
          grid
          grid-cols-5
          gap-[2px]
          mb-1.5
        "
        >
          {LETTERS.map((letter) => (
            <div
              key={letter}
              className={`
                ${LETTER_COLORS[letter]}
                w-5
                h-5
                rounded-full
                flex
                items-center
                justify-center
                text-[9px]
                font-black
                mx-auto
                shadow
              `}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Board */}
        <div
          className="
            grid
            grid-cols-5
            gap-[2px]
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
                  animate={active ? { scale: [1, 1.12, 1] } : {}}
                  transition={{
                    duration: 0.25,
                  }}
                  className={`
                    aspect-square
                    flex
                    items-center
                    justify-center
                    rounded-[3px]
                    text-[8px]
                    font-bold
                    transition-all
                    duration-200

                    ${
                      active
                        ? `
                          ${LETTER_COLORS[letter]}
                          text-white
                          shadow
                        `
                        : `
                          bg-[#1a1b26]
                          text-gray-600
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
      </div>
    </div>
  );
}
