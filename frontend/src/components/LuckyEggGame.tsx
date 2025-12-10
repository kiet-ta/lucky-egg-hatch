// src/components/LuckyEggGame.tsx
import { useState, useEffect } from "react";
import { useAccounts } from "@iota/dapp-kit";
import HatchButton from "./HatchButton";
import EggAnimation from "./EggAnimation";
import ResultModal from "./ResultModal";
import Inventory from "./Inventory";
import "./LuckyEggGame.css";

interface NFT {
  tokenId: string;
  rarity: "Common" | "Rare" | "Epic";
  image: string;
  name: string;
}

interface LuckyEggGameProps {
  inventory: NFT[];
  onInventoryUpdate: (nfts: NFT[]) => void;
}

type GameState = "idle" | "hatching" | "success" | "error" | "inventory";

export default function LuckyEggGame({
  inventory,
  onInventoryUpdate,
}: LuckyEggGameProps) {
  const [address] = useAccounts();
  const [gameState, setGameState] = useState<GameState>("idle");
  const [hatchCount, setHatchCount] = useState(0);
  const [dailyLimit] = useState(5);
  const [resultNFT, setResultNFT] = useState<NFT | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      checkDailyHatchCount();
    }
  }, [address]);

  const checkDailyHatchCount = async () => {
    setHatchCount(2);
  };

  const handleHatch = async () => {
    if (hatchCount >= dailyLimit) {
      setError("Daily hatch limit reached! Come back tomorrow.");
      setGameState("error");
      return;
    }

    if (!address) {
      setError("Please connect your wallet first.");
      setGameState("error");
      return;
    }

    setLoading(true);
    setGameState("hatching");
    setError(null);

    try {
      await simulateHatchTransaction();

      const weights = [70, 25, 5];
      const random = Math.random() * 100;
      let selectedRarity: "Common" | "Rare" | "Epic" = "Common";

      if (random < weights[0]) {
        selectedRarity = "Common";
      } else if (random < weights[0] + weights[1]) {
        selectedRarity = "Rare";
      } else {
        selectedRarity = "Epic";
      }

      const newNFT: NFT = {
        tokenId: Math.random().toString(36).substr(2, 9),
        rarity: selectedRarity,
        image: getEggEmoji(selectedRarity),
        name: `${selectedRarity} Egg #${Math.floor(Math.random() * 10000)}`,
      };

      setResultNFT(newNFT);
      const updatedInventory = [...inventory, newNFT];
      onInventoryUpdate(updatedInventory);
      setHatchCount(hatchCount + 1);
      setGameState("success");
    } catch {
      setError("Hatching failed! Please try again.");
      setGameState("error");
    } finally {
      setLoading(false);
    }
  };

  const simulateHatchTransaction = () => {
    return new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });
  };

  const getEggEmoji = (rarity: string) => {
    const emojiMap: Record<string, string> = {
      Common: "🥚",
      Rare: "🦅",
      Epic: "🐉",
    };
    return emojiMap[rarity] || "🥚";
  };

  const handleCloseResult = () => {
    setGameState("idle");
    setResultNFT(null);
  };

  const handleShowInventory = () => {
    setGameState("inventory");
  };

  const handleBackToGame = () => {
    setGameState("idle");
  };

  if (gameState === "inventory") {
    return (
      <Inventory
        nfts={inventory}
        onBack={handleBackToGame}
        userAddress={address?.address || ""}
      />
    );
  }

  return (
    <div className="egg-game-container">
      <div className="egg-game-header">
        <h1 className="egg-game-title">🥚 Lucky Egg Hatch 🥚</h1>
        <p className="egg-game-subtitle">Hatch magical eggs and collect NFTs!</p>
      </div>

      <div className="egg-game-stats">
        <div className="stat-card">
          <span className="stat-label">Daily Hatches</span>
          <span className="stat-value">
            {hatchCount} / {dailyLimit}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total NFTs</span>
          <span className="stat-value">{inventory.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Wallet</span>
          <span className="stat-value">
            {address?.address
              ? `${address.address.slice(0, 6)}...${address.address.slice(-4)}`
              : "Not Connected"}
          </span>
        </div>
      </div>

      <div className="egg-game-main">
        {gameState === "hatching" && <EggAnimation />}

        {(gameState === "idle" || gameState === "error") && (
          <>
            <div className="egg-display">
              <div className="egg-icon">🥚</div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="game-actions">
              <HatchButton
                onClick={handleHatch}
                loading={loading}
                disabled={hatchCount >= dailyLimit}
              />
              <button
                className="btn-inventory"
                onClick={handleShowInventory}
                disabled={inventory.length === 0}
              >
                📦 View Inventory ({inventory.length})
              </button>
            </div>
          </>
        )}

        {gameState === "success" && resultNFT && (
          <ResultModal nft={resultNFT} onClose={handleCloseResult} />
        )}
      </div>

      <div className="egg-game-footer">
        <p>🔄 Come back daily to hatch more eggs and collect rare NFTs!</p>
        <p className="footer-small">
          Rarity: 70% Common • 25% Rare • 5% Epic
        </p>
      </div>
    </div>
  );
}
