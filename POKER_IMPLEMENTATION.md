# Socket.IO Poker Implementation Guide

## Overview

The Club 420 Poker app now has a **fully functional Socket.IO poker game client** that can connect to a real-time poker server. The implementation includes:

- ✅ Complete poker hand evaluation logic
- ✅ Socket.IO client service for real-time gameplay
- ✅ Full poker game UI with player actions
- ✅ Card rendering and hand display
- ✅ Real-time game state updates

## What's Implemented (Client-Side)

### 1. Poker Logic (`src/utils/pokerLogic.ts`)
- **Hand evaluation**: All poker hands from High Card to Royal Flush
- **Best hand calculator**: Evaluates best 5-card hand from 7 cards (2 hole + 5 community)
- **Deck management**: Create and shuffle 52-card deck
- **Hand comparison**: Compare hands to determine winners

### 2. Socket.IO Service (`src/services/pokerSocket.ts`)
- **Connection management**: Connect/disconnect from poker server
- **Event listeners**: All poker game events (cards dealt, betting actions, pot won, etc.)
- **Player actions**: Fold, check, call, raise, all-in
- **Table management**: Join/leave tables, sit down at positions

### 3. Poker Game Screen (`src/screens/PokerGameScreen.tsx`)
- **Full game UI**: Community cards, player cards, pot display
- **Real-time updates**: Game state, player actions, turn indicators
- **Action buttons**: Fold, Check, Call, Raise, All-In
- **Hand evaluation**: Shows your current hand rank
- **Player list**: All players with chip stacks and statuses

### 4. Navigation Integration
- Poker game opens as full-screen modal from Lobby
- Join table → Navigate to PokerGameScreen
- Leave table → Return to Lobby

## What's Missing (Server-Side)

You need to build a **Node.js/Express + Socket.IO server** to handle:

### Required Server Features

1. **Table Management**
   - Create/delete tables
   - Player join/leave
   - Seat assignments

2. **Game Logic**
   - Deal cards (hole cards + community cards)
   - Manage betting rounds (pre-flop, flop, turn, river)
   - Pot calculation
   - Side pots for all-in scenarios
   - Hand showdown and winner determination

3. **Player Actions**
   - Validate player actions (can they check/call/raise?)
   - Update game state on each action
   - Move to next player
   - Handle timeouts

4. **Chip Management**
   - Deduct chips on bets
   - Award chips to winners
   - Handle rake (0-4.2%)

5. **Authentication**
   - Validate user tokens
   - Check CHiP$ balance before buy-in
   - Update user balances after games

## Server Implementation Example

### Basic Server Structure

```javascript
// server.js
const express = require('express');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store active tables
const activeTables = new Map();

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Join table
  socket.on('join_table', async ({ tableId, buyIn }) => {
    // Validate user has enough CHiP$
    // Create/join table
    // Emit table_update to all players
  });

  // Player actions
  socket.on('fold', ({ tableId }) => {
    // Handle fold action
    // Update game state
    // Move to next player
  });

  socket.on('check', ({ tableId }) => {
    // Handle check
  });

  socket.on('call', ({ tableId }) => {
    // Handle call
  });

  socket.on('raise', ({ tableId, amount }) => {
    // Handle raise
  });

  socket.on('all_in', ({ tableId }) => {
    // Handle all-in
  });

  socket.on('disconnect', () => {
    // Remove player from tables
  });
});

server.listen(3000, () => {
  console.log('Poker server running on port 3000');
});
```

### Game State Management

