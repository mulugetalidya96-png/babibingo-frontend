"use client";

import { useRef } from "react";

export function useBingoSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playNumber = (call: string) => {
    if (!call) return;

    // B1 -> b_1.m4a
    const letter = call[0].toLowerCase();
    const number = call.slice(1);

    const src = `/sounds/${letter}_${number}.mp3`;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(src);
    audioRef.current = audio;

    audio.play().catch((err) => {
      console.log("Audio blocked:", err);
    });
  };

  return {
    playNumber,
  };
}
