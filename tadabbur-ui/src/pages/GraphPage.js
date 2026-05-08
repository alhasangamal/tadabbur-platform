import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Loader2, Search, X, Plus, Minus, Maximize2 } from "lucide-react";
import { useQuranData } from "../context/QuranDataContext";
import GraphSidePanel from "../components/graph/GraphSidePanel";
import { getRelationLabel } from "../components/graph/relationLabels";
import { AnimatePresence } from "framer-motion";

// ─── Colors matching i-quran.com ───
const COL = {
  concept:   '#8b6914', // الله - gold
  prophet:   '#1856b0', Prophet: '#1856b0',
  person:    '#7432c9', Person: '#7432c9',
  character: '#7432c9', Character: '#7432c9',
  angel:     '#087e83',
  place:     '#0c7c5a', Place: '#0c7c5a',
  group:     '#944210', Group: '#944210',
  nation:    '#b84c0c',
  event:     '#b41340', Event: '#b41340',
  object:    '#9a7210',
  creature:  '#4a7510',
  book:      '#137a3a',
  default:   '#5a6577'
};
const LBL = {
  concept: 'مفهوم', prophet: 'نبي', Prophet: 'نبي',
  person: 'شخص', Person: 'شخص', character: 'شخصية', Character: 'شخصية',
  angel: 'ملاك', place: 'مكان', Place: 'مكان',
  group: 'جماعة', Group: 'جماعة', nation: 'قوم',
  event: 'حدث', Event: 'حدث', object: 'شيء',
  creature: 'مخلوق', book: 'كتاب', default: 'كيان'
};
// Node radii by type — like i-quran.com
const RAD = {
  concept: 10, prophet: 7, Prophet: 7,
  person: 5, Person: 5, character: 5, Character: 5,
  angel: 6, place: 5, Place: 5,
  group: 5, Group: 5, nation: 6,
  event: 4, Event: 4, object: 4,
  creature: 4, book: 5, default: 4
};

function hexRgb(h) {
  return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
}

