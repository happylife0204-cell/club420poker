import React, { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";

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

  const handleLogin = () => {
    if (!telegramUsername.trim()) {
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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
    </View>
  );
}

function EmailLogin({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);

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

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsVerifying(true);

    // Simulate verification
    setTimeout(() => {
      const { useAuthStore } = require("../state/authStore");
      useAuthStore.getState().loginWithEmail(email, username, undefined);
      setIsVerifying(false);
      onSuccess();
    }, 1000);
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
    </View>
  );
}

function C420Login({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [c420Balance, setC420Balance] = useState(0);
  const [transferAmount, setTransferAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const destinationAddress = "0.0.10088196-oxyln";

  const handleConnectWallet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);

    // Simulate HashPack wallet connection
    setTimeout(() => {
      setWalletConnected(true);
      setC420Balance(1000); // Mock balance
      setIsProcessing(false);
    }, 1500);
  };

  const handleCopyAddress = async () => {
    await Clipboard.setStringAsync(destinationAddress);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleConfirmTransfer = () => {
    if (!transferAmount.trim() || parseFloat(transferAmount) <= 0) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);

    // Simulate C420 transfer
    setTimeout(() => {
      const amount = parseFloat(transferAmount);
      const { useAuthStore } = require("../state/authStore");
      useAuthStore.getState().loginWithC420(`wallet_${Date.now()}`, amount);
      setIsProcessing(false);
      onSuccess();
    }, 2000);
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
    </View>
  );
}
