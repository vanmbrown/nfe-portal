'use client';

import React, { useMemo, useState, useEffect, useRef, useReducer } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SimpleInput } from '@/components/ui/SimpleInput';
import { Slider } from '@/components/ui/Slider';
import { Separator } from '@/components/ui/Separator';
import { useScience } from '@/context/ScienceContext';
import { sanitizeStyle } from '@/lib/utils/sanitize';
import { initializeActives } from '@/lib/actives';
import { ActiveIngredient } from '@/types/actives';
import {
  FlaskConical, Sun, Moon, Layers, Info, Bug, Sparkles,
  ZoomIn, ZoomOut, Move, ImageIcon, Eye, EyeOff
} from '@/components/ui/Icon';

// ----------------------- PROPS --------------------------------------------
export type NFEMelanocyteMapProps = {
  backgroundUrl?: string; // public path to histology image - using a placeholder for canvas environment
  ingredients?: Array<{
    id: number;
    name: string;
    description: string;
    benefits: string[];
    category: string;
    layer: string;
    roles: string[];
  }>; // Filtered ingredients to display
  loading?: boolean; // Loading state
};

// ----------------------- DATA ---------------------------------------------
const GROUPS = {
  tone: { label: 'Tone', color: '#36C270', textColor: '#ffffff' }, // Green - White text
  hydrate: { label: 'Hydration', color: '#4CB3FF', textColor: '#000000' }, // Sky Blue - Black text
  antioxidant: { label: 'Antioxidants', color: '#D94BBA', textColor: '#ffffff' }, // Magenta - White text
  peptide: { label: 'Peptides', color: '#F8D775', textColor: '#000000' }, // Pastel Gold - Black text
};

// Category-specific opacity for dimmed actives (lighter colors need higher opacity for visibility)
const CATEGORY_DIMMED_OPACITY: Record<keyof typeof GROUPS, number> = {
  peptide: 0.55,      // Pastel gold - very light, needs highest opacity
  hydrate: 0.5,      // Sky blue - light, needs higher opacity
  tone: 0.5,         // Green - medium-light, needs higher opacity
  antioxidant: 0.4,  // Magenta - darker, can use lower opacity
};

// Category-specific text opacity for dimmed actives
const CATEGORY_DIMMED_TEXT_OPACITY: Record<keyof typeof GROUPS, number> = {
  peptide: 0.4,      // Higher for light colors
  hydrate: 0.4,      // Higher for light colors
  tone: 0.35,        // Medium
  antioxidant: 0.35, // Lower for darker colors
};

// ACTIVES now loaded from JSON via context or fallback

const LAYERS = [
  { id: 'sc', title: 'Stratum Corneum', y: 18, h: 14, fill: 'url(#gradSC)', stroke: '#a16207', copy: 'Outer barrier (10–20 µm). Focus: hydration network and lipid lamellae.' },
  { id: 'epi', title: 'Epidermis', y: 32, h: 26, fill: 'url(#gradEPI)', stroke: '#be185d', copy: 'Viable epidermis including basal layer and melanocyte/keratinocyte interface.' },
  { id: 'der', title: 'Dermis', y: 58, h: 26, fill: 'url(#gradDER)', stroke: '#0369a1', copy: 'ECM (collagen/elastin), vasculature, antioxidant defense, peptides.' },
  { id: 'hyp', title: 'Hypodermis', y: 84, h: 14, fill: 'url(#gradHYP)', stroke: '#047857', copy: 'Subcutis/cushioning. NFE focuses above; comfort cascades downward.' }
];

// ----------------------- MAP CONTROLS REDUCER --------------------------------
interface MapState {
  scale: number;
  tx: number;
  ty: number;
}
type MapAction =
  | { type: 'ZOOM_IN' }
  | { type: 'ZOOM_OUT' }
  | { type: 'PAN'; dx: number; dy: number }
  | { type: 'RESET' };

const initialMapState: MapState = { scale: 1, tx: 0, ty: 0 };

