/* ─────────────────────────────────────────────────────────────
   Generates a 1080×1920 Instagram Story image for a fortune.
   Card-based layout with glowing mystical border.
   Auto-scales text so all 5 sections always fit inside the card.
   ───────────────────────────────────────────────────────────── */

export interface StoryFortuneData {
  title: string;
  sections: {
    ask: string;
    para: string;
    yol: string;
    saglik: string;
    genel: string;
  };
  userName?: string;
}

/* ── Canvas dimensions ── */
const W = 1080;
const H = 1920;

/* ── Colours ── */
const GOLD      = "#fbbf24";
const GOLD_55   = "rgba(251,191,36,0.55)";
const GOLD_35   = "rgba(251,191,36,0.35)";
const GOLD_20   = "rgba(251,191,36,0.20)";
const WHITE_90  = "rgba(255,255,255,0.90)";

/* ── Header zone: y = 72 … ~352 ── */
const HDR_EMOJI_Y  = 172;   // baseline
const HDR_TITLE_Y  = 268;   // baseline  (Cinzel 84 px)
const HDR_SUB_Y    = 314;   // baseline  (Cormorant 36 px italic)
const HDR_DIVIDER  = 342;

/* ── Fortune card ── */
const CARD_X  = 52;
const CARD_Y  = 368;
const CARD_W  = W - CARD_X * 2;   // 976
const CARD_H  = 1312;              // ends at y = 1680
const CARD_R  = 52;
const CARD_PX = 68;                // horizontal padding inside card
const CARD_PY = 56;                // vertical padding inside card

// Content rectangle inside card
const CX = CARD_X + CARD_PX;          // 120
const CY = CARD_Y + CARD_PY;          // 424
const CW = CARD_W - CARD_PX * 2;      // 840
const CH = CARD_H - CARD_PY * 2;      // 1200

/* ── Footer zone: y = ~1700 ── */
const FTR_Y = 1706;

/* ── Section definitions ── */
const SECTIONS = [
  { icon: "♡", label: "AŞK",    key: "ask"    as const },
  { icon: "◈", label: "PARA",   key: "para"   as const },
  { icon: "↝", label: "YOL",    key: "yol"    as const },
  { icon: "❧", label: "SAĞLIK", key: "saglik" as const },
  { icon: "✦", label: "GENEL",  key: "genel"  as const },
];

/* ── Seeded stars ── */
const STARS = Array.from({ length: 240 }, (_, i) => ({
  x: ((i * 673 + 113) % 1000) / 1000 * W,
  y: ((i * 419 + 317) % 1000) / 1000 * H,
  r: i % 5 === 0 ? 2.4 : i % 3 === 0 ? 1.6 : 0.9,
  o: 0.08 + (i % 9) * 0.07,
}));

/* ═══════════════════════════════════
   Utility helpers
═══════════════════════════════════ */

/** Round-rect path (no fill/stroke — caller decides) */
function rrPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Word-wrap: draws text and returns next Y */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  maxW: number,
  lineH: number,
  startY: number,
): number {
  const words = text.split(" ");
  let line = "";
  let y = startY;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineH;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
  return y + lineH;
}

/** Count lines needed for text at current ctx font */
function countLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): number {
  const words = text.split(" ");
  let line = "";
  let count = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      count++;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) count++;
  return Math.max(1, count);
}

/** Measure total pixel height needed for all 5 sections at a given fontSize */
function measureSections(
  ctx: CanvasRenderingContext2D,
  sections: StoryFortuneData["sections"],
  fontSize: number,
): number {
  const lbSize  = Math.round(fontSize * 0.75);   // label font size
  const lineH   = Math.round(fontSize * 1.52);   // text line height
  const lbH     = Math.round(fontSize * 1.06);   // label baseline offset
  const lbGap   = Math.round(fontSize * 0.44);   // gap after label underline
  const secGap  = Math.round(fontSize * 0.65);   // gap after text block
  const divGap  = 28;                            // divider row height

  let total = 0;
  for (let i = 0; i < SECTIONS.length; i++) {
    total += lbH + lbGap;
    ctx.font = `${fontSize}px 'Cormorant Garamond', serif`;
    total += countLines(ctx, sections[SECTIONS[i].key], CW) * lineH;
    total += secGap;
    if (i < SECTIONS.length - 1) total += divGap;
  }
  return total;
}

