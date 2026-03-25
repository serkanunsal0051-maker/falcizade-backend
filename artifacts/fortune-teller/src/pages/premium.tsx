import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Crown, CheckCircle2, MoonStar, Sparkles, ChevronLeft,
  Infinity, ShieldOff, Clock as ClockIcon, User, Clock,
} from "lucide-react";

/* ─── Stars ─── */
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  top:  ((i * 37 + 13) % 100),
  left: ((i * 61 +  7) % 100),
  size: (i % 3) === 0 ? 2 : 1,
  dur:  2 + (i % 5),
  delay: (i % 7) * 0.4,
  opacity: 0.12 + (i % 7) * 0.08,
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
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(109,40,217,0.25) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(67,20,120,0.3) 0%, transparent 70%)" }} />
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 flex-1 pt-3 pb-5 relative"
      style={{ WebkitTapHighlightColor: "transparent" }}>
      <span style={{
        color: active ? "#fbbf24" : "rgba(255,255,255,0.3)",
        filter: active ? "drop-shadow(0 0 6px rgba(251,191,36,0.5))" : "none",
      }}>
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

/* ─── Data ─── */
type PlanId = "weekly" | "monthly" | "yearly";

const PLANS: {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  badge?: { text: string; kind: "popular" | "savings" };
}[] = [
  {
    id: "weekly",
    name: "Haftalık",
    price: "99",
    period: "hafta",
  },
  {
    id: "monthly",
    name: "Aylık",
    price: "299",
    period: "ay",
    badge: { text: "En Popüler", kind: "popular" },
  },
  {
    id: "yearly",
    name: "Yıllık",
    price: "1999",
    period: "yıl",
    badge: { text: "Yıllık alarak %44 tasarruf et", kind: "savings" },
  },
];

const BENEFITS = [
  { icon: <Infinity   className="w-[18px] h-[18px]" />, text: "Sınırsız fal okutma" },
  { icon: <ShieldOff  className="w-[18px] h-[18px]" />, text: "Reklamsız kullanım" },
  { icon: <ClockIcon  className="w-[18px] h-[18px]" />, text: "Sınırsız fal geçmişi" },
];

