"use client";

import { useRef, useState, useCallback } from "react";

export function useBingoSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const playNumber = useCallback(
    (call: string) => {
      if (!call || isMuted) return; // ✅ Skip if muted

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
    },
    [isMuted],
  );

  // ✅ Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // ✅ Set mute state directly
  const setMute = useCallback((muted: boolean) => {
    setIsMuted(muted);
  }, []);

  return {
    playNumber,
    toggleMute,
    setMute,
    isMuted,
  };
}
