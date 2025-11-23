import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Modal, Image, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "../state/authStore";
import { useAppStore } from "../state/appStore";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const transactions = useAppStore((s) => s.transactions);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const userTransactions = transactions.filter((t) => t.userId === user?.id);

  // Calculate stats
  const totalWins = userTransactions
    .filter((t) => t.type === "table_win")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalLosses = userTransactions
    .filter((t) => t.type === "table_buy_in")
    .reduce((sum, t) => sum + t.amount, 0);
  const profitLoss = totalWins - totalLosses;

  const handleSendChips = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSendModal(true);
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logout();
  };

  const handleEditProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowEditModal(true);
  };

  if (!user) {
    return (
      <View className="flex-1 bg-[#0a0f1e] items-center justify-center">
        <Text className="text-white/60">No user logged in</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <LinearGradient colors={["#000000", "#0a0f1e", "#000000"]} style={{ flex: 1 }}>
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          <ScrollView className="flex-1">
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
              <Text className="text-white text-2xl font-bold text-center">Profile</Text>
            </View>

            {/* Profile Card */}
            <View className="px-6 mb-6">
              <View className="bg-white/5 rounded-3xl p-6 border border-white/10">
                {/* Avatar & Username */}
                <View className="items-center mb-6">
                  <View className="relative mb-4">
                    {user.avatarUrl ? (
                      <Image
                        source={{ uri: user.avatarUrl }}
                        className="w-24 h-24 rounded-full border-4 border-amber-500/30"
                      />
                    ) : (
                      <View className="bg-amber-500/20 w-24 h-24 rounded-full items-center justify-center border-4 border-amber-500/30">
                        <Text className="text-amber-400 text-4xl font-bold">
                          {user.username ? user.username.charAt(0).toUpperCase() : "?"}
                        </Text>
                      </View>
                    )}
                    <Pressable
                      onPress={handleEditProfile}
                      className="absolute -bottom-1 -right-1 bg-amber-500 w-8 h-8 rounded-full items-center justify-center border-2 border-[#0a0f1e] active:opacity-80"
                    >
                      <Ionicons name="pencil" size={14} color="white" />
                    </Pressable>
                  </View>
                  <Text className="text-white text-2xl font-bold mb-1">
                    {user.username || "Set Username"}
                  </Text>
                  {user.tagline && (
                    <Text className="text-amber-400/80 text-sm italic mt-1">
                      {user.tagline}
                    </Text>
                  )}
                  {user.email && (
                    <Text className="text-white/60 text-sm mt-1">{user.email}</Text>
                  )}
                  {user.bankerStatus !== "none" && (
                    <View className="mt-3">
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
                          paddingHorizontal: 16,
                          paddingVertical: 6,
                        }}
                      >
                        <Text className="text-white font-bold text-sm">
                          {user.bankerStatus === "og" ? "🏆 OG BANKER" : "💼 BANKER"}
                        </Text>
                      </LinearGradient>
                    </View>
                  )}
                </View>

                {/* CHiP$ Balance */}
                <View className="bg-[#0a0f1e]/50 rounded-2xl p-5 mb-4">
                  <Text className="text-white/70 text-sm mb-2">CHiP$ Balance</Text>
                  <Text className="text-white text-4xl font-bold mb-4">
                    {user.chipBalance.toLocaleString()}
                  </Text>
                  <Pressable
                    onPress={handleSendChips}
                    className="bg-emerald-500 rounded-xl py-3 active:opacity-80"
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="paper-plane" size={20} color="white" />
                      <Text className="text-white font-semibold text-base ml-2">
                        Send CHiP$
                      </Text>
                    </View>
                  </Pressable>
                </View>

                {/* Login Method */}
                <View className="flex-row items-center bg-[#0a0f1e]/50 rounded-xl p-4">
                  <View className="bg-blue-500/20 p-2 rounded-full mr-3">
                    <Ionicons
                      name={
                        user.loginMethod === "telegram"
                          ? "send"
                          : user.loginMethod === "email"
                          ? "mail"
                          : "medal"
                      }
                      size={20}
                      color={
                        user.loginMethod === "telegram"
                          ? "#229ED9"
                          : user.loginMethod === "email"
                          ? "#10b981"
                          : "#f59e0b"
                      }
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white/60 text-xs">Login Method</Text>
                    <Text className="text-white font-semibold capitalize">
                      {user.loginMethod === "c420" ? "C420 Token" : user.loginMethod}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Stats */}
            <View className="px-6 mb-6">
              <Text className="text-white text-xl font-bold mb-4">Statistics</Text>
              <View className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
                <StatRow
                  label="Total Games"
                  value={userTransactions.filter((t) => t.type === "table_buy_in").length.toString()}
                  icon="game-controller"
                />
                <View className="h-[1px] bg-white/10" />
                <StatRow
                  label="Total Wins"
                  value={`${totalWins.toLocaleString()} CHiP$`}
                  icon="trending-up"
                  valueColor="text-emerald-400"
                />
                <View className="h-[1px] bg-white/10" />
                <StatRow
                  label="Total Spent"
                  value={`${totalLosses.toLocaleString()} CHiP$`}
                  icon="trending-down"
                  valueColor="text-red-400"
                />
                <View className="h-[1px] bg-white/10" />
                <StatRow
                  label="Profit/Loss"
                  value={`${profitLoss >= 0 ? "+" : ""}${profitLoss.toLocaleString()} CHiP$`}
                  icon="analytics"
                  valueColor={profitLoss >= 0 ? "text-emerald-400" : "text-red-400"}
                />
              </View>
            </View>

            {/* Transaction History */}
            <View className="px-6 mb-6">
              <Text className="text-white text-xl font-bold mb-4">Recent Transactions</Text>
              {userTransactions.length === 0 ? (
                <View className="bg-white/5 rounded-2xl p-8 border border-white/10 items-center">
                  <Ionicons name="receipt-outline" size={40} color="#ffffff40" />
                  <Text className="text-white/60 text-sm mt-3">No transactions yet</Text>
                </View>
              ) : (
                <View className="space-y-3">
                  {userTransactions.slice(0, 10).map((transaction) => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
                  ))}
                </View>
              )}
            </View>

            {/* Banker Info */}
            {user.bankerStatus !== "none" && (
              <View className="px-6 mb-6">
                <Text className="text-white text-xl font-bold mb-4">Banker Info</Text>
                <View className="bg-white/5 rounded-2xl p-5 border border-white/10">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-white/70 text-sm">Status</Text>
                    <Text className="text-white font-semibold">
                      {user.bankerStatus === "og" ? "OG Banker" : "Banker"}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-white/70 text-sm">Fee Rate</Text>
                    <Text className="text-white font-semibold">
                      {(user.bankerFeeRate * 100).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Logout Button */}
            <View className="px-6 mb-6">
              <Pressable
                onPress={handleLogout}
                className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-4 active:opacity-80"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                  <Text className="text-red-400 font-bold text-lg ml-3">Logout</Text>
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Send CHiP$ Modal */}
      <SendChipsModal
        visible={showSendModal}
        onClose={() => setShowSendModal(false)}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </View>
  );
}