```javascript
class PokerGame {
  constructor(tableId, config) {
    this.tableId = tableId;
    this.players = [];
    this.deck = [];
    this.communityCards = [];
    this.pot = 0;
    this.currentBet = 0;
    this.currentPlayerIndex = 0;
    this.round = 'preflop'; // preflop, flop, turn, river, showdown
    this.dealerIndex = 0;
  }

  startGame() {
    this.deck = this.shuffleDeck(this.createDeck());
    this.dealHoleCards();
    this.startBettingRound();
  }

  dealHoleCards() {
    this.players.forEach(player => {
      player.holeCards = [this.deck.pop(), this.deck.pop()];
    });
  }

  dealFlop() {
    this.deck.pop(); // Burn card
    this.communityCards.push(this.deck.pop(), this.deck.pop(), this.deck.pop());
    this.round = 'flop';
  }

  dealTurn() {
    this.deck.pop(); // Burn card
    this.communityCards.push(this.deck.pop());
    this.round = 'turn';
  }

  dealRiver() {
    this.deck.pop(); // Burn card
    this.communityCards.push(this.deck.pop());
    this.round = 'river';
  }

  handleFold(playerId) {
    const player = this.players.find(p => p.id === playerId);
    player.status = 'folded';
    this.nextPlayer();
  }

  handleCall(playerId) {
    const player = this.players.find(p => p.id === playerId);
    const callAmount = this.currentBet - player.currentBet;
    player.chipStack -= callAmount;
    player.currentBet = this.currentBet;
    this.pot += callAmount;
    this.nextPlayer();
  }

  handleRaise(playerId, amount) {
    const player = this.players.find(p => p.id === playerId);
    player.chipStack -= amount;
    player.currentBet += amount;
    this.currentBet = player.currentBet;
    this.pot += amount;
    this.nextPlayer();
  }

  nextPlayer() {
    // Find next active player
    // If round complete, deal next cards
    // If all players acted, move to showdown
  }

  determineWinner() {
    // Evaluate all hands
    // Award pot to winner(s)
    // Handle side pots
  }
}
```

## Environment Variables

Add to your `.env` file:

```bash
# Poker Server URL
EXPO_PUBLIC_POKER_SERVER_URL=http://your-server-url:3000

# Or for local development:
# EXPO_PUBLIC_POKER_SERVER_URL=http://localhost:3000
```

## Socket.IO Events Reference

### Client → Server

| Event | Data | Description |
|-------|------|-------------|
| `join_table` | `{ tableId, buyIn }` | Join a poker table |
| `leave_table` | `{ tableId }` | Leave a table |
| `sit_down` | `{ tableId, position }` | Sit at specific position |
| `start_game` | `{ tableId }` | Start game (host only) |
| `fold` | `{ tableId }` | Fold hand |
| `check` | `{ tableId }` | Check (no bet) |
| `call` | `{ tableId }` | Match current bet |
| `raise` | `{ tableId, amount }` | Raise bet |
| `all_in` | `{ tableId }` | Bet all chips |

### Server → Client

| Event | Data | Description |
|-------|------|-------------|
| `table_update` | `PokerTable` | Table info updated |
| `game_state_update` | `GameState` | Game state changed |
| `player_joined` | `TablePlayer` | New player joined |
| `player_left` | `playerId` | Player left table |
| `cards_dealt` | `{ holeCards, communityCards }` | Cards dealt to player |
| `betting_action` | `{ playerId, action, amount }` | Player made action |
| `pot_won` | `{ winnerId, amount, hand }` | Hand won |
| `showdown` | `{ players }` | Showdown results |
| `your_turn` | `{ currentBet, minRaise, maxRaise }` | Your turn to act |
| `error` | `{ message }` | Error occurred |

## Testing Without Server

For testing the UI without a server:

1. The app will show "Connecting to table..." screen
2. You can modify `pokerSocket.ts` to add mock responses:

```typescript
// For testing, add mock game state
setTimeout(() => {
  const mockGameState = {
    tableId: "test",
    pot: 1000,
    communityCards: [],
    currentBet: 0,
    currentPlayerTurn: 0,
    round: "preflop",
    players: [...]
  };
  // Emit mock events
}, 1000);
```

## Next Steps

1. **Build the Socket.IO server** (Node.js + Express + Socket.IO)
2. **Deploy the server** (Heroku, Railway, AWS, etc.)
3. **Update EXPO_PUBLIC_POKER_SERVER_URL** in your app
4. **Test real gameplay** with multiple clients

## Production Considerations

- **Authentication**: Validate JWT tokens on socket connection
- **Chip verification**: Check user has CHiP$ before buy-in
- **Anti-cheat**: Server-side validation of all actions
- **Timeouts**: Auto-fold if player doesn't act in time
- **Reconnection**: Handle player disconnects gracefully
- **Rake collection**: Deduct rake from pot before awarding
- **Database**: Store game history for statistics
- **Scaling**: Use Redis for multi-server Socket.IO
