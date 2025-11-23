import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useAuthStore } from "../state/authStore";
import { useAppStore } from "../state/appStore";
import { ChipBundle } from "../types/poker";

export default function BankerScreen() {
  const user = useAuthStore((s) => s.user);
  const chipBundles = useAppStore((s) => s.chipBundles);
  const addBundle = useAppStore((s) => s.addBundle);
  const removeBundle = useAppStore((s) => s.removeBundle);

  const [isCreatingBundle, setIsCreatingBundle] = useState(false);
  const [chipAmount, setChipAmount] = useState("");
  const [priceGBP, setPriceGBP] = useState("");
  const [acceptsCard, setAcceptsCard] = useState(true);
  const [acceptsOTC, setAcceptsOTC] = useState(true);
  const [telegramHandle, setTelegramHandle] = useState("");

  const userBundles = chipBundles.filter((b) => b.sellerId === user?.id);

  const handleCreateBundle = () => {
    if (!user || !chipAmount || !priceGBP) return;

    const chipAmountNum = parseFloat(chipAmount);
    if (chipAmountNum > user.chipBalance) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newBundle: ChipBundle = {
      id: `bundle_${Date.now()}`,
      sellerId: user.id,
      sellerUsername: user.username,
      chipAmount: chipAmountNum,
      priceGBP: parseFloat(priceGBP),
      acceptsCardPayment: acceptsCard,
      acceptsOTCOffers: acceptsOTC,
      sellerTelegram: telegramHandle || undefined,
      createdAt: new Date().toISOString(),
      status: "active",
    };

    addBundle(newBundle);

    // Deduct chips from user balance (they're now in escrow)
    const deductChips = useAuthStore.getState().deductChips;
    deductChips(chipAmountNum);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Reset form
    setChipAmount("");
    setPriceGBP("");
    setIsCreatingBundle(false);
  };

  const handleCancelBundle = (bundleId: string, chipAmount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeBundle(bundleId);

    // Return chips to user
    const addChips = useAuthStore.getState().addChips;
    addChips(chipAmount);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Non-banker view
  if (!user || user.bankerStatus === "none") {
    return (
      <View className="flex-1 bg-[#0a0f1e]">
        <LinearGradient colors={["#0a0f1e", "#1a2332"]} style={{ flex: 1 }}>
          <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
            <View className="flex-1 items-center justify-center px-6">
              {/* Icon */}
              <View className="bg-amber-500/20 p-8 rounded-full mb-6 border-4 border-amber-500/30">
                <Ionicons name="lock-closed" size={60} color="#f59e0b" />
              </View>

              <Text className="text-white text-3xl font-bold mb-3 text-center">
                Banker Access
              </Text>
              <Text className="text-white/60 text-center mb-8 text-base">
                Become a banker to sell CHiP$ bundles in the marketplace
              </Text>

              {/* Requirements */}
              <View className="bg-white/5 rounded-3xl p-6 border border-white/10 w-full mb-6">
                <Text className="text-white text-xl font-bold mb-4">How to Become a Banker</Text>

                <View className="space-y-4">
                  <View className="flex-row">
                    <View className="bg-emerald-500/20 w-8 h-8 rounded-full items-center justify-center mr-3">
                      <Text className="text-emerald-400 font-bold">1</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold mb-1">
                        Accumulate 10,000 CHiP$
                      </Text>
                      <Text className="text-white/60 text-sm">
                        Play poker or purchase bundles to reach 10,000 CHiP$
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row">
                    <View className="bg-amber-500/20 w-8 h-8 rounded-full items-center justify-center mr-3">
                      <Text className="text-amber-400 font-bold">2</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold mb-1">
                        Or Exchange C420 Tokens
                      </Text>
                      <Text className="text-white/60 text-sm">
                        Get instant OG Banker status with C420 token exchange
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Current Balance */}
              <View className="bg-emerald-500/10 rounded-2xl p-5 border border-emerald-500/20 w-full">
                <Text className="text-white/70 text-sm mb-2">Your CHiP$ Balance</Text>
                <View className="flex-row items-end justify-between">
                  <Text className="text-white text-3xl font-bold">
                    {user?.chipBalance.toLocaleString()}
                  </Text>
                  <Text className="text-emerald-400 font-semibold mb-1">
                    / 10,000
                  </Text>
                </View>
                {user && user.chipBalance < 10000 && (
                  <View className="mt-3 bg-[#0a0f1e]/50 rounded-lg p-3">
                    <Text className="text-white/60 text-sm">
                      {(10000 - user.chipBalance).toLocaleString()} CHiP$ more needed
                    </Text>
                  </View>
                )}
              </View>

              {/* Benefits */}
              <View className="mt-8 w-full">
                <Text className="text-white text-lg font-bold mb-4">Banker Benefits</Text>
                <View className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <Text className="text-white/70 text-sm ml-3">
                      Sell CHiP$ bundles for fiat
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <Text className="text-white/70 text-sm ml-3">
                      Set your own prices
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <Text className="text-white/70 text-sm ml-3">
                      Accept card payments & OTC offers
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <Text className="text-white/70 text-sm ml-3">
                      Integrated Stripe payouts
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  // Banker view
  return (
    <View className="flex-1 bg-[#0a0f1e]">
      <LinearGradient colors={["#0a0f1e", "#1a2332"]} style={{ flex: 1 }}>
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
              {/* Header */}
              <View className="px-6 pt-4 pb-6">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-white text-3xl font-bold">Banker</Text>
                  <View>
                    <LinearGradient
                      colors={
                        user.bankerStatus === "og"
                          ? ["#fbbf24", "#f59e0b"]
                          : ["#10b981", "#059669"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                      }}
                    >
                      <Text className="text-white font-bold text-sm">
                        {user.bankerStatus === "og" ? "🏆 OG" : "💼 Banker"}
                      </Text>
                    </LinearGradient>
                  </View>
                </View>
                <Text className="text-white/60 text-sm">
                  Manage your CHiP$ bundles
                </Text>
              </View>

              <View className="px-6 pb-6">
                {/* Stats */}
                <View className="bg-white/5 rounded-2xl p-5 border border-white/10 mb-6">
                  <View className="flex-row justify-between mb-4">
                    <View>
                      <Text className="text-white/70 text-sm mb-1">Available CHiP$</Text>
                      <Text className="text-white text-2xl font-bold">
                        {user.chipBalance.toLocaleString()}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-white/70 text-sm mb-1">Fee Rate</Text>
                      <Text className="text-white text-2xl font-bold">
                        {(user.bankerFeeRate * 100).toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                  <View className="bg-[#0a0f1e]/50 rounded-xl p-3">
                    <Text className="text-white/60 text-sm">
                      {user.bankerStatus === "og"
                        ? "You have lifetime 1% fee on all bundle sales as an OG Banker"
                        : "You have a 4.2% fee on all bundle sales"}
                    </Text>
                  </View>
                </View>

                {/* Stripe Integration */}
                {!user.stripeConnectedAccountId && (
                  <View className="bg-blue-500/10 rounded-2xl p-5 border border-blue-500/20 mb-6">
                    <View className="flex-row items-start mb-4">
                      <Ionicons name="card" size={24} color="#3b82f6" />
                      <View className="flex-1 ml-3">
                        <Text className="text-white font-bold text-lg mb-1">
                          Connect Stripe
                        </Text>
                        <Text className="text-blue-300 text-sm">
                          Set up Stripe to receive payments when users buy your bundles
                        </Text>
                      </View>
                    </View>
                    <Pressable className="bg-blue-500 rounded-xl py-3 active:opacity-80">
                      <Text className="text-white text-center font-semibold">
                        Connect Stripe Account
                      </Text>
                    </Pressable>
                  </View>
                )}

                {/* Create Bundle Section */}
                {!isCreatingBundle ? (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsCreatingBundle(true);
                    }}
                    className="bg-emerald-500 rounded-2xl p-5 mb-6 active:opacity-80"
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="add-circle" size={24} color="white" />
                      <Text className="text-white font-bold text-lg ml-2">
                        Create New Bundle
                      </Text>
                    </View>
                  </Pressable>
                ) : (
                  <View className="bg-white/5 rounded-2xl p-5 border border-white/10 mb-6 space-y-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-white text-xl font-bold">New Bundle</Text>
                      <Pressable
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setIsCreatingBundle(false);
                        }}
                      >
                        <Ionicons name="close" size={24} color="#ffffff60" />
                      </Pressable>
                    </View>

                    <View>
                      <Text className="text-white/70 text-sm mb-2">CHiP$ Amount</Text>
                      <TextInput
                        value={chipAmount}
                        onChangeText={setChipAmount}
                        placeholder="1000"
                        placeholderTextColor="#ffffff40"
                        keyboardType="decimal-pad"
                        className="bg-white/10 text-white rounded-xl px-4 py-4 text-lg border border-white/10"
                      />
                      {chipAmount && parseFloat(chipAmount) > user.chipBalance && (
                        <Text className="text-red-400 text-sm mt-2">
                          Insufficient balance
                        </Text>
                      )}
                    </View>

                    <View>
                      <Text className="text-white/70 text-sm mb-2">Price (£GBP)</Text>
                      <TextInput
                        value={priceGBP}
                        onChangeText={setPriceGBP}
                        placeholder="10"
                        placeholderTextColor="#ffffff40"
                        keyboardType="decimal-pad"
                        className="bg-white/10 text-white rounded-xl px-4 py-4 text-lg border border-white/10"
                      />
                      {chipAmount && priceGBP && (
                        <Text className="text-emerald-400 text-sm mt-2">
                          Rate: {(parseFloat(chipAmount) / parseFloat(priceGBP)).toFixed(0)} CHiP$ per £
                        </Text>
                      )}
                    </View>

                    <View>
                      <Text className="text-white/70 text-sm mb-3">Payment Options</Text>
                      <View className="space-y-3">
                        <Pressable
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setAcceptsCard(!acceptsCard);
                          }}
                          className="flex-row items-center"
                        >
                          <View
                            className={`w-6 h-6 rounded-md border-2 items-center justify-center mr-3 ${
                              acceptsCard
                                ? "bg-emerald-500 border-emerald-500"
                                : "border-white/30"
                            }`}
                          >
                            {acceptsCard && (
                              <Ionicons name="checkmark" size={16} color="white" />
                            )}
                          </View>
                          <Text className="text-white">Accept Card Payments 💳</Text>
                        </Pressable>

                        <Pressable
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setAcceptsOTC(!acceptsOTC);
                          }}
                          className="flex-row items-center"
                        >
                          <View
                            className={`w-6 h-6 rounded-md border-2 items-center justify-center mr-3 ${
                              acceptsOTC
                                ? "bg-emerald-500 border-emerald-500"
                                : "border-white/30"
                            }`}
                          >
                            {acceptsOTC && (
                              <Ionicons name="checkmark" size={16} color="white" />
                            )}
                          </View>
                          <Text className="text-white">Accept OTC Offers 🤝</Text>
                        </Pressable>
                      </View>
                    </View>

                    {acceptsOTC && (
                      <View>
                        <Text className="text-white/70 text-sm mb-2">
                          Telegram Handle (Optional)
                        </Text>
                        <TextInput
                          value={telegramHandle}
                          onChangeText={setTelegramHandle}
                          placeholder="@username"
                          placeholderTextColor="#ffffff40"
                          autoCapitalize="none"
                          className="bg-white/10 text-white rounded-xl px-4 py-4 text-lg border border-white/10"
                        />
                      </View>
                    )}

                    <Pressable
                      onPress={handleCreateBundle}
                      disabled={
                        !chipAmount ||
                        !priceGBP ||
                        parseFloat(chipAmount) > user.chipBalance ||
                        (!acceptsCard && !acceptsOTC)
                      }
                      className={`rounded-xl py-4 ${
                        !chipAmount ||
                        !priceGBP ||
                        parseFloat(chipAmount) > user.chipBalance ||
                        (!acceptsCard && !acceptsOTC)
                          ? "bg-white/10 opacity-50"
                          : "bg-emerald-500 active:opacity-80"
                      }`}
                    >
                      <Text className="text-white text-center font-semibold text-lg">
                        Create Bundle
                      </Text>
                    </Pressable>

                    <View className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
                      <Text className="text-amber-300 text-xs">
                        CHiP$ will be deducted from your balance and held in escrow until the bundle is sold or cancelled.
                      </Text>
                    </View>
                  </View>
                )}

                {/* Active Bundles */}
                <Text className="text-white text-xl font-bold mb-4">Your Bundles</Text>
                {userBundles.length === 0 ? (
                  <View className="bg-white/5 rounded-2xl p-8 border border-white/10 items-center">
                    <Ionicons name="albums-outline" size={40} color="#ffffff40" />
                    <Text className="text-white/60 text-sm mt-3">
                      No active bundles
                    </Text>
                  </View>
                ) : (
                  <View className="space-y-3">
                    {userBundles.map((bundle) => (
                      <View
                        key={bundle.id}
                        className="bg-white/5 rounded-2xl p-5 border border-white/10"
                      >
                        <View className="flex-row justify-between items-start mb-4">
                          <View className="flex-1">
                            <Text className="text-white text-xl font-bold mb-1">
                              {bundle.chipAmount.toLocaleString()} CHiP$
                            </Text>
                            <Text className="text-emerald-400 text-lg font-semibold">
                              £{bundle.priceGBP.toLocaleString()}
                            </Text>
                          </View>
                          <View
                            className={`px-3 py-1.5 rounded-full ${
                              bundle.status === "active"
                                ? "bg-emerald-500/20"
                                : "bg-white/10"
                            }`}
                          >
                            <Text
                              className={`text-xs font-semibold ${
                                bundle.status === "active"
                                  ? "text-emerald-400"
                                  : "text-white/60"
                              }`}
                            >
                              {bundle.status}
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row space-x-2 mb-4">
                          {bundle.acceptsCardPayment && (
                            <View className="bg-blue-500/10 px-3 py-1 rounded-full">
                              <Text className="text-blue-300 text-xs">💳 Card</Text>
                            </View>
                          )}
                          {bundle.acceptsOTCOffers && (
                            <View className="bg-amber-500/10 px-3 py-1 rounded-full">
                              <Text className="text-amber-300 text-xs">🤝 OTC</Text>
                            </View>
                          )}
                        </View>

                        {bundle.status === "active" && (
                          <Pressable
                            onPress={() => handleCancelBundle(bundle.id, bundle.chipAmount)}
                            className="bg-red-500/10 border border-red-500/20 rounded-xl py-3 active:opacity-80"
                          >
                            <Text className="text-red-400 text-center font-semibold">
                              Cancel Bundle
                            </Text>
                          </Pressable>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
