import { Card } from "../types/poker";

// Poker hand rankings
export enum HandRank {
  HIGH_CARD = 0,
  PAIR = 1,
  TWO_PAIR = 2,
  THREE_OF_A_KIND = 3,
  STRAIGHT = 4,
  FLUSH = 5,
  FULL_HOUSE = 6,
  FOUR_OF_A_KIND = 7,
  STRAIGHT_FLUSH = 8,
  ROYAL_FLUSH = 9,
}

export interface HandEvaluation {
  rank: HandRank;
  rankName: string;
  value: number;
  cards: Card[];
}

const RANK_VALUES: { [key: string]: number } = {
  "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
  J: 11, Q: 12, K: 13, A: 14,
};

const SUIT_VALUES: { [key: string]: number } = {
  hearts: 0, diamonds: 1, clubs: 2, spades: 3,
};

// Convert card to numeric value for comparison
function cardValue(card: Card): number {
  return RANK_VALUES[card.rank] * 4 + SUIT_VALUES[card.suit];
}

// Get all 5-card combinations from 7 cards
function getCombinations(cards: Card[], k: number): Card[][] {
  const result: Card[][] = [];

  function combine(start: number, chosen: Card[]) {
    if (chosen.length === k) {
      result.push([...chosen]);
      return;
    }

    for (let i = start; i < cards.length; i++) {
      chosen.push(cards[i]);
      combine(i + 1, chosen);
      chosen.pop();
    }
  }

  combine(0, []);
  return result;
}

// Check for flush
function isFlush(cards: Card[]): boolean {
  const suit = cards[0].suit;
  return cards.every(card => card.suit === suit);
}

// Check for straight
function isStraight(cards: Card[]): boolean {
  const values = cards.map(c => RANK_VALUES[c.rank]).sort((a, b) => a - b);

  // Check regular straight
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i + 1] - values[i] !== 1) {
      // Check for A-2-3-4-5 straight (wheel)
      if (values[0] === 2 && values[4] === 14) {
        return values[1] === 3 && values[2] === 4 && values[3] === 5;
      }
      return false;
    }
  }
  return true;
}

// Count rank frequencies
function getRankCounts(cards: Card[]): Map<string, number> {
  const counts = new Map<string, number>();
  cards.forEach(card => {
    counts.set(card.rank, (counts.get(card.rank) || 0) + 1);
  });
  return counts;
}

// Evaluate a 5-card hand
function evaluateHand(cards: Card[]): HandEvaluation {
  if (cards.length !== 5) {
    throw new Error("Hand must contain exactly 5 cards");
  }

  const ranks = cards.map(c => RANK_VALUES[c.rank]).sort((a, b) => b - a);
  const isFlushHand = isFlush(cards);
  const isStraightHand = isStraight(cards);
  const rankCounts = getRankCounts(cards);
  const counts = Array.from(rankCounts.values()).sort((a, b) => b - a);

  // Royal Flush
  if (isFlushHand && isStraightHand && ranks[0] === 14 && ranks[4] === 10) {
    return {
      rank: HandRank.ROYAL_FLUSH,
      rankName: "Royal Flush",
      value: 9000000 + ranks[0],
      cards,
    };
  }

  // Straight Flush
  if (isFlushHand && isStraightHand) {
    return {
      rank: HandRank.STRAIGHT_FLUSH,
      rankName: "Straight Flush",
      value: 8000000 + ranks[0],
      cards,
    };
  }

  // Four of a Kind
  if (counts[0] === 4) {
    return {
      rank: HandRank.FOUR_OF_A_KIND,
      rankName: "Four of a Kind",
      value: 7000000 + ranks[0] * 100 + ranks[4],
      cards,
    };
  }

  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    return {
      rank: HandRank.FULL_HOUSE,
      rankName: "Full House",
      value: 6000000 + ranks[0] * 100 + ranks[3],
      cards,
    };
  }

  // Flush
  if (isFlushHand) {
    return {
      rank: HandRank.FLUSH,
      rankName: "Flush",
      value: 5000000 + ranks[0] * 10000 + ranks[1] * 100 + ranks[2],
      cards,
    };
  }

  // Straight
  if (isStraightHand) {
    return {
      rank: HandRank.STRAIGHT,
      rankName: "Straight",
      value: 4000000 + ranks[0],
      cards,
    };
  }

  // Three of a Kind
  if (counts[0] === 3) {
    return {
      rank: HandRank.THREE_OF_A_KIND,
      rankName: "Three of a Kind",
      value: 3000000 + ranks[0] * 10000 + ranks[3] * 100 + ranks[4],
      cards,
    };
  }

  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    return {
      rank: HandRank.TWO_PAIR,
      rankName: "Two Pair",
      value: 2000000 + ranks[0] * 10000 + ranks[2] * 100 + ranks[4],
      cards,
    };
  }

  // One Pair
  if (counts[0] === 2) {
    return {
      rank: HandRank.PAIR,
      rankName: "Pair",
      value: 1000000 + ranks[0] * 10000 + ranks[2] * 100 + ranks[3] * 10 + ranks[4],
      cards,
    };
  }

  // High Card
  return {
    rank: HandRank.HIGH_CARD,
    rankName: "High Card",
    value: ranks[0] * 10000 + ranks[1] * 1000 + ranks[2] * 100 + ranks[3] * 10 + ranks[4],
    cards,
  };
}

// Evaluate best hand from 7 cards (2 hole + 5 community)
export function evaluateBestHand(holeCards: Card[], communityCards: Card[]): HandEvaluation {
  const allCards = [...holeCards, ...communityCards];

  if (allCards.length < 5) {
    throw new Error("Need at least 5 cards to evaluate hand");
  }

  // Get all 5-card combinations
  const combinations = getCombinations(allCards, 5);

  // Evaluate each combination
  let bestHand: HandEvaluation | null = null;

  for (const combo of combinations) {
    const evaluation = evaluateHand(combo);
    if (!bestHand || evaluation.value > bestHand.value) {
      bestHand = evaluation;
    }
  }

  return bestHand!;
}

// Create a standard 52-card deck
export function createDeck(): Card[] {
  const suits: Card["suit"][] = ["hearts", "diamonds", "clubs", "spades"];
  const ranks: Card["rank"][] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

// Shuffle deck using Fisher-Yates algorithm
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Compare two hands
export function compareHands(hand1: HandEvaluation, hand2: HandEvaluation): number {
  return hand1.value - hand2.value;
}
