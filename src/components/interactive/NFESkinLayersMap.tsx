import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

// --- START: Mocked Shadcn Components for Canvas Environment ---
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={`p-4 rounded-xl ${className || ''}`}>{children}</div>;
const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={`mb-3 ${className || ''}`}>{children}</div>;
const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => <h3 className={`text-xl font-semibold ${className || ''}`}>{children}</h3>;
const CardDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => <p className={`text-sm ${className || ''}`}>{children}</p>;
const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={`space-y-4 ${className || ''}`}>{children}</div>;
const Badge = ({ children, className, variant }: { children: React.ReactNode; className?: string; variant?: string }) => <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${className || ''} ${variant === 'secondary' ? 'bg-white/10 border border-white/20' : ''}`}>{children}</span>;
const Checkbox = ({ id, checked, onCheckedChange }: { id?: string; checked?: boolean; onCheckedChange?: (checked: boolean) => void }) => <input type="checkbox" id={id} checked={checked} onChange={(e) => onCheckedChange?.(e.target.checked)} className="h-4 w-4 rounded text-cyan-500 bg-white/10 border-white/30 focus:ring-cyan-500" />;
const Input = ({ className, placeholder, value, onChange }: { className?: string; placeholder?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) => <input type="text" placeholder={placeholder} value={value} onChange={onChange} className={`p-2 rounded-lg ${className || ''}`} />;
const Button = ({ children, className, onClick, size, variant = 'default' }: { children: React.ReactNode; className?: string; onClick?: () => void; size?: string; variant?: string }) => <button onClick={onClick} className={`flex items-center justify-center p-2 rounded-lg font-medium transition-colors ${className || ''} ${size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2'} ${variant === 'secondary' ? 'bg-white/10 border border-white/20 hover:bg-white/20' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>{children}</button>;
const TooltipProvider = ({ children }: { children: React.ReactNode }) => <div>{children}</div>; // Tooltip is hard to mock fully, keeping simple container
const Tooltip = ({ children }: { children: React.ReactNode }) => <div>{children}</div>; 
const TooltipTrigger = ({ children }: { children: React.ReactNode }) => <span>{children}</span>;
const TooltipContent = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={`hidden ${className || ''}`}>{children}</div>; // Hidden as full tooltip not functional
const Separator = ({ className }: { className?: string }) => <div className={`h-px bg-white/10 ${className || ''}`} />;

// Mock Icons
const Info = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const Droplet = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v8M21 14v8M3 14v8"/></svg>;
const Shield = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.618a8.995 8.995 0 011.378 3.659M18.88 7.12a8.995 8.995 0 01-1.378-3.659M3.702 7.12A8.995 8.995 0 012.324 3.461M5.12 7.12a8.995 8.995 0 01-1.378 3.659"/></svg>;
const Sparkles = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3s1 0 2 1M19 3s-1 0-2 1M12 21s1 0 2-1M3 12h1m16 0h1M7 7l1 1m8 8l1 1M7 17l1-1m8-8l1-1"/></svg>;
const FlaskConical = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18V5M7 11h10M4 19h16"/></svg>;
const Leaf = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.87 6.072 7 8.14 7 11v3.159c0 .538-.214 1.055-.595 1.436L5 17h5m-2 0h6"/></svg>;
const Scale = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>;
// --- END: Mocked Shadcn Components ---


/**
 * UPDATED to reflect NFE Face Elixir — Master Formula v8.5‑KD (Kojic Dipalmitate 2.0%) and removal of Palmitoyl Tripeptide‑5.
 * Sources: client master formula v8.5‑KD 2025‑11‑03.
 */

// ---- ACTIVES DATA (Face & Body) ----
// layer options: "Stratum Corneum", "Epidermis", "Dermis", "Hypodermis"
const FACE_ACTIVES = [
  { name: "HA 4D", layer: "Stratum Corneum", roles: ["Hydration network", "Water binding"], category: "Humectant" },
  { name: "Glycerin", layer: "Stratum Corneum", roles: ["Draws moisture", "Softens feel"], category: "Humectant" },
  { name: "γ‑PGA", layer: "Stratum Corneum", roles: ["Film‑forming hydration", "Elastic feel"], category: "Humectant" },
  { name: "Panthenol", layer: "Epidermis", roles: ["Soothing", "Barrier support"], category: "Vitamin" },
  { name: "Ceramides", layer: "Stratum Corneum", roles: ["Lipid matrix", "Reduce TEWL"], category: "Barrier" },
  { name: "Cholesterol", layer: "Stratum Corneum", roles: ["Lamellar balance", "Barrier resilience"], category: "Barrier" },
  { name: "Squalane", layer: "Stratum Corneum", roles: ["Emollient", "Slip & comfort"], category: "Emollient" },
  { name: "Niacinamide (5%)", layer: "Epidermis", roles: ["Barrier lipids", "Tone‑even look"], category: "Vitamin" },
  { name: "Tranexamic Acid (3%)", layer: "Epidermis", roles: ["Tone support", "Even‑looking complexion"], category: "Tone" },
  { name: "Alpha‑Arbutin (2%)", layer: "Epidermis", roles: ["Tone support", "Spot appearance"], category: "Tone" },
  { name: "Kojic Dipalmitate (2%)", layer: "Epidermis", roles: ["Tone support", "Brightened look"], category: "Tone" },
  { name: "Licorice Root", layer: "Epidermis", roles: ["Calm look of redness", "Tone support"], category: "Botanical" },
  { name: "Centella asiatica", layer: "Dermis", roles: ["Comfort", "Collagen‑friendly environment"], category: "Botanical" },
  { name: "THD Ascorbate (Vit C 5.21%)", layer: "Dermis", roles: ["Antioxidant", "Brightened look"], category: "Antioxidant" },
  { name: "Ferulic + Tocopherols (1.56%)", layer: "Epidermis", roles: ["Antioxidant network", "Lipid protection"], category: "Antioxidant" },
  { name: "CoQ10", layer: "Epidermis", roles: ["Lipid antioxidant", "Comfort"], category: "Antioxidant" },
  { name: "Bakuchiol", layer: "Dermis", roles: ["Smooth look", "Elastic feel"], category: "Retinol‑alt" },
  { name: "GHK‑Cu (Copper Peptide)", layer: "Dermis", roles: ["Firm, smooth look", "Repair feel"], category: "Peptide" },
  { name: "Argireline® (1.0% Active)", layer: "Epidermis", roles: ["Relaxed look of lines"], category: "Peptide" },
  { name: "Ectoin (2%)", layer: "Epidermis", roles: ["Osmolyte stress‑shield", "Hydration stability"], category: "Osmolyte" },
  { name: "Hydrophobic Silica (3µm)", layer: "Epidermis", roles: ["Soft‑focus finish", "Velvety feel"], category: "Finish" },
  { name: "Berry CO₂ extract (0.05%)", layer: "Epidermis", roles: ["Antioxidant comfort", "Botanical defense"], category: "Botanical" },
];

const BODY_ACTIVES = [
  { name: "Niacinamide", layer: "Epidermis", roles: ["Barrier support", "Tone support"], category: "Vitamin" },
  { name: "Licorice Root", layer: "Epidermis", roles: ["Calm appearance", "Tone support"], category: "Botanical" },
  { name: "CoQ10 (solubilized)", layer: "Epidermis", roles: ["Antioxidant"], category: "Antioxidant" },
  { name: "Bakuchiol (body)", layer: "Dermis", roles: ["Smooth look"], category: "Retinol‑alt" },
  { name: "Ceramides + Emollients", layer: "Stratum Corneum", roles: ["Barrier wealth"], category: "Barrier" },
  { name: "HA 4D + Silk AAs", layer: "Stratum Corneum", roles: ["Hydration matrix"], category: "Humectant" },
];


export default function NFESkinLayersMap() {
  const [showBody, setShowBody] = useState(false);
  const [query, setQuery] = useState("");

  const actives = useMemo(() => (showBody ? [...FACE_ACTIVES, ...BODY_ACTIVES] : FACE_ACTIVES), [showBody]);
  
  const filtered = useMemo(
    () =>
      actives.filter(
        (a) =>
          a.name.toLowerCase().includes(query.toLowerCase()) ||
          a.roles.join(" ").toLowerCase().includes(query.toLowerCase()) ||
          a.category.toLowerCase().includes(query.toLowerCase())
      ),
    [actives, query]
  );

  return (
    <TooltipProvider>
      {/* GLOBAL DARK MODE CONTAINER */}
      <div className="min-h-screen w-full font-sans dark text-slate-100" data-testid="skin-layers-map">
        
        {/* Neon gradient scene background */}
        <div className="fixed inset-0 -z-10 bg-slate-900">
          <div className="absolute inset-0 opacity-70" style={{
            background: "radial-gradient(60% 60% at 70% 20%, rgba(34,211,238,0.35) 0%, rgba(59,130,246,0.25) 40%, rgba(236,72,153,0.2) 70%, rgba(2,6,23,0.9) 100%)"
          }}/>
          <div className="absolute inset-0 bg-[radial-gradient(transparent_1px,rgba(2,6,23,0.9)_1px)] [background-size:16px_16px] opacity-20"/>
        </div>

        <div className="mx-auto max-w-7xl p-4 md:p-8">
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
              <p className="mt-1 text-sm md:text-base text-slate-300">
                Data layer supporting the main map, updated to reflect the <b>Master Formula v8.5‑KD</b>.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge className="rounded-2xl bg-emerald-500/90 text-emerald-50">EU‑Standard Safety</Badge>
                <Badge variant="secondary" className="rounded-2xl text-slate-100">Layered Care: Protect → Treat → Nourish</Badge>
                <Badge variant="secondary" className="rounded-2xl border-amber-400/60 text-yellow-300"><Scale className="h-3.5 w-3.5 mr-1"/>Allergen‑Transparent</Badge>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-3">
              <div className="flex items-center gap-3">
                <Checkbox id="bodyToggle" checked={showBody} onCheckedChange={(v)=>setShowBody(!!v)} />
                <label htmlFor="bodyToggle" className="text-sm text-slate-300">Show Body Elixir actives</label>
              </div>
              <Input 
                className="w-64 bg-white/10 border-white/20 text-white placeholder:text-slate-300" 
                placeholder="Search actives, roles, category…" 
                value={query} 
                onChange={(e)=>setQuery(e.target.value)} 
              />
            </div>
          </div>

          {/* Diagram + Legend */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Layered Diagram */}
            <Card className="rounded-3xl lg:col-span-2 overflow-hidden bg-white/5 border-white/10 backdrop-blur-xl shadow-[0_0_1px_1px_rgba(255,255,255,0.05)] p-0">
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
                        <Tooltip>
                          <TooltipTrigger><Info className="h-4 w-4 text-slate-400"/></TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs">Educational visualization only; cosmetic mechanisms (hydration, barrier, antioxidant, tone‑support).</TooltipContent>
                        </Tooltip>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {filtered.filter(a => a.layer === layer).map((a, i) => (
                          <Tooltip key={a.name+"-"+i}>
                            <TooltipTrigger>
                              <div className="group rounded-xl border border-white/10 bg-white/5 px-3 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors">
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-pink-500/90 text-white text-xs"><FlaskConical className="h-3.5 w-3.5"/></span>
                                <div className="truncate">
                                  <div className="text-sm font-medium truncate text-slate-100">{a.name}</div>
                                  <div className="text-[11px] text-slate-300 truncate">{a.category}</div>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <div className="text-sm font-medium mb-1">{a.name}</div>
                              <div className="text-[12px] text-slate-300">{a.roles.join(" • ")}</div>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                        {filtered.filter(a => a.layer === layer).length === 0 && (
                          <div className="text-xs text-slate-500 italic">No matching actives in this layer.</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Legend & Claims-Safe Notes */}
            <Card className="rounded-3xl overflow-hidden bg-white/5 border-white/10 backdrop-blur-xl shadow-[0_0_1px_1px_rgba(255,255,255,0.05)] p-0">
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-100"><Droplet className="h-5 w-5"/> Active Categories</CardTitle>
                <CardDescription className="text-slate-300">Groupings for quick education (non‑therapeutic claims).</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pt-0 pb-6">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    {label: "Humectant", desc: "Bind water for surface hydration"},
                    {label: "Barrier", desc: "Support lipid matrix & comfort"},
                    {label: "Emollient", desc: "Slip, softness, cushion"},
                    {label: "Tone", desc: "Support a more even look"},
                    {label: "Peptide", desc: "Signal smoother, bouncier feel"},
                    {label: "Antioxidant", desc: "Defend against oxidative stress"},
                    {label: "Botanical", desc: "Calm & nurture"},
                    {label: "Osmolyte", desc: "Help balance moisture under stress"},
                    {label: "Finish", desc: "Soft‑focus optics"},
                  ].map((c) => (
                    <div key={c.label} className="rounded-xl border border-white/10 p-3 bg-white/5">
                      <div className="font-medium text-slate-100">{c.label}</div>
                      <div className="text-xs text-slate-400">{c.desc}</div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4 bg-white/10"/>
                <div className="text-xs text-slate-400 space-y-2">
                  <div className="flex items-start gap-2"><Sparkles className="h-3.5 w-3.5 mt-0.5 text-cyan-300"/>This map is educational. Effects reflect cosmetic mechanisms and do not diagnose, treat, or cure conditions.</div>
                  <div className="flex items-start gap-2"><Leaf className="h-3.5 w-3.5 mt-0.5 text-emerald-300"/>EU‑aligned safety: allergen‑transparent INCI labeling; phenoxyethanol ≤ 1.0% in finished product.</div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" className="bg-white/10 border-white/20 text-white">Export PNG</Button>
                  <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">Export PDF</Button>
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
    </TooltipProvider>
  );
}
