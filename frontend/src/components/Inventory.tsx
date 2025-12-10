// src/components/Inventory.tsx
import { useState } from "react";
import "./Inventory.css";

interface NFT {
  tokenId: string;
  rarity: "Common" | "Rare" | "Epic";
  image: string;
  name: string;
}

interface InventoryProps {
  nfts: NFT[];
  onBack: () => void;
  userAddress: string;
}

export default function Inventory({
  nfts,
  onBack,
  userAddress,
}: InventoryProps) {
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

  const commonCount = nfts.filter((nft) => nft.rarity === "Common").length;
  const rareCount = nfts.filter((nft) => nft.rarity === "Rare").length;
  const epicCount = nfts.filter((nft) => nft.rarity === "Epic").length;

  const rarityColor: Record<string, string> = {
    Common: "#9e9e9e",
    Rare: "#2a7de1",
    Epic: "#8e44ad",
  };

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <button className="btn-back" onClick={onBack}>
          ← Back to Game
        </button>
        <h1 className="inventory-title">📦 Your NFT Inventory</h1>
        <div className="user-info">
          {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
        </div>
      </div>

      <div className="inventory-stats">
        <div className="stat-box">
          <span className="stat-count">{nfts.length}</span>
          <span className="stat-label">Total NFTs</span>
        </div>
        <div className="stat-box common">
          <span className="stat-count">{commonCount}</span>
          <span className="stat-label">Common</span>
        </div>
        <div className="stat-box rare">
          <span className="stat-count">{rareCount}</span>
          <span className="stat-label">Rare</span>
        </div>
        <div className="stat-box epic">
          <span className="stat-count">{epicCount}</span>
          <span className="stat-label">Epic</span>
        </div>
      </div>

      <div className="inventory-content">
        {nfts.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">🥚</p>
            <p className="empty-text">No NFTs yet! Start hatching eggs to collect them.</p>
          </div>
        ) : (
          <div className="nft-grid">
            {nfts.map((nft) => (
              <div
                key={nft.tokenId}
                className="nft-grid-item"
                onClick={() => setSelectedNFT(nft)}
                style={{
                  borderColor: rarityColor[nft.rarity],
                }}
              >
                <div className="nft-grid-image">{nft.image}</div>
                <div className="nft-grid-info">
                  <h3>{nft.name}</h3>
                  <div
                    className="rarity-circle"
                    style={{ background: rarityColor[nft.rarity] }}
                    title={nft.rarity}
                  >
                    {nft.rarity === "Common" ? "⭐" : nft.rarity === "Rare" ? "✨" : "🌟"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedNFT && (
        <div
          className="nft-detail-modal-overlay"
          onClick={() => setSelectedNFT(null)}
        >
          <div
            className="nft-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedNFT(null)}
            >
              ✕
            </button>

            <div className="detail-content">
              <div className="detail-image">{selectedNFT.image}</div>

              <div className="detail-info">
                <h2>{selectedNFT.name}</h2>

                <div className="detail-section">
                  <label>Rarity</label>
                  <div
                    className="rarity-circle-large"
                    style={{ background: rarityColor[selectedNFT.rarity] }}
                  >
                    <span className="circle-emoji">
                      {selectedNFT.rarity === "Common" ? "⭐" : selectedNFT.rarity === "Rare" ? "✨" : "🌟"}
                    </span>
                    <span className="circle-text">{selectedNFT.rarity}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <label>Token ID</label>
                  <p className="token-id-detail">{selectedNFT.tokenId}</p>
                </div>

                <div className="detail-section">
                  <label>Contract</label>
                  <p className="contract-info">IOTA L2 Testnet</p>
                </div>

                <div className="detail-actions">
                  <button className="btn-detail-primary">View on Explorer</button>
                  <button className="btn-detail-secondary">Share NFT</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