export default function GraphPage() {
  const { graphData, loading, theme, lang, isRtl } = useQuranData();
  const [filteredData, setFilteredData] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const hoverNodeRef = useRef(null);
  const graphRef = useRef();

  const isLight = theme !== 'dark';
  const bg = isLight ? '#f8f6f1' : '#0f172a';

  // Process links to handle deduplication, bidirectional/multi-relationships with curvature
  const processedData = useMemo(() => {
    if (!graphData?.links) return graphData;
    const nodes = graphData.nodes; // Keep nodes as is
    
    // 1. Deduplicate Links (Don't repeat any relation between 2 entities with same label)
    const uniqueLinksMap = new Map();
    graphData.links.forEach(l => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      const labelText = getRelationLabel(l, lang);
      // Sort source and target so direction doesn't duplicate the same relation
      const key = [s, t].sort().join('-') + '-' + labelText;
      if (!uniqueLinksMap.has(key)) {
        uniqueLinksMap.set(key, { ...l });
      }
    });
    const links = Array.from(uniqueLinksMap.values());
    
    // 2. Curvature (Put each different relation on a separate arrow)
    const linkGroups = {};
    links.forEach(l => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      const pairId = [s, t].sort().join('-');
      if (!linkGroups[pairId]) linkGroups[pairId] = [];
      linkGroups[pairId].push(l);
    });

    Object.values(linkGroups).forEach(group => {
      if (group.length > 1) {
        group.forEach((l, i) => {
          const step = 0.7; // Distance between arrows
          const baseCurv = (i - (group.length - 1) / 2) * step;
          const s = typeof l.source === 'object' ? l.source.id : l.source;
          const t = typeof l.target === 'object' ? l.target.id : l.target;
          const isSorted = s < t;
          // Flip curvature for unsorted direction so opposite links separate correctly
          l.curvature = isSorted ? baseCurv : -baseCurv;
        });
      } else {
        group[0].curvature = 0;
      }
    });
    return { nodes, links };
  }, [graphData, lang]);

  // Build type counts for legend
  const typeCounts = {};
  if (processedData?.nodes) {
    processedData.nodes.forEach(n => {
      typeCounts[n.type] = (typeCounts[n.type] || 0) + 1;
    });
  }

  // Click — isolate & zoom
  const onNodeClick = useCallback((node) => {
    if (!node) return;
    setSelectedEntity(node);
    if (processedData) {
      const rl = processedData.links.filter(l => {
        const s = typeof l.source === 'object' ? l.source.id : l.source;
        const t = typeof l.target === 'object' ? l.target.id : l.target;
        return s === node.id || t === node.id;
      });
      const ids = new Set([node.id]);
      rl.forEach(l => {
        ids.add(typeof l.source === 'object' ? l.source.id : l.source);
        ids.add(typeof l.target === 'object' ? l.target.id : l.target);
      });
      setFilteredData({ nodes: processedData.nodes.filter(n => ids.has(n.id)), links: rl });
    }
    setTimeout(() => {
      if (graphRef.current) {
        graphRef.current.centerAt(node.x, node.y, 600);
        graphRef.current.zoom(3, 600);
      }
    }, 100);
  }, [processedData]);

  // Hover
  const onHover = useCallback((node) => { hoverNodeRef.current = node; }, []);

  // ─── NODE DRAWING (i-quran.com style) ───
  const drawNode = useCallback((node, ctx, gs) => {
    const c = COL[node.type] || COL.default;
    const [cr, cg, cb] = hexRgb(c);
    const isSel = selectedEntity?.id === node.id;
    const isHov = hoverNodeRef.current?.id === node.id;
    const isHL = isSel || isHov;
    const anyFocus = hoverNodeRef.current || selectedEntity;
    const conn = new Set();
    if (anyFocus) {
      const fid = (hoverNodeRef.current || selectedEntity).id;
      conn.add(fid);
      const gd = filteredData || processedData;
      if (gd?.links) gd.links.forEach(l => {
        const s = typeof l.source === 'object' ? l.source.id : l.source;
        const t = typeof l.target === 'object' ? l.target.id : l.target;
        if (s === fid) conn.add(t);
        if (t === fid) conn.add(s);
      });
    }
    const isDim = anyFocus && !conn.has(node.id);

    let r = RAD[node.type] || RAD.default;
    if (isHL) r *= 1.2;

    ctx.save();
    if (isDim) ctx.globalAlpha = 0.15;

    // Glow
    if (isHL) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r * 2.8, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(node.x, node.y, r * .3, node.x, node.y, r * 2.8);
      g.addColorStop(0, `rgba(${cr},${cg},${cb},.15)`);
      g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = g;
      ctx.fill();
    }

    // White fill
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = isLight ? '#fff' : '#151d30';
    ctx.fill();

    // Tint
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${cr},${cg},${cb},${isHL ? .12 : .05})`;
    ctx.fill();

    // Border — thin colored
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${cr},${cg},${cb},${isHL ? .9 : .55})`;
    ctx.lineWidth = (isHL ? 2.5 : 1.5) / gs;
    ctx.stroke();

    // Label
    if (gs > 0.15 || isHL) {
      const lbl = lang === 'ar' ? node.label : (node.name_en || node.label);
      const fs = Math.max(15, r * 2) / gs;
      ctx.font = `700 ${fs}px 'Amiri Quran', serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.strokeStyle = isLight ? 'rgba(248,246,241,.92)' : 'rgba(6,8,16,.92)';
      ctx.lineWidth = 3 / gs;
      ctx.lineJoin = 'round';
      ctx.strokeText(lbl, node.x, node.y - r - 3/gs);
      ctx.fillStyle = isLight ? '#1a1a2e' : '#e8edf5';
      ctx.fillText(lbl, node.x, node.y - r - 3/gs);
    }

    ctx.restore();
  }, [selectedEntity, lang, isLight, filteredData, graphData, processedData]);

  // ─── LINK DRAWING (Curved for multi-links) ───
  const drawLink = useCallback((link, ctx, gs) => {
    const s = link.source, e = link.target;
    if (typeof s !== 'object' || typeof e !== 'object') return;

    const dx = e.x - s.x;
    const dy = e.y - s.y;
    const d = Math.sqrt(dx*dx + dy*dy);
    if (d < 1) return;

    const ux = dx/d, uy = dy/d;
    const sr = (RAD[s.type] || RAD.default) + 2;
    const tr = (RAD[e.type] || RAD.default) + 2;
    
    // Base points at node boundaries
    const x1 = s.x + ux*sr, y1 = s.y + uy*sr;
    const x2 = e.x - ux*tr, y2 = e.y - uy*tr;

    const curv = link.curvature || 0;
    
    const isHov = hoverNodeRef.current && (s.id === hoverNodeRef.current.id || e.id === hoverNodeRef.current.id);
    const isSel = selectedEntity && (s.id === selectedEntity.id || e.id === selectedEntity.id);
    const isHL = isHov || isSel;
    const anyFocus = hoverNodeRef.current || selectedEntity;
    const isDim = anyFocus && !isHL;

    ctx.save();

    // Determine path
    ctx.beginPath();
    let labelPoint = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
    let endTangent = { ux, uy };

    if (curv === 0) {
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    } else {
      // Quadratic curve math
      // Offset midpoint by normal vector * curvature * distance
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const nx = -uy, ny = ux;
      const cpX = mx + nx * d * curv;
      const cpY = my + ny * d * curv;
      
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cpX, cpY, x2, y2);
      
      // Label point at curve peak (t=0.5)
      labelPoint = {
        x: 0.25 * x1 + 0.5 * cpX + 0.25 * x2,
        y: 0.25 * y1 + 0.5 * cpY + 0.25 * y2
      };
      // Tangent at end (t=1)
      const tx = 2 * (x2 - cpX), ty = 2 * (y2 - cpY);
      const tl = Math.sqrt(tx*tx + ty*ty);
      endTangent = { ux: tx/tl, uy: ty/tl };
    }

    const linkColor = isDim 
      ? (isLight ? 'rgba(180,170,150,0.1)' : 'rgba(201,168,76,0.06)')
      : isHL 
        ? (isLight ? 'rgba(15,118,110,0.8)' : 'rgba(45,212,191,0.8)')
        : (isLight ? 'rgba(212,181,106,0.45)' : 'rgba(201,168,76,0.3)');
    
    ctx.strokeStyle = linkColor;
    if (isDim) {
      ctx.lineWidth = .4/gs;
    } else if (isHL) {
      ctx.lineWidth = 2.2/gs;
    } else {
      ctx.lineWidth = .9/gs;
    }
    ctx.stroke();

    // Arrowhead (Using tangent)
    if (!isDim) {
      const al = (isHL ? 8 : 5)/gs, aw = (isHL ? 4 : 2.5)/gs;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - al*endTangent.ux + aw*endTangent.uy, y2 - al*endTangent.uy - aw*endTangent.ux);
      ctx.lineTo(x2 - al*endTangent.ux - aw*endTangent.uy, y2 - al*endTangent.uy + aw*endTangent.ux);
      ctx.closePath();
      ctx.fillStyle = ctx.strokeStyle; // Match line color exactly
      ctx.fill();
    }

    // Label pill
    const relationLabel = getRelationLabel(link, lang);
    if (relationLabel && !isDim && (gs > 0.2 || isHL)) {
      const fs = (isHL ? 16 : 13)/gs;
      ctx.font = `700 ${fs}px 'Noto Kufi Arabic', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const tw = ctx.measureText(relationLabel).width;
      const px = 8/gs, py = 4/gs, bw = tw+px*2, bh = fs+py*2, br = bh/2;
      const bx = labelPoint.x-bw/2, by = labelPoint.y-bh/2;

      ctx.beginPath();
      ctx.moveTo(bx+br,by); ctx.lineTo(bx+bw-br,by);
      ctx.quadraticCurveTo(bx+bw,by,bx+bw,by+br);
      ctx.lineTo(bx+bw,by+bh-br);
      ctx.quadraticCurveTo(bx+bw,by+bh,bx+bw-br,by+bh);
      ctx.lineTo(bx+br,by+bh);
      ctx.quadraticCurveTo(bx,by+bh,bx,by+bh-br);
      ctx.lineTo(bx,by+br);
      ctx.quadraticCurveTo(bx,by,bx+br,by);
      ctx.closePath();
      ctx.fillStyle = isLight ? 'rgba(255,255,255,.95)' : 'rgba(21,29,48,.95)';
      ctx.fill();
      ctx.strokeStyle = isLight ? 'rgba(192,186,174,.4)' : 'rgba(45,212,191,.15)';
      ctx.lineWidth = .6/gs;
      ctx.stroke();

      ctx.fillStyle = isLight ? '#0f766e' : '#2dd4bf';
      ctx.fillText(relationLabel, labelPoint.x, labelPoint.y);
    }

    ctx.restore();
  }, [selectedEntity, isLight, lang]);

  // Search
  const suggestions = searchValue && graphData?.nodes
    ? graphData.nodes.filter(n => (n.label?.includes(searchValue)) || (n.name_en?.toLowerCase().includes(searchValue.toLowerCase()))).slice(0, 10)
    : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
        <p className="mt-4 text-emerald-800 dark:text-emerald-400 font-medium">
          {isRtl ? 'جاري بناء شبكة المعرفة...' : 'Building Knowledge Graph...'}
        </p>
      </div>
    );
  }

  return (
    <div style={{ width:'100%', height:'calc(100vh - 80px)', position:'relative', overflow:'hidden', background: isLight ? '#f8f6f1' : '#0f172a' }}>

      {/* ─── Search Bar (top right) ─── */}
      <div style={{ position:'absolute', top:12, right:12, zIndex:50, width:256 }}>
        <div className="relative" style={{
          background: isLight ? 'rgba(255,255,255,.75)' : 'rgba(21,29,48,.75)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${isLight ? 'rgba(30,41,59,.1)' : 'rgba(30,41,59,.5)'}`,
          borderRadius: 12, padding: '8px 12px 8px 30px',
        }}>
          <span style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', fontSize:'.75rem', color:'#64748b', pointerEvents:'none' }}>🔎</span>
          <input
            type="text"
            placeholder={isRtl ? "ابحث عن كيان... / Search entity..." : "Search entity..."}
            value={searchValue}
            onChange={(e) => { setSearchValue(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            style={{ width:'100%', border:'none', outline:'none', background:'transparent',
              fontFamily:"'Noto Kufi Arabic',sans-serif", fontSize:'.72rem',
              color: isLight ? '#1a1a2e' : '#e8edf5', textAlign:'right',
            }}
          />
          {searchValue && (
            <button onClick={() => { setSearchValue(""); setShowDropdown(false); }}
              style={{ position:'absolute', left:30, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer' }}>
              <X className="w-3.5 h-3.5" style={{ color:'#64748b' }} />
            </button>
          )}
        </div>

        {showDropdown && suggestions.length > 0 && (
          <div style={{
            background: isLight ? 'rgba(255,255,255,.8)' : 'rgba(21,29,48,.8)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${isLight ? 'rgba(224,220,212,.8)' : 'rgba(30,41,59,.5)'}`,
            borderRadius: 12, boxShadow: isLight ? '0 10px 30px rgba(0,0,0,.1)' : '0 10px 40px rgba(0,0,0,.4)',
            maxHeight: '50vh', overflowY: 'auto', marginTop: 4,
          }}>
            {suggestions.map(n => {
              const c = COL[n.type] || COL.default;
              return (
                <div key={n.id} onClick={() => { setSearchValue(""); setShowDropdown(false); onNodeClick(n); }}
                  style={{ padding:'7px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:6,
                    borderBottom:`1px solid ${isLight?'#f0ece4':'#1e293b'}`, fontSize:'.72rem', transition:'background .1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = isLight?'#f8f6f1':'#1a2440'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:c, flexShrink:0 }} />
                  <span style={{ fontWeight:600, color: isLight?'#1a1a2e':'#e8edf5' }}>{n.label}</span>
                  <span style={{ fontSize:'.55rem', color:'#64748b', direction:'ltr' }}>{n.name_en}</span>
                  <span style={{ fontSize:'.45rem', color:'#fff', padding:'1px 5px', borderRadius:8, background:c, marginRight:'auto', flexShrink:0 }}>{LBL[n.type]||n.type}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Controls (top left) ─── */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        <div className="flex gap-2">
          {filteredData && (
            <button onClick={() => { setFilteredData(null); setSelectedEntity(null); }}
              className="glass-card !rounded-xl px-4 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-lg"
            >
              🔄 عرض الكل
            </button>
          )}
        </div>
        
        
      </div>

      {/* ─── Zoom Controls (bottom left) ─── */}
      <div className="absolute bottom-16 left-3 z-10 flex flex-col gap-1.5">
        {[
          { icon: <Plus className="w-4 h-4" />, action: () => graphRef.current?.zoom(graphRef.current.zoom() * 1.5, 300) },
          { icon: <Minus className="w-4 h-4" />, action: () => graphRef.current?.zoom(graphRef.current.zoom() / 1.5, 300) },
          { icon: <Maximize2 className="w-3.5 h-3.5" />, action: () => graphRef.current?.zoomToFit(400, 60) },
        ].map((b, i) => (
          <button key={i} onClick={b.action} style={{
            width:34, height:34, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center',
            background: isLight?'rgba(255,255,255,.7)':'rgba(21,29,48,.7)',
            backdropFilter: 'blur(8px)',
            border:`1px solid ${isLight?'rgba(224,220,212,0.8)':'rgba(30,41,59,0.5)'}`,
            cursor:'pointer', color: isLight?'#9a7b2e':'#c9a84c',
            boxShadow:'0 2px 8px rgba(0,0,0,.08)', transition:'transform .1s',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(.92)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
            {b.icon}
          </button>
        ))}
      </div>

      {/* ─── Graph ─── */}
      <ForceGraph2D
        ref={graphRef}
        graphData={filteredData || processedData}
        nodeCanvasObject={drawNode}
        linkCanvasObject={drawLink}
        linkCanvasObjectMode={() => "replace"}
        nodeRelSize={6}
        linkDirectionalArrowLength={0}
        linkWidth={0}
        backgroundColor={isLight ? '#f8f6f1' : '#0f172a'}
        canvasProps={{ id: 'c', style: { cursor: 'default' } }}
        d3AlphaDecay={0.015}
        d3VelocityDecay={0.15}
        d3AlphaMin={0}
        onNodeClick={onNodeClick}
        onNodeHover={onHover}
        cooldownTicks={Infinity}
        enableNodeDrag={true}
        onNodeDragEnd={node => {
          node.fx = node.x;
          node.fy = node.y;
        }}
        warmupTicks={150}
        onEngineStop={() => {
          if (graphRef.current) graphRef.current.d3ReheatSimulation();
        }}
        d3Force={(name, force) => {
          if (name === 'charge') force.strength(-15000).distanceMax(12000);
          if (name === 'link') force.distance(5000);
          if (name === 'center') force.strength(0.015);
        }}
      />

      {/* ─── Side Panel ─── */}
      <AnimatePresence>
        {selectedEntity && (
          <GraphSidePanel
            entity={selectedEntity}
            onClose={() => { setSelectedEntity(null); setFilteredData(null); }}
            typeConfig={Object.fromEntries(Object.entries(COL).map(([k, c]) => [k, { color: c, label: LBL[k] || k }]))}
            lang={lang}
            isRtl={isRtl}
          />
        )}
      </AnimatePresence>

      {/* ─── Legend (bottom right) ─── */}
      <div className="absolute bottom-3 right-3 z-10 flex flex-wrap gap-x-2 gap-y-1 max-w-[420px] justify-end" style={{ direction:'ltr' }}>
        {Object.entries(typeCounts).sort((a,b) => b[1]-a[1]).map(([type, count]) => (
          <span key={type} style={{ display:'flex', alignItems:'center', gap:3, fontSize:'.55rem',
            color: isLight?'#7a7a9a':'#94a3b8', padding:'2px 5px', borderRadius:4, background: isLight?'rgba(255,255,255,.4)':'rgba(255,255,255,.03)' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background: COL[type]||COL.default, flexShrink:0 }} />
            {LBL[type]||type} ({count})
          </span>
        ))}
      </div>

    </div>
  );
}
