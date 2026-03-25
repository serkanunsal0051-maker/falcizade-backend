import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MoonStar, Sparkles, Crown, User, Clock, BookOpen, ChevronDown } from "lucide-react";
import { useHistory } from "@/hooks/use-history";

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

/* ─── Nav item ─── */
function NavItem({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 flex-1 pt-3 pb-5 relative">
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

/* ─── Date formatter ─── */
function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SECTION_LABELS: Record<string, string> = {
  ask: "Aşk",
  para: "Para",
  yol: "Yol",
  saglik: "Sağlık",
  genel: "Genel",
};

const SECTION_ICONS: Record<string, string> = {
  ask: "♡",
  para: "◈",
  yol: "↝",
  saglik: "❧",
  genel: "✦",
};

export default function History() {
  const [, navigate] = useLocation();
  const { history } = useHistory();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-screen flex flex-col items-center"
      style={{ background: "linear-gradient(170deg, #0c0520 0%, #110826 40%, #0a0418 100%)" }}>
      <StarField />

      <div className="relative z-10 w-full max-w-[390px] flex flex-col min-h-screen pb-24">

        {/* Header */}
        <div className="pt-14 pb-4 px-5 text-center">
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
          <p className="font-display text-xs tracking-[0.2em] uppercase mt-1"
            style={{ color: "rgba(251,191,36,0.45)" }}>
            Fal Geçmişi
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 space-y-4 overflow-y-auto">
          <AnimatePresence mode="wait">
            {history.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="flex flex-col items-center justify-center pt-24 gap-5"
              >
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(251,191,36,0.06)",
                    border: "1px solid rgba(251,191,36,0.18)",
                  }}>
                  <BookOpen className="w-9 h-9"
                    style={{ color: "rgba(251,191,36,0.35)" }} strokeWidth={1.5} />
                </div>
                <p className="font-serif italic text-base text-center"
                  style={{ color: "rgba(255,255,255,0.35)" }}>
                  Henüz fal geçmişin yok.
                </p>
                <p className="text-xs font-sans text-center"
                  style={{ color: "rgba(255,255,255,0.2)" }}>
                  İlk falını baktırdıktan sonra burada görünecek.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3 pb-2"
              >
                {history.map((item, idx) => {
                  const isOpen = expandedId === item.id;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.35 }}
                      className="rounded-2xl overflow-hidden"
                      style={{
                        background: isOpen
                          ? "rgba(251,191,36,0.06)"
                          : "rgba(255,255,255,0.04)",
                        border: `1px solid ${isOpen ? "rgba(251,191,36,0.28)" : "rgba(251,191,36,0.12)"}`,
                        transition: "background 0.3s, border-color 0.3s",
                      }}
                    >
                      {/* ── Tappable header row ── */}
                      <button
                        onClick={() => toggle(item.id)}
                        className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left"
                        style={{ WebkitTapHighlightColor: "transparent" }}
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="font-display text-sm tracking-wide truncate"
                            style={{ color: "#fbbf24", textShadow: isOpen ? "0 0 12px rgba(251,191,36,0.4)" : "none" }}>
                            {item.title || "Fal Yorumu"}
                          </span>
                          <span className="text-[11px] font-sans"
                            style={{ color: "rgba(255,255,255,0.35)" }}>
                            {formatDate(item.createdAt)}
                          </span>
                        </div>

                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="shrink-0"
                          style={{ color: "rgba(251,191,36,0.55)" }}
                        >
                          <ChevronDown className="w-4 h-4" strokeWidth={2} />
                        </motion.span>
                      </button>

                      {/* ── Expandable content ── */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            style={{ overflow: "hidden" }}
                          >
                            <div className="px-5 pb-5 space-y-4"
                              style={{ borderTop: "1px solid rgba(251,191,36,0.10)" }}>
                              {(["ask", "para", "yol", "saglik", "genel"] as const).map((key) =>
                                item.sections[key] ? (
                                  <div key={key} className="pt-4">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <span className="text-amber-400 text-xs leading-none">
                                        {SECTION_ICONS[key]}
                                      </span>
                                      <span className="font-display text-[10px] tracking-[0.15em] uppercase"
                                        style={{ color: "rgba(251,191,36,0.7)" }}>
                                        {SECTION_LABELS[key]}
                                      </span>
                                    </div>
                                    <p className="font-serif text-sm leading-relaxed"
                                      style={{ color: "rgba(255,255,255,0.7)" }}>
                                      {item.sections[key]}
                                    </p>
                                  </div>
                                ) : null
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-50"
        style={{
          background: "rgba(10,4,20,0.94)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(251,191,36,0.10)",
        }}>
        <div className="flex items-stretch">
          <NavItem icon={<MoonStar className="w-5 h-5" strokeWidth={1.5} />} label="Fal"     onClick={() => navigate("/")} />
          <NavItem icon={<Clock    className="w-5 h-5" strokeWidth={1.5} />} label="Geçmiş"  active />
          <NavItem icon={<Crown    className="w-5 h-5" strokeWidth={1.5} />} label="Premium" onClick={() => navigate("/premium")} />
          <NavItem icon={<User     className="w-5 h-5" strokeWidth={1.5} />} label="Profil"  onClick={() => navigate("/profil")} />
        </div>
      </div>
    </div>
  );
}
