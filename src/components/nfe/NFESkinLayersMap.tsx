'use client';

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SimpleInput } from "@/components/ui/SimpleInput";
import { Tooltip } from "@/components/ui/Tooltip";
import { useScience } from '@/context/ScienceContext';
import { initializeActives } from '@/lib/actives';
import { ActiveIngredient } from '@/types/actives';
import { 
  Info, Shield, Sparkles, FlaskConical
} from "lucide-react";


/**
 * UPDATED to reflect NFE Face Elixir — Master Formula v8.5‑KD (Kojic Dipalmitate 2.0%) and removal of Palmitoyl Tripeptide‑5.
 * Sources: client master formula v8.5‑KD 2025‑11‑03.
 */

// ---- ACTIVES DATA (Face & Body) ----
// layer options: "Stratum Corneum", "Epidermis", "Dermis", "Hypodermis"
export default function NFESkinLayersMap({ ingredients }: { ingredients?: any[] }) {
  const [showBody, setShowBody] = useState(false);
  const [query, setQuery] = useState("");

  // Get actives from context (refined by category filters) or fallback to all actives
  const { getRefinedActives } = useScience();
  const contextActives = getRefinedActives();

  const [allActivesLoaded, setAllActivesLoaded] = useState<ActiveIngredient[]>([]);

  useEffect(() => {
    // Load all actives if context is empty
    if (contextActives.length === 0) {
      initializeActives().then(setAllActivesLoaded);
    }
  }, [contextActives]);

  // Use context actives if available, otherwise use loaded actives
  const allActives = useMemo(() => {
    return contextActives.length > 0 ? contextActives : allActivesLoaded;
  }, [contextActives, allActivesLoaded]);

  // Filter by source (Face vs Body) and search query
  const filtered = useMemo(
    () =>
      allActives
        .filter((a) => {
          // Filter by source if showBody toggle is used
          if (showBody) {
            return a.source.includes("Body") || a.source.includes("Face");
          }
          return a.source.includes("Face");
        })
        .filter(
          (a) =>
            a.name.toLowerCase().includes(query.toLowerCase()) ||
            a.roles.join(" ").toLowerCase().includes(query.toLowerCase()) ||
            a.category.toLowerCase().includes(query.toLowerCase())
        ),
    [allActives, showBody, query]
  );

  return (
    <div className="min-h-screen w-full font-sans dark text-slate-100">
        
        {/* Neon gradient scene background */}
        <div className="fixed inset-0 -z-10 bg-slate-900">
          <div 
            className="absolute inset-0 opacity-70" 
            style={{
              background: "radial-gradient(60% 60% at 70% 20%, rgba(34,211,238,0.35) 0%, rgba(59,130,246,0.25) 40%, rgba(236,72,153,0.2) 70%, rgba(2,6,23,0.9) 100%)"
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(transparent_1px,rgba(2,6,23,0.9)_1px)] [background-size:16px_16px] opacity-20"/>
        </div>

        <div className="mx-auto max-w-[90%] md:max-w-6xl p-4 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <motion.h1 
                initial={{opacity:0,y:8}} 
                animate={{opacity:1,y:0}} 
                transition={{duration:0.5}} 
                className="text-3xl md:text-5xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-pink-300"
              >
                NFE Active Ingredient Index
              </motion.h1>
            </div>
            <div className="flex flex-col items-start md:items-end gap-3">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="bodyToggle" 
                  checked={showBody} 
                  onChange={(e)=>setShowBody(e.target.checked)} 
                  className="h-4 w-4 rounded text-cyan-500 bg-white/10 border-white/30 focus:ring-cyan-500" 
                />
                <label htmlFor="bodyToggle" className="text-sm text-slate-300">Show Body Elixir actives</label>
              </div>
              <SimpleInput 
                className="w-64 bg-white/10 border-white/20 text-white placeholder:text-slate-300" 
                placeholder="Search actives, roles, category…" 
                value={query} 
                onChange={(e)=>setQuery(e.target.value)} 
              />
            </div>
          </div>

          {/* Diagram */}
          <div className="w-full">
            {/* Layered Diagram - Full Width */}
            <Card className="rounded-3xl w-full overflow-hidden bg-white/5 border-white/10 backdrop-blur-xl shadow-[0_0_1px_1px_rgba(255,255,255,0.05)] p-0">
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-100"><Shield className="h-5 w-5"/> Biological Cross‑Section</CardTitle>
                <CardDescription className="text-slate-300">Placement is conceptual for educational visualization—actual penetration varies by molecule, vehicle, and routine.</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pt-0 pb-6">
                {/* Visual Layers with Active Pills */}
                <div className="space-y-4">
                  {["Stratum Corneum","Epidermis","Dermis","Hypodermis"].map((layer) => (
                    <div key={layer} className={`relative rounded-xl p-4 md:p-5 border border-white/10 bg-black/30`}>
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-cyan-300">{layer}</div>
                        <Tooltip content="Educational visualization only; cosmetic mechanisms (hydration, barrier, antioxidant, tone‑support).">
                          <Info className="h-4 w-4 text-slate-400 cursor-help"/>
                        </Tooltip>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {filtered.filter(a => a.layer === layer).map((a, i) => {
                          const tooltipContent = (
                            <div>
                              <div className="text-sm font-medium mb-1">{a.name}</div>
                              <div className="text-[12px] text-slate-300">{a.roles.join(" • ")}</div>
                            </div>
                          );
                          return (
                            <Tooltip 
                              key={a.name+"-"+i}
                              content={tooltipContent}
                            >
                              <div className="group rounded-xl border border-white/10 bg-white/5 px-3 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors cursor-help">
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-pink-500/90 text-white text-xs"><FlaskConical className="h-3.5 w-3.5"/></span>
                                <div className="truncate">
                                  <div className="text-sm font-medium truncate text-slate-100">{a.name}</div>
                                  <div className="text-[11px] text-slate-300 truncate">{a.category}</div>
                                </div>
                              </div>
                            </Tooltip>
                          );
                        })}
                        {filtered.filter(a => a.layer === layer).length === 0 && (
                          <div className="text-xs text-slate-500 italic">No matching actives in this layer.</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table of Actives (filtered) */}
          <Card className="rounded-3xl mt-6 bg-white/5 border-white/10 backdrop-blur-xl shadow-[0_0_1px_1px_rgba(255,255,255,0.05)] p-0">
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="text-slate-100">Actives Data Table</CardTitle>
              <CardDescription className="text-slate-300">Search, filter, and share with clinicians/retail buyers.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pt-0 pb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-white/20 text-slate-300">
                      <th className="py-3 pr-2 font-medium">Active</th>
                      <th className="py-3 pr-2 font-medium">Layer</th>
                      <th className="py-3 pr-2 font-medium">Category</th>
                      <th className="py-3 pr-2 font-medium min-w-[200px]">Key Roles (claims‑safe)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => (
                      <tr key={a.name} className="border-b border-white/10 last:border-none hover:bg-white/5 transition-colors">
                        <td className="py-3 pr-2 font-medium text-slate-100">{a.name}</td>
                        <td className="py-3 pr-2 text-slate-300">{a.layer}</td>
                        <td className="py-3 pr-2 text-slate-300">{a.category}</td>
                        <td className="py-3 pr-2 text-slate-400">{a.roles.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}

