import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create a storage adapter that works on both web and native
export const storage = Platform.OS === "web"
  ? {
      getItem: async (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch (e) {
          console.error("Error getting item from localStorage:", e);
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          console.error("Error setting item in localStorage:", e);
        }
      },
      removeItem: async (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.error("Error removing item from localStorage:", e);
        }
      },
    }
  : AsyncStorage;
