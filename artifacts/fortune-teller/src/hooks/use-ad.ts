import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";

export type AdState = "idle" | "watching" | "done";

export type AdType = "fal" | "hak";

interface ShowAdOptions {
  type: AdType;
  onRewarded: () => void;
  onDismissed?: () => void;
  doneMs?: number;
}

// ── Android bridge interface ──────────────────────────────────────────────────
// Android WebView must expose:  webView.addJavascriptInterface(bridge, "Android")
//
// Primary method (new, unified):
//   showAdFromWeb()  — called for both ad types; Android identifies which
//                      callback to fire by reading which window.after* functions
//                      were registered before the call.
//
// Legacy methods (backward compat, still supported):
//   showFalAd()   — pre-fortune rewarded ad  → JS reward callback:  afterFalAd()
//                                            → JS dismiss callback: afterFalAdDismissed()
//   showHakAd()   — credit-earning ad        → JS reward callback:  afterRewardAd()
//                                            → JS dismiss callback: afterHakAdDismissed()
//
// Universal callbacks (always registered on window, Android can call any time):
//   window.onAdRewarded()  — ad fully watched, grant reward & hide loading
//   window.onAdClosed()    — ad closed/skipped, hide loading only
//   window.hideLoading()   — hide the ad loading state
//   window.giveUserCredit()— grant reward without hiding loading
//
// Reward callbacks  (afterFalAd / afterRewardAd):
//   Called by Android ONLY when the ad was fully watched and the reward is granted.
//
// Dismiss callbacks (afterFalAdDismissed / afterHakAdDismissed):
//   Called by Android when the user skips, closes, or the ad fails to load.
//   NO credit is granted.
//
// Safety: all bridge accesses are guarded with optional-chaining so the app
// works normally in a plain browser without any Android WebView present.
// ─────────────────────────────────────────────────────────────────────────────

type AndroidBridge = {
  showAdFromWeb?: () => void;   // primary — unified entry point
  showFalAd?: () => void;       // legacy
  showHakAd?: () => void;       // legacy
};

function getAndroidBridge(): AndroidBridge | undefined {
  if (typeof window === "undefined") return undefined;
  const win = window as unknown as Record<string, unknown>;
  return win["Android"] as AndroidBridge | undefined;
}

function registerGlobalCallback(name: string, fn: () => void) {
  (window as unknown as Record<string, unknown>)[name] = fn;
}

function unregisterGlobalCallback(name: string) {
  delete (window as unknown as Record<string, unknown>)[name];
}

export function useAd() {
  const [adState, setAdState] = useState<AdState>("idle");

  // Refs hold the active reward/dismiss handlers so the permanent global
  // callbacks (onAdRewarded, onAdClosed) always dispatch to the current session.
  const pendingRewardRef   = useRef<(() => void) | null>(null);
  const pendingDismissRef  = useRef<(() => void) | null>(null);

  // ── Register permanent global callbacks once on mount ──────────────────────
  // Android can call window.onAdRewarded / window.onAdClosed at any time.
  // These delegate to whatever handler is currently registered for the active ad.
  useEffect(() => {
    const win = window as unknown as Record<string, unknown>;

    win["hideLoading"] = () => {
      console.log("[Falcızade] hideLoading called");
      setAdState("idle");
      pendingRewardRef.current  = null;
      pendingDismissRef.current = null;
    };

    win["giveUserCredit"] = () => {
      console.log("[Falcızade] giveUserCredit called");
      if (pendingRewardRef.current) {
        pendingRewardRef.current();
      } else {
        console.warn("[Falcızade] giveUserCredit: no pending reward handler");
      }
    };

    win["onAdRewarded"] = () => {
      console.log("[Falcızade] window.onAdRewarded called by Android");
      if (pendingRewardRef.current) {
        pendingRewardRef.current();
      } else {
        console.warn("[Falcızade] onAdRewarded: no pending reward handler");
        // Still hide loading so UI doesn't get stuck
        setAdState("idle");
      }
    };

    win["onAdClosed"] = () => {
      console.log("[Falcızade] window.onAdClosed called by Android");
      if (pendingDismissRef.current) {
        pendingDismissRef.current();
      } else {
        console.warn("[Falcızade] onAdClosed: no pending dismiss handler");
        // Still hide loading so UI doesn't get stuck
        setAdState("idle");
      }
    };

    return () => {
      delete win["onAdRewarded"];
      delete win["onAdClosed"];
      delete win["hideLoading"];
      delete win["giveUserCredit"];
    };
  }, []);

  const showAd = useCallback((opts: ShowAdOptions) => {
    const { type, onRewarded, onDismissed, doneMs = 1400 } = opts;

    const rewardCallbackName  = type === "fal" ? "afterFalAd"          : "afterRewardAd";
    const dismissCallbackName = type === "fal" ? "afterFalAdDismissed" : "afterHakAdDismissed";

    function cleanup() {
      unregisterGlobalCallback(rewardCallbackName);
      unregisterGlobalCallback(dismissCallbackName);
      pendingRewardRef.current  = null;
      pendingDismissRef.current = null;
    }

    const handleRewarded = () => {
      cleanup();
      setAdState("done");
      console.log("[Falcızade] Ad reward granted — type:", type);
      onRewarded();                          // ← credit granted HERE, and only here
      setTimeout(() => setAdState("idle"), doneMs);
    };

    const handleDismissed = () => {
      cleanup();
      setAdState("idle");                    // reset so the button becomes active again
      console.log("[Falcızade] Ad dismissed without reward — type:", type);
      onDismissed?.();                       // NO credit granted
    };

    // Store in refs so permanent globals (onAdRewarded / onAdClosed) can reach them
    pendingRewardRef.current  = handleRewarded;
    pendingDismissRef.current = handleDismissed;

    const bridge = getAndroidBridge();

    // Also register named callbacks for backward-compat Android implementations
    registerGlobalCallback(rewardCallbackName,  handleRewarded);
    registerGlobalCallback(dismissCallbackName, handleDismissed);

    if (bridge?.showAdFromWeb) {
      // ── Android (primary): unified ad entry point ────────
      console.log("[Falcızade] Calling Android.showAdFromWeb() — type:", type);
      setAdState("watching");
      bridge.showAdFromWeb();

    } else if (type === "fal" && bridge?.showFalAd) {
      // ── Android (legacy): fortune ad ────────────────────
      console.log("[Falcızade] Calling Android.showFalAd() (legacy)");
      setAdState("watching");
      bridge.showFalAd();

    } else if (type === "hak" && bridge?.showHakAd) {
      // ── Android (legacy): credit-earning ad ─────────────
      console.log("[Falcızade] Calling Android.showHakAd() (legacy)");
      setAdState("watching");
      bridge.showHakAd();

    } else {
      // ── Browser / no bridge: inform the user ────────────
      cleanup();
      console.log("[Falcızade] No Android bridge found — showing browser message");
      toast({
        title: "Reklamlar sadece mobil uygulamada kullanılabilir",
        description: "Uygulamayı indirerek reklam izleyebilir ve fal hakkı kazanabilirsin.",
        duration: 4000,
      });
    }
  }, []);

  // Expose stable dismiss helper for the calling component (e.g. unmount cleanup)
  const dismissAd = useCallback(() => {
    unregisterGlobalCallback("afterFalAd");
    unregisterGlobalCallback("afterFalAdDismissed");
    unregisterGlobalCallback("afterRewardAd");
    unregisterGlobalCallback("afterHakAdDismissed");
    pendingRewardRef.current  = null;
    pendingDismissRef.current = null;
    setAdState("idle");
  }, []);

  return { adState, showAd, dismissAd };
}
