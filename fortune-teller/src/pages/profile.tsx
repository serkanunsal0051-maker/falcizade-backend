import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { MoonStar, Sparkles, Crown, Clock, User, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

/* ── Stars ── */
const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  r: Math.random() * 1.3 + 0.3,
  o: Math.random() * 0.5 + 0.1,
  d: Math.random() * 3 + 2,
}));

function NavItem({
  icon, label, active, onClick,
}: {
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

export default function Profile() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isGoogle = user?.type === "google";
  const initials = isGoogle
    ? user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "M";

  return (
    <div className="min-h-screen flex flex-col items-center"
      style={{ background: "linear-gradient(170deg, #0c0520 0%, #110826 40%, #0a0418 100%)" }}>

      {/* Stars */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
        {STARS.map((s) => (
          <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r}
            fill="white" opacity={s.o}
            style={{ animation: `pulse ${s.d}s ease-in-out infinite alternate`, transformOrigin: `${s.x}% ${s.y}%` }} />
        ))}
      </svg>

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
            Profil
          </p>
        </div>

        {/* Profile card */}
        <div className="flex-1 px-5 pt-4 flex flex-col gap-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-3xl p-6 flex flex-col items-center gap-4"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(251,191,36,0.16)",
            }}
          >
            {/* Avatar */}
            {isGoogle && user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover"
                style={{ border: "2px solid rgba(251,191,36,0.35)", boxShadow: "0 0 24px rgba(251,191,36,0.15)" }}
              />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(251,191,36,0.08)",
                  border: "2px solid rgba(251,191,36,0.25)",
                  boxShadow: "0 0 24px rgba(251,191,36,0.10)",
                }}>
                <span className="font-display text-2xl" style={{ color: "rgba(251,191,36,0.7)" }}>
                  {initials}
                </span>
              </div>
            )}

            {/* Name / status */}
            {isGoogle ? (
              <div className="flex flex-col items-center gap-1">
                <span className="font-display text-lg tracking-wide"
                  style={{ color: "#fbbf24", textShadow: "0 0 12px rgba(251,191,36,0.35)" }}>
                  {user.name}
                </span>
                <span className="text-xs font-sans" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {user.email}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span className="font-display text-lg tracking-wide"
                  style={{ color: "rgba(255,255,255,0.7)" }}>
                  Misafir
                </span>
                <span className="text-xs font-sans" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Hesap oluşturulmadı
                </span>
              </div>
            )}

            {/* Badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: isGoogle ? "rgba(66,133,244,0.12)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${isGoogle ? "rgba(66,133,244,0.3)" : "rgba(255,255,255,0.1)"}`,
              }}>
              {isGoogle
                ? <ShieldCheck className="w-3.5 h-3.5" style={{ color: "#4285F4" }} strokeWidth={2} />
                : <UserRound className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.4)" }} strokeWidth={1.5} />
              }
              <span className="text-[11px] font-sans"
                style={{ color: isGoogle ? "#4285F4" : "rgba(255,255,255,0.35)" }}>
                {isGoogle ? "Google hesabı" : "Misafir modu"}
              </span>
            </div>
          </motion.div>

          {/* Info box for guests */}
          {!isGoogle && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-2xl p-4"
              style={{
                background: "rgba(251,191,36,0.05)",
                border: "1px solid rgba(251,191,36,0.14)",
              }}
            >
              <p className="text-xs font-sans leading-relaxed"
                style={{ color: "rgba(255,255,255,0.4)" }}>
                Misafir modunda fal geçmişin yalnızca bu cihazda saklanır.
                Google hesabınla giriş yaparak geçmişini güvende tut.
              </p>
              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="mt-3 w-full h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-sans"
                style={{
                  background: "rgba(251,191,36,0.10)",
                  border: "1px solid rgba(251,191,36,0.25)",
                  color: "#fbbf24",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                Google ile Giriş Yap
              </button>
            </motion.div>
          )}

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <button
              onClick={handleLogout}
              className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-sans text-sm"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: "rgba(255,255,255,0.35)",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
              {isGoogle ? "Çıkış Yap" : "Hesap Değiştir"}
            </button>
          </motion.div>
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
            <NavItem icon={<Clock    className="w-5 h-5" strokeWidth={1.5} />} label="Geçmiş"  onClick={() => navigate("/gecmis")} />
            <NavItem icon={<Crown    className="w-5 h-5" strokeWidth={1.5} />} label="Premium" onClick={() => navigate("/premium")} />
            <NavItem icon={<User     className="w-5 h-5" strokeWidth={1.5} />} label="Profil"  active />
          </div>
        </div>

      </div>
    </div>
  );
}
