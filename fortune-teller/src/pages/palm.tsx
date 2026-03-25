import React, { useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoonStar, Hand, Clock, Crown, User,
  Image as ImageIcon, RotateCcw, Sparkles, Tv,
} from "lucide-react";
import { CloseButton } from "@/components/close-button";
import { usePalm, type PalmSections, type PalmResponse } from "@/hooks/use-palm";
import { useSharedCredits } from "@/contexts/credits-context";
import { usePremium } from "@/hooks/use-premium";
import { useAd } from "@/hooks/use-ad";

/* ─────────────────── Stars ─────────────────── */
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  top:  ((i * 37 + 13) % 100),
  left: ((i * 61 +  7) % 100),
  size: (i % 3) === 0 ? 2.5 : 1.5,
  dur:  2 + (i % 5),
  delay: (i % 7) * 0.4,
  opacity: 0.22 + (i % 7) * 0.10,
}));

function StarField() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {STARS.map((s) => (
        <span key={s.id} className="absolute rounded-full bg-white animate-pulse"
          style={{ top: `${s.top}%`, left: `${s.left}%`, width: s.size, height: s.size, opacity: s.opacity, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }}
        />
      ))}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[560px] rounded-full"
        style={{ background: "radial-gradient(ellipse at top, rgba(120,50,240,0.48) 0%, rgba(88,20,180,0.22) 45%, transparent 72%)", animation: "mistDrift1 24s ease-in-out infinite" }} />
      <div className="absolute -top-10 -left-16 w-[320px] h-[320px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(109,40,217,0.30) 0%, transparent 68%)", animation: "mistDrift2 19s ease-in-out infinite" }} />
      <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(80,20,140,0.40) 0%, transparent 70%)", animation: "mistDrift3 27s ease-in-out infinite" }} />
      <div className="absolute top-1/2 left-0 w-56 h-56 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.20) 0%, transparent 70%)", animation: "mistDrift4 22s ease-in-out infinite" }} />
    </div>
  );
}

/* ─────────────────── Section config ─────────────────── */
const SECTIONS: Array<{
  key: keyof PalmSections;
  label: string;
  symbol: string;
  color: string;
  glow: string;
}> = [
  { key: "genel",   label: "Genel",   symbol: "✦", color: "#fbbf24", glow: "rgba(251,191,36,0.55)"  },
  { key: "ask",     label: "Aşk",     symbol: "♡", color: "#f472b6", glow: "rgba(244,114,182,0.55)" },
  { key: "kariyer", label: "Kariyer", symbol: "◈", color: "#34d399", glow: "rgba(52,211,153,0.55)"  },
  { key: "gelecek", label: "Gelecek", symbol: "☽", color: "#c084fc", glow: "rgba(192,132,252,0.55)" },
];

/* ─────────────────── Section card ─────────────────── */
function SectionCard({
  label, symbol, color, glow, text, index, loading,
}: { label: string; symbol: string; color: string; glow: string; text?: string; index: number; loading?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: loading ? 0 : 0.12 + index * 0.14, duration: 0.45, ease: "easeOut" }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(30,9,66,0.92) 0%, rgba(18,5,42,0.88) 100%)",
        border: `1px solid ${color}33`,
        boxShadow: `0 0 16px ${glow.replace("0.55","0.16")}, 0 4px 18px rgba(0,0,0,0.45)`,
        backdropFilter: "blur(12px)",
      }}>
      <div className="h-px w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${color}55, transparent)` }} />
      <div className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[13px]" style={{ color, textShadow: `0 0 10px ${glow}` }}>
            {symbol}
          </span>
          <span className="font-display text-[10px] tracking-[0.18em] uppercase"
            style={{ color, textShadow: `0 0 10px ${glow}` }}>
            {label}
          </span>
        </div>
        {loading ? (
          <div className="space-y-1.5">
            {[1, 0.7, 0.5].map((w, i) => (
              <motion.div key={i} className="h-2.5 rounded-full"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.2, ease: "easeInOut" }}
                style={{ width: `${w * 100}%`, background: `${color}30` }}
              />
            ))}
          </div>
        ) : (
          <p className="font-serif text-[13.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.88)" }}>
            {text}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────── Nav item ─────────────────── */
