import React from 'react';

const GraphLegend = ({ typeConfig }) => {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.85)",
        padding: "14px 22px 10px 22px",
        borderRadius: "18px",
        boxShadow: "0 2px 16px 0 #ede9dd, 0 0 0 1px #f3f1ea",
        zIndex: 50,
        display: "flex",
        flexDirection: "row",
        gap: "18px",
        alignItems: "flex-end",
        border: "none"
      }}
    >
      {Object.entries(typeConfig).map(([key, config]) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: config.color,
            boxShadow: `0 0 0 2px #fff, 0 0 10px ${config.color}22`
          }}></div>
          <span style={{
            fontSize: "0.97rem",
            color: "#4b5563",
            fontWeight: "600"
          }}>{config.label}</span>
        </div>
      ))}
    </div>
  );
};

export default GraphLegend;