/** Find largest font size (34 → 20, step 2) where all text fits in CH */
function findFontSize(ctx: CanvasRenderingContext2D, sections: StoryFortuneData["sections"]): number {
  for (let size = 34; size >= 20; size -= 2) {
    if (measureSections(ctx, sections, size) <= CH) return size;
  }
  return 20;
}

/* ═══════════════════════════════════
   Drawing layers
═══════════════════════════════════ */

function drawBackground(ctx: CanvasRenderingContext2D) {
  // Deep purple base
  const bg = ctx.createLinearGradient(0, 0, W * 0.35, H);
  bg.addColorStop(0,    "#0d0521");
  bg.addColorStop(0.45, "#110928");
  bg.addColorStop(1,    "#0a041a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Top-centre glow
  const g1 = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 720);
  g1.addColorStop(0, "rgba(109,40,217,0.30)");
  g1.addColorStop(1, "transparent");
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);

  // Bottom-right glow
  const g2 = ctx.createRadialGradient(W, H, 0, W, H, 620);
  g2.addColorStop(0, "rgba(67,20,120,0.38)");
  g2.addColorStop(1, "transparent");
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);

  // Mid-left accent
  const g3 = ctx.createRadialGradient(0, H * 0.52, 0, 0, H * 0.52, 420);
  g3.addColorStop(0, "rgba(139,92,246,0.14)");
  g3.addColorStop(1, "transparent");
  ctx.fillStyle = g3;
  ctx.fillRect(0, 0, W, H);
}

