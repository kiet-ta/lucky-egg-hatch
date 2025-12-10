// src/components/LuckyEggGame.tsx
import { useState, useEffect } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@iota/dapp-kit";
import { Transaction} from "@iota/iota-sdk/transactions";
import { useNetworkVariables } from "../networkConfig";
import HatchButton from "./HatchButton";
import EggAnimation from "./EggAnimation";
import ResultModal from "./ResultModal";
import Inventory from "./Inventory";
import "./LuckyEggGame.css";

interface NFT {
  tokenId: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  image: string;
  name: string;
}

interface LuckyEggGameProps {
  inventory: NFT[];
  onInventoryUpdate: (nfts: NFT[]) => void;
  hatchCount: number;
  onHatchCountUpdate: (count: number) => void;
  dailyLimit: number;
}

type GameState = "idle" | "hatching" | "success" | "error" | "inventory";

export default function LuckyEggGame({
  inventory,
  onInventoryUpdate,
  hatchCount,
  onHatchCountUpdate,
  dailyLimit,
}: LuckyEggGameProps) {
  const account = useCurrentAccount();
  const networkVariables = useNetworkVariables();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [gameState, setGameState] = useState<GameState>("idle");
  const [resultNFT, setResultNFT] = useState<NFT | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (account) {
      // TODO: Ở đây nên fetch data thật từ chain để lấy hatchCount của user
      // Hiện tại giữ logic update local tạm thời
      if (hatchCount === 0) {
        onHatchCountUpdate(0);
      }
    }
  }, [account]);

  const handleHatch = async () => {
    if (hatchCount >= dailyLimit) {
      setError("Daily hatch limit reached! Come back tomorrow.");
      setGameState("error");
      return;
    }

    if (!account) {
      setError("Please connect your wallet first.");
      setGameState("error");
      return;
    }

    setLoading(true);
    setGameState("hatching");
    setError(null);

    // call smart contract hatch function
    const txb = new Transaction();
    
    // call func: lucky_egg::hatch(game, random, ctx)
    txb.moveCall({
      target: `${networkVariables.packageId}::lucky_egg::hatch`,
      arguments: [
        txb.object(networkVariables.gameObjectId), // HatchGame Object
        txb.object(networkVariables.randomObjectId), // Random Object (0x8)
      ],
    });

    signAndExecuteTransaction(
      {
        transaction: txb,
      },
      {
        onSuccess: (result) => {
          console.log("Hatch Success:", result);
          
          // Sau khi hatch thành công, lẽ ra cần parse Event để biết ra con gì.
          // Để đơn giản hóa UI lúc này, ta sẽ hiển thị thông báo thành công trước.
          // (Nâng cao: Dùng iotaClient.queryEvents để lấy kết quả Rarity thật)

          // Tạm thời hiển thị kết quả giả lập ở Client để UI mượt mà, 
          // nhưng giao dịch on-chain là THẬT.
          const tempRarity = "Unknown (Check Wallet)"; 
          
          const newNFT: NFT = {
            tokenId: result.digest.slice(0, 10), // Dùng Transaction Digest làm ID tạm
            rarity: "Common", // Placeholder, user cần check wallet
            image: "🥚",
            name: `Hatched Egg (Processing)`,
          };

          setResultNFT(newNFT);
          onInventoryUpdate([...inventory, newNFT]);
          onHatchCountUpdate(hatchCount + 1);
          setGameState("success");
          setLoading(false);
        },
        onError: (err) => {
          console.error("Hatch Failed:", err);
          setError("Transaction failed or rejected. Please try again.");
          setGameState("error");
          setLoading(false);
        },
      }
    );
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
        userAddress={account?.address || ""}
      />
    );
  }

  return (
    <div className="egg-game-container">
      <div className="egg-game-header">
        <h1 className="egg-game-title">🥚 Lucky Egg Hatch 🥚</h1>
        <p className="egg-game-subtitle">Hatch magical eggs on IOTA EVM!</p>
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
            {account?.address
              ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
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
        <p>Transaction required. Ensure you have IOTA tokens for gas.</p>
        <p className="footer-small">
          Rarity: Common • Rare • Epic • Legendary
        </p>
      </div>
    </div>
  );
}