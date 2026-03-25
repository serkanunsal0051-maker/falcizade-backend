import React, { useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, MoonStar, Tv, Share2, BookOpen,
  Crown, User, Clock, X, Image as ImageIcon, AlertCircle, Layers, Hand, Star,
} from "lucide-react";
import { useFortune } from "@/hooks/use-fortune";
import { useSharedCredits } from "@/contexts/credits-context";
import { useHistory } from "@/hooks/use-history";
import { useProfile } from "@/hooks/use-profile";
import { useAd } from "@/hooks/use-ad";
import { usePremium } from "@/hooks/use-premium";
import { cn } from "@/lib/utils";
import { StoryPickerModal } from "@/components/story-picker-modal";
import { CloseButton } from "@/components/close-button";

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
          style={{
            top: `${s.top}%`, left: `${s.left}%`,
            width: s.size, height: s.size,
            opacity: s.opacity,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      {/* Top crown glow — main ambient light source, drifts slowly */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[560px] rounded-full"
        style={{
          background: "radial-gradient(ellipse at top, rgba(120,50,240,0.48) 0%, rgba(88,20,180,0.22) 45%, transparent 72%)",
          animation: "mistDrift1 24s ease-in-out infinite",
        }} />
      {/* Secondary top-left mist blob */}
      <div className="absolute -top-10 -left-16 w-[320px] h-[320px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(109,40,217,0.30) 0%, transparent 68%)",
          animation: "mistDrift2 19s ease-in-out infinite",
        }} />
      {/* Bottom-right mist blob */}
      <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(80,20,140,0.40) 0%, transparent 70%)",
          animation: "mistDrift3 27s ease-in-out infinite",
        }} />
      {/* Mid-left soft accent */}
      <div className="absolute top-1/2 left-0 w-56 h-56 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.20) 0%, transparent 70%)",
          animation: "mistDrift4 22s ease-in-out infinite",
        }} />
      {/* Extra pink/violet mid-screen float for depth */}
      <div className="absolute top-[35%] right-[-40px] w-[260px] h-[260px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(168,60,220,0.15) 0%, transparent 65%)",
          animation: "mistDrift2 30s ease-in-out infinite reverse",
        }} />
    </div>
  );
}

