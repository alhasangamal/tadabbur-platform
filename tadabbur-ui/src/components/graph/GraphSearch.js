import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

export default function GraphSearch({ nodes, typeConfig, onSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!nodes || !query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    console.log("Searching nodes for:", query);
    const filtered = nodes
      .filter(n => {
        const labelMatch = n.label && n.label.toLowerCase().includes(query.toLowerCase());
        const nameEnMatch = n.name_en && n.name_en.toLowerCase().includes(query.toLowerCase());
        return labelMatch || nameEnMatch;
      })
      .slice(0, 10);
    
    console.log("Found results:", filtered.length);
    setSuggestions(filtered);
    setIsOpen(filtered.length > 0);
  }, [query, nodes]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (node) => {
    onSelect(node);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        zIndex: 101,
        width: "400px",
        background: "none"
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          border: "none",
          display: "flex",
          alignItems: "center",
          padding: "12px 20px",
          boxShadow: "0 2px 16px 0 #ede9dd, 0 0 0 1px #f3f1ea",
          gap: "12px"
        }}
      >
        <Search size={22} color="#bfa38a" />
        <input 
          type="text"
          placeholder="بحث في شبكة العلاقات..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "1.1rem",
            color: "#111827",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            textAlign: "right"
          }}
        />
        {query && <X size={20} color="#9ca3af" className="cursor-pointer" onClick={() => setQuery("")} />}
      </div>

      {isOpen && (
        <div className="search-dropdown">
          {suggestions.map((node) => {
            const config = typeConfig[node.type] || typeConfig.default;
            let badgeClass = "badge-default";
            if (node.type === "Prophet") badgeClass = "badge-prophet";
            else if (node.type === "Character" || node.type === "Person") badgeClass = "badge-person";
            else if (node.type === "Place") badgeClass = "badge-place";

            return (
              <div 
                key={node.id} 
                className="search-item"
                onClick={() => handleSelect(node)}
              >
                <div className={`badge ${badgeClass}`}>
                  {config.label}
                </div>
                <div className="search-name-en">{node.name_en}</div>
                <div className="search-name-ar">{node.label}</div>
                <div 
                  className="type-dot" 
                  style={{ background: config.color }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
