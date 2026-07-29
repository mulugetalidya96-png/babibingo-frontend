"use client";

import { create } from "zustand";
import type { GameCard, WinnerInfo } from "@/types/game";

interface GameState {
  // Game info
  gameId: string | null;
  status: "waiting" | "calling" | "finished" | "idle";
  stake: number;
  timer: number;
  players: number;
  boardCount: number;
  pool: number;
  called: string[];
  maxCards: number;

  balance: number;
  reservedCards: number[];
  // User cards
  myCards: GameCard[];
  selectedCards: number[];

  // Winner
  winner: WinnerInfo | null;
  winners: WinnerInfo[];
  nextGameTimer: number;

  // UI
  soundEnabled: boolean;
  currentCall: string | null;

  // Actions
  setGameState: (
    state: Partial<
      Omit<
        GameState,
        | "setGameState"
        | "selectCard"
        | "deselectCard"
        | "addMyCard"
        | "removeMyCard"
        | "setMyCards"
        | "markCalled"
        | "setWinner"
        | "setWinners"
        | "toggleSound"
        | "setCurrentCall"
        | "reset"
        | "resetForNewGame"
        | "setReservedCardsList"
        | "addReservedCard"
        | "removeReservedCard"
        | "reserveCard"
        | "unReserveCard"
        | "setBalance"
        | "updateManualMark"
      >
    >,
  ) => void;
  selectCard: (cardNumber: number) => void;
  deselectCard: (cardNumber: number) => void;
  addMyCard: (card: GameCard) => void;
  removeMyCard: (cardNumber: number) => void;
  setMyCards: (cards: GameCard[]) => void;
  markCalled: (display: string) => void;
  setWinner: (winner: WinnerInfo | null) => void;
  setWinners: (winners: WinnerInfo[]) => void;
  setNextGameTimer: (timer: number) => void;
  toggleSound: () => void;
  setCurrentCall: (call: string | null) => void;
  reset: () => void;
  setBalance: (balance: number) => void;
  updateManualMark: (cardId: string, markedNumbers: number[]) => void; // ✅ New action

  // Reserved cards management
  setReservedCardsList: (cards: number[]) => void;
  addReservedCard: (card: number) => void;
  removeReservedCard: (card: number) => void;
  reserveCard: (card: number) => void;
  unReserveCard: (card: number) => void;

  resetForNewGame: () => void;
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
  maxCards: 4,
  balance: 0,
  myCards: [],
  selectedCards: [],
  winner: null,
  winners: [],
  reservedCards: [],
  nextGameTimer: 0,
  soundEnabled: true,
  currentCall: null,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  setGameState: (state) => set((s) => ({ ...s, ...state })),

  selectCard: (cardNumber) =>
    set((s) => {
      if (s.selectedCards.includes(cardNumber)) return s;
      if (s.selectedCards.length >= s.maxCards) return s;
      return { selectedCards: [...s.selectedCards, cardNumber] };
    }),

  deselectCard: (cardNumber) =>
    set((s) => ({
      selectedCards: s.selectedCards.filter((c) => c !== cardNumber),
    })),

  addMyCard: (card) => set((s) => ({ myCards: [...s.myCards, card] })),

  removeMyCard: (cardNumber: number) =>
    set((s) => ({
      myCards: s.myCards.filter((c) => c.card_number !== cardNumber),
    })),

  setMyCards: (cards) => set({ myCards: cards }),

  markCalled: (display) =>
    set((s) => ({
      called: s.called.includes(display) ? s.called : [...s.called, display],
      currentCall: display,
    })),

  setWinner: (winner) => set({ winner }),
  setWinners: (winners) => set({ winners }),

  setNextGameTimer: (timer) => set({ nextGameTimer: timer }),

  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

  setCurrentCall: (call) => set({ currentCall: call }),

  reset: () => set(initialState),

  // Balance
  setBalance: (balance: number) => set({ balance }),

  // ✅ Update manual marks on a card
  updateManualMark: (cardId: string, markedNumbers: number[]) =>
    set((s) => ({
      myCards: s.myCards.map((card) =>
        card.id === cardId ? { ...card, marked_numbers: markedNumbers } : card,
      ),
    })),

  // Reserved cards management
  setReservedCardsList: (cards: number[]) => set({ reservedCards: cards }),

  addReservedCard: (card: number) =>
    set((s) => ({
      reservedCards: s.reservedCards.includes(card)
        ? s.reservedCards
        : [...s.reservedCards, card],
    })),

  removeReservedCard: (card: number) =>
    set((s) => ({
      reservedCards: s.reservedCards.filter((c) => c !== card),
    })),

  reserveCard: (card: number) =>
    set((s) => ({
      reservedCards: s.reservedCards.includes(card)
        ? s.reservedCards
        : [...s.reservedCards, card],
    })),

  unReserveCard: (card: number) =>
    set((s) => ({
      reservedCards: s.reservedCards.filter((c) => c !== card),
    })),

  resetForNewGame: () =>
    set((s) => ({
      ...initialState,
      gameId: s.gameId,
      status: "waiting",
    })),
}));
