import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { MoonStar, Sparkles, UserRound } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/contexts/auth-context";

/* ── Stars ── */
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  r: Math.random() * 1.4 + 0.3,
  o: Math.random() * 0.55 + 0.15,
  d: Math.random() * 3 + 2,
}));

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export default function Login() {
  const [, navigate] = useLocation();
  const { loginAsGuest, loginWithGoogle } = useAuth();

  const handleGuest = () => {
    loginAsGuest();
    navigate("/onboarding");
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then((r) => r.json());
        loginWithGoogle({
          id: userInfo.sub,
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
        });
        navigate("/onboarding");
      } catch {
        alert("Google bilgileri alınamadı. Lütfen tekrar deneyin.");
      }
    },
    onError: () => {
      alert("Google ile giriş başarısız oldu. Lütfen tekrar deneyin.");
    },
  });

  const handleGoogle = () => {
    if (!GOOGLE_CLIENT_ID) {
      alert("Google giriş şu an kullanılamıyor.");
      return;
    }
    googleLogin();
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

      <div className="relative z-10 w-full max-w-[390px] px-7 flex flex-col items-center gap-10">

        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-3 mb-1">
            <MoonStar className="w-6 h-6 text-amber-400" strokeWidth={1.5}
              style={{ filter: "drop-shadow(0 0 8px rgba(251,191,36,0.6))" }} />
            <h1
              className="font-display text-[32px] tracking-[0.22em] uppercase"
              style={{ color: "#fbbf24", textShadow: "0 0 40px rgba(251,191,36,0.5)" }}
            >
              Falcızade
            </h1>
            <Sparkles className="w-6 h-6 text-amber-400" strokeWidth={1.5}
              style={{ filter: "drop-shadow(0 0 8px rgba(251,191,36,0.6))" }} />
          </div>
          <p
            className="font-display text-[11px] tracking-[0.25em] uppercase"
            style={{ color: "rgba(251,191,36,0.45)" }}
          >
            Kahve Falı
          </p>
        </motion.div>

        {/* Decorative cup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        >
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background: "radial-gradient(circle at 40% 35%, rgba(251,191,36,0.13) 0%, rgba(139,92,246,0.07) 100%)",
              border: "1px solid rgba(251,191,36,0.22)",
              boxShadow: "0 0 50px rgba(251,191,36,0.12), inset 0 0 30px rgba(139,92,246,0.06)",
            }}
          >
            <svg viewBox="0 0 80 80" className="w-16 h-16" fill="none">
              <ellipse cx="40" cy="58" rx="26" ry="7" fill="rgba(251,191,36,0.08)" />
              <path d="M18 28 Q20 56 40 58 Q60 56 62 28 Q52 24 40 24 Q28 24 18 28Z"
                fill="rgba(139,92,246,0.18)" stroke="rgba(251,191,36,0.5)" strokeWidth="1.2" />
              <path d="M62 34 Q72 34 72 42 Q72 50 62 50"
                stroke="rgba(251,191,36,0.45)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M30 38 Q34 44 40 40 Q46 36 50 42"
                stroke="rgba(251,191,36,0.35)" strokeWidth="1" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3, ease: "easeOut" }}
          className="w-full flex flex-col gap-4"
        >
          {/* Google sign-in */}
          <button
            onClick={handleGoogle}
            className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-sans text-sm font-medium"
            style={{
              background: "linear-gradient(135deg, rgba(251,191,36,0.18) 0%, rgba(251,191,36,0.10) 100%)",
              border: "1px solid rgba(251,191,36,0.40)",
              color: "#fbbf24",
              boxShadow: "0 0 24px rgba(251,191,36,0.12)",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <GoogleIcon />
            Google ile Giriş Yap
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span className="text-[11px] font-sans" style={{ color: "rgba(255,255,255,0.25)" }}>
              veya
            </span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Guest */}
          <button
            onClick={handleGuest}
            className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-sans text-sm"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.55)",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <UserRound className="w-4 h-4" strokeWidth={1.5} />
            Misafir olarak devam et
          </button>

          {/* Guest warning */}
          <p
            className="text-center text-[11px] font-sans leading-relaxed px-2"
            style={{ color: "rgba(255,255,255,0.22)" }}
          >
            Misafir hesabında fal geçmişi yalnızca bu cihazda saklanır.
            Uygulama silinirse veriler kaybolabilir.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
