import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { pokerSocket } from "../services/pokerSocket";
import { useAuthStore } from "../state/authStore";
import { Card, GameState, TablePlayer } from "../types/poker";
import { evaluateBestHand } from "../utils/pokerLogic";

type PokerGameRouteProp = RouteProp<{ params: { tableId: string; buyIn: number } }, "params">;

export default function PokerGameScreen() {
  const route = useRoute<PokerGameRouteProp>();
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);

  const { tableId, buyIn } = route.params;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [holeCards, setHoleCards] = useState<Card[]>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [currentBet, setCurrentBet] = useState(0);
  const [minRaise, setMinRaise] = useState(0);
  const [maxRaise, setMaxRaise] = useState(0);
  const [raiseAmount, setRaiseAmount] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Connect to poker server
    pokerSocket.connect(user.id);
    setConnected(true);

    // Join the table
    pokerSocket.joinTable(tableId, buyIn);

    // Set up listeners
    pokerSocket.onGameStateUpdate((state: GameState) => {
      setGameState(state);
    });

    pokerSocket.onCardsDealt((data) => {
      setHoleCards(data.holeCards);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });

    pokerSocket.onYourTurn((data) => {
      setIsMyTurn(true);
      setCurrentBet(data.currentBet);
      setMinRaise(data.minRaise);
      setMaxRaise(data.maxRaise);
      setRaiseAmount(data.minRaise);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    });

    pokerSocket.onBettingAction((data) => {
      // Show action notification
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    });

    pokerSocket.onPotWon((data) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });

    pokerSocket.onError((error) => {
      Alert.alert("Error", error.message);
    });

    // Clean up on unmount
    return () => {
      pokerSocket.leaveTable(tableId);
      pokerSocket.removeAllListeners();
    };
  }, [user, tableId, buyIn]);

  const handleFold = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pokerSocket.fold(tableId);
    setIsMyTurn(false);
  }, [tableId]);

  const handleCheck = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pokerSocket.check(tableId);
    setIsMyTurn(false);
  }, [tableId]);

  const handleCall = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pokerSocket.call(tableId);
    setIsMyTurn(false);
  }, [tableId]);

  const handleRaise = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pokerSocket.raise(tableId, raiseAmount);
    setIsMyTurn(false);
  }, [tableId, raiseAmount]);

  const handleAllIn = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "All In",
      "Are you sure you want to go all in?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "All In",
          style: "destructive",
          onPress: () => {
            pokerSocket.allIn(tableId);
            setIsMyTurn(false);
          },
        },
      ]
    );
  }, [tableId]);

  const handleLeave = useCallback(() => {
    Alert.alert(
      "Leave Table",
      "Are you sure you want to leave the table?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            pokerSocket.leaveTable(tableId);
            navigation.goBack();
          },
        },
      ]
    );
  }, [tableId, navigation]);

  if (!connected || !gameState) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <LinearGradient colors={["#000000", "#0a0f1e", "#000000"]} style={{ flex: 1, width: "100%", alignItems: "center", justifyContent: "center" }}>
          <Text className="text-white text-xl">Connecting to table...</Text>
        </LinearGradient>
      </View>
    );
  }

  const myPlayer = gameState.players.find(p => p.userId === user?.id);
  const currentPlayer = gameState.players[gameState.currentPlayerTurn];

  return (
    <View className="flex-1 bg-black">
      <LinearGradient colors={["#000000", "#0a0f1e", "#000000"]} style={{ flex: 1 }}>
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          {/* Header */}
          <View className="px-6 py-4 flex-row items-center justify-between border-b border-white/10">
            <Pressable onPress={handleLeave} className="bg-white/5 px-4 py-2 rounded-xl active:opacity-80">
              <Text className="text-red-400 font-semibold">Leave</Text>
            </Pressable>
            <View className="bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
              <Text className="text-amber-400 font-semibold">Pot: {gameState.pot.toLocaleString()} CHiP$</Text>
            </View>
            <View className="bg-white/5 px-4 py-2 rounded-xl">
              <Text className="text-white/70 font-semibold">{gameState.round}</Text>
            </View>
          </View>

          <ScrollView className="flex-1">
            {/* Community Cards */}
            <View className="items-center py-8">
              <Text className="text-white/60 text-sm mb-4">Community Cards</Text>
              <View className="flex-row space-x-2">
                {gameState.communityCards.length === 0 ? (
                  <View className="bg-white/5 w-16 h-24 rounded-xl items-center justify-center border border-white/10">
                    <Ionicons name="help" size={24} color="#ffffff40" />
                  </View>
                ) : (
                  gameState.communityCards.map((card, index) => (
                    <CardComponent key={index} card={card} />
                  ))
                )}
              </View>
            </View>

            {/* Players */}
            <View className="px-6 py-4">
              <Text className="text-white text-lg font-bold mb-4">Players ({gameState.players.length})</Text>
              <View className="space-y-3">
                {gameState.players.map((player, index) => (
                  <PlayerCard
                    key={player.userId}
                    player={player}
                    isCurrentTurn={index === gameState.currentPlayerTurn}
                    isMe={player.userId === user?.id}
                  />
                ))}
              </View>
            </View>

            {/* My Hand */}
            {holeCards.length > 0 && (
              <View className="px-6 py-6 bg-white/5 border-t border-white/10">
                <Text className="text-white text-lg font-bold mb-4">Your Hand</Text>
                <View className="flex-row space-x-3 mb-4">
                  {holeCards.map((card, index) => (
                    <CardComponent key={index} card={card} />
                  ))}
                </View>
                {gameState.communityCards.length >= 3 && (
                  <View className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
                    <Text className="text-amber-400 text-sm font-semibold">
                      {evaluateBestHand(holeCards, gameState.communityCards).rankName}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          {isMyTurn && myPlayer && myPlayer.status === "active" && (
            <View className="px-6 py-6 bg-black/80 border-t border-amber-500/30">
              <View className="flex-row space-x-2 mb-3">
                <Pressable
                  onPress={handleFold}
                  className="flex-1 bg-red-500 rounded-xl py-4 active:opacity-80"
                >
                  <Text className="text-white text-center font-bold">Fold</Text>
                </Pressable>

                {currentBet === 0 ? (
                  <Pressable
                    onPress={handleCheck}
                    className="flex-1 bg-blue-500 rounded-xl py-4 active:opacity-80"
                  >
                    <Text className="text-white text-center font-bold">Check</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={handleCall}
                    className="flex-1 bg-emerald-500 rounded-xl py-4 active:opacity-80"
                  >
                    <Text className="text-white text-center font-bold">Call {currentBet}</Text>
                  </Pressable>
                )}
              </View>

              <View className="flex-row space-x-2">
                <Pressable
                  onPress={handleRaise}
                  className="flex-1 bg-amber-500 rounded-xl py-4 active:opacity-80"
                >
                  <Text className="text-white text-center font-bold">Raise {raiseAmount}</Text>
                </Pressable>

                <Pressable
                  onPress={handleAllIn}
                  className="flex-1 bg-purple-500 rounded-xl py-4 active:opacity-80"
                >
                  <Text className="text-white text-center font-bold">All In</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Waiting for turn */}
          {!isMyTurn && currentPlayer && (
            <View className="px-6 py-4 bg-black/80 border-t border-white/10">
              <Text className="text-white/60 text-center">
                Waiting for {currentPlayer.username}...
              </Text>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

function CardComponent({ card }: { card: Card }) {
  const getSuitColor = (suit: Card["suit"]) => {
    return suit === "hearts" || suit === "diamonds" ? "#ef4444" : "#000000";
  };

  const getSuitIcon = (suit: Card["suit"]) => {
    switch (suit) {
      case "hearts": return "♥";
      case "diamonds": return "♦";
      case "clubs": return "♣";
      case "spades": return "♠";
    }
  };

  return (
    <View className="bg-white w-16 h-24 rounded-xl items-center justify-center border-2 border-white/20">
      <Text style={{ color: getSuitColor(card.suit), fontSize: 24, fontWeight: "bold" }}>
        {card.rank}
      </Text>
      <Text style={{ color: getSuitColor(card.suit), fontSize: 20 }}>
        {getSuitIcon(card.suit)}
      </Text>
    </View>
  );
}

function PlayerCard({ player, isCurrentTurn, isMe }: { player: TablePlayer; isCurrentTurn: boolean; isMe: boolean }) {
  return (
    <View className={`bg-white/5 rounded-2xl p-4 border ${isCurrentTurn ? "border-amber-500" : "border-white/10"}`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${isMe ? "bg-amber-500/20 border-2 border-amber-500" : "bg-white/10"}`}>
            <Text className={`text-lg font-bold ${isMe ? "text-amber-400" : "text-white"}`}>
              {player.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-white font-semibold">{player.username}</Text>
              {isMe && <Text className="text-amber-400 text-xs ml-2">(You)</Text>}
              {player.isDealer && <Text className="text-blue-400 text-xs ml-2">D</Text>}
            </View>
            <Text className="text-white/60 text-sm">{player.chipStack.toLocaleString()} CHiP$</Text>
          </View>
        </View>

        <View className={`px-3 py-1 rounded-full ${
          player.status === "active" ? "bg-emerald-500/20" :
          player.status === "folded" ? "bg-red-500/20" :
          player.status === "all_in" ? "bg-purple-500/20" :
          "bg-white/10"
        }`}>
          <Text className={`text-xs font-semibold ${
            player.status === "active" ? "text-emerald-400" :
            player.status === "folded" ? "text-red-400" :
            player.status === "all_in" ? "text-purple-400" :
            "text-white/60"
          }`}>
            {player.status.replace("_", " ").toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
}
