import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Loader2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuranData } from "../../context/QuranDataContext";
import { getRelationLabel } from "./relationLabels";

export default function GraphSidePanel({ entity, onClose, typeConfig, lang, isRtl }) {
  const { isLight } = useQuranData();
  const navigate = useNavigate();
  const [relations, setRelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRel, setExpandedRel] = useState(null);
  const [versesData, setVersesData] = useState({});
  const [versesLoading, setVersesLoading] = useState(false);
  const [surahMap, setSurahMap] = useState({});

  // Fetch surah names map once
  const API_BASE = process.env.REACT_APP_API_URL || 'https://tadabbur-api.onrender.com';

  // Fetch surah names map once
  useEffect(() => {
    axios.get(`${API_BASE}/surahs/map`)
      .then(res => setSurahMap(res.data))
      .catch(() => {});
  }, [API_BASE]);

  // Format "6:71" → "الأنعام:71"
  const fmtRef = (ref) => {
    const parts = ref.trim().split(':');
    const sNum = parts[0];
    const sName = surahMap[sNum] || sNum;
    return `${sName}:${parts[1]}`;
  };

  const fmtRefs = (notes) => {
    if (!notes) return '';
    return notes.split(',').map(r => fmtRef(r.trim())).join('، ');
  };

  useEffect(() => {
    if (!entity) return;
    const fetchRels = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/graph/entity/${entity.id}`);
        setRelations(res.data.relations || []);
      } catch (err) {
        console.error("Error fetching entity relationships:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRels();
    setExpandedRel(null);
    setVersesData({});
  }, [entity]);

  const handleExpand = async (relIndex, evidenceNotes) => {
    if (expandedRel === relIndex) {
      setExpandedRel(null);
      return;
    }
    setExpandedRel(relIndex);

    if (evidenceNotes && !versesData[relIndex]) {
      setVersesLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/verses/by-keys`, { params: { keys: evidenceNotes } });
        setVersesData(prev => ({ ...prev, [relIndex]: res.data.verses || [] }));
      } catch (err) {
        console.error("Error fetching verses:", err);
      } finally {
        setVersesLoading(false);
      }
    }
  };

  const config = typeConfig?.[entity.type] || { color: '#5a6577', label: 'كيان' };

  return (
    <motion.div
      initial={{ y: '105%' }}
      animate={{ y: 0 }}
      exit={{ y: '105%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 12,
        zIndex: 25,
        width: 380,
        maxWidth: 'calc(100vw - 24px)',
        maxHeight: '55vh',
        background: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(21,29,48,0.7)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${isLight ? 'rgba(224,220,212,0.8)' : 'rgba(30,41,59,0.5)'}`,
        borderRadius: '16px 16px 0 0',
        boxShadow: '0 -10px 40px rgba(0,0,0,.15)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ padding: '10px 14px 6px', borderBottom: '1px solid #e0dcd4', position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: 6, right: isRtl ? 'auto' : 10, left: isRtl ? 10 : 'auto',
            width: 22, height: 22, borderRadius: '50%',
            background: '#f0ece4', border: '1px solid #e0dcd4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '.7rem', color: '#7a7a9a', zIndex: 2,
          }}
        >✕</button>
        <h2 style={{ fontFamily: "'Amiri', serif", color: '#9a7b2e', fontSize: '1rem', margin: 0 }}>
          {lang === 'ar' ? entity.label : (entity.name_en || entity.label)}
        </h2>
        <div style={{ color: '#7a7a9a', fontSize: '.58rem' }}>
          {lang === 'ar' ? (entity.name_en || '') : entity.label}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 3
        }}>
          <div style={{
            display: 'inline-block',
            padding: '2px 7px', borderRadius: 14,
            fontSize: '.5rem', fontWeight: 600,
            background: config.color + '15',
            color: config.color,
            border: `1px solid ${config.color}30`,
          }}>
            {isRtl ? config.label : entity.type}
          </div>
          
          {(entity.type === 'prophet' || entity.type === 'person' || entity.type === 'character') && (
            <button 
              onClick={() => navigate('/characters')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 3,
                fontSize: '.5rem', fontWeight: 700, color: '#0f766e'
              }}
            >
              <span>تفاصيل أكثر</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* Relationships Body */}
      <div style={{ padding: '4px 0', overflowY: 'auto', maxHeight: 'calc(55vh - 60px)' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#c9a84c' }} />
          </div>
        ) : relations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#7a7a9a', fontSize: '.75rem' }}>
            لا توجد علاقات مسجلة
          </div>
        ) : (
          relations.map((rel, idx) => {
            const isSource = rel.source_slug === entity.id;
            const otherLabel = isSource ? rel.target_name_ar : rel.source_name_ar;
            const relationLabel = getRelationLabel(rel, lang);
            const isExp = expandedRel === idx;
            const evidenceNotes = rel.evidence_notes || "";

            return (
              <div key={idx}>
                {/* Relationship Row */}
                <div
                  onClick={() => evidenceNotes && handleExpand(idx, evidenceNotes)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 5,
                    padding: '7px 14px',
                    borderBottom: '1px solid #f0ece4',
                    cursor: evidenceNotes ? 'pointer' : 'default',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8f6f1'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ color: '#7a7a9a', fontSize: '.62rem', flexShrink: 0, marginTop: 2, width: 14, textAlign: 'center' }}>
                    {isSource ? '→' : '←'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '.7rem', lineHeight: 1.5 }}>
                      <span style={{ color: '#0f766e', fontWeight: 600 }}>{relationLabel} </span>
                      <span style={{ color: '#d4b56a', fontWeight: 600 }}>{otherLabel}</span>
                      {evidenceNotes && (
                        <span style={{ color: '#7a7a9a', fontSize: '.5rem', direction: 'rtl', marginRight: 4 }}>
                          [{fmtRefs(evidenceNotes)}]
                        </span>
                      )}
                    </div>
                    {evidenceNotes && (
                      <div style={{ fontSize: '.52rem', color: '#9a7b2e', marginTop: 2 }}>
                        {isExp ? '📖 إخفاء' : '📖 الآيات'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Verses Expansion */}
                <AnimatePresence>
                  {isExp && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{
                        background: '#f8f6f1',
                        borderRadius: 8,
                        margin: '3px 14px 5px',
                        padding: '7px 9px',
                        border: '1px solid #e0dcd4',
                      }}>
                        {versesLoading && !versesData[idx] ? (
                          <div style={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
                            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#c9a84c' }} />
                          </div>
                        ) : (
                          (versesData[idx] || []).map((v, i) => (
                            <div key={i} style={{
                              padding: '3px 0',
                              borderBottom: i < (versesData[idx]?.length || 0) - 1 ? '1px solid #e0dcd4' : 'none',
                              lineHeight: 1.7,
                            }}>
                              <span style={{
                                display: 'inline-block',
                                background: '#9a7b2e',
                                color: '#fff',
                                fontSize: '.48rem',
                                padding: '1px 5px',
                                borderRadius: 7,
                                marginLeft: 4,
                                direction: 'ltr',
                              }}>
                                {v.surah_name}:{v.ayah_key?.split(':')[1]}
                              </span>
                              <span style={{
                                fontFamily: "'Amiri', serif",
                                color: '#1a1a2e',
                                fontSize: '.8rem',
                                display: 'block',
                                marginTop: 2,
                              }}>
                                {v.text_uthmani}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