function drawStars(ctx: CanvasRenderingContext2D) {
  for (const s of STARS) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${s.o})`;
    ctx.fill();
  }
}

function drawGoldDivider(ctx: CanvasRenderingContext2D, y: number, width = 600) {
  const x0 = (W - width) / 2;
  const grd = ctx.createLinearGradient(x0, y, x0 + width, y);
  grd.addColorStop(0,   "transparent");
  grd.addColorStop(0.5, GOLD_55);
  grd.addColorStop(1,   "transparent");
  ctx.save();
  ctx.strokeStyle = grd;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x0 + width, y);
  ctx.stroke();
  ctx.restore();
}

function drawHeader(ctx: CanvasRenderingContext2D) {
  // Halo behind logo
  const halo = ctx.createRadialGradient(W / 2, HDR_TITLE_Y - 60, 0, W / 2, HDR_TITLE_Y - 60, 300);
  halo.addColorStop(0, "rgba(251,191,36,0.10)");
  halo.addColorStop(1, "transparent");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 60, W, 320);

  // 🔮 emoji
  ctx.save();
  ctx.font     = "82px serif";
  ctx.textAlign = "center";
  ctx.fillText("🔮", W / 2, HDR_EMOJI_Y);
  ctx.restore();

  // FALCIZADE
  ctx.save();
  ctx.font        = "bold 86px 'Cinzel', serif";
  ctx.textAlign   = "center";
  ctx.fillStyle   = GOLD;
  ctx.shadowColor = "rgba(251,191,36,0.50)";
  ctx.shadowBlur  = 30;
  ctx.fillText("FALCIZADE", W / 2, HDR_TITLE_Y);
  ctx.shadowBlur  = 0;
  ctx.restore();

  // Subtitle
  ctx.save();
  ctx.font      = "italic 38px 'Cormorant Garamond', serif";
  ctx.textAlign = "center";
  ctx.fillStyle = GOLD_55;
  ctx.fillText("Kahve Falı", W / 2, HDR_SUB_Y);
  ctx.restore();

  drawGoldDivider(ctx, HDR_DIVIDER, 680);
}

/** 4-pointed star ornament for card corners */
function drawCornerStar(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle   = GOLD;
  ctx.shadowColor = "rgba(251,191,36,0.95)";
  ctx.shadowBlur  = 16;
  ctx.beginPath();
  const pts = 8;
  for (let i = 0; i < pts; i++) {
    const angle = (i * Math.PI * 2) / pts - Math.PI / 4;
    const r = i % 2 === 0 ? 14 : 5.5;
    const px = r * Math.cos(angle);
    const py = r * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCard(ctx: CanvasRenderingContext2D) {
  // ── 1. Outer glow (shadow on fill) ────────────────────────
  ctx.save();
  ctx.shadowColor   = "rgba(251,191,36,0.48)";
  ctx.shadowBlur    = 50;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle     = "rgba(10, 3, 28, 0.92)";
  rrPath(ctx, CARD_X, CARD_Y, CARD_W, CARD_H, CARD_R);
  ctx.fill();
  ctx.restore();

  // ── 2. Gold outer border ─────────────────────────────────
  ctx.save();
  ctx.strokeStyle = "rgba(251,191,36,0.42)";
  ctx.lineWidth   = 2.5;
  rrPath(ctx, CARD_X, CARD_Y, CARD_W, CARD_H, CARD_R);
  ctx.stroke();
  ctx.restore();

  // ── 3. Faint inner border (double-line effect) ────────────
  ctx.save();
  ctx.strokeStyle = GOLD_20;
  ctx.lineWidth   = 1;
  rrPath(ctx, CARD_X + 6, CARD_Y + 6, CARD_W - 12, CARD_H - 12, CARD_R - 4);
  ctx.stroke();
  ctx.restore();

  // ── 4. Top shimmer band inside card ───────────────────────
  const shimmer = ctx.createLinearGradient(CARD_X, CARD_Y, CARD_X + CARD_W, CARD_Y);
  shimmer.addColorStop(0,   "transparent");
  shimmer.addColorStop(0.5, "rgba(251,191,36,0.08)");
  shimmer.addColorStop(1,   "transparent");
  ctx.save();
  ctx.fillStyle = shimmer;
  ctx.fillRect(CARD_X, CARD_Y, CARD_W, 4);
  ctx.restore();

  // ── 5. Corner ornaments ───────────────────────────────────
  const corners: [number, number][] = [
    [CARD_X,            CARD_Y],
    [CARD_X + CARD_W,   CARD_Y],
    [CARD_X,            CARD_Y + CARD_H],
    [CARD_X + CARD_W,   CARD_Y + CARD_H],
  ];
  for (const [cx, cy] of corners) drawCornerStar(ctx, cx, cy);
}

function drawInnerDivider(ctx: CanvasRenderingContext2D, y: number) {
  const x0 = CX + 40;
  const x1 = CX + CW - 40;
  const grd = ctx.createLinearGradient(x0, y, x1, y);
  grd.addColorStop(0,   "transparent");
  grd.addColorStop(0.5, "rgba(251,191,36,0.22)");
  grd.addColorStop(1,   "transparent");
  ctx.save();
  ctx.strokeStyle = grd;
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x1, y);
  ctx.stroke();
  ctx.restore();
}

function drawSections(
  ctx: CanvasRenderingContext2D,
  sections: StoryFortuneData["sections"],
  fontSize: number,
) {
  const lbSize = Math.round(fontSize * 0.75);
  const lineH  = Math.round(fontSize * 1.52);
  const lbH    = Math.round(fontSize * 1.06);
  const lbGap  = Math.round(fontSize * 0.44);
  const secGap = Math.round(fontSize * 0.65);
  const divGap = 28;

  let y = CY;

  for (let i = 0; i < SECTIONS.length; i++) {
    const { icon, label, key } = SECTIONS[i];

    // Label
    ctx.save();
    ctx.font        = `500 ${lbSize}px 'Cinzel', serif`;
    ctx.textAlign   = "left";
    ctx.fillStyle   = GOLD;
    ctx.shadowColor = "rgba(251,191,36,0.45)";
    ctx.shadowBlur  = 10;
    ctx.fillText(`${icon}  ${label}`, CX, y + lbH);
    ctx.restore();

    // Label underline
    ctx.save();
    ctx.font = `500 ${lbSize}px 'Cinzel', serif`;
    const lw = ctx.measureText(`${icon}  ${label}`).width;
    const lg = ctx.createLinearGradient(CX, 0, CX + lw, 0);
    lg.addColorStop(0, GOLD_35);
    lg.addColorStop(1, "transparent");
    ctx.strokeStyle = lg;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(CX, y + lbH + 7);
    ctx.lineTo(CX + lw, y + lbH + 7);
    ctx.stroke();
    ctx.restore();

    y += lbH + lbGap;

    // Fortune text
    ctx.save();
    ctx.font      = `${fontSize}px 'Cormorant Garamond', serif`;
    ctx.fillStyle = WHITE_90;
    ctx.textAlign = "left";
    y = wrapText(ctx, sections[key], CX, CW, lineH, y);
    ctx.restore();

    y += secGap;

    // Divider between sections
    if (i < SECTIONS.length - 1) {
      drawInnerDivider(ctx, y);
      y += divGap;
    }
  }
}

function drawFooter(ctx: CanvasRenderingContext2D) {
  drawGoldDivider(ctx, FTR_Y, 720);

  // Decoration row
  ctx.save();
  ctx.font      = "30px serif";
  ctx.textAlign = "center";
  ctx.fillStyle = GOLD_55;
  ctx.fillText("· · ✦ · ·", W / 2, FTR_Y + 62);
  ctx.restore();

  // CTA
  ctx.save();
  ctx.font        = "bold 48px 'Cinzel', serif";
  ctx.textAlign   = "center";
  ctx.fillStyle   = GOLD;
  ctx.shadowColor = "rgba(251,191,36,0.55)";
  ctx.shadowBlur  = 24;
  ctx.fillText("✨ Falcızade ile falına bak", W / 2, FTR_Y + 144);
  ctx.restore();

  // Bottom radial glow
  const bg = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, 400);
  bg.addColorStop(0, "rgba(251,191,36,0.07)");
  bg.addColorStop(1, "transparent");
  ctx.fillStyle = bg;
  ctx.fillRect(0, H - 400, W, 400);
}

/* ══════════════════════════════════════════════
   Main entry point
══════════════════════════════════════════════ */
export async function generateStoryImage(data: StoryFortuneData): Promise<string> {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }

  const canvas = document.createElement("canvas");
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  // Background + stars first
  drawBackground(ctx);
  drawStars(ctx);

  // Header
  drawHeader(ctx);

  // Card shell (background + border + ornaments)
  drawCard(ctx);

  // Clip content to card interior so nothing overflows
  ctx.save();
  rrPath(ctx, CARD_X + 3, CARD_Y + 3, CARD_W - 6, CARD_H - 6, CARD_R - 2);
  ctx.clip();

  // Auto-scale and draw sections
  const fontSize = findFontSize(ctx, data.sections);
  drawSections(ctx, data.sections, fontSize);

  ctx.restore(); // release clip

  // Footer
  drawFooter(ctx);

  return canvas.toDataURL("image/jpeg", 0.92);
}

/* ══════════════════════════════════════════════
   Download / share
══════════════════════════════════════════════ */
export function downloadStoryImage(dataUrl: string, filename = "falcizade-falim.jpg") {
  const android = typeof window !== "undefined"
    ? ((window as unknown as Record<string, unknown>).FalcizadeAndroid as
        { shareImage?: (b64: string, mime: string, name: string) => void } | undefined)
    : undefined;

  if (android?.shareImage) {
    android.shareImage(dataUrl.split(",")[1] ?? dataUrl, "image/jpeg", filename);
    return;
  }

  const a = document.createElement("a");
  a.href     = dataUrl;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 200);
}