/* ─────────────────── Coffee Cup SVG ─────────────────── */
function CoffeeCup({ hasImage, preview, onRemove }: {
  hasImage: boolean; preview: string | null; onRemove: () => void;
}) {
  /* ── Image state ── */
  if (hasImage && preview) {
    return (
      <div className="relative flex items-center justify-center" style={{ width: 172, height: 172 }}>
        <motion.div
          animate={{ opacity: [0.55, 0.92, 0.55] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: "0 0 44px rgba(251,191,36,0.50)" }}
        />
        <div className="absolute rounded-full"
          style={{
            width: 160, height: 160,
            border: "2px solid rgba(251,191,36,0.72)",
            boxShadow: "0 0 28px rgba(251,191,36,0.45), 0 0 56px rgba(251,191,36,0.18), inset 0 0 18px rgba(251,191,36,0.10)",
          }} />
        <div className="relative w-[132px] h-[132px] rounded-full overflow-hidden border-2 border-amber-400/70"
          style={{ boxShadow: "0 0 32px rgba(251,191,36,0.55)" }}>
          <img src={preview} alt="Fincan" className="w-full h-full object-cover opacity-85" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute inset-0 flex items-end justify-center pb-2">
            <button onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-1.5 rounded-full bg-black/60 text-white">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Empty (upload prompt) state ── */
  return (
    <div className="relative flex items-center justify-center" style={{ width: 172, height: 172 }}>

      {/* Layer 0 — soft background atmosphere, pulsing */}
      <motion.div
        animate={{ opacity: [0.42, 0.80, 0.42], scale: [1, 1.07, 1] }}
        transition={{ repeat: Infinity, duration: 3.6, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(251,191,36,0.34) 0%, rgba(120,50,240,0.24) 50%, transparent 74%)",
        }}
      />

      {/* Layer 1 — outer pulse ring */}
      <motion.div
        animate={{ scale: [1, 1.10, 1], opacity: [0.30, 0.70, 0.30] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.4 }}
        className="absolute rounded-full"
        style={{ width: 162, height: 162, border: "1.5px solid rgba(251,191,36,0.60)" }}
      />

      {/* Layer 2 — main gold ring (always visible, glowing) */}
      <div
        className="absolute rounded-full"
        style={{
          width: 150, height: 150,
          border: "2px solid rgba(251,191,36,0.82)",
          boxShadow:
            "0 0 28px rgba(251,191,36,0.55), 0 0 56px rgba(251,191,36,0.22), 0 0 80px rgba(200,100,0,0.12), inset 0 0 20px rgba(251,191,36,0.10)",
          background: "rgba(251,191,36,0.04)",
        }}
      />

      {/* Layer 3 — inner shimmer ring, offset phase from outer */}
      <motion.div
        animate={{ opacity: [0.35, 0.78, 0.35] }}
        transition={{ repeat: Infinity, duration: 2.0, ease: "easeInOut", delay: 1.2 }}
        className="absolute rounded-full"
        style={{ width: 134, height: 134, border: "1px dashed rgba(251,191,36,0.52)" }}
      />

      {/* Layer 4 — floating cup */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
        className="relative z-10"
      >
        {/* overflow="visible" lets steam wisps animate beyond SVG bounds */}
        <svg viewBox="0 0 100 100" width="88" height="88" fill="none"
          style={{ overflow: "visible" }}>

          {/* ── Steam wisp 1 — left ── */}
          <motion.g
            animate={{ y: [0, -10, -20], opacity: [0, 0.72, 0] }}
            transition={{ repeat: Infinity, duration: 2.0, delay: 0, ease: "easeOut" }}
          >
            <path
              d="M33 27 C31 22 36 18 33 13 C30 8 35 4 33 0"
              stroke="rgba(251,191,36,0.75)" strokeWidth="1.7" strokeLinecap="round" fill="none"
            />
          </motion.g>

          {/* ── Steam wisp 2 — centre (tallest) ── */}
          <motion.g
            animate={{ y: [0, -10, -20], opacity: [0, 0.90, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, delay: 0.55, ease: "easeOut" }}
          >
            <path
              d="M50 24 C47 18 53 13 50 8 C47 3 53 -1 50 -5"
              stroke="rgba(251,191,36,0.90)" strokeWidth="2.0" strokeLinecap="round" fill="none"
            />
          </motion.g>

          {/* ── Steam wisp 3 — right ── */}
          <motion.g
            animate={{ y: [0, -10, -20], opacity: [0, 0.72, 0] }}
            transition={{ repeat: Infinity, duration: 1.85, delay: 1.1, ease: "easeOut" }}
          >
            <path
              d="M67 27 C65 22 70 18 67 13 C64 8 69 4 67 0"
              stroke="rgba(251,191,36,0.75)" strokeWidth="1.7" strokeLinecap="round" fill="none"
            />
          </motion.g>

          {/* ── Saucer drop-shadow ── */}
          <ellipse cx="50" cy="87" rx="34" ry="4.5" fill="rgba(0,0,0,0.28)" />

          {/* ── Saucer ── */}
          <ellipse cx="50" cy="84" rx="32" ry="6"
            fill="rgba(100,45,10,0.42)" stroke="rgba(251,191,36,0.52)" strokeWidth="1.3" />
          <path d="M22 84 Q36 80 50 80 Q64 80 78 84"
            stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" fill="none" />

          {/* ── Cup body ── */}
          <path d="M20 40 Q18 70 26 77 Q38 85 50 85 Q62 85 74 77 Q82 70 80 40 Z"
            fill="rgba(68,24,7,0.75)" stroke="rgba(251,191,36,0.58)" strokeWidth="1.4" />

          {/* Cup left-side shine */}
          <path d="M24 44 Q23 63 27 73"
            stroke="rgba(255,255,255,0.09)" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Subtle horizontal band */}
          <path d="M22 58 Q50 55 78 58"
            stroke="rgba(251,191,36,0.13)" strokeWidth="0.8" fill="none" />

          {/* ── Handle — outer stroke ── */}
          <path d="M80 47 Q97 47 97 63 Q97 79 80 79"
            stroke="rgba(251,191,36,0.58)" strokeWidth="1.7" fill="none" strokeLinecap="round" />
          {/* Handle — inner (depth) */}
          <path d="M80 52 Q91 52 91 63 Q91 74 80 74"
            stroke="rgba(251,191,36,0.22)" strokeWidth="1.0" fill="none" strokeLinecap="round" />

          {/* ── Coffee surface ellipse ── */}
          <ellipse cx="50" cy="40" rx="30" ry="8"
            fill="rgba(88,34,7,0.88)" stroke="rgba(251,191,36,0.44)" strokeWidth="1.3" />

          {/* Coffee swirl line 1 */}
          <path d="M36 40 Q43 36 50 40 Q57 44 64 40"
            stroke="rgba(251,191,36,0.34)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          {/* Coffee swirl line 2 */}
          <path d="M41 43 Q47 40 53 43"
            stroke="rgba(251,191,36,0.20)" strokeWidth="1.0" fill="none" strokeLinecap="round" />

          {/* Coffee surface highlight */}
          <ellipse cx="43" cy="37" rx="7" ry="2.5"
            fill="rgba(255,255,255,0.09)" transform="rotate(-8,43,37)" />
        </svg>
      </motion.div>
    </div>
  );
}

/* ─────────────────── Section card (results) ─────────────────── */
function SectionCard({ icon, label, text, delay }: {
  icon: string; label: string; text: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(34,10,72,0.92) 0%, rgba(20,6,44,0.88) 100%)",
        border: "1px solid rgba(251,191,36,0.30)",
        boxShadow:
          "0 0 22px rgba(109,40,217,0.24), 0 6px 20px rgba(0,0,0,0.50), inset 0 1px 0 rgba(251,191,36,0.12)",
        backdropFilter: "blur(14px)",
      }}
    >
      {/* Top shimmer line */}
      <div className="h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.45), transparent)" }} />

      <div className="px-5 py-4">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-base leading-none"
            style={{ color: "#fbbf24", textShadow: "0 0 10px rgba(251,191,36,0.65)" }}>
            {icon}
          </span>
          <span className="font-display text-xs tracking-[0.16em] uppercase"
            style={{ color: "#fcd34d", textShadow: "0 0 12px rgba(251,191,36,0.45)" }}>
            {label}
          </span>
        </div>
        <p className="font-serif text-[13.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.88)" }}>
          {text}
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────── Action pill ─────────────────── */
function ActionPill({ icon, label, badge, onClick, disabled }: {
  icon: React.ReactNode; label: string; badge: string; onClick?: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-left transition-all active:scale-[0.98]",
        disabled && "opacity-40 cursor-not-allowed active:scale-100"
      )}
      style={{
        background: "linear-gradient(135deg, rgba(30,10,62,0.80) 0%, rgba(18,6,40,0.75) 100%)",
        border: "1px solid rgba(251,191,36,0.20)",
        boxShadow: "0 2px 14px rgba(0,0,0,0.40), 0 0 10px rgba(109,40,217,0.14)",
        backdropFilter: "blur(12px)",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span className="text-amber-400 shrink-0"
        style={{ filter: "drop-shadow(0 0 5px rgba(251,191,36,0.50))" }}>{icon}</span>
      <span className="flex-1 text-sm font-sans" style={{ color: "rgba(255,255,255,0.80)" }}>{label}</span>
      <span className="text-[11px] font-bold text-amber-400 px-2.5 py-1 rounded-full"
        style={{
          background: "linear-gradient(90deg, rgba(251,191,36,0.18), rgba(217,119,6,0.14))",
          border: "1px solid rgba(251,191,36,0.35)",
          textShadow: "0 0 8px rgba(251,191,36,0.40)",
        }}>
        {badge}
      </span>
    </button>
  );
}

