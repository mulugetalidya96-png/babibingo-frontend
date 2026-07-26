"use client";

import { useEffect, useRef, useCallback } from "react";
import { useGameStore } from "./use-game-store";
import type { WSResponse } from "@/types/game";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";

export function useWebSocket(userId: number | undefined) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const {
    setGameState,
    addMyCard,
    markCalled,
    setWinner,
    setMyCards,
    setReservedCardsList, // ✅ Now exists
    addReservedCard, // ✅ Now exists
    removeReservedCard, // ✅ Now exists
    reserveCard, // ✅ For the current user's cards
    resetForNewGame,
  } = useGameStore();

  const connect = useCallback(() => {
    if (!userId) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${WS_URL}?user_id=${userId}`);

    ws.onopen = () => {
      console.log("[WS] Connected");
      ws.send(JSON.stringify({ type: "game.state" }));
    };

    ws.onmessage = (event) => {
      try {
        const data: WSResponse = JSON.parse(event.data);
        console.log("[WS] Message:", data.type, data);

        switch (data.type) {
          case "game.new":
            resetForNewGame();
            setGameState({
              gameId: data.game_id || null,
              status: "waiting",
              timer: data.timer ?? 0,
              players: 0,
              boardCount: 0,
              pool: 0,
              stake: data.stake ?? 20,
              reservedCards: [],
            });
            break;

          case "timer.tick":
            setGameState({
              gameId: data.game_id || null,
              status: data.status === "waiting" ? "waiting" : "idle",
              timer: data.timer ?? 0,
              players: data.players ?? 0,
              boardCount: data.board_count ?? 0,
              pool: data.pool ?? 0,
              stake: data.stake ?? 20,
            });
            break;

          case "game.state":
            if (data.state) {
              setGameState({
                gameId: data.state.game_id,
                status:
                  data.state.status === "waiting"
                    ? "waiting"
                    : data.state.status === "calling"
                      ? "calling"
                      : "finished",
                timer: data.state.timer,
                players: data.state.players,
                boardCount: data.state.board_count,
                pool: data.state.pool,
                stake: data.state.stake,
                called: data.state.called,
                maxCards: data.state.max_cards,
              });
              if (data.state.my_cards) {
                setMyCards(data.state.my_cards);
              }
              // ✅ Use setReservedCardsList for initial state
              setReservedCardsList(data.state.reserved_cards ?? []);
            }
            break;

          case "card.reserved":
            // ✅ Only process if the card belongs to the current user
            if (data.user_id === userId) {
              console.log(`[WS] Card ${data.card_number} reserved by you`);
              if (data.card_number !== undefined) {
                reserveCard(data.card_number); // ✅ Add to "My Cards"
              }
              if (data.card) {
                addMyCard(data.card);
              }
            } else {
              // ✅ Update the reserved cards list for display (other users)
              console.log(
                `[WS] Card ${data.card_number} reserved by user ${data.user_id}`,
              );
              if (data.card_number !== undefined) {
                addReservedCard(data.card_number);
              }
            }
            break;

          case "card.cancelled":
            // ✅ Only process if the card belongs to the current user
            if (data.user_id === userId) {
              console.log(`[WS] Card ${data.card_number} cancelled by you`);
              // Remove from my cards (you need to handle this)
            } else {
              // Update reserved cards list for others
              if (data.card_number !== undefined) {
                removeReservedCard(data.card_number);
              }
            }
            break;

          case "game.started":
            setGameState({
              status: "calling",
              timer: 0,
              players: data.players ?? 0,
              boardCount: data.board_count ?? 0,
              pool: data.pool ?? 0,
            });
            break;

          case "number.called":
            if (data.call_display) {
              markCalled(data.call_display);
            }
            break;

          case "cards.selected":
            if (data.cards) {
              data.cards.forEach((card) => addMyCard(card));
              setGameState({ selectedCards: [] });
            }
            break;

          case "game.winner":
            if (data.winner) {
              setWinner(data.winner);
              setGameState({
                status: "finished",
                nextGameTimer: 10,
              });
            }
            break;

          case "game.ended":
            setGameState({
              status: "finished",
              nextGameTimer: 10,
            });
            break;

          case "error":
            console.error("[WS] Error:", data.message);
            break;
        }
      } catch (err) {
        console.error("[WS] Parse error:", err);
      }
    };

    ws.onclose = () => {
      console.log("[WS] Disconnected, reconnecting...");
      reconnectTimeout.current = setTimeout(connect, 3000);
    };

    ws.onerror = (err) => {
      console.error("[WS] Error:", err);
      ws.close();
    };

    wsRef.current = ws;
  }, [
    userId,
    setGameState,
    addMyCard,
    markCalled,
    setWinner,
    setMyCards,
    setReservedCardsList,
    addReservedCard,
    removeReservedCard,
    reserveCard,
    resetForNewGame,
  ]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    wsRef.current?.close();
  }, []);

  const send = useCallback((data: object) => {
    console.log("[WS SEND]", data);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { send, ws: wsRef };
}
