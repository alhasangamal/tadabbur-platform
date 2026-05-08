import React from 'react';
import { X, ExternalLink, Bookmark, Share2 } from 'lucide-react';

const EntityPanel = ({ selectedEntity, typeConfig, onClose }) => {
  if (!selectedEntity) return null;

  const typeInfo = typeConfig[selectedEntity.type] || typeConfig.default;

  return (
    <div 
      className="glass animate-slide-right"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: "420px",
        maxWidth: "100%",
        zIndex: 100,
        boxShadow: "var(--shadow-lg)",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Header */}
      <div style={{
        padding: "30px",
        background: `linear-gradient(135deg, ${typeInfo.color}15 0%, transparent 100%)`,
        borderBottom: "1px solid var(--b)",
        position: "relative"
      }}>
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            background: "var(--c)",
            border: "1px solid var(--b)",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--x2)",
            transition: "var(--transition)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "rotate(90deg)";
            e.currentTarget.style.color = "var(--r)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "rotate(0deg)";
            e.currentTarget.style.color = "var(--x2)";
          }}
        >
          <X size={20} />
        </button>

        <div style={{
          display: "inline-block",
          padding: "6px 12px",
          borderRadius: "8px",
          background: typeInfo.color,
          color: "white",
          fontSize: "0.75rem",
          fontWeight: "700",
          marginBottom: "15px",
          textTransform: "uppercase",
          letterSpacing: "0.05em"
        }}>
          {typeInfo.label}
        </div>

        <h2 style={{
          margin: 0,
          fontSize: "2rem",
          fontWeight: "700",
          color: "var(--x)",
          fontFamily: "'IBM Plex Sans Arabic', sans-serif"
        }}>
          {selectedEntity.label}
        </h2>
      </div>

      {/* Content */}
      <div style={{ padding: "30px", flex: 1 }}>
        <p style={{
          margin: "0 0 30px 0",
          fontSize: "1rem",
          lineHeight: "1.8",
          color: "var(--x2)"
        }}>
          {selectedEntity.description || "لا يوجد وصف حالي لهذا الكيان في قاعدة البيانات."}
        </p>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "40px" }}>
          <button style={actionButtonStyle}><Bookmark size={18} /> حفظ</button>
          <button style={actionButtonStyle}><Share2 size={18} /> مشاركة</button>
        </div>

        {/* آيات مرتبطة */}
        {selectedEntity.ayat && selectedEntity.ayat.length > 0 && (
          <div style={{ marginBottom: "30px" }}>
            <h3 style={sectionTitleStyle}>الآيات المرتبطة</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {selectedEntity.ayat.map((a, i) => (
                <div key={i} style={{
                  background: "#f8fafc",
                  borderRadius: 10,
                  padding: "12px 15px",
                  fontSize: "1.1rem",
                  color: "#222",
                  border: "1px solid #e5e7eb",
                  direction: "rtl"
                }}>
                  <div style={{ fontWeight: 700, color: "#4d7a73", marginBottom: 4 }}>{a.ayah_key} <span style={{ color: "#bfa038", fontWeight: 500, fontSize: "0.95em" }}>{a.mention_text}</span></div>
                  <div>{a.text_uthmani || a.text_simple}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const sectionTitleStyle = {
  fontSize: "0.9rem",
  fontWeight: "700",
  color: "var(--gl)",
  marginBottom: "15px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "1px solid var(--b)",
  paddingBottom: "8px"
};

const actionButtonStyle = {
  flex: 1,
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid var(--b)",
  background: "var(--c)",
  color: "var(--x2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontSize: "0.9rem",
  cursor: "pointer",
  transition: "var(--transition)"
};

const refItemStyle = {
  padding: "12px 15px",
  background: "var(--c2)",
  borderRadius: "10px",
  fontSize: "0.9rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  color: "var(--x)",
  cursor: "pointer",
  border: "1px solid transparent",
  transition: "var(--transition)"
};

export default EntityPanel;
