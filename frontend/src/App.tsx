import { useEffect, useState } from "react";
import { useAccounts } from "@iota/dapp-kit";
import { Box } from "@radix-ui/themes";
import LuckyEggGame from "./components/LuckyEggGame";
import Inventory from "./components/Inventory";
import Home from "./components/Home";
import { useNetworkVariable } from "./networkConfig";
import Navbar from "./components/Navbar";


interface NFT {
  tokenId: string;
  rarity: "Common" | "Rare" | "Epic";
  image: string;
  name: string;
}

function App() {
  const creatorObject = useNetworkVariable("gameObjectId");
  const [address] = useAccounts();
  // Track the currently-selected navbar tab so clicking tabs changes main content
  const [currentTab, setCurrentTab] = useState<string>("hatch");
  // Shared inventory state across all tabs
  const [inventory, setInventory] = useState<NFT[]>([]);
  // Shared hatch count and daily limit across all tabs
  const [hatchCount, setHatchCount] = useState(0);
  const [dailyLimit] = useState(100);

  useEffect(() => {
    if (!address) return; // tránh lỗi khi chưa có address

    const body = {
      jsonrpc: "2.0",
      id: 1,
      method: "iota_getObject",
      params: [creatorObject, { showContent: true }],
    };

    fetch("https://indexer.devnet.iota.cafe/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .catch((err) => {
        console.error("Error checking creator:", err);
      });
  }, [address, creatorObject]);

  return (
    <>
      {/* Navbar luôn hiển thị ở trên cùng */}
      <Navbar onNavigate={(tab: string) => setCurrentTab(tab)} />

      {/* Nội dung chính của dApp - render based on selected tab */}
      <Box>
        {currentTab === "hatch" && (
          <LuckyEggGame
            inventory={inventory}
            onInventoryUpdate={setInventory}
            hatchCount={hatchCount}
            onHatchCountUpdate={setHatchCount}
            dailyLimit={dailyLimit}
          />
        )}
        {currentTab === "inventory" && (
          <Inventory
            nfts={inventory}
            onBack={() => setCurrentTab("hatch")}
            userAddress={address?.address ?? "0x0"}
          />
        )}
        {currentTab === "leaderboard" && (
          <div style={{ padding: 32 }}>
            <h2>Leaderboard (Update later...)</h2>
          </div>
        )}
      </Box>
    </>
  );
}

export default App;
