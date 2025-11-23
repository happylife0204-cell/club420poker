import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useAppStore } from "../state/appStore";
import { useAuthStore } from "../state/authStore";
import { ChipBundle } from "../types/poker";

export default function MarketplaceScreen() {
  const chipBundles = useAppStore((s) => s.chipBundles);
  const user = useAuthStore((s) => s.user);
  const [selectedBundle, setSelectedBundle] = useState<ChipBundle | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const activeBundles = chipBundles.filter((b) => b.status === "active");

  const handleBundlePress = (bundle: ChipBundle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBundle(bundle);
    setShowPurchaseModal(true);
  };

  const handleClosePurchaseModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPurchaseModal(false);
    setSelectedBundle(null);
  };

  return (
    <View className="flex-1 bg-[#0a0f1e]">
      <LinearGradient
        colors={["#0a0f1e", "#1a2332"]}
        style={{ flex: 1 }}
      >
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          {/* Header */}
          <View className="px-6 pt-4 pb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white text-3xl font-bold">Marketplace</Text>
              <View className="bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                <Text className="text-emerald-400 font-semibold">
                  {user?.chipBalance.toLocaleString()} CHiP$
                </Text>
              </View>
            </View>
            <Text className="text-white/60 text-sm">
              Purchase CHiP$ bundles from bankers
            </Text>
          </View>

          {/* Bundles List */}
          <ScrollView className="flex-1 px-6">
            {activeBundles.length === 0 ? (
              <View className="flex-1 items-center justify-center py-20">
                <View className="bg-white/5 p-8 rounded-full mb-4">
                  <Ionicons name="storefront-outline" size={60} color="#ffffff40" />
                </View>
                <Text className="text-white/60 text-lg text-center">
                  No bundles available yet
                </Text>
                <Text className="text-white/40 text-sm text-center mt-2">
                  Become a banker to list CHiP$ bundles
                </Text>
              </View>
            ) : (
              <View className="pb-6 space-y-4">
                {activeBundles.map((bundle) => (
                  <BundleCard
                    key={bundle.id}
                    bundle={bundle}
                    onPress={() => handleBundlePress(bundle)}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Purchase Modal */}
      {selectedBundle && (
        <PurchaseModal
          visible={showPurchaseModal}
          bundle={selectedBundle}
          onClose={handleClosePurchaseModal}
        />
      )}
    </View>
  );
}

function BundleCard({ bundle, onPress }: { bundle: ChipBundle; onPress: () => void }) {
  const chipPerPound = bundle.chipAmount / bundle.priceGBP;

  return (
    <Pressable
      onPress={onPress}
      className="bg-white/5 rounded-2xl p-5 border border-white/10 active:opacity-80"
    >
      {/* Seller Info */}
      <View className="flex-row items-center mb-4">
        <View className="bg-emerald-500/20 w-12 h-12 rounded-full items-center justify-center mr-3">
          <Text className="text-emerald-400 text-lg font-bold">
            {bundle.sellerUsername.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-white text-lg font-semibold">{bundle.sellerUsername}</Text>
          <Text className="text-white/60 text-sm">Banker</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ffffff60" />
      </View>

      {/* Bundle Details */}
      <View className="bg-[#0a0f1e]/50 rounded-xl p-4 space-y-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-white/70 text-sm">Amount</Text>
          <Text className="text-white text-xl font-bold">
            {bundle.chipAmount.toLocaleString()} CHiP$
          </Text>
        </View>

        <View className="h-[1px] bg-white/10" />

        <View className="flex-row justify-between items-center">
          <Text className="text-white/70 text-sm">Price</Text>
          <Text className="text-emerald-400 text-xl font-bold">£{bundle.priceGBP.toLocaleString()}</Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-white/70 text-sm">Rate</Text>
          <Text className="text-white/60 text-sm">{chipPerPound.toFixed(0)} CHiP$ per £</Text>
        </View>
      </View>

      {/* Payment Methods */}
      <View className="flex-row items-center mt-4 space-x-2">
        {bundle.acceptsCardPayment && (
          <View className="bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
            <Text className="text-blue-300 text-xs font-semibold">💳 Card</Text>
          </View>
        )}
        {bundle.acceptsOTCOffers && (
          <View className="bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
            <Text className="text-amber-300 text-xs font-semibold">🤝 OTC Offers</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function PurchaseModal({
  visible,
  bundle,
  onClose,
}: {
  visible: boolean;
  bundle: ChipBundle;
  onClose: () => void;
}) {
  const [purchaseMethod, setPurchaseMethod] = useState<"card" | "otc" | null>(null);
  const [otcMessage, setOtcMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const addChips = useAuthStore((s) => s.addChips);
  const purchaseBundle = useAppStore((s) => s.purchaseBundle);
  const addTransaction = useAppStore((s) => s.addTransaction);
  const user = useAuthStore((s) => s.user);

  const handleCardPurchase = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);

    // Simulate card payment processing
    setTimeout(() => {
      addChips(bundle.chipAmount);
      purchaseBundle(bundle.id);

      if (user) {
        addTransaction({
          id: `txn_${Date.now()}`,
          userId: user.id,
          type: "chip_purchase",
          amount: bundle.chipAmount,
          relatedUserId: bundle.sellerId,
          relatedBundleId: bundle.id,
          timestamp: new Date().toISOString(),
          description: `Purchased ${bundle.chipAmount.toLocaleString()} CHiP$ for £${bundle.priceGBP}`,
        });
      }

      setIsProcessing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    }, 2000);
  };

  const handleOTCRequest = () => {
    if (!otcMessage.trim()) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/80 justify-end">
        <View className="bg-[#0a0f1e] rounded-t-3xl border-t-2 border-emerald-500/20">
          <SafeAreaView edges={["bottom"]}>
            {/* Header */}
            <View className="px-6 pt-6 pb-4 flex-row items-center justify-between border-b border-white/10">
              <Text className="text-white text-2xl font-bold">Purchase Bundle</Text>
              <Pressable onPress={onClose} className="bg-white/5 p-2 rounded-full">
                <Ionicons name="close" size={24} color="white" />
              </Pressable>
            </View>

            <ScrollView className="px-6 py-6" style={{ maxHeight: 500 }}>
              {/* Bundle Summary */}
              <View className="bg-emerald-500/10 rounded-2xl p-5 border border-emerald-500/20 mb-6">
                <Text className="text-white/70 text-sm mb-2">You will receive</Text>
                <Text className="text-white text-3xl font-bold mb-1">
                  {bundle.chipAmount.toLocaleString()} CHiP$
                </Text>
                <Text className="text-emerald-400 text-lg font-semibold">
                  for £{bundle.priceGBP.toLocaleString()}
                </Text>
              </View>

              {/* Seller Info */}
              <View className="bg-white/5 rounded-xl p-4 mb-6">
                <Text className="text-white/70 text-sm mb-2">Seller</Text>
                <Text className="text-white text-lg font-semibold">{bundle.sellerUsername}</Text>
              </View>

              {/* Payment Method Selection */}
              {purchaseMethod === null && (
                <View className="space-y-3">
                  <Text className="text-white text-lg font-semibold mb-2">
                    Choose Payment Method
                  </Text>

                  {bundle.acceptsCardPayment && (
                    <Pressable
                      onPress={() => setPurchaseMethod("card")}
                      className="bg-blue-500/10 border-2 border-blue-500/30 rounded-xl p-5 flex-row items-center active:opacity-80"
                    >
                      <View className="bg-blue-500/20 p-3 rounded-full mr-4">
                        <Ionicons name="card" size={28} color="#3b82f6" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-lg font-semibold">Card Payment</Text>
                        <Text className="text-white/60 text-sm">Instant purchase</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={24} color="#3b82f6" />
                    </Pressable>
                  )}

                  {bundle.acceptsOTCOffers && (
                    <Pressable
                      onPress={() => setPurchaseMethod("otc")}
                      className="bg-amber-500/10 border-2 border-amber-500/30 rounded-xl p-5 flex-row items-center active:opacity-80"
                    >
                      <View className="bg-amber-500/20 p-3 rounded-full mr-4">
                        <Ionicons name="chatbubbles" size={28} color="#f59e0b" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-lg font-semibold">Make OTC Offer</Text>
                        <Text className="text-white/60 text-sm">Negotiate with seller</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={24} color="#f59e0b" />
                    </Pressable>
                  )}
                </View>
              )}

              {/* Card Payment */}
              {purchaseMethod === "card" && (
                <View className="space-y-4">
                  <Pressable onPress={() => setPurchaseMethod(null)} className="mb-2">
                    <Text className="text-emerald-400 text-sm">← Change payment method</Text>
                  </Pressable>

                  <View className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20 mb-4">
                    <Text className="text-blue-300 text-sm">
                      Your card will be charged £{bundle.priceGBP.toLocaleString()} and you will instantly receive {bundle.chipAmount.toLocaleString()} CHiP$ in your account.
                    </Text>
                  </View>

                  <Pressable
                    onPress={handleCardPurchase}
                    disabled={isProcessing}
                    className={`bg-blue-500 rounded-xl py-4 ${
                      isProcessing ? "opacity-50" : "active:opacity-80"
                    }`}
                  >
                    <Text className="text-white text-center text-lg font-semibold">
                      {isProcessing ? "Processing Payment..." : `Pay £${bundle.priceGBP.toLocaleString()}`}
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* OTC Offer */}
              {purchaseMethod === "otc" && (
                <View className="space-y-4">
                  <Pressable onPress={() => setPurchaseMethod(null)} className="mb-2">
                    <Text className="text-emerald-400 text-sm">← Change payment method</Text>
                  </Pressable>

                  <View className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20 mb-4">
                    <Text className="text-amber-300 text-sm">
                      Send a message to {bundle.sellerUsername} with your offer. They will contact you to arrange payment.
                    </Text>
                  </View>

                  <View>
                    <Text className="text-white/70 text-sm mb-2 ml-1">Your Message</Text>
                    <TextInput
                      value={otcMessage}
                      onChangeText={setOtcMessage}
                      placeholder="I would like to purchase this bundle..."
                      placeholderTextColor="#ffffff40"
                      multiline
                      numberOfLines={4}
                      className="bg-white/10 text-white rounded-xl px-4 py-4 text-base border border-white/10"
                      style={{ textAlignVertical: "top" }}
                    />
                  </View>

                  {bundle.sellerTelegram && (
                    <View className="bg-[#229ED9]/10 rounded-xl p-4 border border-[#229ED9]/20">
                      <Text className="text-blue-300 text-sm">
                        Contact seller on Telegram: @{bundle.sellerTelegram}
                      </Text>
                    </View>
                  )}

                  <Pressable
                    onPress={handleOTCRequest}
                    disabled={!otcMessage.trim()}
                    className={`bg-amber-500 rounded-xl py-4 ${
                      !otcMessage.trim() ? "opacity-50" : "active:opacity-80"
                    }`}
                  >
                    <Text className="text-white text-center text-lg font-semibold">
                      Send Offer
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Warning */}
              <View className="bg-red-500/10 rounded-xl p-4 border border-red-500/20 mt-6">
                <Text className="text-red-300 text-xs">
                  ⚠️ IMPORTANT: Real Money Trading (RMT) with CHiP$ is against our Terms of Service. While we cannot detect or prevent it, we strongly advise against it. All purchases are final.
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}
