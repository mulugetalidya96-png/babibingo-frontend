"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useGameStore } from "./use-game-store";
import type { WSResponse } from "@/types/game";
import { toast } from "sonner";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";

export function useWebSocket(userId: number | undefined) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const {
    setGameState,
    addMyCard,
    removeMyCard,
    markCalled,
    setWinner,
    setWinners,
    setMyCards,
    setReservedCardsList,
    addReservedCard,
    removeReservedCard,
    reserveCard,
    unReserveCard,
    resetForNewGame,
    deselectCard,
  } = useGameStore();

  const connect = useCallback(() => {
    if (!userId) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${WS_URL}?user_id=${userId}`);

    ws.onopen = () => {
      console.log("[WS] Connected");
      setIsConnected(true);
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
              setReservedCardsList(data.state.reserved_cards ?? []);
            }
            break;

          case "card.reserved":
            if (data.user_id === userId) {
              console.log(`[WS] Card ${data.card_number} reserved by you`);

              // ✅ Clear pending state via CardGrid handler
              const handlers = (window as any).__cardGridHandlers;
              if (handlers?.onReservationSuccess) {
                handlers.onReservationSuccess();
              }

              if (data.card_number !== undefined) {
                reserveCard(data.card_number);
              }
              if (data.card) {
                addMyCard(data.card);
              }
            } else {
              console.log(
                `[WS] Card ${data.card_number} reserved by user ${data.user_id}`,
              );
              if (data.card_number !== undefined) {
                addReservedCard(data.card_number);
              }
            }
            break;

          case "card.cancelled":
            if (data.user_id === userId) {
              console.log(`[WS] Card ${data.card_number} cancelled by you`);
              if (data.card_number !== undefined) {
                removeMyCard(data.card_number);
                unReserveCard(data.card_number);
              }
            } else {
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
              console.log(
                `🎉 Winner: ${data.winner.name} - $${data.winner.prize}`,
              );
              setWinner(data.winner);
              setGameState({
                status: "finished",
                nextGameTimer: 10,
              });
            }
            break;

          case "game.winners_summary":
            if (data.winners && data.winners.length > 0) {
              console.log(`🎉 ${data.winners.length} winners!`);
              setWinner(data.winners[0]);
              setWinners(data.winners);
              setGameState({
                status: "finished",
                nextGameTimer: 10,
                pool: data.pool ?? 0,
              });
            }
            break;

          case "game.ended":
            setGameState({
              status: "finished",
              nextGameTimer: 10,
            });
            break;

          // ✅ ERROR HANDLING WITH ROLLBACK
          case "error":
            console.error("[WS] Error:", data.message);

            // ✅ Get CardGrid handlers
            const handlers = (window as any).__cardGridHandlers;

            if (data.message) {
              const msg = data.message.toLowerCase();

              // ✅ Handle all reservation errors through CardGrid
              if (
                msg.includes("insufficient balance") ||
                msg.includes("card already reserved") ||
                msg.includes("maximum") ||
                msg.includes("card data not found") ||
                msg.includes("failed saving card") ||
                msg.includes("user not found")
              ) {
                // ✅ Use CardGrid's error handler for reservation errors
                if (handlers?.onReservationError) {
                  handlers.onReservationError(data.message);
                } else {
                  // ✅ Fallback: manually deselect last card
                  const state = useGameStore.getState();
                  const lastSelected =
                    state.selectedCards[state.selectedCards.length - 1];
                  if (lastSelected !== undefined) {
                    deselectCard(lastSelected);
                  }
                  toast.error(data.message);
                }
              }
              // ✅ Handle other errors
              else {
                // Rollback any pending selection
                const state = useGameStore.getState();
                if (state.selectedCards.length > 0) {
                  const lastSelected =
                    state.selectedCards[state.selectedCards.length - 1];
                  if (lastSelected !== undefined) {
                    deselectCard(lastSelected);
                  }
                }
                toast.error(data.message || "An error occurred");
              }
            }
            break;

          default:
            console.log("[WS] Unknown message type:", data.type);
        }
      } catch (err) {
        console.error("[WS] Parse error:", err);
      }
    };

    ws.onclose = () => {
      console.log("[WS] Disconnected, reconnecting...");
      setIsConnected(false);
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
    removeMyCard,
    markCalled,
    setWinner,
    setWinners,
    setMyCards,
    setReservedCardsList,
    addReservedCard,
    removeReservedCard,
    reserveCard,
    unReserveCard,
    resetForNewGame,
    deselectCard,
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

  return { send, ws: wsRef, isConnected };
}
