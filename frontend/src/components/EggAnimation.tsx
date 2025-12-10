// src/components/EggAnimation.tsx
import "./EggAnimation.css";

export default function EggAnimation() {
  return (
    <div className="egg-animation-container">
      <div className="egg-animation">
        <div className="egg-crack crack-1"></div>
        <div className="egg-crack crack-2"></div>
        <div className="egg-crack crack-3"></div>
        <span className="egg-text">🥚</span>
      </div>
      <p className="hatching-text">Your egg is hatching...</p>
      <div className="progress-bar">
        <div className="progress-fill"></div>
      </div>
    </div>
  );
}
