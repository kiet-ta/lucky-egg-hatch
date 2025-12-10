// src/components/ResultModal.tsx
import "./ResultModal.css";

interface NFT {
  tokenId: string;
  rarity: "Common" | "Rare" | "Epic";
  image: string;
  name: string;
}

interface ResultModalProps {
  nft: NFT;
  onClose: () => void;
}

export default function ResultModal({ nft, onClose }: ResultModalProps) {
  const rarityColor: Record<string, string> = {
    Common: "#9e9e9e",
    Rare: "#2a7de1",
    Epic: "#8e44ad",
  };

  const rarityEmoji: Record<string, string> = {
    Common: "⭐",
    Rare: "✨",
    Epic: "🌟",
  };

  return (
    <div className="result-modal-overlay">
      <div className="result-modal">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="result-header">
          <h2 className="result-title">🎉 Congratulations! 🎉</h2>
          <p className="result-subtitle">You hatched a new NFT!</p>
        </div>

        <div className="result-content">
          <div
            className="nft-card"
            style={{
              borderColor: rarityColor[nft.rarity],
              boxShadow: `0 0 20px ${rarityColor[nft.rarity]}40`,
            }}
          >
            <div className="nft-image">{nft.image}</div>
            <div className="nft-info">
              <h3 className="nft-name">{nft.name}</h3>
              <div className="rarity-badge-circle" style={{ background: rarityColor[nft.rarity] }}>
                <span className="rarity-emoji">{rarityEmoji[nft.rarity]}</span>
                <span className="rarity-text">{nft.rarity}</span>
              </div>
              <p className="token-id">Token ID: {nft.tokenId}</p>
            </div>
          </div>

          <div className="rarity-stats">
            <div className="stat">
              <span className="stat-icon">📊</span>
              <span className="stat-text">
                {nft.rarity === "Common"
                  ? "70% Rarity"
                  : nft.rarity === "Rare"
                    ? "25% Rarity"
                    : "5% Rarity"}
              </span>
            </div>
            <div className="stat">
              <span className="stat-icon">🔗</span>
              <span className="stat-text">Blockchain Verified</span>
            </div>
          </div>
        </div>

        <div className="result-actions">
          <button className="btn-view-inventory" onClick={onClose}>
            View Inventory
          </button>
          <button className="btn-hatch-again" onClick={onClose}>
            Hatch Another
          </button>
        </div>
      </div>
    </div>
  );
}
