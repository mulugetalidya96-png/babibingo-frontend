"use client"

import { create } from "zustand"
import type { GameCard, WinnerInfo } from "@/types/game"

interface GameState {
  // Game info
  gameId: string | null
  status: "waiting" | "calling" | "finished" | "idle"
  stake: number
  timer: number
  players: number
  boardCount: number
  pool: number
  called: string[]
  maxCards: number

  // User cards
  myCards: GameCard[]
  selectedCards: number[]

  // Winner
  winner: WinnerInfo | null
  nextGameTimer: number

  // UI
  soundEnabled: boolean
  currentCall: string | null

  // Actions
  setGameState: (state: Partial<Omit<GameState, "setGameState" | "selectCard" | "deselectCard" | "addMyCard" | "markCalled" | "setWinner" | "toggleSound" | "setCurrentCall" | "reset">>) => void
  selectCard: (cardNumber: number) => void
  deselectCard: (cardNumber: number) => void
  addMyCard: (card: GameCard) => void
  setMyCards: (cards: GameCard[]) => void
  markCalled: (display: string) => void
  setWinner: (winner: WinnerInfo | null) => void
  setNextGameTimer: (timer: number) => void
  toggleSound: () => void
  setCurrentCall: (call: string | null) => void
  reset: () => void
}

const initialState = {
  gameId: null,
  status: "idle" as const,
  stake: 20,
  timer: 0,
  players: 0,
  boardCount: 0,
  pool: 0,
  called: [],
  maxCards: 2,
  myCards: [],
  selectedCards: [],
  winner: null,
  nextGameTimer: 0,
  soundEnabled: true,
  currentCall: null,
}

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  setGameState: (state) => set((s) => ({ ...s, ...state })),

  selectCard: (cardNumber) =>
    set((s) => {
      if (s.selectedCards.includes(cardNumber)) return s
      if (s.selectedCards.length >= s.maxCards) return s
      return { selectedCards: [...s.selectedCards, cardNumber] }
    }),

  deselectCard: (cardNumber) =>
    set((s) => ({
      selectedCards: s.selectedCards.filter((c) => c !== cardNumber),
    })),

  addMyCard: (card) =>
    set((s) => ({ myCards: [...s.myCards, card] })),

  setMyCards: (cards) => set({ myCards: cards }),

  markCalled: (display) =>
    set((s) => ({
      called: s.called.includes(display) ? s.called : [...s.called, display],
      currentCall: display,
    })),

  setWinner: (winner) => set({ winner }),

  setNextGameTimer: (timer) => set({ nextGameTimer: timer }),

  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

  setCurrentCall: (call) => set({ currentCall: call }),

  reset: () => set(initialState),
}))
