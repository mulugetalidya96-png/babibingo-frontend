export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface CardData {
  B: number[];
  I: number[];
  N: (number | null)[];
  G: number[];
  O: number[];
  card_id: number;
}

export interface GameCard {
  id: string;
  card_number: number;
  card_data: CardData;
  marked_numbers: number[];
  is_winner: boolean;
}

export interface WinnerInfo {
  user_id: number;
  name: string;
  phone: string;
  prize: number;
  card_number: number;
  pattern: string;
}

export interface GameStateResponse {
  game_id: string;
  status: string;
  stake: number;
  timer: number;
  players: number;
  board_count: number;
  pool: number;
  called: string[];
  my_cards: GameCard[];
  max_cards: number;
}

export interface WSRequest {
  type: string;
  card_numbers?: number[];
  card_id?: string;
}

export interface WSResponse {
  status: string;
  type: string;
  game_id?: string;
  cards?: GameCard[];
  state?: GameStateResponse;
  message?: string;
  winner?: WinnerInfo;
  call_number?: number;
  call_display?: string;
  called?: string[];
  players?: number;
  board_count?: number;
  timer?: number;
  pool?: number;
  stake?: number;
}
