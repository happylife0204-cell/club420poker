import { io, Socket } from "socket.io-client";
import { PokerTable, TablePlayer, Card, GameState } from "../types/poker";

// Socket.IO server URL - update this with your backend server
const SOCKET_URL = process.env.EXPO_PUBLIC_POKER_SERVER_URL || "http://localhost:3000";

class PokerSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(userId: string, token?: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        userId,
        token,
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupDefaultListeners();
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  private setupDefaultListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected to poker server");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from poker server");
    });

    this.socket.on("error", (error: any) => {
      console.error("Socket error:", error);
    });
  }

  // Join a poker table
  joinTable(tableId: string, buyIn: number) {
    this.socket?.emit("join_table", { tableId, buyIn });
  }

  // Leave a poker table
  leaveTable(tableId: string) {
    this.socket?.emit("leave_table", { tableId });
  }

  // Sit at table
  sitDown(tableId: string, position: number) {
    this.socket?.emit("sit_down", { tableId, position });
  }

  // Start the game (host only)
  startGame(tableId: string) {
    this.socket?.emit("start_game", { tableId });
  }

  // Player actions
  fold(tableId: string) {
    this.socket?.emit("fold", { tableId });
  }

  check(tableId: string) {
    this.socket?.emit("check", { tableId });
  }

  call(tableId: string) {
    this.socket?.emit("call", { tableId });
  }

  raise(tableId: string, amount: number) {
    this.socket?.emit("raise", { tableId, amount });
  }

  allIn(tableId: string) {
    this.socket?.emit("all_in", { tableId });
  }

  // Listen for table updates
  onTableUpdate(callback: (table: PokerTable) => void) {
    this.addListener("table_update", callback);
    this.socket?.on("table_update", callback);
  }

  // Listen for game state updates
  onGameStateUpdate(callback: (gameState: GameState) => void) {
    this.addListener("game_state_update", callback);
    this.socket?.on("game_state_update", callback);
  }

  // Listen for player joined
  onPlayerJoined(callback: (player: TablePlayer) => void) {
    this.addListener("player_joined", callback);
    this.socket?.on("player_joined", callback);
  }

  // Listen for player left
  onPlayerLeft(callback: (playerId: string) => void) {
    this.addListener("player_left", callback);
    this.socket?.on("player_left", callback);
  }

  // Listen for cards dealt
  onCardsDealt(callback: (data: { holeCards: Card[]; communityCards: Card[] }) => void) {
    this.addListener("cards_dealt", callback);
    this.socket?.on("cards_dealt", callback);
  }

  // Listen for betting action
  onBettingAction(callback: (data: { playerId: string; action: string; amount?: number }) => void) {
    this.addListener("betting_action", callback);
    this.socket?.on("betting_action", callback);
  }

  // Listen for pot won
  onPotWon(callback: (data: { winnerId: string; amount: number; hand: string }) => void) {
    this.addListener("pot_won", callback);
    this.socket?.on("pot_won", callback);
  }

  // Listen for showdown
  onShowdown(callback: (data: { players: Array<{ playerId: string; cards: Card[]; hand: string }> }) => void) {
    this.addListener("showdown", callback);
    this.socket?.on("showdown", callback);
  }

  // Listen for your turn
  onYourTurn(callback: (data: { currentBet: number; minRaise: number; maxRaise: number }) => void) {
    this.addListener("your_turn", callback);
    this.socket?.on("your_turn", callback);
  }

  // Listen for errors
  onError(callback: (error: { message: string }) => void) {
    this.addListener("error", callback);
    this.socket?.on("error", callback);
  }

  // Remove listener
  removeListener(event: string, callback?: Function) {
    if (callback) {
      this.socket?.off(event, callback as any);
      const listeners = this.listeners.get(event) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.socket?.off(event);
      this.listeners.delete(event);
    }
  }

  private addListener(event: string, callback: Function) {
    const listeners = this.listeners.get(event) || [];
    listeners.push(callback);
    this.listeners.set(event, listeners);
  }

  // Clean up all listeners
  removeAllListeners() {
    this.listeners.forEach((_, event) => {
      this.socket?.off(event);
    });
    this.listeners.clear();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const pokerSocket = new PokerSocketService();
