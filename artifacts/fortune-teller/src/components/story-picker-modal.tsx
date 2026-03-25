import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Share2, Clock, Loader2, BookOpen, Sparkles, ChevronRight, ArrowLeft,
} from "lucide-react";
import { FortuneHistoryItem } from "@/hooks/use-history";
import { generateStoryImage, downloadStoryImage } from "@/lib/generate-story-image";

type View = "options" | "history";

interface StoryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: FortuneHistoryItem[];
}

/* ─── Helpers ─── */
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function getPreview(item: FortuneHistoryItem): string {
  const text = item.sections.ask || item.sections.genel || item.title || "";
  return text.length > 90 ? text.slice(0, 90) + "…" : text;
}

/* ─── Shared sheet constants ─── */
const SHEET_STYLE: React.CSSProperties = {
  background: "linear-gradient(170deg, #130a2e 0%, #0c0520 55%, #0a041a 100%)",
  borderTop: "1px solid rgba(251,191,36,0.24)",
  borderLeft: "1px solid rgba(251,191,36,0.10)",
  borderRight: "1px solid rgba(251,191,36,0.10)",
  borderRadius: "28px 28px 0 0",
  boxShadow: "0 -24px 64px rgba(109,40,217,0.28)",
};

/* ═══════════════════════════════════════════ */
export function StoryPickerModal({ isOpen, onClose, history }: StoryPickerModalProps) {
  const [view, setView]                       = useState<View>("options");
  const [isGeneratingLatest, setIsGeneratingLatest] = useState(false);
  const [generatingId, setGeneratingId]       = useState<string | null>(null);

  /* Reset view to options each time the modal is closed */
  useEffect(() => {
    if (isOpen) return;
    const t = setTimeout(() => {
      setView("options");
      setIsGeneratingLatest(false);
      setGeneratingId(null);
    }, 380);
    return () => clearTimeout(t);
  }, [isOpen]);

  const isBusy = isGeneratingLatest || generatingId !== null;

  const handleClose = () => {
    if (!isBusy) onClose();
  };

  /* Generate from a specific FortuneHistoryItem */
  const generate = async (item: FortuneHistoryItem) => {
    try {
      const dataUrl = await generateStoryImage({
        title: item.title,
        sections: item.sections,
      });
      downloadStoryImage(dataUrl);
      onClose();
    } catch (err) {
      console.error("[Falcızade] Story generation failed:", err);
    } finally {
      setIsGeneratingLatest(false);
      setGeneratingId(null);
    }
  };

  /* Option 1 — Son Falım */
  const handleLatest = async () => {
    if (isBusy || history.length === 0) return;
    setIsGeneratingLatest(true);
    await generate(history[0]);
  };

  /* Option 2 → go to history list */
  const handleOpenHistory = () => {
    if (isBusy || history.length === 0) return;
    setView("history");
  };

  /* Select item from history list */
  const handleSelectItem = async (item: FortuneHistoryItem) => {
    if (isBusy) return;
    setGeneratingId(item.id);
    await generate(item);
  };

  const latest    = history[0] ?? null;
  const hasHistory = history.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="spicker-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[70]"
            style={{ background: "rgba(5,2,12,0.84)", backdropFilter: "blur(8px)" }}
            onClick={handleClose}
          />

          {/* ── Bottom sheet ── */}
          <motion.div
            key="spicker-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 310, damping: 32 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-[71] flex flex-col overflow-hidden"
            style={{ ...SHEET_STYLE, height: view === "history" ? "80vh" : "auto" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-0 shrink-0">
              <div className="w-10 h-[3px] rounded-full"
                style={{ background: "rgba(251,191,36,0.26)" }} />
            </div>

            {/* ─────────────── Inner view switcher ─────────────── */}
            <AnimatePresence mode="wait" initial={false}>

              {/* ══════════════ OPTIONS VIEW ══════════════ */}
              {view === "options" && (
                <motion.div
                  key="view-options"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="flex flex-col px-5 pt-4 pb-8"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <Share2 className="w-4 h-4 text-amber-400/70" strokeWidth={1.5} />
                        <p className="font-display text-sm tracking-widest"
                          style={{ color: "#fbbf24", textShadow: "0 0 12px rgba(251,191,36,0.4)" }}>
                          Story Oluştur
                        </p>
                      </div>
                      <p className="text-[11px] font-sans pl-6"
                        style={{ color: "rgba(255,255,255,0.35)" }}>
                        Hangi falı Story olarak paylaşmak istersin?
                      </p>
                    </div>
                    <button
                      onClick={handleClose}
                      disabled={isBusy}
                      className="p-2 rounded-full transition-all active:scale-95 disabled:opacity-40"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.55)" }} />
                    </button>
                  </div>

                  {/* ── Thin divider ── */}
                  <div className="mb-5 h-px w-full"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.18), transparent)" }} />

                  {/* ── Option Card 1: Son Falım ── */}
                  <OptionCard
                    icon={
                      isGeneratingLatest
                        ? <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                        : <Sparkles className="w-6 h-6 text-amber-400" strokeWidth={1.5} />
                    }
                    title="Son Falım"
                    subtitle={
                      isGeneratingLatest
                        ? "Görsel oluşturuluyor…"
                        : hasHistory
                          ? getPreview(latest!)
                          : "Henüz bir fal okutmadın"
                    }
                    disabled={!hasHistory || isBusy}
                    loading={isGeneratingLatest}
                    onClick={handleLatest}
                  />

                  <div className="my-3" />

                  {/* ── Option Card 2: Geçmiş Fallarım ── */}
                  <OptionCard
                    icon={<BookOpen className="w-6 h-6 text-amber-400" strokeWidth={1.5} />}
                    title="Geçmiş Fallarım"
                    subtitle={
                      hasHistory
                        ? `${history.length} faldan birini seç`
                        : "Henüz bir fal geçmişin yok"
                    }
                    disabled={!hasHistory || isBusy}
                    onClick={handleOpenHistory}
                    showChevron
                  />
                </motion.div>
              )}

              {/* ══════════════ HISTORY VIEW ══════════════ */}
              {view === "history" && (
                <motion.div
                  key="view-history"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="flex flex-col flex-1 min-h-0"
                >
                  {/* History header */}
                  <div className="flex items-center gap-2 px-4 pt-3 pb-4 shrink-0"
                    style={{ borderBottom: "1px solid rgba(251,191,36,0.10)" }}>
                    <button
                      onClick={() => !isBusy && setView("options")}
                      disabled={isBusy}
                      className="p-2 rounded-full shrink-0 transition-all active:scale-95 disabled:opacity-40"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <ArrowLeft className="w-4 h-4" style={{ color: "rgba(255,255,255,0.60)" }} />
                    </button>
                    <div className="flex-1">
                      <p className="font-display text-sm tracking-widest"
                        style={{ color: "#fbbf24", textShadow: "0 0 12px rgba(251,191,36,0.4)" }}>
                        Geçmiş Fallarım
                      </p>
                      <p className="text-[11px] font-sans"
                        style={{ color: "rgba(255,255,255,0.35)" }}>
                        Story oluşturmak için bir fal seç
                      </p>
                    </div>
                    <button
                      onClick={handleClose}
                      disabled={isBusy}
                      className="p-2 rounded-full shrink-0 transition-all active:scale-95 disabled:opacity-40"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.55)" }} />
                    </button>
                  </div>

                  {/* Scrollable list */}
                  <div
                    className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5"
                    style={{ scrollbarWidth: "none" } as React.CSSProperties}
                  >
                    {history.map((item) => {
                      const isThis = generatingId === item.id;
                      const dim    = isBusy && !isThis;
                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => handleSelectItem(item)}
                          disabled={isBusy}
                          whileTap={{ scale: isBusy ? 1 : 0.98 }}
                          className="w-full text-left rounded-2xl px-4 py-3.5 transition-all disabled:cursor-not-allowed"
                          style={{
                            background: isThis
                              ? "rgba(251,191,36,0.10)"
                              : "rgba(255,255,255,0.038)",
                            border: `1px solid ${isThis ? "rgba(251,191,36,0.40)" : "rgba(255,255,255,0.08)"}`,
                            backdropFilter: "blur(10px)",
                            opacity: dim ? 0.42 : 1,
                            boxShadow: isThis ? "0 0 22px rgba(251,191,36,0.08)" : "none",
                            WebkitTapHighlightColor: "transparent",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-1">
                                <Clock className="w-3 h-3 shrink-0"
                                  style={{ color: "rgba(251,191,36,0.52)" }} />
                                <span className="text-[11px] font-sans truncate"
                                  style={{ color: "rgba(251,191,36,0.62)" }}>
                                  {formatDate(item.createdAt)}
                                </span>
                              </div>
                              <p className="text-[13px] font-serif leading-snug"
                                style={{ color: "rgba(255,255,255,0.68)" }}>
                                {getPreview(item)}
                              </p>
                            </div>

                            <div
                              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                              style={{
                                background: isThis ? "rgba(251,191,36,0.18)" : "rgba(251,191,36,0.08)",
                                border: `1px solid ${isThis ? "rgba(251,191,36,0.46)" : "rgba(251,191,36,0.18)"}`,
                                boxShadow: isThis ? "0 0 14px rgba(251,191,36,0.22)" : "none",
                              }}
                            >
                              {isThis
                                ? <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                                : <Share2 className="w-4 h-4" style={{ color: "rgba(251,191,36,0.68)" }} />}
                            </div>
                          </div>

                          {isThis && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="text-[11px] font-sans mt-2 text-center"
                              style={{ color: "rgba(251,191,36,0.65)" }}
                            >
                              Görsel oluşturuluyor…
                            </motion.p>
                          )}
                        </motion.button>
                      );
                    })}

                    <div className="h-6" />
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Reusable option card ─── */
interface OptionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  disabled?: boolean;
  loading?: boolean;
  showChevron?: boolean;
  onClick: () => void;
}

