import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Share, KeyboardAvoidingView, Platform, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAppStore } from "../state/appStore";
import { useAuthStore } from "../state/authStore";
import { PokerTable } from "../types/poker";

export default function HostTableScreen() {
  const [tableName, setTableName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("6");
  const [smallBlind, setSmallBlind] = useState("10");
  const [bigBlind, setBigBlind] = useState("20");
  const [buyIn, setBuyIn] = useState("1000");
  const [potRake, setPotRake] = useState("2");
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now() + 30 * 60000)); // 30 minutes from now
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [timeUntilStart, setTimeUntilStart] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createdTable, setCreatedTable] = useState<PokerTable | null>(null);

  const user = useAuthStore((s) => s.user);
  const addTable = useAppStore((s) => s.addTable);

  // Update countdown every second
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = selectedDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeUntilStart(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeUntilStart(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeUntilStart(`${minutes}m ${seconds}s`);
        }
      } else {
        setTimeUntilStart("Starting now!");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [selectedDate]);

  const handleCreateTable = () => {
    if (!user || !tableName.trim()) return;

    const rakeValue = parseFloat(potRake) / 100;
    if (rakeValue < 0 || rakeValue > 0.042) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsCreating(true);

    setTimeout(() => {
      const tableId = `table_${Date.now()}`;
      const shareableLink = `club420poker://join/${tableId}`;

      const newTable: PokerTable = {
        id: tableId,
        hostId: user.id,
        hostUsername: user.username,
        name: tableName,
        maxPlayers: parseInt(maxPlayers),
        currentPlayers: 0,
        smallBlind: parseFloat(smallBlind),
        bigBlind: parseFloat(bigBlind),
        buyIn: parseFloat(buyIn),
        potRake: rakeValue,
        scheduledStartTime: selectedDate.toISOString(),
        status: "waiting",
        shareableLink,
        players: [],
      };

      addTable(newTable);
      setCreatedTable(newTable);
      setIsCreating(false);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1000);
  };

  const handleShareTable = async () => {
    if (!createdTable) return;

    try {
      await Share.share({
        message: `Join my poker table "${createdTable.name}"!\n\nBuy-in: ${createdTable.buyIn.toLocaleString()} CHiP$\nBlinds: ${createdTable.smallBlind}/${createdTable.bigBlind}\n\n${createdTable.shareableLink}`,
        title: `Join ${createdTable.name}`,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // User cancelled share
    }
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCreatedTable(null);
    setTableName("");
    setMaxPlayers("6");
    setSmallBlind("10");
    setBigBlind("20");
    setBuyIn("1000");
    setPotRake("2");
  };

  if (createdTable) {
    return (
      <View className="flex-1 bg-black">
        <LinearGradient colors={["#000000", "#0a0f1e", "#000000"]} style={{ flex: 1 }}>
          <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
            <View className="flex-1 items-center justify-center px-6">
              {/* Success Icon */}
              <View className="bg-amber-500/20 p-8 rounded-full mb-6 border-4 border-amber-500/30">
                <Ionicons name="checkmark" size={80} color="#f59e0b" />
              </View>

              <Text className="text-white text-3xl font-bold mb-2 text-center">
                Table Created!
              </Text>
              <Text className="text-white/60 text-center mb-8">
                Your poker table is ready for players
              </Text>

              {/* Table Details */}
              <View className="bg-white/5 rounded-3xl p-6 border border-white/10 w-full mb-6">
                <Text className="text-white text-2xl font-bold mb-4 text-center">
                  {createdTable.name}
                </Text>
                <View className="space-y-3">
                  <View className="flex-row justify-between">
                    <Text className="text-white/70">Players</Text>
                    <Text className="text-white font-semibold">
                      0/{createdTable.maxPlayers}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-white/70">Buy-in</Text>
                    <Text className="text-amber-400 font-semibold">
                      {createdTable.buyIn.toLocaleString()} CHiP$
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-white/70">Blinds</Text>
                    <Text className="text-white font-semibold">
                      {createdTable.smallBlind}/{createdTable.bigBlind}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View className="w-full space-y-3">
                <Pressable
                  onPress={handleShareTable}
                  className="bg-amber-500 rounded-xl py-4 active:opacity-80"
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="share-social" size={20} color="white" />
                    <Text className="text-white font-semibold text-lg ml-2">
                      Share Table Link
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={handleReset}
                  className="bg-white/10 rounded-xl py-4 active:opacity-80"
                >
                  <Text className="text-white font-semibold text-lg text-center">
                    Create Another Table
                  </Text>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <LinearGradient colors={["#000000", "#0a0f1e", "#000000"]} style={{ flex: 1 }}>
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
              {/* Header with Logo */}
              <View className="px-6 pt-4 pb-6 border-b border-white/10">
                <View className="items-center mb-4">
                  <View className="bg-black px-6 py-4 rounded-2xl">
                    <Image
                      source={require("../../assets/image-1763857797.png")}
                      style={{ width: 240, height: 120 }}
                      resizeMode="contain"
                    />
                  </View>
                </View>
                <Text className="text-white text-2xl font-bold text-center">Host a Table</Text>
              </View>

              <View className="px-6 pb-6 space-y-5">
                {/* Table Name */}
                <View>
                  <Text className="text-white text-lg font-semibold mb-2">Table Name</Text>
                  <TextInput
                    value={tableName}
                    onChangeText={setTableName}
                    placeholder="Friday Night Poker"
                    placeholderTextColor="#ffffff40"
                    className="bg-white/10 text-white rounded-xl px-4 py-4 text-lg border border-white/10"
                  />
                </View>

                {/* Max Players */}
                <View>
                  <Text className="text-white text-lg font-semibold mb-2">Max Players</Text>
                  <View className="flex-row space-x-2">
                    {["2", "4", "6", "8", "10"].map((num) => (
                      <Pressable
                        key={num}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setMaxPlayers(num);
                        }}
                        className={`flex-1 py-3 rounded-xl ${
                          maxPlayers === num
                            ? "bg-amber-500"
                            : "bg-white/10 border border-white/10"
                        } active:opacity-80`}
                      >
                        <Text
                          className={`text-center font-semibold ${
                            maxPlayers === num ? "text-white" : "text-white/60"
                          }`}
                        >
                          {num}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Blinds */}
                <View>
                  <Text className="text-white text-lg font-semibold mb-2">Blinds</Text>
                  <View className="flex-row space-x-3">
                    <View className="flex-1">
                      <Text className="text-white/70 text-sm mb-2">Small Blind</Text>
                      <TextInput
                        value={smallBlind}
                        onChangeText={setSmallBlind}
                        placeholder="10"
                        placeholderTextColor="#ffffff40"
                        keyboardType="decimal-pad"
                        className="bg-white/10 text-white rounded-xl px-4 py-4 text-lg border border-white/10"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white/70 text-sm mb-2">Big Blind</Text>
                      <TextInput
                        value={bigBlind}
                        onChangeText={setBigBlind}
                        placeholder="20"
                        placeholderTextColor="#ffffff40"
                        keyboardType="decimal-pad"
                        className="bg-white/10 text-white rounded-xl px-4 py-4 text-lg border border-white/10"
                      />
                    </View>
                  </View>
                </View>

                {/* Buy-in */}
                <View>
                  <Text className="text-white text-lg font-semibold mb-2">Buy-in</Text>
                  <TextInput
                    value={buyIn}
                    onChangeText={setBuyIn}
                    placeholder="1000"
                    placeholderTextColor="#ffffff40"
                    keyboardType="decimal-pad"
                    className="bg-white/10 text-white rounded-xl px-4 py-4 text-lg border border-white/10"
                  />
                  <Text className="text-white/60 text-sm mt-2 ml-1">
                    Minimum: 1 CHiP$
                  </Text>
                </View>

                {/* Pot Rake */}
                <View>
                  <Text className="text-white text-lg font-semibold mb-2">Pot Rake (%)</Text>
                  <TextInput
                    value={potRake}
                    onChangeText={(text) => {
                      const value = parseFloat(text);
                      if (isNaN(value) || value <= 4.2) {
                        setPotRake(text);
                      }
                    }}
                    placeholder="2"
                    placeholderTextColor="#ffffff40"
                    keyboardType="decimal-pad"
                    className="bg-white/10 text-white rounded-xl px-4 py-4 text-lg border border-white/10"
                  />
                  <Text className="text-white/60 text-sm mt-2 ml-1">
                    Maximum: 4.2%
                  </Text>
                </View>

                {/* Scheduled Start Time */}
                <View>
                  <Text className="text-white text-lg font-semibold mb-3">Scheduled Start Time</Text>

                  {/* Date and Time Selectors */}
                  <View className="flex-row space-x-3 mb-3">
                    {/* Date Picker */}
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setShowDatePicker(true);
                      }}
                      className="flex-1 bg-white/10 border border-white/10 rounded-xl p-4 active:opacity-80"
                    >
                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text className="text-white/60 text-xs mb-1">Date</Text>
                          <Text className="text-white font-semibold">
                            {selectedDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Text>
                        </View>
                        <Ionicons name="calendar" size={24} color="#f59e0b" />
                      </View>
                    </Pressable>

                    {/* Time Picker */}
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setShowTimePicker(true);
                      }}
                      className="flex-1 bg-white/10 border border-white/10 rounded-xl p-4 active:opacity-80"
                    >
                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text className="text-white/60 text-xs mb-1">Time</Text>
                          <Text className="text-white font-semibold">
                            {selectedDate.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </Text>
                        </View>
                        <Ionicons name="time" size={24} color="#f59e0b" />
                      </View>
                    </Pressable>
                  </View>

                  {/* Countdown Display */}
                  <View className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20 mb-3">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Ionicons name="hourglass-outline" size={20} color="#f59e0b" />
                        <Text className="text-white/70 text-sm ml-2">Starts in</Text>
                      </View>
                      <Text className="text-amber-400 font-bold text-lg">
                        {timeUntilStart}
                      </Text>
                    </View>
                  </View>

                  {/* Notification Toggle */}
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setEnableNotifications(!enableNotifications);
                    }}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 active:opacity-80"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <Ionicons
                          name="notifications"
                          size={22}
                          color={enableNotifications ? "#f59e0b" : "#ffffff60"}
                        />
                        <View className="ml-3 flex-1">
                          <Text className="text-white font-semibold mb-1">
                            Reminder Notifications
                          </Text>
                          <Text className="text-white/60 text-xs">
                            Get notified 5 minutes before table starts
                          </Text>
                        </View>
                      </View>
                      <View
                        className={`w-12 h-7 rounded-full p-1 ${
                          enableNotifications ? "bg-amber-500" : "bg-white/20"
                        }`}
                      >
                        <View
                          className={`w-5 h-5 rounded-full bg-white ${
                            enableNotifications ? "ml-auto" : ""
                          }`}
                        />
                      </View>
                    </View>
                  </Pressable>
                </View>

                {/* Date Time Pickers (iOS) */}
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="spinner"
                    minimumDate={new Date()}
                    onChange={(event, date) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (date) {
                        const newDate = new Date(date);
                        newDate.setHours(selectedDate.getHours());
                        newDate.setMinutes(selectedDate.getMinutes());
                        setSelectedDate(newDate);
                      }
                    }}
                  />
                )}

                {showTimePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="time"
                    display="spinner"
                    onChange={(event, date) => {
                      setShowTimePicker(Platform.OS === 'ios');
                      if (date) {
                        const newDate = new Date(selectedDate);
                        newDate.setHours(date.getHours());
                        newDate.setMinutes(date.getMinutes());
                        setSelectedDate(newDate);
                      }
                    }}
                  />
                )}

                {/* Info Box */}
                <View className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                  <View className="flex-row items-start">
                    <Ionicons name="information-circle" size={20} color="#3b82f6" />
                    <Text className="text-blue-300 text-sm ml-2 flex-1">
                      After creating your table, you can share the link with other players on social media or directly within the app.
                    </Text>
                  </View>
                </View>

                {/* Create Button */}
                <Pressable
                  onPress={handleCreateTable}
                  disabled={
                    !tableName.trim() ||
                    !smallBlind ||
                    !bigBlind ||
                    !buyIn ||
                    parseFloat(potRake) > 4.2 ||
                    isCreating
                  }
                  className={`rounded-xl py-4 ${
                    !tableName.trim() ||
                    !smallBlind ||
                    !bigBlind ||
                    !buyIn ||
                    parseFloat(potRake) > 4.2 ||
                    isCreating
                      ? "bg-white/10 opacity-50"
                      : "bg-amber-500 active:opacity-80"
                  }`}
                >
                  <Text className="text-white text-center text-lg font-semibold">
                    {isCreating ? "Creating Table..." : "Create Table"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
