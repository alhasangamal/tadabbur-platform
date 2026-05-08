import React from 'react';
import { Plus, Minus, Maximize, Target } from 'lucide-react';

const GraphControls = ({ onZoomIn, onZoomOut, onReset, onCenter }) => {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.85)",
        padding: "10px 8px 10px 8px",
        borderRadius: "16px",
        boxShadow: "0 2px 16px 0 #ede9dd, 0 0 0 1px #f3f1ea",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        alignItems: "center",
        border: "none"
      }}
    >
      <ControlButton onClick={onZoomIn} icon={<Plus size={20} />} label="Zoom In" />
      <ControlButton onClick={onZoomOut} icon={<Minus size={20} />} label="Zoom Out" />
      <div style={{ height: "1px", background: "var(--b)", margin: "4px 0" }}></div>
      <ControlButton onClick={onCenter} icon={<Target size={20} />} label="Center" />
      <ControlButton onClick={onReset} icon={<Maximize size={20} />} label="Fit Screen" />
    </div>
  );
};

const ControlButton = ({ onClick, icon, label }) => (
  <button
    onClick={onClick}
    title={label}
    style={{
      width: "44px",
      height: "44px",
      borderRadius: "50%",
      border: "none",
      background: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: "#bfa038",
      boxShadow: "0 1px 6px #ede9dd",
      fontWeight: 700,
      fontSize: "1.1rem",
      transition: "all 0.2s"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "#f8f6f1";
      e.currentTarget.style.color = "#906634";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "#fff";
      e.currentTarget.style.color = "#bfa038";
    }}
  >
    {icon}
  </button>
);

export default GraphControls;