export default function Premium() {
  const [, navigate] = useLocation();
  const [selected, setSelected] = useState<PlanId>("monthly");

  return (
    <div className="min-h-screen flex flex-col items-center"
      style={{ background: "linear-gradient(170deg, #0c0520 0%, #110826 40%, #0a0418 100%)" }}>
      <StarField />

      <div className="relative z-10 w-full max-w-[390px] flex flex-col min-h-screen pb-24">

        {/* ── Header ── */}
        <div className="pt-14 pb-2 px-5 relative">
          <button onClick={() => navigate("/")}
            className="absolute left-5 top-14 flex items-center gap-1 transition-colors"
            style={{ color: "rgba(251,191,36,0.55)", WebkitTapHighlightColor: "transparent" }}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-sans">Geri</span>
          </button>

          <div className="text-center">
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
          </div>
        </div>

        {/* ── Crown hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center pt-6 pb-5 px-5"
        >
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full blur-2xl"
              style={{ background: "radial-gradient(circle, rgba(251,191,36,0.22) 0%, transparent 70%)", transform: "scale(1.8)" }} />
            <div className="w-20 h-20 rounded-full flex items-center justify-center relative"
              style={{
                background: "linear-gradient(145deg, rgba(120,53,15,0.6), rgba(92,30,120,0.6))",
                border: "1.5px solid rgba(251,191,36,0.40)",
                boxShadow: "0 0 40px rgba(251,191,36,0.18), 0 0 80px rgba(251,191,36,0.07)",
              }}>
              <Crown className="w-10 h-10 text-amber-400"
                style={{ filter: "drop-shadow(0 0 10px rgba(251,191,36,0.7))" }} />
            </div>
          </div>

          <h2 className="font-display text-xl tracking-wide text-center mb-0.5"
            style={{ color: "#fbbf24", textShadow: "0 0 20px rgba(251,191,36,0.35)" }}>
            Premium Üyelik
          </h2>
          <p className="text-sm font-serif italic text-center"
            style={{ color: "rgba(255,255,255,0.35)" }}>
            Falın gücünü tam olarak keşfet
          </p>
        </motion.div>

        {/* ── Plan cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="px-5 flex flex-col gap-3"
        >
          {PLANS.map((plan, idx) => {
            const isSelected = selected === plan.id;
            return (
              <motion.button
                key={plan.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + idx * 0.08, duration: 0.35 }}
                onClick={() => setSelected(plan.id)}
                className="w-full rounded-2xl text-left"
                style={{
                  background: isSelected
                    ? "linear-gradient(135deg, rgba(120,53,15,0.35) 0%, rgba(92,30,120,0.30) 100%)"
                    : "rgba(255,255,255,0.04)",
                  border: isSelected
                    ? "1.5px solid rgba(251,191,36,0.55)"
                    : "1.5px solid rgba(255,255,255,0.09)",
                  boxShadow: isSelected
                    ? "0 0 24px rgba(251,191,36,0.12), inset 0 1px 0 rgba(251,191,36,0.08)"
                    : "none",
                  transition: "all 0.22s",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {/* Shimmer top line on selected */}
                {isSelected && (
                  <div className="h-px w-full rounded-t-2xl"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.45), transparent)" }} />
                )}

                <div className="px-4 py-3.5 flex items-center justify-between gap-3">
                  {/* Left: name + badge */}
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display text-base tracking-wide"
                        style={{ color: isSelected ? "#fbbf24" : "rgba(255,255,255,0.65)" }}>
                        {plan.name}
                      </span>

                      {plan.badge?.kind === "popular" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold tracking-wide uppercase"
                          style={{
                            background: "linear-gradient(90deg, rgba(251,191,36,0.22), rgba(245,158,11,0.18))",
                            border: "1px solid rgba(251,191,36,0.40)",
                            color: "#fbbf24",
                          }}>
                          {plan.badge.text}
                        </span>
                      )}
                    </div>

                    {plan.badge?.kind === "savings" && (
                      <span className="inline-flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-[11px] font-sans font-medium"
                        style={{
                          background: "linear-gradient(90deg, rgba(251,191,36,0.15), rgba(217,119,6,0.12))",
                          border: "1px solid rgba(251,191,36,0.30)",
                          color: "#fcd34d",
                        }}>
                        ✦ {plan.badge.text}
                      </span>
                    )}
                  </div>

                  {/* Right: price + radio */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-display text-xl"
                        style={{ color: isSelected ? "#fbbf24" : "rgba(255,255,255,0.75)" }}>
                        ₺{plan.price}
                      </span>
                      <span className="text-[11px] font-sans ml-1"
                        style={{ color: "rgba(255,255,255,0.35)" }}>
                        /{plan.period}
                      </span>
                    </div>

                    {/* Radio dot */}
                    <div className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        border: isSelected
                          ? "2px solid #fbbf24"
                          : "1.5px solid rgba(255,255,255,0.20)",
                        background: isSelected ? "rgba(251,191,36,0.12)" : "transparent",
                        transition: "all 0.2s",
                      }}>
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full"
                          style={{ background: "#fbbf24", boxShadow: "0 0 6px rgba(251,191,36,0.8)" }} />
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Benefits ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.45 }}
          className="mx-5 mt-5 rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, rgba(120,53,15,0.18), rgba(92,30,120,0.18))",
            border: "1px solid rgba(251,191,36,0.14)",
          }}
        >
          <div className="h-px w-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.35), transparent)" }} />
          <div className="px-5 py-4 space-y-3">
            {BENEFITS.map(({ icon, text }, idx) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.08, duration: 0.35 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(251,191,36,0.09)",
                    border: "1px solid rgba(251,191,36,0.20)",
                    color: "#fbbf24",
                  }}>
                  {icon}
                </div>
                <p className="text-sm font-sans flex-1"
                  style={{ color: "rgba(255,255,255,0.75)" }}>
                  {text}
                </p>
                <CheckCircle2 className="w-4 h-4 shrink-0"
                  style={{ color: "#fbbf24", filter: "drop-shadow(0 0 3px rgba(251,191,36,0.45))" }} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="mx-5 mt-5"
        >
          <button
            className="w-full py-[17px] rounded-2xl font-display text-[15px] tracking-[0.16em] uppercase flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
            style={{
              background: "linear-gradient(135deg, #b45309 0%, #fbbf24 50%, #b45309 100%)",
              color: "#1a0500",
              boxShadow: "0 0 36px rgba(251,191,36,0.38), 0 4px 18px rgba(251,191,36,0.18), inset 0 1px 0 rgba(255,255,255,0.15)",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <Crown className="w-5 h-5" strokeWidth={2} />
            Premium Satın Al
          </button>

          <p className="text-center text-xs font-sans mt-2.5"
            style={{ color: "rgba(255,255,255,0.22)" }}>
            Dilediğin zaman iptal edebilirsin
          </p>
        </motion.div>

      </div>

      {/* ── Fixed bottom nav ── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-50"
        style={{
          background: "rgba(10,4,20,0.94)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(251,191,36,0.10)",
        }}>
        <div className="flex items-stretch">
          <NavItem icon={<MoonStar className="w-5 h-5" strokeWidth={1.5} />} label="Fal"     onClick={() => navigate("/")} />
          <NavItem icon={<Clock    className="w-5 h-5" strokeWidth={1.5} />} label="Geçmiş"  onClick={() => navigate("/gecmis")} />
          <NavItem icon={<Crown    className="w-5 h-5" strokeWidth={1.5} />} label="Premium" active />
          <NavItem icon={<User     className="w-5 h-5" strokeWidth={1.5} />} label="Profil"  onClick={() => navigate("/profil")} />
        </div>
      </div>
    </div>
  );
}
