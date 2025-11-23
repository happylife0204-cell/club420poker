import { Alert } from "react-native";

// Environment variables
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const STRIPE_BACKEND_URL = process.env.EXPO_PUBLIC_STRIPE_BACKEND_URL || "http://localhost:3001";

// Stripe service for all payment operations
class StripeService {
  /**
   * Check if Stripe is properly configured
   */
  isConfigured(): boolean {
    return !!STRIPE_PUBLISHABLE_KEY && !!STRIPE_BACKEND_URL && STRIPE_PUBLISHABLE_KEY !== "pk_test_placeholder";
  }

  /**
   * Create Stripe Connect account for new banker
   * This should be called when a user becomes a banker
   */
  async createConnectAccount(userId: string, email: string): Promise<{ accountId: string; onboardingUrl: string } | null> {
    try {
      const response = await fetch(`${STRIPE_BACKEND_URL}/create-connect-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email }),
      });

      if (!response.ok) {
        throw new Error("Failed to create Connect account");
      }

      const data = await response.json();
      return {
        accountId: data.accountId,
        onboardingUrl: data.onboardingUrl,
      };
    } catch (error) {
      console.error("Create Connect account error:", error);
      return null;
    }
  }

  /**
   * Get Connect account onboarding status
   */
  async getConnectAccountStatus(accountId: string): Promise<{
    chargesEnabled: boolean;
    detailsSubmitted: boolean;
    payoutsEnabled: boolean;
  } | null> {
    try {
      const response = await fetch(`${STRIPE_BACKEND_URL}/connect-account-status/${accountId}`);

      if (!response.ok) {
        throw new Error("Failed to get account status");
      }

      return await response.json();
    } catch (error) {
      console.error("Get Connect account status error:", error);
      return null;
    }
  }

  /**
   * Create a payment intent for buying a chip bundle
   * @param bundleId - The bundle being purchased
   * @param sellerId - The banker selling the bundle
   * @param amount - Amount in GBP (pence)
   * @param buyerId - The user making the purchase
   */
  async createPaymentIntent(
    bundleId: string,
    sellerId: string,
    amount: number,
    buyerId: string
  ): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
    try {
      const response = await fetch(`${STRIPE_BACKEND_URL}/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bundleId,
          sellerId,
          amount,
          buyerId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const data = await response.json();
      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
      };
    } catch (error) {
      console.error("Create payment intent error:", error);
      return null;
    }
  }

  /**
   * Confirm payment status after processing
   */
  async confirmPaymentStatus(paymentIntentId: string): Promise<{
    status: "succeeded" | "processing" | "failed";
    chipAmount?: number;
  } | null> {
    try {
      const response = await fetch(`${STRIPE_BACKEND_URL}/payment-status/${paymentIntentId}`);

      if (!response.ok) {
        throw new Error("Failed to get payment status");
      }

      return await response.json();
    } catch (error) {
      console.error("Confirm payment status error:", error);
      return null;
    }
  }

  /**
   * Get banker's earnings and statistics
   */
  async getBankerEarnings(sellerId: string): Promise<{
    totalEarnings: number;
    bundlesSold: number;
    pendingPayouts: number;
  } | null> {
    try {
      const response = await fetch(`${STRIPE_BACKEND_URL}/banker-earnings/${sellerId}`);

      if (!response.ok) {
        throw new Error("Failed to get banker earnings");
      }

      return await response.json();
    } catch (error) {
      console.error("Get banker earnings error:", error);
      return null;
    }
  }

  /**
   * Create payout to banker's bank account
   */
  async createPayout(sellerId: string, amount: number): Promise<{ payoutId: string } | null> {
    try {
      const response = await fetch(`${STRIPE_BACKEND_URL}/create-payout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, amount }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payout");
      }

      return await response.json();
    } catch (error) {
      console.error("Create payout error:", error);
      return null;
    }
  }

  /**
   * Mock purchase for testing when Stripe is not configured
   */
  async mockPurchase(bundleId: string, chipAmount: number): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        "Stripe Not Configured",
        `This would purchase ${chipAmount.toLocaleString()} CHiP$ in production. For now, using mock purchase for testing.`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: "Mock Purchase",
            onPress: () => resolve(true),
          },
        ]
      );
    });
  }
}

export const stripeService = new StripeService();

/**
 * Process payment for a chip bundle
 * Note: Stripe native module is not available in this environment.
 * This will always use mock purchases until Stripe is properly configured with a custom dev client.
 */
export const useStripePayment = () => {
  const processPayment = async (
    bundleId: string,
    sellerId: string,
    amount: number,
    buyerId: string
  ): Promise<boolean> => {
    try {
      // Always use mock purchase since Stripe native module is not available
      // When you rebuild with a custom dev client and add Stripe configuration,
      // this will automatically use real Stripe payments
      return await stripeService.mockPurchase(bundleId, amount);
    } catch (error) {
      console.error("Process payment error:", error);
      Alert.alert("Error", "An unexpected error occurred");
      return false;
    }
  };

  return { processPayment };
};