function StatRow({
  label,
  value,
  icon,
  valueColor = "text-white",
}: {
  label: string;
  value: string;
  icon: any;
  valueColor?: string;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center">
        <Ionicons name={icon} size={20} color="#ffffff60" />
        <Text className="text-white/70 ml-3">{label}</Text>
      </View>
      <Text className={`${valueColor} font-semibold text-lg`}>{value}</Text>
    </View>
  );
}

function TransactionItem({ transaction }: { transaction: any }) {
  const getIcon = () => {
    switch (transaction.type) {
      case "chip_purchase":
        return "cart";
      case "chip_send":
        return "arrow-up";
      case "chip_receive":
        return "arrow-down";
      case "table_buy_in":
        return "enter";
      case "table_win":
        return "trophy";
      case "bundle_sale":
        return "cash";
      case "c420_exchange":
        return "swap-horizontal";
      default:
        return "ellipse";
    }
  };

  const getColor = () => {
    switch (transaction.type) {
      case "chip_purchase":
      case "chip_receive":
      case "table_win":
      case "bundle_sale":
        return "text-emerald-400";
      case "chip_send":
      case "table_buy_in":
        return "text-red-400";
      default:
        return "text-white";
    }
  };

  return (
    <View className="bg-white/5 rounded-xl p-4 border border-white/10 flex-row items-center">
      <View className="bg-white/10 p-3 rounded-full mr-4">
        <Ionicons name={getIcon()} size={20} color="#ffffff80" />
      </View>
      <View className="flex-1">
        <Text className="text-white font-semibold mb-1" numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text className="text-white/60 text-xs">
          {new Date(transaction.timestamp).toLocaleDateString()}
        </Text>
      </View>
      <Text className={`${getColor()} font-bold text-lg`}>
        {transaction.type === "chip_send" || transaction.type === "table_buy_in" ? "-" : "+"}
        {transaction.amount.toLocaleString()}
      </Text>
    </View>
  );
}

function SendChipsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const user = useAuthStore((s) => s.user);
  const deductChips = useAuthStore((s) => s.deductChips);
  const addTransaction = useAppStore((s) => s.addTransaction);

  const handleSend = () => {
    if (!recipient.trim() || !amount.trim() || parseFloat(amount) <= 0) {
      return;
    }

    const sendAmount = parseFloat(amount);
    if (!user || user.chipBalance < sendAmount) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);

    setTimeout(() => {
      const success = deductChips(sendAmount);
      if (success) {
        addTransaction({
          id: `txn_${Date.now()}`,
          userId: user.id,
          type: "chip_send",
          amount: sendAmount,
          relatedUserId: recipient,
          timestamp: new Date().toISOString(),
          description: `Sent ${sendAmount.toLocaleString()} CHiP$ to ${recipient}`,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setRecipient("");
        setAmount("");
        onClose();
      }
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-black/80 justify-end">
            <View className="bg-[#0a0f1e] rounded-t-3xl border-t-2 border-emerald-500/20">
              <SafeAreaView edges={["bottom"]}>
                <View className="px-6 pt-6 pb-4 flex-row items-center justify-between border-b border-white/10">
                  <Text className="text-white text-2xl font-bold">Send CHiP$</Text>
                  <Pressable onPress={onClose} className="bg-white/5 p-2 rounded-full">
                    <Ionicons name="close" size={24} color="white" />
                  </Pressable>
                </View>

                <ScrollView
                  className="px-6 py-6"
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View className="space-y-4">
                    <View className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                      <Text className="text-emerald-400 text-sm">
                        Your Balance: {user?.chipBalance.toLocaleString()} CHiP$
                      </Text>
                    </View>

                    <View>
                      <Text className="text-white/70 text-sm mb-2 ml-1">Recipient Username</Text>
                      <TextInput
                        value={recipient}
                        onChangeText={setRecipient}
                        placeholder="username"
                        placeholderTextColor="#ffffff40"
                        autoCapitalize="none"
                        className="bg-white/10 text-white rounded-xl px-4 py-4 text-lg border border-white/10"
                      />
                    </View>

                    <View>
                      <Text className="text-white/70 text-sm mb-2 ml-1">Amount</Text>
                      <TextInput
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0"
                        placeholderTextColor="#ffffff40"
                        keyboardType="decimal-pad"
                        className="bg-white/10 text-white rounded-xl px-4 py-4 text-lg border border-white/10"
                      />
                    </View>

                    <Pressable
                      onPress={handleSend}
                      disabled={
                        !recipient.trim() ||
                        !amount.trim() ||
                        parseFloat(amount) <= 0 ||
                        (user && parseFloat(amount) > user.chipBalance) ||
                        isProcessing
                      }
                      className={`bg-emerald-500 rounded-xl py-4 ${
                        !recipient.trim() ||
                        !amount.trim() ||
                        parseFloat(amount) <= 0 ||
                        (user && parseFloat(amount) > user.chipBalance) ||
                        isProcessing
                          ? "opacity-50"
                          : "active:opacity-80"
                      }`}
                    >
                      <Text className="text-white text-center text-lg font-semibold">
                        {isProcessing ? "Sending..." : "Send CHiP$"}
                      </Text>
                    </Pressable>

                    {user && amount && parseFloat(amount) > user.chipBalance && (
                      <View className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                        <Text className="text-red-300 text-sm">Insufficient balance</Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
              </SafeAreaView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function EditProfileModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [username, setUsername] = useState(user?.username || "");
  const [tagline, setTagline] = useState(user?.tagline || "");
  const [avatarUri, setAvatarUri] = useState(user?.avatarUrl || "");
  const [isSaving, setIsSaving] = useState(false);

  const handlePickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleSave = () => {
    if (!username.trim()) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);

    setTimeout(() => {
      updateUser({
        username: username.trim(),
        tagline: tagline.trim() || undefined,
        avatarUrl: avatarUri || undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsSaving(false);
      onClose();
    }, 500);
  };

  const remainingChars = 42 - tagline.length;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-black/80 justify-end">
            <View className="bg-[#0a0f1e] rounded-t-3xl border-t-2 border-amber-500/20">
              <SafeAreaView edges={["bottom"]}>
                <View className="px-6 pt-6 pb-4 flex-row items-center justify-between border-b border-white/10">
                  <Text className="text-white text-2xl font-bold">Edit Profile</Text>
                  <Pressable onPress={onClose} className="bg-white/5 p-2 rounded-full active:opacity-80">
                    <Ionicons name="close" size={24} color="white" />
                  </Pressable>
                </View>

                <ScrollView
                  className="px-6 py-6"
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View className="space-y-5">
                    {/* Avatar Section */}
                    <View className="items-center">
                      <Pressable onPress={handlePickImage} className="active:opacity-80">
                        {avatarUri ? (
                          <Image
                            source={{ uri: avatarUri }}
                            className="w-32 h-32 rounded-full border-4 border-amber-500/30"
                          />
                        ) : (
                          <View className="bg-amber-500/20 w-32 h-32 rounded-full items-center justify-center border-4 border-amber-500/30">
                            <Text className="text-amber-400 text-5xl font-bold">
                              {username ? username.charAt(0).toUpperCase() : "?"}
                            </Text>
                          </View>
                        )}
                        <View className="absolute bottom-0 right-0 bg-amber-500 w-10 h-10 rounded-full items-center justify-center border-4 border-[#0a0f1e]">
                          <Ionicons name="camera" size={18} color="white" />
                        </View>
                      </Pressable>
                      <Text className="text-white/60 text-sm mt-3">Tap to change avatar</Text>
                    </View>

                    {/* Username Input */}
                    <View>
                      <Text className="text-white/70 text-sm mb-2 ml-1">Username</Text>
                      <TextInput
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Enter username"
                        placeholderTextColor="#ffffff40"
                        autoCapitalize="none"
                        maxLength={20}
                        className="bg-white/10 text-white rounded-xl px-4 py-4 text-lg border border-white/10"
                      />
                    </View>

                    {/* Tagline Input */}
                    <View>
                      <View className="flex-row items-center justify-between mb-2 ml-1">
                        <Text className="text-white/70 text-sm">Tagline</Text>
                        <Text className={`text-xs ${remainingChars < 10 ? "text-amber-400" : "text-white/40"}`}>
                          {remainingChars} / 42
                        </Text>
                      </View>
                      <TextInput
                        value={tagline}
                        onChangeText={(text) => {
                          if (text.length <= 42) {
                            setTagline(text);
                          }
                        }}
                        placeholder="Add a tagline (optional)"
                        placeholderTextColor="#ffffff40"
                        maxLength={42}
                        className="bg-white/10 text-white rounded-xl px-4 py-4 text-lg border border-white/10"
                      />
                      <Text className="text-white/50 text-xs mt-2 ml-1 italic">
                        Example: &quot;win some lose some&quot;
                      </Text>
                    </View>

                    {/* Save Button */}
                    <Pressable
                      onPress={handleSave}
                      disabled={!username.trim() || isSaving}
                      className={`bg-amber-500 rounded-xl py-4 mt-2 ${
                        !username.trim() || isSaving ? "opacity-50" : "active:opacity-80"
                      }`}
                    >
                      <Text className="text-white text-center text-lg font-semibold">
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Text>
                    </Pressable>

                    {!username.trim() && (
                      <View className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                        <Text className="text-red-300 text-sm">Username is required</Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
              </SafeAreaView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