/* ─────────────────── No-image alert popup ─────────────────── */
function NoImageAlert({ isOpen, onClose, onUpload }: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="nia-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[80]"
            style={{ background: "rgba(5,2,12,0.82)", backdropFilter: "blur(7px)" }}
            onClick={onClose}
          />

          {/* Card */}
          <div className="fixed inset-0 z-[81] flex items-center justify-center px-6 pointer-events-none">
            <motion.div
              key="nia-card"
              initial={{ scale: 0.86, opacity: 0, y: 18 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.90, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="relative w-full pointer-events-auto flex flex-col items-center text-center px-6 py-8 rounded-3xl"
              style={{
                background: "linear-gradient(160deg, #180d38 0%, #0c0520 100%)",
                border: "1px solid rgba(251,191,36,0.28)",
                boxShadow:
                  "0 0 0 1px rgba(109,40,217,0.14), 0 0 56px rgba(109,40,217,0.26), 0 0 24px rgba(251,191,36,0.10)",
              }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <X className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.45)" }} />
              </button>

              {/* Cup icon */}
              <div
                className="mb-4 flex items-center justify-center w-16 h-16 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)",
                  border: "1px solid rgba(251,191,36,0.20)",
                  fontSize: 32,
                }}
              >
                ☕
              </div>

              {/* Title */}
              <p
                className="font-display text-[15px] tracking-[0.06em] mb-2.5"
                style={{
                  color: "#fbbf24",
                  textShadow: "0 0 18px rgba(251,191,36,0.55)",
                }}
              >
                Fincan Fotoğrafı Gerekli
              </p>

              {/* Message */}
              <p
                className="font-serif text-[13px] leading-relaxed mb-7"
                style={{ color: "rgba(255,255,255,0.52)" }}
              >
                Fal bakabilmem için önce fincan fotoğrafını yüklemelisin.
              </p>

              {/* CTA */}
              <button
                onClick={() => { onUpload(); onClose(); }}
                className="w-full py-[14px] rounded-2xl font-display text-[13px] tracking-[0.16em] uppercase active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #b45309 0%, #fbbf24 50%, #b45309 100%)",
                  color: "#1a0500",
                  boxShadow: "0 0 28px rgba(251,191,36,0.38)",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <ImageIcon className="w-4 h-4" />
                Fotoğraf Yükle
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────── Bottom nav item ─────────────────── */
function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 flex-1 pt-3 pb-5 relative"
      style={{ WebkitTapHighlightColor: "transparent" }}>
      <span style={{ color: active ? "#fbbf24" : "rgba(255,255,255,0.3)",
        filter: active ? "drop-shadow(0 0 6px rgba(251,191,36,0.5))" : "none" }}>
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
export default function Home() {
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [showNoImageAlert, setShowNoImageAlert] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // "credit" = watching to earn credit | "fortune" = watching before generating fortune
  const [adContext, setAdContext] = useState<"credit" | "fortune">("credit");
  const [showStoryPicker, setShowStoryPicker] = useState(false);

  const {
    credits,
    adRewardLimitReached,
    shareRewardLimitReached,
    spendCredit,
    addCreditFromAd,
    addCreditFromShare,
  } = useSharedCredits();
  const { history, addToHistory } = useHistory();
  const { profile } = useProfile();
  const { adState, showAd } = useAd();
  const { isPremium } = usePremium();
  const fortuneMutation = useFortune();

  const outOfCredits = !isPremium && credits <= 0;
  const isBusy = fortuneMutation.isPending || adState !== "idle";

  /* ── Fortune generation (called after ad or directly for premium) ── */
  const doGenerateFortune = () => {
    if (!file) return;
    fortuneMutation.mutate(
      { image: file, name: profile?.name, gender: profile?.gender },
      {
        onSuccess: (data) => {
          if (!isPremium) spendCredit();
          addToHistory({ title: data.title, sections: data.sections });
        },
      }
    );
  };

  /* ── Main "Falına Bak" button ── */
  const handleMainButton = () => {
    if (isBusy) return;
    if (!file) { setShowNoImageAlert(true); return; }
    if (outOfCredits) return;

    if (isPremium) {
      doGenerateFortune();
      return;
    }

    // Show rewarded ad FIRST, then generate on reward
    setAdContext("fortune");
    showAd({
      type: "fal",
      onRewarded: doGenerateFortune,
      doneMs: 700, // close quickly so fortune loading shows fast
    });
  };

  /* ── "Reklam İzle" → earn +1 credit ── */
  const handleEarnCreditAd = () => {
    if (adState !== "idle" || adRewardLimitReached) return;
    setAdContext("credit");
    showAd({
      type: "hak",
      onRewarded: addCreditFromAd,
      doneMs: 1500,
    });
  };

  /* ── Share generic invite for +1 credit (home state, before fortune) ── */
  const handleShare = async () => {
    if (shareRewardLimitReached) return;
    const text = "Falcızade ile kahve falıma baktım 🔮";
    try {
      if (navigator.share) {
        await navigator.share({ text });
        addCreditFromShare();
      } else {
        await navigator.clipboard.writeText(text);
        addCreditFromShare();
      }
    } catch {
      // user cancelled — no credit
    }
  };

  /* ── Share actual fortune text for +1 credit (results state) ── */
  const handleShareFortune = async (fortuneData?: typeof fortuneMutation.data) => {
    if (!fortuneData?.sections) return;
    const { sections } = fortuneData;
    const fortuneBody = [sections.ask, sections.para, sections.yol, sections.saglik, sections.genel]
      .filter(Boolean)
      .join("\n\n");
    const text = ["🔮 Falcızade Falım", "", fortuneBody, "", "✨ Falına sen de baktır", "Falcızade"].join("\n");
    try {
      if (navigator.share) {
        await navigator.share({ text });
        if (!shareRewardLimitReached) addCreditFromShare();
      } else {
        await navigator.clipboard.writeText(text);
        if (!shareRewardLimitReached) addCreditFromShare();
      }
    } catch {
      // user cancelled — no credit
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    fortuneMutation.reset();
  };

  const handleReset = () => {
    setFile(null); setPreview(null);
    fortuneMutation.reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const mainButtonLabel = !file
    ? "Falına Bak"
    : fortuneMutation.isPending
      ? "Okunuyor…"
      : "Falına Bak";
  const mainButtonActive = !outOfCredits && !isBusy;

  return (
    <div className="min-h-screen flex flex-col items-center"
      style={{ background: "linear-gradient(170deg, #1c0840 0%, #150930 30%, #0e0622 60%, #090318 100%)" }}>
      <StarField />
      <CloseButton
        visible={fortuneMutation.isSuccess && !!fortuneMutation.data}
        onClose={handleReset}
      />

      <div className="relative z-10 w-full max-w-[390px] flex flex-col min-h-screen">

        <AnimatePresence mode="wait">

          {/* ══════════ STATE: HOME ══════════ */}
          {!fortuneMutation.isPending && !fortuneMutation.isSuccess && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col flex-1 pb-24">

              {/* Header */}
              <div className="pt-14 pb-2 text-center px-5">
                <div className="flex items-center justify-center gap-2.5 mb-1">
                  <MoonStar className="w-5 h-5 text-amber-400" strokeWidth={1.5}
                    style={{ filter: "drop-shadow(0 0 6px rgba(251,191,36,0.5))" }} />
                  <h1 className="font-display text-[26px] tracking-[0.2em] uppercase"
                    style={{ color: "#fbbf24", textShadow: "0 0 30px rgba(251,191,36,0.45)" }}>
                    Falcızade
                  </h1>
                  <Sparkles className="w-5 h-5 text-amber-400" strokeWidth={1.5}
                    style={{ filter: "drop-shadow(0 0 6px rgba(251,191,36,0.5))" }} />
                </div>
                <p className="font-serif italic text-[12px]" style={{ color: "rgba(251,191,36,0.35)" }}>
                  Kahve Falınızı Öğrenin
                </p>
              </div>

              {/* ── Main row: Coffee cup card (left) + right column (Premium + fortune cards) ── */}
              <div className="mx-5 mt-6 flex gap-3 items-stretch">

                {/* Left: Coffee cup card */}
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const id = Date.now();
                    setRipples(prev => [...prev, { id, x, y }]);
                    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 750);
                    if (!file) fileInputRef.current?.click();
                  }}
                  className="relative flex-1 flex flex-col items-center justify-center py-7 rounded-3xl cursor-pointer transition-all active:scale-[0.98] overflow-hidden"
                  style={{
                    background: "linear-gradient(145deg, rgba(60,20,110,0.55), rgba(35,10,80,0.45))",
                    border: "1px solid rgba(251,191,36,0.34)",
                    boxShadow: "0 0 32px rgba(251,191,36,0.12), 0 0 18px rgba(109,40,217,0.18), 0 4px 16px rgba(0,0,0,0.35)",
                  }}
                >
                  {/* Energy ripple on tap */}
                  <AnimatePresence>
                    {ripples.map(r => (
                      <motion.div
                        key={r.id}
                        className="absolute rounded-full pointer-events-none"
                        initial={{ scale: 0, opacity: 0.70 }}
                        animate={{ scale: 7, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.70, ease: "easeOut" }}
                        style={{
                          left: r.x - 22,
                          top: r.y - 22,
                          width: 44,
                          height: 44,
                          background: "radial-gradient(circle, rgba(180,80,255,0.70) 0%, rgba(109,40,217,0.50) 45%, transparent 70%)",
                        }}
                      />
                    ))}
                  </AnimatePresence>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                  <CoffeeCup hasImage={!!file} preview={preview} onRemove={handleReset} />
                  {!file && (
                    <div className="mt-4 text-center px-2 space-y-[3px]">
                      <p className="text-[13px] font-sans font-semibold tracking-wide"
                        style={{
                          color: "#fbbf24",
                          textShadow: "0 0 14px rgba(251,191,36,0.70), 0 0 28px rgba(251,191,36,0.28)",
                        }}>
                        ☕ Fincan Fotoğrafını Yükle
                      </p>
                      <p className="text-[11px] font-serif italic"
                        style={{
                          color: "rgba(251,191,36,0.58)",
                          textShadow: "0 0 10px rgba(251,191,36,0.30)",
                        }}>
                        Falına Bakmaya Başla
                      </p>
                    </div>
                  )}
                  {file && (
                    <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-sans"
                      style={{ background: "rgba(251,191,36,0.10)", border: "1px solid rgba(251,191,36,0.25)", color: "rgba(251,191,36,0.7)", WebkitTapHighlightColor: "transparent" }}>
                      <ImageIcon className="w-3 h-3" /> Değiştir
                    </button>
                  )}
                </div>

                {/* Right column: Premium badge + 3 fortune shortcut cards */}
                <div className="w-[92px] shrink-0 flex flex-col gap-2">

                  {/* Premium badge */}
                  {!isPremium && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.12, duration: 0.32 }}
                      className="rounded-2xl flex flex-col items-center gap-1 pt-2.5 pb-2 px-2 relative overflow-hidden shrink-0"
                      style={{
                        background: "linear-gradient(160deg, rgba(120,53,15,0.52), rgba(92,30,120,0.52))",
                        border: "1px solid rgba(251,191,36,0.28)",
                        boxShadow: "0 0 16px rgba(251,191,36,0.10), 0 3px 12px rgba(0,0,0,0.28)",
                      }}>
                      <div className="absolute inset-x-0 top-0 h-px"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.55), transparent)" }} />
                      <motion.div
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}>
                        <Crown className="w-5 h-5 text-amber-400"
                          style={{ filter: "drop-shadow(0 0 7px rgba(251,191,36,0.65))" }} />
                      </motion.div>
                      <p className="font-display text-[10px] tracking-[0.14em] text-amber-400 leading-none">Premium</p>
                      <button
                        onClick={() => navigate("/premium")}
                        className="w-full py-1.5 rounded-lg font-display text-[9px] tracking-wider mt-0.5"
                        style={{
                          background: "linear-gradient(90deg, #d97706, #fbbf24)",
                          color: "#1a0500",
                          boxShadow: "0 0 8px rgba(251,191,36,0.35)",
                          WebkitTapHighlightColor: "transparent",
                        }}>
                        SATIN AL
                      </button>
                    </motion.div>
                  )}

                  {/* Fortune shortcut cards — fill remaining height equally */}
                  {([
                    {
                      icon: <Layers className="w-4 h-4" strokeWidth={1.5} />,
                      title: "Tarot Falı", path: "/tarot", color: "#c084fc",
                      glowDim:   "0 0 5px rgba(192,132,252,0.12), 0 3px 10px rgba(0,0,0,0.32)",
                      glowPulse: "0 0 14px rgba(192,132,252,0.52), 0 0 28px rgba(192,132,252,0.22), 0 3px 10px rgba(0,0,0,0.32)",
                      glowHover: "0 0 18px rgba(192,132,252,0.70), 0 0 34px rgba(192,132,252,0.32), 0 0 50px rgba(192,132,252,0.12), 0 4px 14px rgba(0,0,0,0.36)",
                      glowTap:   "0 0 12px rgba(192,132,252,0.55), 0 0 24px rgba(192,132,252,0.24), 0 3px 10px rgba(0,0,0,0.32)",
                      border:    "rgba(192,132,252,0.45)",
                    },
                    {
                      icon: <Hand className="w-4 h-4" strokeWidth={1.5} />,
                      title: "El Falı", path: "/el-fali", color: "#34d399",
                      glowDim:   "0 0 5px rgba(52,211,153,0.12), 0 3px 10px rgba(0,0,0,0.32)",
                      glowPulse: "0 0 14px rgba(52,211,153,0.52), 0 0 28px rgba(52,211,153,0.22), 0 3px 10px rgba(0,0,0,0.32)",
                      glowHover: "0 0 18px rgba(52,211,153,0.70), 0 0 34px rgba(52,211,153,0.32), 0 0 50px rgba(52,211,153,0.12), 0 4px 14px rgba(0,0,0,0.36)",
                      glowTap:   "0 0 12px rgba(52,211,153,0.55), 0 0 24px rgba(52,211,153,0.24), 0 3px 10px rgba(0,0,0,0.32)",
                      border:    "rgba(52,211,153,0.40)",
                    },
                    {
                      icon: <Star className="w-4 h-4" strokeWidth={1.5} />,
                      title: "Günlük Burç", path: "/burc", color: "#fbbf24",
                      glowDim:   "0 0 5px rgba(251,191,36,0.12), 0 3px 10px rgba(0,0,0,0.32)",
                      glowPulse: "0 0 14px rgba(251,191,36,0.52), 0 0 28px rgba(251,191,36,0.22), 0 3px 10px rgba(0,0,0,0.32)",
                      glowHover: "0 0 18px rgba(251,191,36,0.70), 0 0 34px rgba(251,191,36,0.32), 0 0 50px rgba(251,191,36,0.12), 0 4px 14px rgba(0,0,0,0.36)",
                      glowTap:   "0 0 12px rgba(251,191,36,0.55), 0 0 24px rgba(251,191,36,0.24), 0 3px 10px rgba(0,0,0,0.32)",
                      border:    "rgba(251,191,36,0.42)",
                    },
                  ] as const).map(({ icon, title, path, color, glowDim, glowPulse, glowHover, glowTap, border }, i) => (
                    <motion.button
                      key={path}
                      initial={{ opacity: 0, x: 10, boxShadow: glowDim }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        boxShadow: [glowDim, glowPulse, glowDim],
                      }}
                      transition={{
                        opacity:   { delay: 0.18 + i * 0.08, duration: 0.32, ease: "easeOut" },
                        x:         { delay: 0.18 + i * 0.08, duration: 0.32, ease: "easeOut" },
                        boxShadow: {
                          delay: 1.0 + i * 1.1,
                          duration: 2.8,
                          repeat: Infinity,
                          repeatDelay: 1.4,
                          ease: "easeInOut",
                        },
                      }}
                      whileHover={{
                        scale: 1.03,
                        boxShadow: glowHover,
                        transition: { type: "spring", stiffness: 280, damping: 20 },
                      }}
                      whileTap={{
                        scale: 0.94,
                        boxShadow: glowTap,
                        transition: { type: "spring", stiffness: 320, damping: 24 },
                      }}
                      onClick={() => navigate(path)}
                      className="flex-1 relative flex flex-col items-center justify-center gap-1 rounded-2xl overflow-hidden"
                      style={{
                        background: "linear-gradient(145deg, rgba(28,8,60,0.88), rgba(16,4,38,0.84))",
                        border: `1px solid ${border}`,
                        WebkitTapHighlightColor: "transparent",
                        minHeight: 52,
                      }}>
                      <div className="absolute inset-x-0 top-0 h-px"
                        style={{ background: `linear-gradient(90deg, transparent, ${color}55, transparent)` }} />
                      <span style={{ color, filter: `drop-shadow(0 0 7px ${color}aa)` }}>{icon}</span>
                      <p className="font-display text-[8.5px] tracking-wide text-center leading-tight px-1"
                        style={{ color }}>
                        {title}
                      </p>
                    </motion.button>
                  ))}

                </div>
              </div>

              {/* Credit counter / premium badge / no-credits message */}
              {isPremium ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-5 flex items-center justify-center gap-2"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />
                  <span className="text-sm font-sans"
                    style={{ color: "rgba(251,191,36,0.7)" }}>
                    Premium — Sınırsız Fal
                  </span>
                </motion.div>
              ) : outOfCredits ? (
                /* ── No credits state ── */
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-5 mt-5 rounded-2xl px-5 py-4 flex flex-col items-center gap-3"
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
                        ✨ Fal Hakkı Kazan (Reklam İzle)
                      </button>
                    </>
                  )}
                </motion.div>
              ) : (
                <div className="mt-5 flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400/50" strokeWidth={1.5} />
                    <span className="text-sm font-sans" style={{ color: "rgba(255,255,255,0.5)" }}>
                      Bugün kalan fal hakkın:{" "}
                      <span className="font-bold"
                        style={{ color: "#fbbf24", textShadow: "0 0 10px rgba(251,191,36,0.5)" }}>
                        {credits} / 1
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {/* Error */}
              {fortuneMutation.isError && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="mx-5 mt-4 flex items-start gap-2 px-4 py-3 rounded-2xl"
                  style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)" }}>
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300 font-sans">
                    {fortuneMutation.error instanceof Error ? fortuneMutation.error.message : "Bir hata oluştu."}
                  </p>
                </motion.div>
              )}

              {/* ── Falına Bak button ── */}
              <div className="mx-5 mt-5">
                <button
                  onClick={handleMainButton}
                  disabled={!mainButtonActive}
                  className={cn(
                    "w-full py-[18px] rounded-2xl font-display text-[16px] tracking-[0.18em] uppercase transition-all active:scale-[0.98] flex items-center justify-center gap-2.5",
                    !mainButtonActive && "opacity-40 cursor-not-allowed"
                  )}
                  style={{
                    background: mainButtonActive
                      ? "linear-gradient(90deg, #d97706 0%, #fcd34d 40%, #f59e0b 75%, #d97706 100%)"
                      : "rgba(251,191,36,0.12)",
                    color: mainButtonActive ? "#1a0500" : "rgba(251,191,36,0.4)",
                    boxShadow: mainButtonActive
                      ? "0 0 48px rgba(251,191,36,0.60), 0 0 24px rgba(255,140,0,0.40), 0 4px 22px rgba(251,191,36,0.28), inset 0 1px 0 rgba(255,255,255,0.22)"
                      : "none",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <MoonStar className="w-5 h-5" strokeWidth={1.5} />
                  {mainButtonLabel}
                </button>
              </div>

              {/* ── Action pills ── */}
              <div className="mx-5 mt-4 space-y-2.5">
                {!isPremium && (
                  <>
                    <ActionPill
                      icon={<Tv className="w-4 h-4" />}
                      label={adRewardLimitReached
                        ? "Bugün reklam izleyerek kazanabileceğin fal hakları bitti."
                        : "✨ Fal Hakkı Kazan (Reklam İzle)"}
                      badge={adRewardLimitReached ? "Limit" : "+1 Fal"}
                      onClick={adRewardLimitReached ? undefined : handleEarnCreditAd}
                      disabled={adRewardLimitReached || adState !== "idle"}
                    />
                    <ActionPill
                      icon={<Share2 className="w-4 h-4" />}
                      label={shareRewardLimitReached
                        ? "Bugün paylaşarak kazanabileceğin fal hakları bitti."
                        : "Fal Paylaş"}
                      badge={shareRewardLimitReached ? "Limit" : "+1 Fal"}
                      onClick={shareRewardLimitReached ? undefined : handleShare}
                      disabled={shareRewardLimitReached}
                    />
                  </>
                )}
                <ActionPill
                  icon={<BookOpen className="w-4 h-4" />}
                  label="Falını Story Olarak Paylaş"
                  badge="Paylaş"
                  onClick={() => setShowStoryPicker(true)}
                />
              </div>
            </motion.div>
          )}

          {/* ══════════ STATE: LOADING ══════════ */}
          {fortuneMutation.isPending && (
            <motion.div key="loading"
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center flex-1 gap-8 pb-24">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-amber-400/20 animate-[spin_6s_linear_infinite]" />
                <div className="absolute inset-4 rounded-full border border-amber-400/30 animate-[spin_4s_linear_infinite_reverse]" />
                <div className="absolute inset-8 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(251,191,36,0.15), transparent)", animation: "pulse 2s ease-in-out infinite" }} />
                <MoonStar className="w-9 h-9 text-amber-400 relative z-10"
                  style={{ filter: "drop-shadow(0 0 14px rgba(251,191,36,0.8))", animation: "pulse 2s ease-in-out infinite" }} />
              </div>
              <div className="text-center space-y-2 px-8">
                <p className="font-display text-xl tracking-[0.15em] text-amber-400"
                  style={{ textShadow: "0 0 20px rgba(251,191,36,0.4)" }}>
                  Ruhlar Fısıldıyor
                </p>
                <p className="font-serif italic text-sm"
                  style={{ color: "rgba(255,255,255,0.45)", animation: "pulse 2.5s ease-in-out infinite" }}>
                  Kaderiniz okunuyor…
                </p>
              </div>
            </motion.div>
          )}

          {/* ══════════ STATE: RESULTS ══════════ */}
          {fortuneMutation.isSuccess && fortuneMutation.data && (
            <motion.div key="results"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
              className="flex flex-col flex-1 pb-24">

              <div className="pt-14 pb-5 text-center px-5">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <MoonStar className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
                  <h1 className="font-display text-[22px] tracking-[0.2em] uppercase"
                    style={{ color: "#fbbf24", textShadow: "0 0 20px rgba(251,191,36,0.4)" }}>
                    Falcızade
                  </h1>
                </div>
                <h2 className="font-display text-lg text-amber-400/90 tracking-wide"
                  style={{ textShadow: "0 0 15px rgba(251,191,36,0.3)" }}>
                  {fortuneMutation.data.title || "Kaderinizin Sesi"}
                </h2>
                <div className="w-20 h-px mx-auto mt-3"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.5), transparent)" }} />
              </div>

              <div className="mx-5 space-y-3">
                {([
                  { key: "ask",    label: "Aşk",    icon: "♡" },
                  { key: "para",   label: "Para",   icon: "◈" },
                  { key: "yol",    label: "Yol",    icon: "↝" },
                  { key: "saglik", label: "Sağlık", icon: "❧" },
                  { key: "genel",  label: "Genel",  icon: "✦" },
                ] as const).map(({ key, label, icon }, idx) => (
                  <SectionCard key={key} icon={icon} label={label}
                    text={fortuneMutation.data.sections[key]} delay={0.08 + idx * 0.1} />
                ))}

                {/* Post-result actions */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
                  className="pt-1 pb-2 space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-3 h-3 text-amber-400/40" strokeWidth={1.5} />
                    <span className="text-xs font-sans" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {isPremium ? (
                        <span className="text-amber-400/60">Premium — Sınırsız Fal</span>
                      ) : (
                        <>
                          Kalan Fal Hakkı:{" "}
                          <span className="font-bold" style={{ color: credits > 0 ? "#fbbf24" : "#f87171" }}>
                            {credits}
                          </span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* New reading button */}
                  {(isPremium || credits > 0) ? (
                    <button onClick={handleReset}
                      className="w-full py-4 rounded-2xl font-display text-sm tracking-widest uppercase transition-all active:scale-[0.98]"
                      style={{
                        border: "1px solid rgba(251,191,36,0.35)",
                        color: "#fbbf24",
                        background: "rgba(251,191,36,0.06)",
                        WebkitTapHighlightColor: "transparent",
                      }}>
                      Yeniden Bak
                    </button>
                  ) : adRewardLimitReached ? (
                    <p className="text-xs font-sans text-center py-2"
                      style={{ color: "rgba(255,255,255,0.38)" }}>
                      Bugün reklam izleyerek kazanabileceğin fal hakları bitti.
                    </p>
                  ) : (
                    <button
                      onClick={handleEarnCreditAd}
                      disabled={adState !== "idle"}
                      className="w-full h-12 rounded-2xl flex items-center justify-center gap-2.5 font-sans text-sm font-medium transition-all active:scale-[0.97] disabled:opacity-50"
                      style={{
                        background: "linear-gradient(135deg, rgba(251,191,36,0.20) 0%, rgba(251,191,36,0.12) 100%)",
                        border: "1px solid rgba(251,191,36,0.40)",
                        color: "#fbbf24",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <Tv className="w-4 h-4" strokeWidth={1.5} />
                      ✨ Fal Hakkı Kazan (Reklam İzle)
                    </button>
                  )}

                  <ActionPill
                    icon={<Share2 className="w-4 h-4" />}
                    label={shareRewardLimitReached
                      ? "Bugün paylaşarak kazanabileceğin fal hakları bitti."
                      : "Fal Paylaş"}
                    badge={shareRewardLimitReached ? "Limit" : "+1 Fal"}
                    onClick={shareRewardLimitReached ? undefined : () => handleShareFortune(fortuneMutation.data)}
                    disabled={shareRewardLimitReached}
                  />

                  <ActionPill
                    icon={<Share2 className="w-4 h-4" />}
                    label="Falını Story Olarak Paylaş"
                    badge="Paylaş"
                    onClick={() => setShowStoryPicker(true)}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* ── Rewarded ad overlay ── */}
        <AnimatePresence>
          {adState !== "idle" && (
            <motion.div
              key="ad-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center"
              style={{ background: "rgba(5,2,12,0.88)", backdropFilter: "blur(10px)" }}
            >
              <motion.div
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.88, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="w-72 rounded-3xl px-8 py-10 flex flex-col items-center gap-5 text-center"
                style={{
                  background: "linear-gradient(160deg, rgba(120,53,15,0.50), rgba(60,20,100,0.60))",
                  border: "1px solid rgba(251,191,36,0.25)",
                  boxShadow: "0 0 60px rgba(251,191,36,0.10)",
                }}
              >
                {adState === "watching" ? (
                  <>
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-amber-400/20 border-t-amber-400 animate-spin" />
                      <Tv className="w-6 h-6 text-amber-400"
                        style={{ filter: "drop-shadow(0 0 6px rgba(251,191,36,0.6))" }} />
                    </div>
                    <div>
                      <p className="font-display text-base tracking-widest text-amber-400 mb-1">
                        Reklam İzleniyor
                      </p>
                      <p className="text-xs font-sans" style={{ color: "rgba(255,255,255,0.4)" }}>
                        Lütfen bekleyin…
                      </p>
                    </div>
                  </>
                ) : (
                  /* done state — message depends on context */
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(251,191,36,0.12)",
                        border: "1px solid rgba(251,191,36,0.4)",
                        boxShadow: "0 0 20px rgba(251,191,36,0.25)",
                      }}
                    >
                      {adContext === "credit" ? (
                        <Sparkles className="w-7 h-7 text-amber-400"
                          style={{ filter: "drop-shadow(0 0 8px rgba(251,191,36,0.7))" }} />
                      ) : (
                        <MoonStar className="w-7 h-7 text-amber-400"
                          style={{ filter: "drop-shadow(0 0 8px rgba(251,191,36,0.7))" }} />
                      )}
                    </motion.div>
                    <div>
                      <p className="font-display text-base tracking-widest text-amber-400 mb-1">
                        {adContext === "credit" ? "+1 Fal Hakkı Kazandın!" : "Fal okunuyor…"}
                      </p>
                      <p className="text-xs font-sans" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {adContext === "credit" ? "Hayırlı fallar dileriz" : "Ruhlar fısıldıyor…"}
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Fixed bottom nav ── */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-50"
          style={{
            background: "rgba(10,4,20,0.94)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(251,191,36,0.10)",
          }}>
          <div className="flex items-stretch">
            <NavItem icon={<MoonStar className="w-5 h-5" strokeWidth={1.5} />} label="Fal"     active />
            <NavItem icon={<Clock    className="w-5 h-5" strokeWidth={1.5} />} label="Geçmiş"  onClick={() => navigate("/gecmis")} />
            <NavItem icon={<Crown    className="w-5 h-5" strokeWidth={1.5} />} label="Premium" onClick={() => navigate("/premium")} />
            <NavItem icon={<User     className="w-5 h-5" strokeWidth={1.5} />} label="Profil"  onClick={() => navigate("/profil")} />
          </div>
        </div>

      </div>

      {/* ── No-image alert ── */}
      <NoImageAlert
        isOpen={showNoImageAlert}
        onClose={() => setShowNoImageAlert(false)}
        onUpload={() => fileInputRef.current?.click()}
      />

      {/* ── Story picker modal ── */}
      <StoryPickerModal
        isOpen={showStoryPicker}
        onClose={() => setShowStoryPicker(false)}
        history={history}
      />

    </div>
  );
}
