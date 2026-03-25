import { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CloseButtonProps {
  visible: boolean;
  onClose: () => void;
}

export function CloseButton({ visible, onClose }: CloseButtonProps) {
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.75 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          whileHover={{ scale: 1.14, boxShadow: "0 0 28px rgba(251,191,36,0.55), 0 0 52px rgba(251,191,36,0.20), 0 4px 18px rgba(0,0,0,0.55)" }}
          whileTap={{ scale: 0.90 }}
          onClick={onClose}
          className="fixed z-50 top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(42,12,90,0.92) 0%, rgba(24,6,56,0.88) 100%)",
            border: "1.5px solid rgba(251,191,36,0.55)",
            boxShadow: "0 0 16px rgba(251,191,36,0.28), 0 0 32px rgba(251,191,36,0.10), 0 4px 14px rgba(0,0,0,0.55)",
            backdropFilter: "blur(14px)",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <X
            className="w-[18px] h-[18px]"
            strokeWidth={2.5}
            style={{ color: "#fbbf24", filter: "drop-shadow(0 0 6px rgba(251,191,36,0.65))" }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
