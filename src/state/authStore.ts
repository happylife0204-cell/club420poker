import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { storage } from "../utils/storage";
import { User, LoginMethod } from "../types/poker";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  loginWithTelegram: (telegramId: string, username: string, avatarUrl?: string) => void;
  loginWithEmail: (email: string, username: string, avatarUrl?: string) => void;
  loginWithC420: (walletAddress: string, c420Balance: number) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  addChips: (amount: number) => void;
  deductChips: (amount: number) => boolean;
  setBankerStatus: (status: "none" | "og" | "regular") => void;
  setStripeAccount: (accountId: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      loginWithTelegram: (telegramId: string, username: string, avatarUrl?: string) => {
        const newUser: User = {
          id: `tg_${telegramId}`,
          username,
          telegramId,
          avatarUrl,
          chipBalance: 0,
          bankerStatus: "none",
          bankerFeeRate: 0,
          createdAt: new Date().toISOString(),
          loginMethod: "telegram",
        };
        set({ user: newUser, isAuthenticated: true });
      },

      loginWithEmail: (email: string, username: string, avatarUrl?: string) => {
        const newUser: User = {
          id: `email_${Date.now()}`,
          username,
          email,
          avatarUrl,
          chipBalance: 0,
          bankerStatus: "none",
          bankerFeeRate: 0,
          createdAt: new Date().toISOString(),
          loginMethod: "email",
        };
        set({ user: newUser, isAuthenticated: true });
      },

      loginWithC420: (walletAddress: string, c420Balance: number) => {
        const chipAmount = c420Balance * 50000; // 1 C420 = 50,000 CHiP$
        const newUser: User = {
          id: `c420_${walletAddress}`,
          username: "", // Will be set after user creates username
          chipBalance: chipAmount,
          c420Balance,
          bankerStatus: "og",
          bankerFeeRate: 0.01, // 1% lifetime fee for OG bankers
          createdAt: new Date().toISOString(),
          loginMethod: "c420",
        };
        set({ user: newUser, isAuthenticated: true });
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      addChips: (amount: number) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              chipBalance: currentUser.chipBalance + amount,
            },
          });

          // Check if user should become a banker
          const newBalance = currentUser.chipBalance + amount;
          if (
            newBalance >= 10000 &&
            currentUser.bankerStatus === "none"
          ) {
            set({
              user: {
                ...currentUser,
                chipBalance: newBalance,
                bankerStatus: "regular",
                bankerFeeRate: 0.042, // 4.2% lifetime fee for regular bankers
              },
            });
          }
        }
      },

      deductChips: (amount: number): boolean => {
        const currentUser = get().user;
        if (currentUser && currentUser.chipBalance >= amount) {
          set({
            user: {
              ...currentUser,
              chipBalance: currentUser.chipBalance - amount,
            },
          });
          return true;
        }
        return false;
      },

      setBankerStatus: (status: "none" | "og" | "regular") => {
        const currentUser = get().user;
        if (currentUser) {
          const feeRate = status === "og" ? 0.01 : status === "regular" ? 0.042 : 0;
          set({
            user: {
              ...currentUser,
              bankerStatus: status,
              bankerFeeRate: feeRate,
            },
          });
        }
      },

      setStripeAccount: (accountId: string) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              stripeConnectedAccountId: accountId,
            },
          });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => storage),
    }
  )
);