function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case 'ZOOM_IN': {
      const nextScale = Math.min(2.2, state.scale + 0.2);
      return { ...state, scale: nextScale, tx: 0, ty: 0 }; // Lock position
    }
    case 'ZOOM_OUT': {
      const nextScale = Math.min(2.2, Math.max(0.8, state.scale - 0.2));
      return { ...state, scale: nextScale, tx: 0, ty: 0 }; // Lock position
    }
    case 'PAN': {
      // Panning disabled - keep position locked at 0,0
      return { ...state, tx: 0, ty: 0 };
    }
    case 'RESET':
      return initialMapState;
    default:
      return state;
  }
}

// ----------------------- SELF TESTS ---------------------------------------
interface TestResult {
  pass: boolean;
  msg: string;
}

// Self-tests removed - data validation now handled by JSON schema

// ----------------------- COMPONENT ----------------------------------------
export default function NFEMelanocyteMap({
  backgroundUrl = '/images/products/20251003_175948-EDIT.jpg', // Real histology/image underlay
  ingredients,
  loading = false
}: NFEMelanocyteMapProps) {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string>('');
  const [themeDark, setThemeDark] = useState(true);
  const [groupFilter, setGroupFilter] = useState({ tone: true, hydrate: true, antioxidant: true, peptide: true });
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Pan/zoom state using useReducer - locked in place (no panning)
  const [mapState, dispatch] = useReducer(mapReducer, initialMapState);
  const { scale } = mapState; // tx and ty are always 0 (locked)
  const [showHistology, setShowHistology] = useState(true);
  const [histologyOpacity, setHistologyOpacity] = useState(35); // 0..100

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Get actives from context if available (refined by category filters)
  // Hook must be called unconditionally
  const { getRefinedActives } = useScience();
  const contextActives = getRefinedActives();

  const [allActivesLoaded, setAllActivesLoaded] = useState<ActiveIngredient[]>([]);

  useEffect(() => {
    // Load all actives if context is empty
    if (contextActives.length === 0) {
      initializeActives().then(setAllActivesLoaded);
    }
  }, [contextActives]);

  // Detect large screen for responsive placeholder
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.matchMedia('(min-width: 1024px)').matches);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Use context actives (already filtered) and apply search query
  const filtered = useMemo(() => {
    const activesToUse = contextActives.length > 0 ? contextActives : allActivesLoaded;
    return activesToUse.filter(a => (
      groupFilter[a.group as keyof typeof groupFilter] &&
      [a.name, a.layer, a.roles.join(' '), a.mech].join(' ').toLowerCase().includes(query.toLowerCase())
    ));
  }, [query, groupFilter, contextActives, allActivesLoaded]);

  const active = useMemo(() => filtered.find(a => a.id === activeId) || null, [activeId, filtered]);

  // Events: zoom with wheel only (panning disabled - diagram is locked)
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = Math.sign(e.deltaY) * 0.1;
    if (delta < 0) {
      dispatch({ type: 'ZOOM_IN' });
    } else {
      dispatch({ type: 'ZOOM_OUT' });
    }
  };
  // Panning disabled - no-op handlers to prevent accidental movement
  const onMouseDown = () => {
    // Disabled - diagram is locked in place
  };
  const onMouseMove = () => {
    // Disabled - diagram is locked in place
  };
  const onMouseUp = () => {
    // Disabled - diagram is locked in place
  };
  const onMouseLeave = () => {
    // Disabled - diagram is locked in place
  };

  // Self-tests removed - data validation now handled by JSON schema
  const allTestsPass = true;

  // Theme-based styling
  const bgColor = themeDark ? 'bg-nfe-green-900' : 'bg-nfe-paper';
  const textColor = themeDark ? 'text-nfe-paper' : 'text-nfe-ink';
  const mutedTextColor = themeDark ? 'text-nfe-paper/70' : 'text-nfe-muted';
  const cardBg = themeDark ? 'bg-nfe-green/10 border-nfe-gold/20' : 'bg-nfe-paper border-nfe-green/20';
  const inputBg = themeDark ? 'bg-nfe-green/10 border-nfe-gold/20 text-nfe-paper' : 'bg-white border-gray-300 text-nfe-ink';

  return (
    <section aria-labelledby="melanocyte-map-title" className={`my-8 ${bgColor} ${textColor} min-h-screen`} data-testid="melanocyte-map">
      {/* Accessibility: Remove default focus outlines, use glow instead */}
      <style dangerouslySetInnerHTML={{__html: sanitizeStyle(`
        g[role="button"]:focus-visible {
          outline: none !important;
        }
        g[role="button"]:focus-visible circle {
          filter: url(#glowActive) !important;
        }
      `)}} />
      {/* Neon gradient scene */}
      <div className="fixed inset-0 -z-10">
        <div className={`absolute inset-0 opacity-70 ${themeDark ? 'bg-nfe-green-900' : 'bg-nfe-paper'}`} style={{
          background: themeDark
            ? 'radial-gradient(60% 60% at 70% 20%, rgba(16,59,42,0.35) 0%, rgba(198,166,100,0.25) 40%, rgba(16,59,42,0.2) 70%, rgba(11,41,30,0.9) 100%)'
            : 'radial-gradient(60% 60% at 70% 20%, rgba(198,166,100,0.15) 0%, rgba(16,59,42,0.1) 40%, rgba(250,250,248,0.9) 100%)'
        }} />
        <div className={`absolute inset-0 ${themeDark ? 'bg-[radial-gradient(transparent_1px,rgba(11,41,30,0.9)_1px)]' : 'bg-[radial-gradient(transparent_1px,rgba(250,250,248,0.5)_1px)]'} [background-size:16px_16px] opacity-20`} />
      </div>

      <div className="mx-auto max-w-7xl p-4 md:p-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 w-full">
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              id="melanocyte-map-title"
              className="text-[clamp(2rem,4vw,4.5rem)] leading-[1.05] tracking-tight break-normal [word-break:normal] [overflow-wrap:normal] [hyphens:none] font-primary font-semibold text-nfe-gold lg:bg-gradient-to-r lg:from-nfe-gold lg:to-nfe-gold/70 lg:bg-clip-text lg:text-transparent"
            >
              Melanocyte Interaction Map
            </motion.h1>
            <p className={`mt-1 text-sm md:text-base ${mutedTextColor}`}>
              Interactive cross‑section with real histology texture underlay.
            </p>
            {/* Non-functional badges removed per UX requirements */}
            {/* Future badges can be conditionally rendered here if needed */}
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full max-w-full min-w-0">
            <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap shrink-0">
              {Object.entries(GROUPS).map(([key, meta]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={groupFilter[key as keyof typeof groupFilter] ? 'primary' : 'outline'}
                  className={`rounded-full whitespace-nowrap ${groupFilter[key as keyof typeof groupFilter] ? 'ring-2 ring-nfe-gold' : 'opacity-70'}`}
                  onClick={() => setGroupFilter(g => ({ ...g, [key]: !g[key as keyof typeof g] }))}
                  aria-label={`Toggle ${meta.label} filter`}
                >
                  <span className="h-2 w-2 rounded-full mr-2 flex-shrink-0" style={{ background: meta.color }} />
                  {meta.label}
                </Button>
              ))}
            </div>
            <div className="w-full lg:w-auto lg:min-w-[360px] lg:max-w-[450px] min-w-0">
              <SimpleInput
                className={`w-full min-w-0 ${inputBg} placeholder:${mutedTextColor}`}
                placeholder={isLargeScreen ? "Search actives, roles, mechanisms…" : "Search actives, roles…"}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search actives"
              />
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => setQuery('')} aria-label="Clear search" className="flex-shrink-0">
                Clear
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setThemeDark(d => !d)}
                aria-label={themeDark ? 'Switch to light theme' : 'Switch to dark theme'}
                className="flex-shrink-0"
              >
                {themeDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* MAIN CANVAS PANEL */}
        <Card className={`rounded-3xl overflow-hidden ${cardBg} backdrop-blur-xl shadow-lg p-0`}>
          <CardHeader className="px-6 pt-6 pb-4">
            <CardTitle className={`flex items-center gap-2 ${textColor}`}>
              <Layers className="h-5 w-5" /> Cross‑Section Diagram
            </CardTitle>
            <CardDescription className={mutedTextColor}>
              Cosmetic mechanisms only (appearance, hydration, barrier, comfort).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* SVG DIAGRAM WITH HISTOLOGY UNDERLAY */}
              <div className="lg:col-span-2">
                <div
                  ref={containerRef}
                  className={`relative w-full h-[520px] rounded-2xl border ${themeDark ? 'border-nfe-gold/20' : 'border-nfe-green/20'} ${themeDark ? 'bg-nfe-ink/20' : 'bg-nfe-paper'} overflow-hidden`}
                  onWheel={onWheel}
                  role="application"
                  aria-label="Interactive skin layers map (locked position, zoom only)"
                >
                  {/* Histology underlay - full coverage, no placeholder text visible */}
                  {showHistology && (
                    <Image
                      src={backgroundUrl}
                      alt="Skin histology underlay"
                      fill
                      className="object-cover object-center select-none pointer-events-none"
                      unoptimized
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMGYyYzFjIi8+PC9zdmc+"
                      sizes="100vw"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null; // prevents infinite loop
                        e.currentTarget.src = '/images/products/20251003_175948-EDIT.jpg';
                      }}
                      style={{ 
                        opacity: histologyOpacity / 100, 
                        mixBlendMode: 'multiply', 
                        filter: 'saturate(1.2) contrast(1.05)',
                        objectFit: 'cover',
                        objectPosition: 'center'
                      }}
                    />
                  )}

                  {/* Controls */}
                  <div className="absolute top-3 right-3 z-10 flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => dispatch({ type: 'ZOOM_IN' })}
                      aria-label="Zoom in"
                      className={cardBg}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => dispatch({ type: 'ZOOM_OUT' })}
                      aria-label="Zoom out"
                      className={cardBg}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => dispatch({ type: 'RESET' })}
                      aria-label="Reset view"
                      className={cardBg}
                    >
                      <Move className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setShowHistology(v => !v)}
                      aria-label={showHistology ? 'Hide histology' : 'Show histology'}
                      className={cardBg}
                    >
                      {showHistology ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Opacity slider */}
                  <div className={`absolute left-3 top-3 z-10 min-w-[180px] ${cardBg} rounded-xl p-2 text-[11px] ${textColor}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="h-3.5 w-3.5" />
                      Histology opacity: <span className="font-bold">{histologyOpacity}%</span>
                    </div>
                    <Slider
                      value={[histologyOpacity]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(v) => setHistologyOpacity(v[0])}
                      aria-label="Histology opacity"
                    />
                  </div>

                  {/* SVG - scaled to fill container and centered */}
                  <svg 
                    viewBox="0 0 100 100" 
                    className="absolute inset-0 w-full h-full" 
                    preserveAspectRatio="xMidYMid meet"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="gradSC" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#fde68a" />
                        <stop offset="100%" stopColor="#fcd34d" />
                      </linearGradient>
                      <linearGradient id="gradEPI" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#fecdd3" />
                        <stop offset="100%" stopColor="#fda4af" />
                      </linearGradient>
                      <linearGradient id="gradDER" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#bae6fd" />
                        <stop offset="100%" stopColor="#7dd3fc" />
                      </linearGradient>
                      <linearGradient id="gradHYP" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#bbf7d0" />
                        <stop offset="100%" stopColor="#86efac" />
                      </linearGradient>
                      {/* Enhanced glow filter for better bubble visibility */}
                      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2.2" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      {/* White glow for active bubbles - no border box */}
                      <filter id="glowActive" x="-100%" y="-100%" width="300%" height="300%">
                        {/* White outer glow */}
                        <feGaussianBlur stdDeviation="4" result="whiteGlow" />
                        <feColorMatrix 
                          type="matrix" 
                          values="0 0 0 0 1
                                  0 0 0 0 1
                                  0 0 0 0 1
                                  0 0 0 0.85 0" 
                          in="whiteGlow" 
                          result="brightWhiteGlow"
                        />
                        <feMerge>
                          <feMergeNode in="brightWhiteGlow" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      {/* Subtle dimmed filter for inactive actives - slight blur, desaturation, and inner glow */}
                      <filter id="glowDimmed" x="-50%" y="-50%" width="200%" height="200%">
                        {/* Inner white glow for better visibility of lighter colors */}
                        <feGaussianBlur stdDeviation="1" result="innerGlow" />
                        <feColorMatrix 
                          type="matrix" 
                          values="0 0 0 0 1
                                  0 0 0 0 1
                                  0 0 0 0 1
                                  0 0 0 0.15 0" 
                          in="innerGlow" 
                          result="whiteGlow"
                        />
                        {/* Slight blur and desaturation */}
                        <feGaussianBlur stdDeviation="0.5" result="blurred" />
                        <feColorMatrix 
                          type="saturate" 
                          values="0.7" 
                          in="blurred" 
                          result="desaturated"
                        />
                        <feMerge>
                          <feMergeNode in="whiteGlow" />
                          <feMergeNode in="desaturated" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* viewport transform - centered and locked (tx, ty always 0) */}
                    <g transform={`translate(50, 50) scale(${scale}) translate(-50, -50)`}>
                      {/* Layers */}
                      {LAYERS.map((L) => (
                        <g key={L.id}>
                          <rect x={5} y={L.y} width={90} height={L.h} fill={L.fill} stroke={L.stroke} strokeWidth={0.3} rx={2} />
                          <text x={7} y={L.y + 4} fontSize={2.8} fill="#0f172a" style={{ fontWeight: 700 }}>
                            {L.title}
                          </text>
                          <text x={7} y={L.y + 8} fontSize={2.2} fill="#1f2937">
                            {L.copy}
                          </text>
                        </g>
                      ))}

                      {/* Basal layer curve + label */}
                      <path d="M5 56 C 25 60, 75 52, 95 56" fill="none" stroke="#f0abfc" strokeWidth="0.6" opacity="0.9" />
                      <text x={6} y={55} fontSize={2.2} fill="#a21caf">
                        Basal layer (melanocytes at keratinocyte interface)
                      </text>

                      {/* Melanocytes */}
                      {[20, 45, 70, 88].map((mx, i) => (
                        <g key={i}>
                          <circle cx={mx} cy={56} r={1.6} fill="#1f2937" />
                          <circle cx={mx} cy={56} r={3.2} fill="#111827" opacity={0.25} />
                          <path d={`M${mx} 56 q 4 -2 8 0`} stroke="#111827" strokeWidth={0.3} fill="none" opacity={0.35} />
                          <path d={`M${mx} 56 q -4 -2 -8 0`} stroke="#111827" strokeWidth={0.3} fill="none" opacity={0.35} />
                        </g>
                      ))}

                      {/* Active pins - exclusive highlighting with group-based colors */}
                      {filtered.map((a) => {
                        const isGroupActive = groupFilter[a.group as keyof typeof groupFilter];
                        const groupColor = GROUPS[a.group as keyof typeof GROUPS].color;
                        const groupTextColor = GROUPS[a.group as keyof typeof GROUPS].textColor;
                        const isActive = a.id === activeId;
                        const activeGroup = activeId ? filtered.find(act => act.id === activeId)?.group : null;
                        
                        // Exclusive highlighting logic with category-specific opacity:
                        // - If an active is selected: only that class is fully visible (90-100%), others dim with category-adaptive opacity
                        // - If no active is selected: all active groups show at 85-90%
                        let bubbleOpacity: number;
                        let textOpacity: number;
                        
                        if (activeId && activeId !== '' && activeGroup) {
                          // An active is selected - exclusive highlighting
                          if (a.group === activeGroup) {
                            // Same group as selected active: full visibility
                            bubbleOpacity = isActive ? 1.0 : 0.95;
                            textOpacity = isActive ? 1.0 : 0.95;
                          } else if (isGroupActive) {
                            // Different group but filter is on: dimmed with category-specific opacity
                            const groupKey = a.group as keyof typeof GROUPS;
                            bubbleOpacity = CATEGORY_DIMMED_OPACITY[groupKey] || 0.4;
                            textOpacity = CATEGORY_DIMMED_TEXT_OPACITY[groupKey] || 0.35;
                          } else {
                            // Group filter is off: hidden
                            bubbleOpacity = 0;
                            textOpacity = 0;
                          }
                        } else {
                          // No active selected - normal state
                          bubbleOpacity = isGroupActive ? (isActive ? 0.95 : 0.88) : 0;
                          textOpacity = isGroupActive ? (isActive ? 0.95 : 0.88) : 0;
                        }
                        
                        // Don't render if completely hidden
                        if (bubbleOpacity === 0) return null;
                        
                        return (
                          <motion.g
                            key={a.id}
                            onClick={() => {
                              // Toggle: deselect if clicking the same active
                              setActiveId(activeId === a.id ? '' : a.id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                // Toggle: deselect if pressing Enter on the same active
                                setActiveId(activeId === a.id ? '' : a.id);
                              }
                            }}
                            style={{ 
                              cursor: 'pointer',
                              outline: 'none',
                              border: 'none'
                            }}
                            tabIndex={0}
                            role="button"
                            aria-label={`Select ${a.name}`}
                            className="focus-visible:outline-none focus-visible:ring-0"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{
                              opacity: bubbleOpacity,
                              scale: isActive ? 1.15 : 1
                            }}
                            transition={{ 
                              duration: 0.3, 
                              ease: 'easeOut'
                            }}
                          >
                            {/* Bubble with white glow for active state - no border box */}
                            <circle 
                              cx={a.x} 
                              cy={a.y} 
                              r={2.8} 
                              fill={groupColor} 
                              opacity={bubbleOpacity}
                              filter={isActive ? "url(#glowActive)" : (activeId && activeId !== '' && a.group !== activeGroup && isGroupActive ? "url(#glowDimmed)" : "url(#glow)")}
                              stroke="none"
                              style={{
                                outline: 'none',
                                boxShadow: 'none',
                                WebkitTapHighlightColor: 'transparent'
                              }}
                            />
                            {/* Text label with group-specific colors */}
                            {/* Text shadow for white text on colored backgrounds */}
                            {groupTextColor === '#ffffff' && textOpacity > 0.5 && (
                              <text 
                                x={a.x + 3.2} 
                                y={a.y + 1.1} 
                                fontSize={2.3} 
                                fill="#000000"
                                opacity={textOpacity * 0.5}
                                style={{ fontWeight: isActive ? 'bold' : '600' }}
                              >
                                {a.name}
                              </text>
                            )}
                            {/* Main text - bright white when active, group color otherwise */}
                            {textOpacity > 0.25 && (
                              <text 
                                x={a.x + 3.2} 
                                y={a.y + 1.1} 
                                fontSize={isActive ? 2.4 : 2.3} 
                                fill={isActive ? '#ffffff' : (textOpacity < 0.5 ? '#888888' : groupTextColor)}
                                opacity={isActive ? 1.0 : textOpacity}
                                style={{ 
                                  fontWeight: isActive ? 'bold' : '600',
                                  filter: isActive ? 'drop-shadow(0 0 2px rgba(255,255,255,0.8))' : 'none'
                                }}
                              >
                                {a.name}
                              </text>
                            )}
                            {/* Connection line when active */}
                            {isActive && (
                              <line 
                                x1={a.x} 
                                y1={a.y} 
                                x2={a.x} 
                                y2={56} 
                                stroke={groupColor} 
                                strokeWidth={0.8}
                                opacity={bubbleOpacity}
                              />
                            )}
                          </motion.g>
                        );
                      })}
                    </g>
                  </svg>

                  {/* corner hint - panning disabled */}
                  <div className={`absolute left-3 bottom-3 text-[11px] ${mutedTextColor} ${cardBg} px-2 py-1 rounded-full border ${themeDark ? 'border-nfe-gold/20' : 'border-nfe-green/20'}`}>
                    Scroll to zoom
                  </div>
                </div>
              </div>

              {/* DETAILS PANEL */}
              <div>
                <Card className={`rounded-2xl ${cardBg} backdrop-blur-xl p-6`}>
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className={`flex items-center gap-2 ${textColor}`}>
                      <FlaskConical className="h-5 w-5" />
                      {active ? active.name : 'Select an active'}
                    </CardTitle>
                    <CardDescription className={mutedTextColor}>
                      Layer focus: <span className="font-semibold">{active?.layer || '-'}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {active ? (
                      <div className={`space-y-3 text-sm ${textColor}`}>
                        <div className={`rounded-xl border ${themeDark ? 'border-nfe-gold/20' : 'border-nfe-green/20'} p-3 ${cardBg}`}>
                          <div className={`text-xs uppercase tracking-wide ${mutedTextColor}`}>Targets</div>
                          <div className="mt-1">{active.targets.join(', ')}</div>
                        </div>
                        <div className={`rounded-xl border ${themeDark ? 'border-nfe-gold/20' : 'border-nfe-green/20'} p-3 ${cardBg}`}>
                          <div className={`text-xs uppercase tracking-wide ${mutedTextColor}`}>Roles (claims‑safe)</div>
                          <div className="mt-1">{active.roles.join(' • ')}</div>
                        </div>
                        <div className={`rounded-xl border ${themeDark ? 'border-nfe-gold/20' : 'border-nfe-green/20'} p-3 ${cardBg}`}>
                          <div className={`text-xs uppercase tracking-wide ${mutedTextColor}`}>Mechanism (cosmetic)</div>
                          <div className="mt-1">{active.mech}</div>
                        </div>
                        <Separator className={`my-3 ${themeDark ? 'bg-nfe-gold/20' : 'bg-nfe-green/20'}`} />
                        <div className={`text-xs ${mutedTextColor} flex items-start gap-2`}>
                          <Info className="h-3.5 w-3.5 mt-0.5" />
                          Melanated skin often has larger, more persistent melanosomes with even distribution; consistent SPF and gentle tone‑support actives help maintain an even look. Educational visualization only; not a medical claim.
                        </div>
                      </div>
                    ) : (
                      <div className={`text-sm ${mutedTextColor}`}>Tap a pin in the diagram to see details.</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* INDEX + TESTS */}
        <Card className={`rounded-3xl mt-6 ${cardBg} backdrop-blur-xl p-6`}>
          <CardHeader className="p-0 mb-4">
            <CardTitle className={`${textColor} flex items-center gap-2`}>
              <Sparkles className="h-5 w-5" /> Actives Index
            </CardTitle>
            <CardDescription className={mutedTextColor}>
              Filter and export for clinician decks, retail sell‑in, and education.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((a) => (
                <div
                  key={a.id}
                  className={`rounded-xl border ${themeDark ? 'border-nfe-gold/20' : 'border-nfe-green/20'} p-3 ${cardBg} transition-all duration-150 ease-in-out cursor-pointer ${
                    activeId === a.id
                      ? 'ring-2 ring-nfe-gold shadow-lg shadow-nfe-gold/40'
                      : 'hover:bg-nfe-green/10'
                  }`}
                  onClick={() => setActiveId(a.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveId(a.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${a.name}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-medium ${textColor}`}>{a.name}</div>
                      <div className={`text-xs ${mutedTextColor}`}>
                        {a.layer} • <span className="opacity-80">{GROUPS[a.group as keyof typeof GROUPS].label}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveId(a.id);
                      }}
                      aria-label={`Locate ${a.name} on map`}
                    >
                      Locate
                    </Button>
                  </div>
                  <div className={`text-xs mt-2 ${mutedTextColor}`}>{a.roles.join(' • ')}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" aria-label="Export as PNG">
                Export PNG
              </Button>
              <Button variant="outline" size="sm" aria-label="Export as PDF">
                Export PDF
              </Button>
            </div>

            {/* Self-tests removed - data validation now handled by JSON schema */}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
