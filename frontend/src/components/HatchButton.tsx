// src/components/HatchButton.tsx
import "./HatchButton.css";

interface HatchButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}

export default function HatchButton({
  onClick,
  loading,
  disabled,
}: HatchButtonProps) {
  return (
    <button
      className={`hatch-button ${loading ? "loading" : ""} ${
        disabled ? "disabled" : ""
      }`}
      onClick={onClick}
      disabled={loading || disabled}
    >
      <span className="button-text">
        {loading ? "🔄 Hatching..." : "🐣 Hatch Egg"}
      </span>
      {loading && <span className="loading-spinner"></span>}
    </button>
  );
}
