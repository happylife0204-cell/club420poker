import { useEffect } from "react";
import { useAppStore } from "../state/appStore";
import { ChipBundle, PokerTable } from "../types/poker";

export function useMockData() {
  const addBundle = useAppStore((s) => s.addBundle);
  const addTable = useAppStore((s) => s.addTable);

  useEffect(() => {
    // Add mock bundles
    const mockBundles: ChipBundle[] = [
      {
        id: "bundle_1",
        sellerId: "mock_seller_1",
        sellerUsername: "PokerPro",
        chipAmount: 50000,
        priceGBP: 40,
        acceptsCardPayment: true,
        acceptsOTCOffers: true,
        sellerTelegram: "pokerpro420",
        createdAt: new Date().toISOString(),
        status: "active",
      },
      {
        id: "bundle_2",
        sellerId: "mock_seller_2",
        sellerUsername: "ChipMaster",
        chipAmount: 100000,
        priceGBP: 75,
        acceptsCardPayment: true,
        acceptsOTCOffers: false,
        createdAt: new Date().toISOString(),
        status: "active",
      },
      {
        id: "bundle_3",
        sellerId: "mock_seller_3",
        sellerUsername: "OGBanker",
        chipAmount: 250000,
        priceGBP: 180,
        acceptsCardPayment: true,
        acceptsOTCOffers: true,
        sellerTelegram: "ogbanker",
        createdAt: new Date().toISOString(),
        status: "active",
      },
    ];

    // Add mock tables
    const futureTime = new Date();
    futureTime.setHours(futureTime.getHours() + 2);

    const mockTables: PokerTable[] = [
      {
        id: "table_1",
        hostId: "mock_host_1",
        hostUsername: "TableMaster",
        name: "Friday Night Poker",
        maxPlayers: 6,
        currentPlayers: 3,
        smallBlind: 10,
        bigBlind: 20,
        buyIn: 1000,
        potRake: 0.02,
        scheduledStartTime: futureTime.toISOString(),
        status: "waiting",
        shareableLink: "club420poker://join/table_1",
        players: [
          {
            userId: "player_1",
            username: "Player1",
            chipStack: 1000,
            position: 0,
            status: "active",
          },
          {
            userId: "player_2",
            username: "Player2",
            chipStack: 1000,
            position: 1,
            status: "active",
          },
          {
            userId: "player_3",
            username: "Player3",
            chipStack: 1000,
            position: 2,
            status: "active",
          },
        ],
      },
      {
        id: "table_2",
        hostId: "mock_host_2",
        hostUsername: "HighRoller",
        name: "High Stakes Table",
        maxPlayers: 8,
        currentPlayers: 5,
        smallBlind: 50,
        bigBlind: 100,
        buyIn: 5000,
        potRake: 0.03,
        scheduledStartTime: new Date().toISOString(),
        status: "in_progress",
        shareableLink: "club420poker://join/table_2",
        players: [
          {
            userId: "player_4",
            username: "HighRoller1",
            chipStack: 7500,
            position: 0,
            status: "active",
          },
          {
            userId: "player_5",
            username: "HighRoller2",
            chipStack: 4200,
            position: 1,
            status: "active",
          },
          {
            userId: "player_6",
            username: "HighRoller3",
            chipStack: 6800,
            position: 2,
            status: "active",
          },
          {
            userId: "player_7",
            username: "HighRoller4",
            chipStack: 3500,
            position: 3,
            status: "active",
          },
          {
            userId: "player_8",
            username: "HighRoller5",
            chipStack: 5100,
            position: 4,
            status: "active",
          },
        ],
      },
    ];

    // Initialize mock data only if stores are empty
    const currentBundles = useAppStore.getState().chipBundles;
    const currentTables = useAppStore.getState().activeTables;

    if (currentBundles.length === 0) {
      mockBundles.forEach((bundle) => addBundle(bundle));
    }

    if (currentTables.length === 0) {
      mockTables.forEach((table) => addTable(table));
    }
  }, []);
}
