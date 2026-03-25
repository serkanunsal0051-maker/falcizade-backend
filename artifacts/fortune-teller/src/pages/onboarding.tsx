import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { MoonStar, Sparkles, ChevronRight } from "lucide-react";
import { useProfile, type Gender } from "@/hooks/use-profile";

const STARS = Array.from({ length: 70 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  r: Math.random() * 1.4 + 0.3,
  o: Math.random() * 0.5 + 0.12,
  d: Math.random() * 3 + 2,
}));

export default function Onboarding() {
  const [, navigate] = useLocation();
  const { saveProfile } = useProfile();

  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);

  const canContinue = name.trim().length > 0 && gender !== null;

  const handleContinue = () => {
    if (!canContinue) return;
    saveProfile({ name: name.trim(), gender: gender! });
    navigate("/");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(170deg, #0c0520 0%, #110826 40%, #0a0418 100%)" }}
    >
      {/* Stars */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
        {STARS.map((s) => (
          <circle
            key={s.id}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill="white"
            opacity={s.o}
            style={{
              animation: `pulse ${s.d}s ease-in-out infinite alternate`,
              transformOrigin: `${s.x}% ${s.y}%`,
            }}
          />
        ))}
      </svg>

      <div className="relative z-10 w-full max-w-[390px] px-7 flex flex-col items-center gap-9">

        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-3">
            <MoonStar className="w-5 h-5 text-amber-400" strokeWidth={1.5}
              style={{ filter: "drop-shadow(0 0 7px rgba(251,191,36,0.6))" }} />
            <h1 className="font-display text-[26px] tracking-[0.22em] uppercase"
              style={{ color: "#fbbf24", textShadow: "0 0 35px rgba(251,191,36,0.45)" }}>
              Falcızade
            </h1>
            <Sparkles className="w-5 h-5 text-amber-400" strokeWidth={1.5}
              style={{ filter: "drop-shadow(0 0 7px rgba(251,191,36,0.6))" }} />
          </div>
        </motion.div>

        {/* Intro text */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-center flex flex-col gap-2"
        >
          <p className="font-display text-xl tracking-wide"
            style={{ color: "rgba(255,255,255,0.85)" }}>
            Sizi Tanıyalım
          </p>
          <p className="font-serif italic text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.38)" }}>
            Falınız size özel olsun diye birkaç bilgiye ihtiyacım var.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="w-full flex flex-col gap-6"
        >
          {/* Name input */}
          <div className="flex flex-col gap-2">
            <label className="font-display text-[11px] tracking-[0.18em] uppercase"
              style={{ color: "rgba(251,191,36,0.6)" }}>
              Adınız
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Adınızı girin…"
              autoComplete="given-name"
              className="w-full h-13 px-4 rounded-2xl font-sans text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: name.trim()
                  ? "1px solid rgba(251,191,36,0.40)"
                  : "1px solid rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.85)",
                caretColor: "#fbbf24",
                height: "52px",
                transition: "border-color 0.2s",
              }}
            />
          </div>

          {/* Gender selection */}
          <div className="flex flex-col gap-2">
            <label className="font-display text-[11px] tracking-[0.18em] uppercase"
              style={{ color: "rgba(251,191,36,0.6)" }}>
              Cinsiyet
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { value: "female" as Gender, label: "Kadın", symbol: "☽" },
                  { value: "male"   as Gender, label: "Erkek", symbol: "☀" },
                ] as const
              ).map(({ value, label, symbol }) => {
                const active = gender === value;
                return (
                  <button
                    key={value}
                    onClick={() => setGender(value)}
                    className="h-14 rounded-2xl flex items-center justify-center gap-2 font-sans text-sm"
                    style={{
                      background: active
                        ? "rgba(251,191,36,0.13)"
                        : "rgba(255,255,255,0.04)",
                      border: active
                        ? "1px solid rgba(251,191,36,0.45)"
                        : "1px solid rgba(255,255,255,0.09)",
                      color: active ? "#fbbf24" : "rgba(255,255,255,0.45)",
                      boxShadow: active ? "0 0 18px rgba(251,191,36,0.10)" : "none",
                      transition: "all 0.2s",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <span style={{ fontSize: "16px", lineHeight: 1 }}>{symbol}</span>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-sans text-sm font-medium mt-1"
            style={{
              background: canContinue
                ? "linear-gradient(135deg, rgba(251,191,36,0.90) 0%, rgba(245,158,11,0.85) 100%)"
                : "rgba(255,255,255,0.06)",
              border: canContinue
                ? "none"
                : "1px solid rgba(255,255,255,0.08)",
              color: canContinue ? "#1a0a00" : "rgba(255,255,255,0.2)",
              fontWeight: canContinue ? 600 : 400,
              boxShadow: canContinue
                ? "0 0 30px rgba(251,191,36,0.30), 0 4px 16px rgba(251,191,36,0.18)"
                : "none",
              transition: "all 0.25s",
              WebkitTapHighlightColor: "transparent",
              cursor: canContinue ? "pointer" : "not-allowed",
            }}
          >
            Devam Et
            {canContinue && <ChevronRight className="w-4 h-4" strokeWidth={2.5} />}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
