import React, { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, Image, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { hashPackWallet, HASHPACK_CONFIG } from "../services/hashPackWallet";

interface LandingScreenProps {
  onLoginSuccess: () => void;
}

export default function LandingScreen({ onLoginSuccess }: LandingScreenProps) {
  const [selectedMethod, setSelectedMethod] = useState<"telegram" | "email" | "c420" | null>(null);

  const handleMethodSelect = (method: "telegram" | "email" | "c420") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMethod(method);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMethod(null);
  };

  return (
    <LinearGradient
      colors={["#000000", "#0a0f1e", "#000000"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {selectedMethod === null ? (
              <MainLoginOptions onMethodSelect={handleMethodSelect} />
            ) : selectedMethod === "telegram" ? (
              <TelegramLogin onBack={handleBack} onSuccess={onLoginSuccess} />
            ) : selectedMethod === "email" ? (
              <EmailLogin onBack={handleBack} onSuccess={onLoginSuccess} />
            ) : (
              <C420Login onBack={handleBack} onSuccess={onLoginSuccess} />
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function MainLoginOptions({ onMethodSelect }: { onMethodSelect: (method: "telegram" | "email" | "c420") => void }) {
  return (
    <View className="flex-1 justify-center px-6">
      {/* Logo */}
      <View className="items-center mb-16">
        <View className="bg-black px-8 py-6 rounded-3xl">
          <Image
            source={require("../../assets/image-1763857797.png")}
            style={{ width: 320, height: 160 }}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Login Options */}
      <View className="space-y-4">
        {/* Telegram Login */}
        <Pressable
          onPress={() => onMethodSelect("telegram")}
          className="bg-[#229ED9] rounded-2xl p-5 flex-row items-center active:opacity-80"
        >
          <View className="bg-white/20 p-3 rounded-full mr-4">
            <Ionicons name="send" size={24} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-lg font-semibold">Login with Telegram</Text>
            <Text className="text-white/70 text-sm">Fast and secure</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </Pressable>

        {/* Email Login */}
        <Pressable
          onPress={() => onMethodSelect("email")}
          className="bg-white/5 border-2 border-white/10 rounded-2xl p-5 flex-row items-center active:opacity-80"
        >
          <View className="bg-amber-500/20 p-3 rounded-full mr-4">
            <Ionicons name="mail" size={24} color="#f59e0b" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-lg font-semibold">Email Sign Up</Text>
            <Text className="text-white/70 text-sm">Create an account</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </Pressable>

        {/* C420 Token Login */}
        <Pressable
          onPress={() => onMethodSelect("c420")}
          className="bg-gradient-to-r rounded-2xl p-[2px] active:opacity-80"
          style={{
            backgroundColor: "transparent",
          }}
        >
          <LinearGradient
            colors={["#fbbf24", "#f59e0b", "#d97706"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 16,
              padding: 2,
            }}
          >
            <View className="bg-[#0a0f1e] rounded-2xl p-5 flex-row items-center">
              <View className="bg-amber-500/20 p-3 rounded-full mr-4">
                <Ionicons name="medal" size={24} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-lg font-semibold">C420 Token Holder</Text>
                <Text className="text-amber-400 text-sm font-semibold">OG Banker Access</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#f59e0b" />
            </View>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Footer */}
      <View className="mt-12">
        <Text className="text-white/40 text-center text-sm">
          By continuing, you agree to our Terms of Service
        </Text>
      </View>
    </View>
  );
}

function TelegramLogin({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [telegramUsername, setTelegramUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showToS, setShowToS] = useState(false);

  const handleLogin = () => {
    if (!telegramUsername.trim()) {
      return;
    }

    // Show ToS modal before creating account
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowToS(true);
  };

  const handleAcceptToS = () => {
    setShowToS(false);
    setIsLoading(true);

    // Simulate Telegram auth
    setTimeout(() => {
      const { useAuthStore } = require("../state/authStore");
      useAuthStore.getState().loginWithTelegram(
        telegramUsername,
        telegramUsername,
        undefined
      );
      setIsLoading(false);
      onSuccess();
    }, 1000);
  };

  const handleDeclineToS = () => {
    setShowToS(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  return (
    <View className="flex-1 justify-center px-6">
      <Pressable onPress={onBack} className="mb-8">
        <View className="flex-row items-center">
          <Ionicons name="chevron-back" size={24} color="#10b981" />
          <Text className="text-emerald-400 text-lg ml-2">Back</Text>
        </View>
      </Pressable>

      <View className="bg-white/5 rounded-3xl p-6 border border-white/10">
        <View className="items-center mb-6">
          <View className="bg-[#229ED9]/20 p-4 rounded-full mb-4">
            <Ionicons name="send" size={40} color="#229ED9" />
          </View>
          <Text className="text-white text-2xl font-bold mb-2">Telegram Login</Text>
          <Text className="text-white/60 text-center">
            Enter your Telegram username to continue
          </Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-white/70 text-sm mb-2 ml-1">Telegram Username</Text>
            <TextInput
              value={telegramUsername}
              onChangeText={setTelegramUsername}
              placeholder="@username"
              placeholderTextColor="#ffffff40"
              autoCapitalize="none"
              className="bg-white/10 text-white rounded-xl px-4 py-4 text-lg border border-white/10"
            />
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={!telegramUsername.trim() || isLoading}
            className={`bg-[#229ED9] rounded-xl py-4 ${
              !telegramUsername.trim() || isLoading ? "opacity-50" : "active:opacity-80"
            }`}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {isLoading ? "Connecting..." : "Continue with Telegram"}
            </Text>
          </Pressable>
        </View>

        <View className="mt-6 bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
          <Text className="text-blue-300 text-sm">
            Your Telegram avatar will automatically be used as your Club 420 Poker profile picture
          </Text>
        </View>
      </View>

      {/* Terms of Service Modal */}
      <TermsOfServiceModal
        visible={showToS}
        onAccept={handleAcceptToS}
        onDecline={handleDeclineToS}
      />
    </View>
  );
}

function EmailLogin({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [showToS, setShowToS] = useState(false);

  const handleSendVerification = () => {
    if (!email.trim() || !username.trim()) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsVerifying(true);

    // Simulate sending verification email
    setTimeout(() => {
      setIsVerifying(false);
      setShowVerification(true);
    }, 1000);
  };

  const handleVerify = () => {
    if (!verificationCode.trim()) {
      return;
    }

    // Show ToS modal before creating account
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowToS(true);
  };

  const handleAcceptToS = () => {
    setShowToS(false);
    setIsVerifying(true);

    // Simulate verification and account creation
    setTimeout(() => {
      const { useAuthStore } = require("../state/authStore");
      useAuthStore.getState().loginWithEmail(email, username, undefined);
      setIsVerifying(false);
      onSuccess();
    }, 1000);
  };

  const handleDeclineToS = () => {
    setShowToS(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  return (
    <View className="flex-1 justify-center px-6">
      <Pressable onPress={onBack} className="mb-8">
        <View className="flex-row items-center">
          <Ionicons name="chevron-back" size={24} color="#10b981" />
          <Text className="text-emerald-400 text-lg ml-2">Back</Text>
        </View>
      </Pressable>

      <View className="bg-white/5 rounded-3xl p-6 border border-white/10">
        <View className="items-center mb-6">
          <View className="bg-emerald-500/20 p-4 rounded-full mb-4">
            <Ionicons name="mail" size={40} color="#10b981" />
          </View>
          <Text className="text-white text-2xl font-bold mb-2">Email Sign Up</Text>
          <Text className="text-white/60 text-center">
            {showVerification
              ? "Enter the verification code sent to your email"
              : "Create your account to get started"}
          </Text>
        </View>

        {!showVerification ? (
          <View className="space-y-4">
            <View>
              <Text className="text-white/70 text-sm mb-2 ml-1">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor="#ffffff40"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-white/10 text-white rounded-xl px-4 py-4 text-lg border border-white/10"
              />
            </View>

            <View>
              <Text className="text-white/70 text-sm mb-2 ml-1">Username</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="username"
                placeholderTextColor="#ffffff40"
                autoCapitalize="none"
                className="bg-white/10 text-white rounded-xl px-4 py-4 text-lg border border-white/10"
              />
            </View>

            <Pressable
              onPress={handleSendVerification}
              disabled={!email.trim() || !username.trim() || isVerifying}
              className={`bg-emerald-500 rounded-xl py-4 ${
                !email.trim() || !username.trim() || isVerifying ? "opacity-50" : "active:opacity-80"
              }`}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {isVerifying ? "Sending..." : "Send Verification Code"}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="space-y-4">
            <View>
              <Text className="text-white/70 text-sm mb-2 ml-1">Verification Code</Text>
              <TextInput
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="000000"
                placeholderTextColor="#ffffff40"
                keyboardType="number-pad"
                maxLength={6}
                className="bg-white/10 text-white rounded-xl px-4 py-4 text-lg border border-white/10 text-center"
              />
            </View>

            <Pressable
              onPress={handleVerify}
              disabled={!verificationCode.trim() || isVerifying}
              className={`bg-emerald-500 rounded-xl py-4 ${
                !verificationCode.trim() || isVerifying ? "opacity-50" : "active:opacity-80"
              }`}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {isVerifying ? "Verifying..." : "Verify & Continue"}
              </Text>
            </Pressable>

            <Pressable onPress={() => setShowVerification(false)} className="py-2">
              <Text className="text-emerald-400 text-center">Resend Code</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Terms of Service Modal */}
      <TermsOfServiceModal
        visible={showToS}
        onAccept={handleAcceptToS}
        onDecline={handleDeclineToS}
      />
    </View>
  );
}

function C420Login({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [c420Balance, setC420Balance] = useState(0);
  const [transferAmount, setTransferAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [showToS, setShowToS] = useState(false);
  const [pendingTransferData, setPendingTransferData] = useState<{ amount: number; txId: string; chipsReceived: number } | null>(null);
  const destinationAddress = HASHPACK_CONFIG.RECEIVER_ACCOUNT_ID;

  const handleConnectWallet = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);
    setError("");

    try {
      // Attempt to connect to HashPack
      const walletData = await hashPackWallet.connectWallet();

      if (walletData.isConnected) {
        setWalletConnected(true);
        setAccountId(walletData.accountId);
        setC420Balance(walletData.c420Balance);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError("Failed to connect wallet. Please try again.");
      }
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      setError(err.message || "Failed to connect HashPack wallet");
      // For testing, show mock connection
      Alert.alert(
        "HashPack Not Configured",
        "Real HashPack integration requires mobile wallet setup. For testing, mock connection enabled.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Use Mock",
            onPress: () => {
              setWalletConnected(true);
              setAccountId("0.0.123456");
              setC420Balance(1000);
            },
          },
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyAddress = async () => {
    await Clipboard.setStringAsync(destinationAddress);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleConfirmTransfer = async () => {
    if (!transferAmount.trim() || parseFloat(transferAmount) <= 0) {
      return;
    }

    const amount = parseFloat(transferAmount);

    if (amount > c420Balance) {
      Alert.alert("Insufficient Balance", "You don't have enough C420 tokens.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);
    setError("");

    try {
      // Send C420 tokens via HashPack
      const txId = await hashPackWallet.sendC420Tokens(amount);

      // Calculate CHiP$ received
      const chipsReceived = hashPackWallet.calculateChips(amount);

      // Store pending transfer data and show ToS
      setPendingTransferData({ amount, txId, chipsReceived });
      setIsProcessing(false);
      setShowToS(true);
    } catch (err: any) {
      console.error("Transfer error:", err);
      setError(err.message || "Transfer failed");

      // For testing purposes
      Alert.alert(
        "Transaction Not Sent",
        "Real HashPack transactions require proper setup. Use mock for testing?",
        [
          { text: "Cancel", style: "cancel", onPress: () => setIsProcessing(false) },
          {
            text: "Mock Transfer",
            onPress: () => {
              const chipsReceived = amount * 50000;
              setPendingTransferData({ amount, txId: "mock_txn_" + Date.now(), chipsReceived });
              setIsProcessing(false);
              setShowToS(true);
            },
          },
        ]
      );
    }
  };

  const handleAcceptToS = () => {
    setShowToS(false);

    if (pendingTransferData) {
      const { amount, txId, chipsReceived } = pendingTransferData;

      // Login user with C420
      const { useAuthStore } = require("../state/authStore");
      useAuthStore.getState().loginWithC420(accountId, amount);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        "Transfer Complete!",
        `You sent ${amount} C420 and received ${chipsReceived.toLocaleString()} CHiP$\n\nTransaction: ${txId}`,
        [{ text: "OK", onPress: onSuccess }]
      );
    }
  };

  const handleDeclineToS = () => {
    setShowToS(false);
    setPendingTransferData(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  return (
    <View className="flex-1 justify-center px-6">
      <Pressable onPress={onBack} className="mb-8">
        <View className="flex-row items-center">
          <Ionicons name="chevron-back" size={24} color="#10b981" />
          <Text className="text-emerald-400 text-lg ml-2">Back</Text>
        </View>
      </Pressable>

      <View className="bg-white/5 rounded-3xl p-6 border border-amber-500/20">
        <View className="items-center mb-6">
          <View className="bg-amber-500/20 p-4 rounded-full mb-4">
            <Ionicons name="medal" size={40} color="#f59e0b" />
          </View>
          <Text className="text-white text-2xl font-bold mb-2">C420 Token Login</Text>
          <Text className="text-amber-400 text-center font-semibold mb-1">
            Exclusive OG Banker Access
          </Text>
          <Text className="text-white/60 text-center text-sm">
            Token ID: 0.0.10117135 on Hedera
          </Text>
        </View>

        {!walletConnected ? (
          <View className="space-y-4">
            <View className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
              <Text className="text-amber-300 text-sm font-semibold mb-2">Benefits:</Text>
              <View className="space-y-1">
                <Text className="text-amber-200 text-sm">• Instant CHiP$ at 1:50,000 ratio</Text>
                <Text className="text-amber-200 text-sm">• OG Banker status</Text>
                <Text className="text-amber-200 text-sm">• Lifetime 1% fee on bundle sales</Text>
                <Text className="text-amber-200 text-sm">• Priority marketplace access</Text>
              </View>
            </View>

            <Pressable
              onPress={handleConnectWallet}
              disabled={isProcessing}
              className={`bg-amber-500 rounded-xl py-4 ${
                isProcessing ? "opacity-50" : "active:opacity-80"
              }`}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {isProcessing ? "Connecting..." : "Connect HashPack Wallet"}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="space-y-4">
            <View className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-white text-sm">Wallet Connected</Text>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              </View>
              <Text className="text-white text-2xl font-bold">
                {c420Balance.toLocaleString()} C420
              </Text>
            </View>

            <View>
              <Text className="text-white/70 text-sm mb-2 ml-1">Send C420 to:</Text>
              <Pressable
                onPress={handleCopyAddress}
                className="bg-white/10 rounded-xl px-4 py-4 flex-row items-center justify-between border border-white/10 active:opacity-80"
              >
                <Text className="text-white text-base flex-1">{destinationAddress}</Text>
                <Ionicons name="copy" size={20} color="#10b981" />
              </Pressable>
            </View>

            <View>
              <Text className="text-white/70 text-sm mb-2 ml-1">Amount to Send</Text>
              <TextInput
                value={transferAmount}
                onChangeText={setTransferAmount}
                placeholder="0"
                placeholderTextColor="#ffffff40"
                keyboardType="decimal-pad"
                className="bg-white/10 text-white rounded-xl px-4 py-4 text-lg border border-white/10"
              />
              {transferAmount && parseFloat(transferAmount) > 0 && (
                <Text className="text-amber-400 text-sm mt-2 ml-1">
                  You will receive: {(parseFloat(transferAmount) * 50000).toLocaleString()} CHiP$
                </Text>
              )}
            </View>

            <Pressable
              onPress={handleConfirmTransfer}
              disabled={!transferAmount.trim() || parseFloat(transferAmount) <= 0 || isProcessing}
              className={`bg-amber-500 rounded-xl py-4 ${
                !transferAmount.trim() || parseFloat(transferAmount) <= 0 || isProcessing
                  ? "opacity-50"
                  : "active:opacity-80"
              }`}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {isProcessing ? "Processing..." : "Confirm Transfer"}
              </Text>
            </Pressable>

            <View className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
              <Text className="text-red-300 text-xs">
                ⚠️ Important: Send C420 tokens from your HashPack wallet to the address above. Once received, your CHiP$ balance will be credited automatically.
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Terms of Service Modal */}
      <TermsOfServiceModal
        visible={showToS}
        onAccept={handleAcceptToS}
        onDecline={handleDeclineToS}
      />
    </View>
  );
}

function TermsOfServiceModal({
  visible,
  onAccept,
  onDecline,
}: {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isAtBottom && !hasScrolledToEnd) {
      setHasScrolledToEnd(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/95">
        <SafeAreaView style={{ flex: 1 }}>
          <View className="flex-1 px-6 pt-4">
            {/* Header */}
            <View className="mb-6">
              <Text className="text-white text-2xl font-bold text-center mb-2">
                Terms of Service
              </Text>
              <Text className="text-white/60 text-center text-sm">
                Please read and scroll to the bottom to continue
              </Text>
            </View>

            {/* Terms Content */}
            <ScrollView
              className="flex-1 bg-white/5 rounded-2xl p-5 border border-white/10 mb-6"
              onScroll={handleScroll}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={true}
            >
              <Text className="text-white text-lg font-bold mb-4">Club 420 Poker - Terms of Service</Text>

              <Text className="text-white/90 text-base mb-4">
                Last Updated: {new Date().toLocaleDateString()}
              </Text>

              <Text className="text-white font-semibold text-base mb-2">1. Acceptance of Terms</Text>
              <Text className="text-white/80 text-sm mb-4">
                By accessing or using Club 420 Poker (&quot;the App&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the App.
              </Text>

              <Text className="text-white font-semibold text-base mb-2">2. Virtual Currency (CHiP$)</Text>
              <Text className="text-white/80 text-sm mb-4">
                CHiP$ is an in-app virtual currency used exclusively for gameplay within Club 420 Poker. CHiP$ has no real-world monetary value and cannot be exchanged for real money, goods, or services outside the App.
              </Text>

              <Text className="text-white font-semibold text-base mb-2">3. Real Money Trading (RMT) Prohibition</Text>
              <Text className="text-white/80 text-sm mb-4">
                Users are strictly prohibited from buying, selling, or exchanging CHiP$ for real money or any items of real-world value. Any violation of this policy may result in immediate account termination without refund.
              </Text>

              <Text className="text-white font-semibold text-base mb-2">4. Banker System</Text>
              <Text className="text-white/80 text-sm mb-4">
                The Banker system allows qualified users to list CHiP$ bundles in the marketplace. All transactions within the App are for virtual currency only. Bankers who accept card payments do so through integrated payment processors and are subject to applicable fees as disclosed in the App.
              </Text>

              <Text className="text-white font-semibold text-base mb-2">5. C420 Token Integration</Text>
              <Text className="text-white/80 text-sm mb-4">
                C420 token holders on the Hedera network may exchange their tokens for CHiP$ at a fixed rate (1 C420 = 50,000 CHiP$) and receive OG Banker status. This exchange is voluntary and irreversible. By participating, you acknowledge that C420 tokens are transferred to the designated wallet address and cannot be refunded.
              </Text>

              <Text className="text-white font-semibold text-base mb-2">6. User Conduct</Text>
              <Text className="text-white/80 text-sm mb-4">
                Users must conduct themselves respectfully and in accordance with all applicable laws. Cheating, harassment, exploitation of bugs, or any malicious activity is strictly prohibited and may result in account suspension or termination.
              </Text>

              <Text className="text-white font-semibold text-base mb-2">7. Account Security</Text>
              <Text className="text-white/80 text-sm mb-4">
                You are responsible for maintaining the confidentiality of your account credentials. Club 420 Poker is not liable for any loss or damage arising from unauthorized account access due to your failure to protect your login information.
              </Text>

              <Text className="text-white font-semibold text-base mb-2">8. No Gambling or Wagering</Text>
              <Text className="text-white/80 text-sm mb-4">
                Club 420 Poker is a social gaming platform for entertainment purposes only. The App does not facilitate real money gambling, betting, or wagering. All poker games are played with virtual currency (CHiP$) that has no real-world value.
              </Text>

              <Text className="text-white font-semibold text-base mb-2">9. Age Requirement</Text>
              <Text className="text-white/80 text-sm mb-4">
                You must be at least 18 years old (or the legal age of majority in your jurisdiction) to use the App. By using the App, you represent and warrant that you meet this age requirement.
              </Text>

              <Text className="text-white font-semibold text-base mb-2">10. Privacy and Data</Text>
              <Text className="text-white/80 text-sm mb-4">
                We collect and process user data as described in our Privacy Policy. By using the App, you consent to such collection and processing. We do not sell your personal information to third parties.
              </Text>

              <Text className="text-white font-semibold text-base mb-2">11. Intellectual Property</Text>
              <Text className="text-white/80 text-sm mb-4">
                All content, trademarks, logos, and intellectual property within the App are owned by Club 420 Poker or its licensors. You may not copy, modify, distribute, or create derivative works without explicit permission.
              </Text>

              <Text className="text-white font-semibold text-base mb-2">12. Disclaimers and Limitations of Liability</Text>
              <Text className="text-white/80 text-sm mb-4">
                The App is provided &quot;as is&quot; without warranties of any kind. Club 420 Poker is not liable for any indirect, incidental, consequential, or punitive damages arising from your use of the App, including but not limited to loss of CHiP$, account suspension, or service interruptions.
              </Text>

              <Text className="text-white font-semibold text-base mb-2">13. Modifications to Terms</Text>
              <Text className="text-white/80 text-sm mb-4">
                We reserve the right to modify these Terms of Service at any time. Continued use of the App following any changes constitutes acceptance of the revised terms.
              </Text>

              <Text className="text-white font-semibold text-base mb-2">14. Termination</Text>
              <Text className="text-white/80 text-sm mb-4">
                We may suspend or terminate your account at our sole discretion for any violation of these Terms or for any other reason. Upon termination, you will lose access to your account and any associated CHiP$ balance.
              </Text>

              <Text className="text-white font-semibold text-base mb-2">15. Governing Law</Text>
              <Text className="text-white/80 text-sm mb-4">
                These Terms of Service are governed by and construed in accordance with applicable laws. Any disputes arising from these terms will be resolved through binding arbitration.
              </Text>

              <Text className="text-white font-semibold text-base mb-2">16. Contact Information</Text>
              <Text className="text-white/80 text-sm mb-6">
                For questions or concerns about these Terms of Service, please contact us through the App support channels.
              </Text>

              <Text className="text-amber-400 text-center text-sm font-semibold mb-4">
                {hasScrolledToEnd ? "✓ You have read the entire Terms of Service" : "↓ Scroll to the bottom to continue"}
              </Text>
            </ScrollView>

            {/* Action Buttons */}
            <View className="pb-4 space-y-3">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onAccept();
                }}
                disabled={!hasScrolledToEnd}
                className={`rounded-xl py-4 ${
                  hasScrolledToEnd ? "bg-emerald-500 active:opacity-80" : "bg-white/10 opacity-50"
                }`}
              >
                <Text className="text-white text-center text-lg font-semibold">
                  I Agree - Create Account
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onDecline();
                }}
                className="bg-white/5 rounded-xl py-3 active:opacity-80"
              >
                <Text className="text-white/60 text-center font-semibold">
                  Decline
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