function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 flex-1 pt-3 pb-5 relative"
      style={{ WebkitTapHighlightColor: "transparent" }}>
      <span style={{ color: active ? "#fbbf24" : "rgba(255,255,255,0.3)", filter: active ? "drop-shadow(0 0 6px rgba(251,191,36,0.5))" : "none" }}>
        {icon}
      </span>
      <span className="text-[9px] font-sans tracking-wide"
        style={{ color: active ? "#fbbf24" : "rgba(255,255,255,0.3)" }}>
        {label}
      </span>
      {active && (
        <span className="absolute bottom-3.5 w-1 h-1 rounded-full bg-amber-400"
          style={{ boxShadow: "0 0 6px rgba(251,191,36,0.8)" }} />
      )}
    </button>
  );
}

/* ─────────────────── Page ─────────────────── */
export default function Palm() {
  const [, navigate] = useLocation();
  const { mutate, isPending, data, error, reset } = usePalm();
  const { credits, spendCredit, addCreditFromAd, adRewardLimitReached } = useSharedCredits();
  const { isPremium } = usePremium();
  const { adState, showAd } = useAd();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  type Phase = "idle" | "awaiting_ad" | "result";
  const [phase, setPhase] = useState<Phase>("idle");
  const resultRef = useRef<PalmResponse | null>(null);

  const outOfCredits = !isPremium && credits <= 0;

  const handleEarnCreditAd = () => {
    if (adState !== "idle" || adRewardLimitReached) return;
    showAd({ type: "hak", onRewarded: addCreditFromAd, doneMs: 1500 });
  };

  const handleWatchAd = () => {
    if (adState !== "idle") return;
    showAd({
      type: "fal",
      onRewarded: () => {
        if (!isPremium) spendCredit();
        setPhase("result");
      },
      doneMs: 700,
    });
  };

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    reset();
    resultRef.current = null;
    setPhase("idle");
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleReadPalm() {
    if (!selectedImage) return;
    setPhase("idle");
    mutate({ image: selectedImage }, {
      onSuccess: (data) => {
        resultRef.current = data;
        setPhase("awaiting_ad");
      },
      onError: () => setPhase("idle"),
    });
  }

  function handleReset() {
    reset();
    resultRef.current = null;
    setPhase("idle");
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const canRead = !!selectedImage && !isPending;

  return (
    <div className="min-h-screen flex flex-col items-center"
      style={{ background: "linear-gradient(170deg, #1c0840 0%, #150930 30%, #0e0622 60%, #090318 100%)" }}>
      <StarField />
      <CloseButton
        visible={phase === "result"}
        onClose={() => { handleReset(); navigate("/"); }}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="relative z-10 w-full max-w-[390px] flex flex-col min-h-screen">

        {/* ── Header ── */}
        <div className="pt-safe-top pt-10 pb-4 px-5 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="w-4 h-4" style={{ color: "rgba(251,191,36,0.55)" }} strokeWidth={1.5} />
              <h1 className="font-display text-[22px] tracking-[0.22em] uppercase"
                style={{ color: "#fbbf24", textShadow: "0 0 24px rgba(251,191,36,0.55), 0 0 48px rgba(251,191,36,0.20)" }}>
                El Falı
              </h1>
              <Sparkles className="w-4 h-4" style={{ color: "rgba(251,191,36,0.55)" }} strokeWidth={1.5} />
            </div>
            <p className="font-serif text-[12px] tracking-widest"
              style={{ color: "rgba(251,191,36,0.40)" }}>
              EL ÇİZGİLERİNİN SIRRI
            </p>
          </motion.div>
        </div>

        {/* ── Divider ── */}
        <div className="mx-8 h-px mb-5"
          style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.30), transparent)" }} />

        {/* ── Scrollable content ── */}
        <div className="flex-1 px-5 pb-4 space-y-4 overflow-y-auto">

          {/* Upload / Preview card */}
          <motion.div
            onClick={handleUploadClick}
            whileTap={{ scale: 0.985 }}
            className="rounded-3xl overflow-hidden cursor-pointer"
            style={{
              background: "linear-gradient(150deg, rgba(34,10,72,0.88) 0%, rgba(20,6,46,0.84) 100%)",
              border: "1.5px dashed rgba(251,191,36,0.30)",
              boxShadow: "0 0 32px rgba(109,40,217,0.22), 0 6px 24px rgba(0,0,0,0.50)",
            }}>
            {previewUrl ? (
              /* Image preview */
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="El fotoğrafı"
                  className="w-full object-cover"
                  style={{ maxHeight: 220, objectPosition: "center top" }}
                />
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(9,3,24,0.72) 100%)" }} />
                <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                  <span className="font-display text-[10px] tracking-widest uppercase"
                    style={{ color: "rgba(251,191,36,0.70)" }}>
                    Değiştirmek için dokun
                  </span>
                </div>
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-9 px-4 gap-3">
                <motion.div
                  animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                  className="text-5xl" style={{ filter: "drop-shadow(0 0 16px rgba(251,191,36,0.40))" }}>
                  ✋
                </motion.div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" style={{ color: "rgba(251,191,36,0.50)" }} strokeWidth={1.5} />
                  <span className="font-display text-[11px] tracking-[0.15em] uppercase"
                    style={{ color: "rgba(251,191,36,0.55)" }}>
                    El Fotoğrafı Ekle
                  </span>
                </div>
                <p className="font-serif text-[11.5px] text-center leading-snug"
                  style={{ color: "rgba(255,255,255,0.35)" }}>
                  Avucunun açık fotoğrafını yükle,{"\n"}çizgilerini okuyayım
                </p>
              </div>
            )}
          </motion.div>

          {/* CTA button */}
          {outOfCredits ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl px-5 py-4 flex flex-col items-center gap-3"
              style={{
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.22)",
              }}
            >
              <p className="font-display text-base tracking-wide text-center"
                style={{ color: "#f87171", textShadow: "0 0 12px rgba(239,68,68,0.3)" }}>
                Fal hakkın bitti
              </p>
              {adRewardLimitReached ? (
                <p className="text-xs font-sans text-center"
                  style={{ color: "rgba(255,255,255,0.40)" }}>
                  Bugün reklam izleyerek kazanabileceğin fal hakları bitti.
                </p>
              ) : (
                <>
                  <p className="text-xs font-sans text-center"
                    style={{ color: "rgba(255,255,255,0.35)" }}>
                    Reklam izleyerek yeni bir fal hakkı kazan.
                  </p>
                  <button
                    onClick={handleEarnCreditAd}
                    disabled={adState !== "idle"}
                    className="w-full h-12 rounded-xl flex items-center justify-center gap-2.5 font-sans text-sm font-medium transition-all active:scale-[0.97] disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, rgba(251,191,36,0.20) 0%, rgba(251,191,36,0.12) 100%)",
                      border: "1px solid rgba(251,191,36,0.40)",
                      color: "#fbbf24",
                      boxShadow: "0 0 20px rgba(251,191,36,0.10)",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <Tv className="w-4 h-4" strokeWidth={1.5} />
                    {adState === "watching" ? "Reklam İzleniyor…" : "✨ Fal Hakkı Kazan (Reklam İzle)"}
                  </button>
                </>
              )}
            </motion.div>
          ) : phase === "idle" && (
            <button
              onClick={handleReadPalm}
              disabled={!canRead}
              className="w-full py-[18px] rounded-2xl font-display text-[16px] tracking-[0.18em] uppercase transition-all active:scale-[0.98] flex items-center justify-center gap-2.5"
              style={{
                background: isPending
                  ? "rgba(251,191,36,0.10)"
                  : canRead
                    ? "linear-gradient(90deg, #d97706 0%, #fcd34d 40%, #f59e0b 75%, #d97706 100%)"
                    : "rgba(251,191,36,0.08)",
                color: isPending
                  ? "rgba(251,191,36,0.45)"
                  : canRead
                    ? "#1a0500"
                    : "rgba(251,191,36,0.25)",
                boxShadow: canRead && !isPending
                  ? "0 0 48px rgba(251,191,36,0.60), 0 0 24px rgba(255,140,0,0.40), 0 4px 22px rgba(251,191,36,0.28)"
                  : "none",
                WebkitTapHighlightColor: "transparent",
                cursor: canRead ? "pointer" : "default",
              }}>
              <Hand className="w-5 h-5" strokeWidth={1.5} />
              {isPending ? "Çizgiler Okunuyor…" : "Eline Bak"}
            </button>
          )}

          {/* Loading section cards */}
          {isPending && (
            <>
              {SECTIONS.map((s, i) => (
                <SectionCard key={s.key} label={s.label} symbol={s.symbol} color={s.color} glow={s.glow} index={i} loading />
              ))}
            </>
          )}

          {/* ── Awaiting ad gate ── */}
          <AnimatePresence>
            {phase === "awaiting_ad" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, rgba(34,10,72,0.92) 0%, rgba(20,6,44,0.88) 100%)",
                  border: "1px solid rgba(251,191,36,0.38)",
                  boxShadow: "0 0 28px rgba(109,40,217,0.30), 0 6px 20px rgba(0,0,0,0.50)",
                }}
              >
                <div className="h-px w-full"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.50), transparent)" }} />
                <div className="px-5 py-6 flex flex-col items-center gap-4">
                  <motion.p
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="text-3xl"
                    style={{ filter: "drop-shadow(0 0 14px rgba(251,191,36,0.65))" }}
                  >✨</motion.p>
                  <div className="text-center space-y-1.5">
                    <p className="font-display text-[15px] tracking-[0.18em] uppercase"
                      style={{ color: "#fcd34d", textShadow: "0 0 16px rgba(251,191,36,0.55)" }}>
                      Falın Hazır!
                    </p>
                    <p className="font-serif text-[12.5px] leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.48)" }}>
                      El çizgilerindeki sırlar çözüldü.{"\n"}Görmek için kısa bir reklam izle.
                    </p>
                  </div>
                  <button
                    onClick={handleWatchAd}
                    disabled={adState !== "idle"}
                    className="w-full h-12 rounded-xl flex items-center justify-center gap-2.5 font-sans text-sm font-medium transition-all active:scale-[0.97] disabled:opacity-60"
                    style={{
                      background: adState === "idle"
                        ? "linear-gradient(90deg, #d97706 0%, #fcd34d 40%, #f59e0b 75%, #d97706 100%)"
                        : "rgba(251,191,36,0.12)",
                      color: adState === "idle" ? "#1a0500" : "rgba(251,191,36,0.45)",
                      boxShadow: adState === "idle"
                        ? "0 0 36px rgba(251,191,36,0.45), 0 4px 16px rgba(251,191,36,0.25)"
                        : "none",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <Tv className="w-4 h-4" strokeWidth={1.5} />
                    {adState === "watching" ? "Reklam İzleniyor…" : "✨ Falını Gör (Reklam İzle)"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result */}
          <AnimatePresence>
            {phase === "result" && resultRef.current && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-3">
                {/* Fortune title */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-center pt-1 pb-0.5">
                  <p className="font-display text-[13px] tracking-[0.14em] uppercase"
                    style={{ color: "rgba(251,191,36,0.75)", textShadow: "0 0 18px rgba(251,191,36,0.35)" }}>
                    {resultRef.current.title}
                  </p>
                </motion.div>

                {SECTIONS.map((s, i) => (
                  <SectionCard
                    key={s.key}
                    label={s.label}
                    symbol={s.symbol}
                    color={s.color}
                    glow={s.glow}
                    text={resultRef.current!.sections[s.key]}
                    index={i}
                  />
                ))}

                {/* Try again */}
                <button
                  onClick={handleReset}
                  className="w-full py-4 rounded-2xl font-display text-[13px] tracking-[0.16em] uppercase transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                  style={{
                    background: "rgba(251,191,36,0.08)",
                    border: "1px solid rgba(251,191,36,0.18)",
                    color: "rgba(251,191,36,0.55)",
                    WebkitTapHighlightColor: "transparent",
                  }}>
                  <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                  Yeni Okuma
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center font-serif text-sm py-2"
                style={{ color: "rgba(248,113,113,0.80)" }}>
                {(error as Error).message}
              </motion.p>
            )}
          </AnimatePresence>

        </div>

        {/* ── Bottom nav ── */}
        <div className="sticky bottom-0 left-0 right-0 z-20"
          style={{ background: "rgba(9,3,24,0.90)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(251,191,36,0.10)" }}>
          <div className="flex max-w-[390px] mx-auto">
            <NavItem icon={<MoonStar className="w-5 h-5" strokeWidth={1.5} />} label="Fal"     onClick={() => navigate("/")} />
            <NavItem icon={<Clock    className="w-5 h-5" strokeWidth={1.5} />} label="Geçmiş"  onClick={() => navigate("/gecmis")} />
            <NavItem icon={<Crown    className="w-5 h-5" strokeWidth={1.5} />} label="Premium" onClick={() => navigate("/premium")} />
            <NavItem icon={<User     className="w-5 h-5" strokeWidth={1.5} />} label="Profil"  onClick={() => navigate("/profil")} />
          </div>
        </div>

      </div>
    </div>
  );
}
