import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useAppStore } from "../state/appStore";
import { useAuthStore } from "../state/authStore";
import { PokerTable } from "../types/poker";
import { useNavigation } from "@react-navigation/native";

export default function LobbyScreen() {
  const activeTables = useAppStore((s) => s.activeTables);
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation<any>();

  const waitingTables = activeTables.filter((t) => t.status === "waiting");
  const inProgressTables = activeTables.filter((t) => t.status === "in_progress");

  const handleJoinTable = (table: PokerTable) => {
    if (!user) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to game screen (to be implemented)
    // For now, just show the table details
  };

  return (
    <View className="flex-1 bg-[#0a0f1e]">
      <LinearGradient colors={["#0a0f1e", "#1a2332"]} style={{ flex: 1 }}>
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          {/* Header */}
          <View className="px-6 pt-4 pb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white text-3xl font-bold">Lobby</Text>
              <View className="flex-row items-center bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                <Ionicons name="people" size={16} color="#10b981" />
                <Text className="text-emerald-400 font-semibold ml-2">
                  {activeTables.length} Tables
                </Text>
              </View>
            </View>
            <Text className="text-white/60 text-sm">
              Join a table or create your own
            </Text>
          </View>

          <ScrollView className="flex-1 px-6">
            {activeTables.length === 0 ? (
              <View className="flex-1 items-center justify-center py-20">
                <View className="bg-white/5 p-8 rounded-full mb-4">
                  <Ionicons name="grid-outline" size={60} color="#ffffff40" />
                </View>
                <Text className="text-white/60 text-lg text-center mb-2">
                  No active tables
                </Text>
                <Text className="text-white/40 text-sm text-center">
                  Be the first to host a game!
                </Text>
                <Pressable
                  onPress={() => navigation.navigate("HostTable")}
                  className="bg-emerald-500 px-6 py-3 rounded-xl mt-6 active:opacity-80"
                >
                  <Text className="text-white font-semibold">Host a Table</Text>
                </Pressable>
              </View>
            ) : (
              <View className="pb-6">
                {/* Waiting Tables */}
                {waitingTables.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-white text-xl font-bold mb-4">
                      Waiting for Players
                    </Text>
                    <View className="space-y-3">
                      {waitingTables.map((table) => (
                        <TableCard
                          key={table.id}
                          table={table}
                          onJoin={() => handleJoinTable(table)}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {/* In Progress Tables */}
                {inProgressTables.length > 0 && (
                  <View>
                    <Text className="text-white text-xl font-bold mb-4">
                      Games in Progress
                    </Text>
                    <View className="space-y-3">
                      {inProgressTables.map((table) => (
                        <TableCard
                          key={table.id}
                          table={table}
                          onJoin={() => handleJoinTable(table)}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

function TableCard({ table, onJoin }: { table: PokerTable; onJoin: () => void }) {
  const canJoin = table.currentPlayers < table.maxPlayers && table.status === "waiting";
  const user = useAuthStore((s) => s.user);
  const hasEnoughChips = user && user.chipBalance >= table.buyIn;

  return (
    <View className="bg-white/5 rounded-2xl p-5 border border-white/10">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text className="text-white text-lg font-bold mb-1">{table.name}</Text>
          <Text className="text-white/60 text-sm">Hosted by {table.hostUsername}</Text>
        </View>
        <View
          className={`px-3 py-1.5 rounded-full ${
            table.status === "waiting"
              ? "bg-emerald-500/20"
              : "bg-amber-500/20"
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              table.status === "waiting" ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {table.status === "waiting" ? "Waiting" : "In Progress"}
          </Text>
        </View>
      </View>

      {/* Table Info */}
      <View className="bg-[#0a0f1e]/50 rounded-xl p-4 mb-4">
        <View className="flex-row justify-between mb-3">
          <Text className="text-white/70 text-sm">Players</Text>
          <Text className="text-white font-semibold">
            {table.currentPlayers}/{table.maxPlayers}
          </Text>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="text-white/70 text-sm">Blinds</Text>
          <Text className="text-white font-semibold">
            {table.smallBlind}/{table.bigBlind}
          </Text>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="text-white/70 text-sm">Buy-in</Text>
          <Text className="text-emerald-400 font-semibold">
            {table.buyIn.toLocaleString()} CHiP$
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-white/70 text-sm">Rake</Text>
          <Text className="text-white font-semibold">
            {(table.potRake * 100).toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Start Time */}
      <View className="flex-row items-center mb-4">
        <Ionicons name="time" size={16} color="#ffffff60" />
        <Text className="text-white/60 text-sm ml-2">
          Starts: {new Date(table.scheduledStartTime).toLocaleString()}
        </Text>
      </View>

      {/* Action Button */}
      {canJoin ? (
        <Pressable
          onPress={onJoin}
          disabled={!hasEnoughChips}
          className={`rounded-xl py-3 ${
            hasEnoughChips
              ? "bg-emerald-500 active:opacity-80"
              : "bg-white/10 opacity-50"
          }`}
        >
          <Text className="text-white text-center font-semibold">
            {hasEnoughChips ? "Join Table" : "Insufficient CHiP$"}
          </Text>
        </Pressable>
      ) : table.status === "waiting" ? (
        <View className="bg-amber-500/10 rounded-xl py-3 border border-amber-500/20">
          <Text className="text-amber-400 text-center font-semibold">Table Full</Text>
        </View>
      ) : (
        <View className="bg-blue-500/10 rounded-xl py-3 border border-blue-500/20">
          <Text className="text-blue-400 text-center font-semibold">Spectate</Text>
        </View>
      )}
    </View>
  );
}
