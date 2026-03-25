import React, { useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, MoonStar, Clock, Crown, User, RefreshCw, Sparkles, Tv } from "lucide-react";
import { CloseButton } from "@/components/close-button";
import { useTarot, type TarotCard, type TarotResponse } from "@/hooks/use-tarot";
import { useSharedCredits } from "@/contexts/credits-context";
import { usePremium } from "@/hooks/use-premium";
import { useAd } from "@/hooks/use-ad";

/* ─────────────────── Stars (mirrors home.tsx StarField) ─────────────────── */
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
          style={{
            top: `${s.top}%`, left: `${s.left}%`,
            width: s.size, height: s.size,
            opacity: s.opacity,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
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

/* ─────────────────── Position config ─────────────────── */
const POSITION_CONFIG: Record<string, { symbol: string; color: string; glow: string }> = {
  past:    { symbol: "☽", color: "#c084fc", glow: "rgba(192,132,252,0.55)" },
  present: { symbol: "✦", color: "#fbbf24", glow: "rgba(251,191,36,0.55)"  },
  future:  { symbol: "☀", color: "#fb923c", glow: "rgba(251,146,60,0.55)"  },
};

/* ─────────────────── Single tarot card ─────────────────── */
function TarotCardFace({ card, index }: { card: TarotCard; index: number }) {
  const cfg = POSITION_CONFIG[card.position] ?? POSITION_CONFIG.present;
  return (
    <motion.div
      key={card.name}
      initial={{ rotateY: 180, opacity: 0, y: 12 }}
      animate={{ rotateY: 0,   opacity: 1, y: 0  }}
      transition={{ delay: index * 0.28, duration: 0.55, type: "spring", stiffness: 260, damping: 22 }}
      style={{ perspective: 700 }}
      className="flex flex-col items-center gap-2 flex-1"
    >
      {/* Position label */}
      <p className="font-display text-[10px] tracking-[0.18em] uppercase"
        style={{ color: cfg.color, textShadow: `0 0 10px ${cfg.glow}` }}>
        {card.positionLabel}
      </p>

      {/* Card body */}
      <div className="w-full rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, rgba(32,8,68,0.95) 0%, rgba(18,4,44,0.92) 100%)",
          border: `1px solid ${cfg.color}55`,
          boxShadow: `0 0 18px ${cfg.glow.replace("0.55", "0.22")}, 0 6px 20px rgba(0,0,0,0.55)`,
          minHeight: 148,
        }}>
        {/* Shimmer top line */}
        <div className="h-px w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}88, transparent)` }} />

        <div className="flex flex-col items-center justify-between px-2 py-3 h-full" style={{ minHeight: 140 }}>
          {/* Large symbol */}
          <motion.p
            animate={{ opacity: [0.75, 1, 0.75] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", delay: index * 0.4 }}
            className="text-3xl mt-2"
            style={{ color: cfg.color, textShadow: `0 0 18px ${cfg.glow}, 0 0 36px ${cfg.glow.replace("0.55","0.25")}` }}
          >
            {cfg.symbol}
          </motion.p>

          {/* Divider */}
          <div className="w-3/4 h-px my-1"
            style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}44, transparent)` }} />

          {/* Card name */}
          <p className="font-display text-[9px] tracking-wide text-center leading-snug px-1 pb-1"
            style={{ color: `${cfg.color}cc` }}>
            {card.name}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────── Face-down placeholder (loading) ─────────────────── */
function TarotCardBack({ index }: { index: number }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2 flex-1"
      animate={{ opacity: [0.5, 0.85, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.8, delay: index * 0.3, ease: "easeInOut" }}
    >
      <p className="font-display text-[10px] tracking-[0.18em] uppercase"
        style={{ color: "rgba(251,191,36,0.35)" }}>
        {["Geçmiş", "Şimdi", "Gelecek"][index]}
      </p>
      <div className="w-full rounded-2xl overflow-hidden" style={{ minHeight: 148,
        background: "linear-gradient(160deg, rgba(28,8,60,0.90) 0%, rgba(16,4,40,0.88) 100%)",
        border: "1px solid rgba(251,191,36,0.14)",
      }}>
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.20), transparent)" }} />
        <div className="flex items-center justify-center" style={{ minHeight: 140 }}>
          <p className="text-2xl" style={{ color: "rgba(251,191,36,0.25)" }}>✦</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────── Bottom nav item ─────────────────── */
function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 flex-1 pt-3 pb-5 relative"
      style={{ WebkitTapHighlightColor: "transparent" }}>
      <span style={{ color: active ? "#fbbf24" : "rgba(255,255,255,0.3)", filter: active ? "drop-shadow(0 0 6px rgba(251,191,36,0.5))" : "none" }}>
        {icon}
      </span>
      <span className="text-[10px] font-sans tracking-wide"
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
export default function Tarot() {
  const [, navigate] = useLocation();
  const { mutate, isPending, data, error, reset } = useTarot();
  const { credits, spendCredit, addCreditFromAd, adRewardLimitReached } = useSharedCredits();
  const { isPremium } = usePremium();
  const { adState, showAd } = useAd();

  type Phase = "idle" | "awaiting_ad" | "result";
  const [phase, setPhase] = useState<Phase>("idle");
  const resultRef = useRef<TarotResponse | null>(null);

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

  const handleDraw = () => {
    setPhase("idle");
    mutate(undefined, {
      onSuccess: (data) => {
        resultRef.current = data;
        setPhase("awaiting_ad");
      },
      onError: () => setPhase("idle"),
    });
  };

  const handleReset = () => {
    reset();
    resultRef.current = null;
    setPhase("idle");
  };

  return (
    <div className="min-h-screen flex flex-col items-center"
      style={{ background: "linear-gradient(170deg, #1c0840 0%, #150930 30%, #0e0622 60%, #090318 100%)" }}>
      <StarField />
      <CloseButton
        visible={phase === "result"}
        onClose={() => { handleReset(); navigate("/"); }}
      />

      <div className="relative z-10 w-full max-w-[390px] flex flex-col min-h-screen">

        {/* ── Header ── */}
        <div className="pt-safe-top pt-10 pb-4 px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="w-4 h-4" style={{ color: "rgba(251,191,36,0.55)" }} strokeWidth={1.5} />
              <h1 className="font-display text-[22px] tracking-[0.22em] uppercase"
                style={{ color: "#fbbf24", textShadow: "0 0 24px rgba(251,191,36,0.55), 0 0 48px rgba(251,191,36,0.20)" }}>
                Tarot Falı
              </h1>
              <Sparkles className="w-4 h-4" style={{ color: "rgba(251,191,36,0.55)" }} strokeWidth={1.5} />
            </div>
            <p className="font-serif text-[12px] tracking-widest"
              style={{ color: "rgba(251,191,36,0.40)" }}>
              GEÇMİŞ · ŞİMDİ · GELECEK
            </p>
          </motion.div>
        </div>

        {/* ── Divider ── */}
        <div className="mx-8 h-px mb-6"
          style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.30), transparent)" }} />

        {/* ── Main content ── */}
        <div className="flex-1 px-5 pb-4 space-y-5">

          {/* 3 cards row */}
          <div className="flex gap-2.5">
            {(isPending || phase === "awaiting_ad")
              ? [0, 1, 2].map(i => <TarotCardBack key={i} index={i} />)
              : (phase === "result" && resultRef.current)
                ? resultRef.current.cards.map((card, i) => <TarotCardFace key={card.position} card={card} index={i} />)
                : [0, 1, 2].map(i => (
                    /* Idle placeholder cards */
                    <div key={i} className="flex flex-col items-center gap-2 flex-1">
                      <p className="font-display text-[10px] tracking-[0.18em] uppercase"
                        style={{ color: "rgba(251,191,36,0.25)" }}>
                        {["Geçmiş", "Şimdi", "Gelecek"][i]}
                      </p>
                      <div className="w-full rounded-2xl" style={{
                        minHeight: 148,
                        background: "linear-gradient(160deg, rgba(22,6,50,0.80) 0%, rgba(12,4,30,0.78) 100%)",
                        border: "1px solid rgba(251,191,36,0.10)",
                      }}>
                        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.10), transparent)" }} />
                        <div className="flex items-center justify-center" style={{ minHeight: 140 }}>
                          <p className="text-xl" style={{ color: "rgba(251,191,36,0.12)" }}>✦</p>
                        </div>
                      </div>
                    </div>
                  ))
            }
          </div>

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
                      Yıldızlar senin için mesajını hazırladı.{"\n"}Görmek için kısa bir reklam izle.
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

          {/* ── Interpretation card ── */}
          <AnimatePresence>
            {phase === "result" && resultRef.current && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.9, duration: 0.50, ease: "easeOut" }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, rgba(34,10,72,0.92) 0%, rgba(20,6,44,0.88) 100%)",
                  border: "1px solid rgba(251,191,36,0.28)",
                  boxShadow: "0 0 22px rgba(109,40,217,0.24), 0 6px 20px rgba(0,0,0,0.50)",
                  backdropFilter: "blur(14px)",
                }}
              >
                <div className="h-px w-full"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.42), transparent)" }} />
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span style={{ color: "#fbbf24", textShadow: "0 0 10px rgba(251,191,36,0.65)", fontSize: 15 }}>✦</span>
                    <span className="font-display text-xs tracking-[0.16em] uppercase"
                      style={{ color: "#fcd34d", textShadow: "0 0 12px rgba(251,191,36,0.45)" }}>
                      Kartların Yorumu
                    </span>
                  </div>
                  <p className="font-serif text-[13.5px] leading-relaxed whitespace-pre-wrap"
                    style={{ color: "rgba(255,255,255,0.88)" }}>
                    {resultRef.current.interpretation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Error ── */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center font-serif text-sm"
                style={{ color: "rgba(248,113,113,0.80)" }}>
                {(error as Error).message}
              </motion.p>
            )}
          </AnimatePresence>

          {/* ── CTA button ── */}
          <div className="pt-1">
            {phase === "awaiting_ad" ? null
              : outOfCredits ? (
              /* No-credits gate */
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
            ) : phase === "result" ? (
              /* "Draw again" button */
              <button
                onClick={() => { handleReset(); handleDraw(); }}
                disabled={isPending}
                className="w-full py-4 rounded-2xl font-display text-[15px] tracking-[0.18em] uppercase transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-50"
                style={{
                  background: "linear-gradient(90deg, #7c3aed 0%, #a855f7 45%, #7c3aed 100%)",
                  color: "#fff",
                  boxShadow: "0 0 36px rgba(139,92,246,0.50), 0 4px 18px rgba(109,40,217,0.30)",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <RefreshCw className="w-4 h-4" strokeWidth={2} />
                Yeni Okuma
              </button>
            ) : (
              /* Initial "draw cards" button */
              <button
                onClick={handleDraw}
                disabled={isPending}
                className="w-full py-[18px] rounded-2xl font-display text-[16px] tracking-[0.18em] uppercase transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-60"
                style={{
                  background: isPending
                    ? "rgba(251,191,36,0.12)"
                    : "linear-gradient(90deg, #d97706 0%, #fcd34d 40%, #f59e0b 75%, #d97706 100%)",
                  color: isPending ? "rgba(251,191,36,0.45)" : "#1a0500",
                  boxShadow: isPending
                    ? "none"
                    : "0 0 48px rgba(251,191,36,0.60), 0 0 24px rgba(255,140,0,0.40), 0 4px 22px rgba(251,191,36,0.28)",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <Layers className="w-5 h-5" strokeWidth={1.5} />
                {isPending ? "Kartlar Okunuyor…" : "Kartları Çek"}
              </button>
            )}
          </div>

        </div>

        {/* ── Fixed bottom nav ── */}
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
