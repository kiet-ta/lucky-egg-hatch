// src/components/Navbar.tsx
import { useState } from "react";
import { ConnectButton } from "@iota/dapp-kit";
import "./Navbar.css";

interface NavbarProps {
  onNavigate?: (tab: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [activeTab, setActiveTab] = useState("hatch");

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-egg">🥚</span>
          <span className="logo-text">IOTA Egg Game</span>
        </div>

        <div className="navbar-tabs">
          <button
            className={`nav-tab ${activeTab === "hatch" ? "active" : ""}`}
            onClick={() => handleTabClick("hatch")}
          >
            <span className="tab-icon">🐣</span>
            <span className="tab-label">Hatch Egg</span>
          </button>
          <button
            className={`nav-tab ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => handleTabClick("inventory")}
          >
            <span className="tab-icon">📦</span>
            <span className="tab-label">Inventory</span>
          </button>
          <button
            className={`nav-tab ${activeTab === "leaderboard" ? "active" : ""}`}
            onClick={() => handleTabClick("leaderboard")}
          >
            <span className="tab-icon">🏆</span>
            <span className="tab-label">Leaderboard</span>
          </button>
        </div>

        <div className="navbar-actions">
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}
