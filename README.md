# Club 420 Poker App

A fully functional poker application built with React Native and Expo, featuring multiple login methods, in-app CHiP$ currency, banker marketplace system, and poker table management.

## Features

### Authentication System
- **Telegram Login**: Quick login using Telegram credentials with automatic avatar sync
- **Email Sign Up**: Traditional email registration with verification code system
- **C420 Token Login**: Exclusive login for C420 token holders on Hedera blockchain
  - Token ID: 0.0.10117135
  - Exchange rate: 1 C420 = 50,000 CHiP$
  - Instant OG Banker status with 1% lifetime fee

### Currency System
- **CHiP$**: In-app currency for all poker activities
- Minimum transaction: 1 CHiP$
- Send CHiP$ to other users via Profile screen
- Transaction history tracking with P&L calculations

### Marketplace
- Default landing tab after login
- Browse CHiP$ bundles listed by bankers
- Purchase options:
  - Card payment (instant)
  - OTC offers (peer-to-peer negotiation)
- View seller details and bundle rates
- Real-time bundle availability

### Profile Tab
- View and manage user profile
- Display CHiP$ balance
- Send CHiP$ to other users
- View statistics:
  - Total games played
  - Total wins/losses
  - Profit/Loss tracking
- Transaction history
- Banker status and fee rate display

### Lobby Tab
- View all active poker tables
- Filter by status:
  - Waiting for players
  - Games in progress
- Table information:
  - Current players / Max players
  - Blinds (Small/Big)
  - Buy-in amount
  - Pot rake percentage
  - Scheduled start time
- Join tables (if sufficient CHiP$ balance)
- Spectate ongoing games

### Host a Table Tab
- Create custom poker tables with parameters:
  - Table name
  - Max players: 2-10
  - Small/Big blinds (min 1 CHiP$)
  - Buy-in amount
  - Pot rake: 0-4.2%
  - Scheduled start date/time
- Share table link via social media or direct message
- Automatic table listing in Lobby

### Banker Tab
Two different views based on banker status:

#### Non-Banker View
- Explains banker requirements and benefits
- Shows progress toward 10,000 CHiP$ requirement
- Display current CHiP$ balance
- Information about OG Banker status via C420 tokens

#### Banker View (requires 10,000+ CHiP$ or C420 token exchange)
- Create CHiP$ bundles for sale
- Set custom pricing in GBP
- Choose payment methods:
  - Accept card payments
  - Accept OTC offers with optional Telegram handle
- View all active bundles
- Cancel bundles (returns CHiP$ to balance)
- Stripe integration for receiving payments
- Fee structure:
  - OG Bankers: 1% lifetime fee
  - Regular Bankers: 4.2% lifetime fee

## Banker System

### How to Become a Banker
1. **Regular Banker**: Accumulate 10,000 CHiP$ through gameplay or purchases
   - 4.2% fee on all bundle sales
2. **OG Banker**: Exchange C420 tokens (Token ID: 0.0.10117135 on Hedera)
   - Send C420 to: 0.0.10088196-oxyln
   - 1% fee on all bundle sales
   - Instant banker access

### Banker Benefits
- List CHiP$ bundles in the marketplace
- Set custom prices and rates
- Choose payment methods (card/OTC)
- Integrated Stripe payouts
- Bundle management and tracking

## State Management

### Auth Store (Persisted)
- User authentication state
- User profile data
- CHiP$ balance
- Banker status
- Login methods

### App Store (Non-Persisted)
- Active poker tables
- CHiP$ bundles marketplace
- Transaction history
- Table join/leave management

## Important Notes

### RMT Warning
The app displays warnings that Real Money Trading (RMT) with CHiP$ is against Terms of Service. While the app cannot detect or prevent it, users are advised against engaging in RMT activities.

### C420 Token Integration
- One-time C420 token exchange for CHiP$
- No C420 tokens are handled within the app after initial exchange
- All C420 sent to 0.0.10088196-oxyln is external to the app
- OG Banker status is permanent once obtained

### Payment Flow
- Card payments process instantly via Stripe integration
- OTC offers allow buyer-seller negotiation
- CHiP$ are held in escrow when bundles are created
- Bundles can be cancelled to return CHiP$ to banker

## Tech Stack
- React Native 0.76.7
- Expo SDK 53
- Zustand (state management)
- React Navigation (tabs & stack navigation)
- Nativewind (styling)
- Expo Linear Gradient
- Expo Haptics
- Expo Clipboard
- AsyncStorage (persistence)

## File Structure
```
src/
├── navigation/
│   └── RootNavigator.tsx      # Main navigation with auth flow
├── screens/
│   ├── LandingScreen.tsx      # Authentication screen (3 login methods)
│   ├── MarketplaceScreen.tsx  # CHiP$ bundles marketplace
│   ├── ProfileScreen.tsx      # User profile & stats
│   ├── LobbyScreen.tsx        # Poker tables lobby
│   ├── HostTableScreen.tsx    # Create poker tables
│   └── BankerScreen.tsx       # Banker bundle management
├── state/
│   ├── authStore.ts           # User authentication & balance
│   └── appStore.ts            # Tables, bundles, transactions
└── types/
    └── poker.ts               # TypeScript type definitions
```

## Design Philosophy
- Clean, modern mobile-first design
- Dark theme with emerald accent colors
- Smooth haptic feedback
- Intuitive navigation with bottom tabs
- Clear visual hierarchy
- Banker status badges (gold for OG, green for regular)

## Future Enhancements
- Real-time poker gameplay implementation
- WebSocket integration for live table updates
- Push notifications for table starts
- Enhanced statistics and leaderboards
- Social features and friend lists
- Tournament mode
- Chat functionality
