import { useEffect, useState } from "react";
import { useAccounts } from "@iota/dapp-kit";
import { Box } from "@radix-ui/themes";
import LuckyEggGame from "./components/LuckyEggGame";
import Inventory from "./components/Inventory";
import Home from "./components/Home";
import { useNetworkVariable } from "./networkConfig";
import Navbar from "./components/Navbar";


function App() {
  const creatorObject = useNetworkVariable("creatorObjectId" as never);
  const [address] = useAccounts();
  // Track the currently-selected navbar tab so clicking tabs changes main content
  const [currentTab, setCurrentTab] = useState<string>("hatch");

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
        {currentTab === "hatch" && <LuckyEggGame />}
        {currentTab === "inventory" && (
          <Inventory
            nfts={[]}
            onBack={() => setCurrentTab("hatch")}
            userAddress={address?.address ?? "0x0"}
          />
        )}
        {currentTab === "stats" && (
          <Home />
        )}
        {currentTab === "leaderboard" && (
          <div style={{ padding: 32 }}>
            <h2>Leaderboard (placeholder)</h2>
            <p>This view will show the leaderboard — implement as needed.</p>
          </div>
        )}
      </Box>
    </>
  );
}

export default App;