function OptionCard({ icon, title, subtitle, disabled, loading, showChevron, onClick }: OptionCardProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all disabled:cursor-not-allowed"
      style={{
        background: loading
          ? "rgba(251,191,36,0.10)"
          : "rgba(255,255,255,0.042)",
        border: `1.5px solid ${loading ? "rgba(251,191,36,0.42)" : "rgba(251,191,36,0.20)"}`,
        backdropFilter: "blur(12px)",
        opacity: disabled && !loading ? 0.45 : 1,
        boxShadow: loading ? "0 0 24px rgba(251,191,36,0.10)" : "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Icon circle */}
      <div
        className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{
          background: loading ? "rgba(251,191,36,0.20)" : "rgba(251,191,36,0.10)",
          border: `1px solid ${loading ? "rgba(251,191,36,0.50)" : "rgba(251,191,36,0.28)"}`,
          boxShadow: loading ? "0 0 18px rgba(251,191,36,0.22)" : "none",
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 text-left">
        <p className="font-display text-sm tracking-wide mb-0.5"
          style={{
            color: loading ? "#fbbf24" : "rgba(255,255,255,0.90)",
            textShadow: loading ? "0 0 12px rgba(251,191,36,0.35)" : "none",
          }}>
          {title}
        </p>
        <p className="text-[12px] font-sans leading-tight truncate"
          style={{ color: loading ? "rgba(251,191,36,0.70)" : "rgba(255,255,255,0.42)" }}>
          {subtitle}
        </p>
      </div>

      {/* Chevron or nothing */}
      {showChevron && !disabled && (
        <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "rgba(251,191,36,0.40)" }} />
      )}
    </motion.button>
  );
}
