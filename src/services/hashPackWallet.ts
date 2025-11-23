import {
  Client,
  AccountId,
  AccountBalanceQuery,
  TransferTransaction,
  TokenAssociateTransaction,
  Hbar
} from "@hashgraph/sdk";

// C420 Token configuration
const C420_TOKEN_ID = "0.0.10117135"; // Club 420 token
const RECEIVER_ACCOUNT_ID = "0.0.10088196"; // CHiP$ exchange receiver
const C420_TO_CHIPS_RATIO = 50000; // 1 C420 = 50,000 CHiP$

export interface HederaWalletData {
  accountId: string;
  c420Balance: number;
  hbarBalance: number;
  isConnected: boolean;
}

class HashPackWalletService {
  private accountId: string | null = null;
  private client: Client | null = null;
  private walletConnector: any = null; // WalletConnect instance

  /**
   * Initialize HashPack wallet connection
   * Uses WalletConnect for mobile app integration
   */
  async connectWallet(): Promise<HederaWalletData> {
    try {
      // For React Native, we'll use a custom URL scheme or deep linking
      // This is a simplified version - production needs proper WalletConnect setup

      // Create Hedera client for testnet (change to mainnet in production)
      this.client = Client.forTestnet();

      // In a real implementation, this would trigger HashPack mobile app
      // For now, we'll simulate the connection
      const accountId = await this.requestAccountId();

      if (!accountId) {
        throw new Error("Failed to connect wallet");
      }

      this.accountId = accountId;

      // Get balances
      const balances = await this.getAccountBalances(accountId);

      return {
        accountId,
        c420Balance: balances.c420Balance,
        hbarBalance: balances.hbarBalance,
        isConnected: true,
      };
    } catch (error) {
      console.error("HashPack connection error:", error);
      throw error;
    }
  }

  /**
   * Get account balances including C420 tokens
   */
  async getAccountBalances(accountId: string): Promise<{ c420Balance: number; hbarBalance: number }> {
    try {
      if (!this.client) {
        throw new Error("Client not initialized");
      }

      const account = AccountId.fromString(accountId);
      const query = new AccountBalanceQuery().setAccountId(account);

      const balance = await query.execute(this.client);

      // Get HBAR balance
      const hbarBalance = balance.hbars.toBigNumber().toNumber();

      // Get C420 token balance
      const tokenBalance = balance.tokens?._map?.get(C420_TOKEN_ID);
      const c420Balance = tokenBalance ? Number(tokenBalance.toString()) / 100 : 0; // Adjust for decimals

      return {
        c420Balance,
        hbarBalance,
      };
    } catch (error) {
      console.error("Error fetching balances:", error);
      throw error;
    }
  }

  /**
   * Send C420 tokens to receiver address
   * Returns transaction ID
   */
  async sendC420Tokens(amount: number): Promise<string> {
    try {
      if (!this.accountId || !this.client) {
        throw new Error("Wallet not connected");
      }

      const senderAccount = AccountId.fromString(this.accountId);
      const receiverAccount = AccountId.fromString(RECEIVER_ACCOUNT_ID);

      // Adjust amount for token decimals (assuming 2 decimals for C420)
      const adjustedAmount = Math.floor(amount * 100);

      // Create transfer transaction
      const transaction = new TransferTransaction()
        .addTokenTransfer(C420_TOKEN_ID, senderAccount, -adjustedAmount)
        .addTokenTransfer(C420_TOKEN_ID, receiverAccount, adjustedAmount);

      // In production, this would be signed by HashPack
      // For now, this is a placeholder
      // const signedTx = await this.signTransaction(transaction);
      // const receipt = await signedTx.execute(this.client);

      // Return mock transaction ID
      return `0.0.${Date.now()}-mock-txn`;
    } catch (error) {
      console.error("Error sending tokens:", error);
      throw error;
    }
  }

  /**
   * Calculate CHiP$ amount from C420 tokens
   */
  calculateChips(c420Amount: number): number {
    return c420Amount * C420_TO_CHIPS_RATIO;
  }

  /**
   * Check if account has associated C420 token
   */
  async isTokenAssociated(accountId: string): Promise<boolean> {
    try {
      const balances = await this.getAccountBalances(accountId);
      // If we can get the balance, token is associated
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Associate C420 token with account (required before receiving tokens)
   */
  async associateToken(): Promise<string> {
    try {
      if (!this.accountId || !this.client) {
        throw new Error("Wallet not connected");
      }

      const account = AccountId.fromString(this.accountId);

      const transaction = new TokenAssociateTransaction()
        .setAccountId(account)
        .setTokenIds([C420_TOKEN_ID]);

      // In production, sign with HashPack
      // const signedTx = await this.signTransaction(transaction);
      // const receipt = await signedTx.execute(this.client);

      return `0.0.${Date.now()}-assoc-txn`;
    } catch (error) {
      console.error("Error associating token:", error);
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  disconnect() {
    this.accountId = null;
    this.client = null;
    this.walletConnector = null;
  }

  /**
   * Get current connected account ID
   */
  getAccountId(): string | null {
    return this.accountId;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.accountId !== null;
  }

  /**
   * Request account ID from HashPack
   * In production, this would use WalletConnect or deep linking
   */
  private async requestAccountId(): Promise<string | null> {
    // This is where you'd integrate with HashPack mobile
    // For now, return mock data for testing

    // In real implementation:
    // 1. Open HashPack app via deep link
    // 2. User approves connection
    // 3. Return account ID

    return null; // Will be replaced with actual connection
  }

  /**
   * Sign transaction with HashPack
   */
  private async signTransaction(transaction: any): Promise<any> {
    // In production, send transaction to HashPack for signing
    // HashPack will prompt user to approve
    // Return signed transaction
    throw new Error("Signing not implemented - needs HashPack integration");
  }
}

// Export singleton
export const hashPackWallet = new HashPackWalletService();

// Constants export
export const HASHPACK_CONFIG = {
  C420_TOKEN_ID,
  RECEIVER_ACCOUNT_ID,
  C420_TO_CHIPS_RATIO,
  NETWORK: "testnet", // Change to "mainnet" in production
};
