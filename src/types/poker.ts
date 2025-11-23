export type LoginMethod = "telegram" | "email" | "c420";

export interface User {
  id: string;
  username: string;
  email?: string;
  telegramId?: string;
  avatarUrl?: string;
  tagline?: string; // Max 42 characters
  chipBalance: number;
  bankerStatus: "none" | "og" | "regular";
  bankerFeeRate: number; // 0.01 for OG, 0.042 for regular
  c420Balance?: number;
  stripeConnectedAccountId?: string;
  createdAt: string;
  loginMethod: LoginMethod;
}

export interface ChipBundle {
  id: string;
  sellerId: string;
  sellerUsername: string;
  chipAmount: number;
  priceGBP: number;
  acceptsCardPayment: boolean;
  acceptsOTCOffers: boolean;
  sellerTelegram?: string;
  createdAt: string;
  status: "active" | "sold" | "cancelled";
}

export interface PokerTable {
  id: string;
  hostId: string;
  hostUsername: string;
  name: string;
  maxPlayers: number;
  currentPlayers: number;
  smallBlind: number;
  bigBlind: number;
  potRake: number; // 0 to 0.042
  buyIn: number;
  scheduledStartTime: string;
  status: "waiting" | "in_progress" | "completed";
  shareableLink: string;
  players: TablePlayer[];
}

export interface TablePlayer {
  userId: string;
  username: string;
  avatarUrl?: string;
  chipStack: number;
  position: number;
  isDealer?: boolean;
  isSmallBlind?: boolean;
  isBigBlind?: boolean;
  status: "active" | "folded" | "all_in" | "sitting_out";
}

export interface Transaction {
  id: string;
  userId: string;
  type: "chip_purchase" | "chip_send" | "chip_receive" | "table_buy_in" | "table_win" | "bundle_sale" | "c420_exchange";
  amount: number;
  relatedUserId?: string;
  relatedTableId?: string;
  relatedBundleId?: string;
  timestamp: string;
  description: string;
}

export interface PlayerStats {
  userId: string;
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  biggestWin: number;
  biggestLoss: number;
  profitLoss: number;
  handsPlayed: number;
  vpip: number; // Voluntarily Put Money In Pot percentage
  pfr: number; // Pre-Flop Raise percentage
}

export interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  rank: "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
}

export interface GameState {
  tableId: string;
  pot: number;
  communityCards: Card[];
  currentBet: number;
  currentPlayerTurn: number;
  round: "preflop" | "flop" | "turn" | "river" | "showdown";
  players: TablePlayer[];
}
