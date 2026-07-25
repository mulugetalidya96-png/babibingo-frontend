"use client";

import { useRef } from "react";

export function useBingoSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playNumber = (call: string) => {
    if (!call) return;

    const letter = call[0].toLowerCase();
    const number = call.slice(1);

    const src = `/sounds/${letter}_${number}.mp3`;

    let audio = audioRef.current;

    // create Audio only once
    if (!audio) {
      audio = new Audio();
      audio.preload = "auto";
      audioRef.current = audio;
    }

    // stop current sound
    audio.pause();
    audio.currentTime = 0;

    // change source
    audio.src = src;

    audio.play().catch((err) => {
      console.log("Audio blocked:", err);
    });
  };

  return {
    playNumber,
  };
}
