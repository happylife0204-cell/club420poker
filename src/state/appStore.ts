import { create } from "zustand";
import { ChipBundle, PokerTable, Transaction } from "../types/poker";

interface AppState {
  // Marketplace
  chipBundles: ChipBundle[];
  selectedBundle: ChipBundle | null;

  // Tables
  activeTables: PokerTable[];
  currentTable: PokerTable | null;

  // Transactions
  transactions: Transaction[];

  // Actions - Marketplace
  addBundle: (bundle: ChipBundle) => void;
  removeBundle: (bundleId: string) => void;
  setSelectedBundle: (bundle: ChipBundle | null) => void;
  purchaseBundle: (bundleId: string) => void;

  // Actions - Tables
  addTable: (table: PokerTable) => void;
  removeTable: (tableId: string) => void;
  updateTable: (tableId: string, updates: Partial<PokerTable>) => void;
  setCurrentTable: (table: PokerTable | null) => void;
  joinTable: (tableId: string, userId: string, username: string, buyIn: number) => void;

  // Actions - Transactions
  addTransaction: (transaction: Transaction) => void;
  getTransactionHistory: (userId: string) => Transaction[];
}

export const useAppStore = create<AppState>()((set, get) => ({
  // Initial state
  chipBundles: [],
  selectedBundle: null,
  activeTables: [],
  currentTable: null,
  transactions: [],

  // Marketplace actions
  addBundle: (bundle: ChipBundle) => {
    set((state) => ({
      chipBundles: [...state.chipBundles, bundle],
    }));
  },

  removeBundle: (bundleId: string) => {
    set((state) => ({
      chipBundles: state.chipBundles.filter((b) => b.id !== bundleId),
    }));
  },

  setSelectedBundle: (bundle: ChipBundle | null) => {
    set({ selectedBundle: bundle });
  },

  purchaseBundle: (bundleId: string) => {
    set((state) => ({
      chipBundles: state.chipBundles.map((b) =>
        b.id === bundleId ? { ...b, status: "sold" as const } : b
      ),
    }));
  },

  // Table actions
  addTable: (table: PokerTable) => {
    set((state) => ({
      activeTables: [...state.activeTables, table],
    }));
  },

  removeTable: (tableId: string) => {
    set((state) => ({
      activeTables: state.activeTables.filter((t) => t.id !== tableId),
    }));
  },

  updateTable: (tableId: string, updates: Partial<PokerTable>) => {
    set((state) => ({
      activeTables: state.activeTables.map((t) =>
        t.id === tableId ? { ...t, ...updates } : t
      ),
    }));
  },

  setCurrentTable: (table: PokerTable | null) => {
    set({ currentTable: table });
  },

  joinTable: (tableId: string, userId: string, username: string, buyIn: number) => {
    set((state) => ({
      activeTables: state.activeTables.map((t) => {
        if (t.id === tableId && t.currentPlayers < t.maxPlayers) {
          const newPlayer = {
            userId,
            username,
            chipStack: buyIn,
            position: t.currentPlayers,
            status: "active" as const,
          };
          return {
            ...t,
            players: [...t.players, newPlayer],
            currentPlayers: t.currentPlayers + 1,
          };
        }
        return t;
      }),
    }));
  },

  // Transaction actions
  addTransaction: (transaction: Transaction) => {
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    }));
  },

  getTransactionHistory: (userId: string) => {
    return get().transactions.filter((t) => t.userId === userId);
  },
}));
