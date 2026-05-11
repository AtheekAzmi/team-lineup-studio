import type { AnimationStyle, Match } from "./lineup-types";

export const CANVAS_W = 1536;
export const CANVAS_H = 1024;
export const ROW_DURATION = 0.45;
export const HOLD_DURATION = 9;
export const MIN_DURATION = 15;
export const MAX_DURATION = 20;

export const canvasW = (m: Match) => Math.max(320, Math.round(m.canvas_width || CANVAS_W));
export const canvasH = (m: Match) => Math.max(320, Math.round(m.canvas_height || CANVAS_H));

// Brand assets shown on every lineup
export const BRAND_LEFT_LOGO = "/branding/sports-festival-logo.png";
export const BRAND_RIGHT_LOGO = "/branding/oba-logo.png";
export const VS_BADGE_IMAGE = "/branding/vs.png";

export const totalDuration = (m: Match) => {
  const rows = Math.max(m.team_a_players.length, m.team_b_players.length);
  const base = rows * ROW_DURATION + HOLD_DURATION;
  const clamped = Math.min(MAX_DURATION, Math.max(MIN_DURATION, base));
  return clamped / Math.max(0.25, m.animation_speed);
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// ---- Image cache (cross-origin so canvas stays untainted for export) ----
const imageCache = new Map<string, HTMLImageElement>();

export function getCachedImage(url: string): HTMLImageElement | null {
  if (!url) return null;
  const cached = imageCache.get(url);
  if (cached) return cached.complete && cached.naturalWidth > 0 ? cached : null;
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  imageCache.set(url, img);
  return null;
}

export function preloadImages(urls: (string | null | undefined)[]): Promise<void> {
  const tasks = urls
    .filter((u): u is string => !!u)
    .map(
      (u) =>
        new Promise<void>((resolve) => {
          const existing = imageCache.get(u);
          if (existing && existing.complete && existing.naturalWidth > 0) return resolve();
          const img = existing ?? new Image();
          if (!existing) {
            img.crossOrigin = "anonymous";
            imageCache.set(u, img);
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
          if (!existing) img.src = u;
          if (img.complete) resolve();
        }),
    );
  return Promise.all(tasks).then(() => undefined);
}

function drawBackground(ctx: CanvasRenderingContext2D, m: Match) {
  const W = canvasW(m), H = canvasH(m);
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, m.bg_from);
  grad.addColorStop(1, m.bg_to);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  if (m.bg_image_url) {
    const img = getCachedImage(m.bg_image_url);
    if (img) {
      const ir = img.width / img.height;
      const cr = W / H;
      let dw = W, dh = H, dx = 0, dy = 0;
      if (ir > cr) {
        dh = H; dw = dh * ir; dx = (W - dw) / 2;
      } else {
        dw = W; dh = dw / ir; dy = (H - dh) / 2;
      }
      ctx.save();
      ctx.globalAlpha = clamp01(m.bg_image_opacity);
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    }
  }

  const v = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, Math.max(W, H) * 0.6);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

function drawHeader(ctx: CanvasRenderingContext2D, m: Match, t: number) {
  const headerProg = easeOut(clamp01(t / 0.6));
  ctx.save();
  ctx.globalAlpha = headerProg;
  ctx.translate(0, (1 - headerProg) * -20);
  const font = m.title_font || "system-ui, sans-serif";
  const titleSize = Math.max(16, Math.min(120, m.title_size || 44));
  ctx.fillStyle = m.title_color || "#fff";
  ctx.textAlign = "center";
  ctx.font = `800 ${titleSize}px ${font}`;
  ctx.fillText(m.title, CANVAS_W / 2, 40 + titleSize * 0.7);
  ctx.fillStyle = m.subtitle_color || "rgba(255,255,255,0.85)";
  ctx.font = `600 ${Math.round(titleSize * 0.6)}px ${font}`;
  ctx.fillText(m.subtitle, CANVAS_W / 2, 40 + titleSize * 0.7 + titleSize * 0.85);
  ctx.restore();

  // Brand logos flanking title (left = sports festival, right = OBA)
  const brandProg = easeOut(clamp01(t / 0.7));
  drawBrandLogo(ctx, BRAND_LEFT_LOGO, 110, 90, 150, brandProg);
  drawBrandLogo(ctx, BRAND_RIGHT_LOGO, CANVAS_W - 110, 90, 150, brandProg);
}

function drawBrandLogo(
  ctx: CanvasRenderingContext2D,
  url: string,
  cx: number,
  cy: number,
  maxSize: number,
  prog: number,
) {
  const img = getCachedImage(url);
  if (!img) return;
  const ratio = img.width / img.height || 1;
  const w = ratio >= 1 ? maxSize : maxSize * ratio;
  const h = ratio >= 1 ? maxSize / ratio : maxSize;
  ctx.save();
  ctx.globalAlpha = prog;
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  ctx.restore();
}

function drawVS(ctx: CanvasRenderingContext2D, t: number, badgeUrl?: string | null) {
  const p = easeOut(clamp01((t - 0.4) / 0.6));
  if (p <= 0) return;
  const cx = CANVAS_W / 2, cy = CANVAS_H / 2 + 30;
  const scale = 0.7 + 0.3 * p;
  const img = getCachedImage(badgeUrl || VS_BADGE_IMAGE);
  ctx.save();
  ctx.globalAlpha = p;
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  if (img) {
    const target = 280;
    const ratio = img.width / img.height || 1;
    const w = ratio >= 1 ? target : target * ratio;
    const h = ratio >= 1 ? target / ratio : target;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
  } else {
    // Fallback vector VS while image loads
    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.moveTo(-30, -70); ctx.lineTo(10, -10); ctx.lineTo(-15, -5);
    ctx.lineTo(30, 70); ctx.lineTo(-10, 10); ctx.lineTo(15, 5);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "900 80px system-ui, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("VS", 0, 0);
  }
  ctx.restore();
}

function drawLogo(
  ctx: CanvasRenderingContext2D,
  url: string | null,
  anchorX: number,
  anchorY: number,
  scale: number,
  offsetX: number,
  offsetY: number,
  prog: number,
) {
  if (!url) return;
  const img = getCachedImage(url);
  if (!img) return;
  const baseSize = 140;
  const ratio = img.width / img.height || 1;
  const w = baseSize * scale * (ratio >= 1 ? 1 : ratio);
  const h = baseSize * scale * (ratio >= 1 ? 1 / ratio : 1);
  ctx.save();
  ctx.globalAlpha = prog;
  ctx.translate(anchorX + offsetX, anchorY + offsetY);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function drawTeamHeader(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, name: string, color: string, textColor: string, prog: number) {
  ctx.save();
  ctx.globalAlpha = prog;
  ctx.translate(0, (1 - prog) * 20);
  const g = ctx.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0, shade(color, -0.2));
  g.addColorStop(0.5, color);
  g.addColorStop(1, shade(color, -0.2));
  roundRect(ctx, x, y, w, 50, 8);
  ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = textColor;
  ctx.font = "800 30px system-ui, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(name, x + w / 2, y + 25);
  ctx.restore();
}

function shade(hex: string, amt: number): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + v * amt)));
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawRow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  index: number, name: string, color: string, textColor: string,
  rowProg: number, style: AnimationStyle, side: "L" | "R"
) {
  if (rowProg <= 0) return;
  const p = clamp01(rowProg);
  const e = easeOut(p);

  ctx.save();

  switch (style) {
    case "rise":
      ctx.globalAlpha = e;
      ctx.translate(0, (1 - e) * 40);
      break;
    case "fade":
      ctx.globalAlpha = e;
      break;
    case "pan":
      ctx.globalAlpha = e;
      ctx.translate((side === "L" ? -1 : 1) * (1 - e) * 80, 0);
      break;
    case "pop": {
      ctx.globalAlpha = e;
      const s = 0.6 + 0.4 * e + Math.sin(p * Math.PI) * 0.08;
      ctx.translate(x + w / 2, y + h / 2);
      ctx.scale(s, s);
      ctx.translate(-(x + w / 2), -(y + h / 2));
      break;
    }
    case "wipe":
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.rect(x, y, w * e, h);
      ctx.clip();
      break;
    case "blur":
      ctx.globalAlpha = e;
      ctx.filter = `blur(${(1 - e) * 12}px)`;
      break;
    case "succession":
      ctx.globalAlpha = e;
      ctx.translate(0, (1 - e) * 16);
      break;
    case "breathe": {
      ctx.globalAlpha = e;
      const s = 1 + Math.sin(p * Math.PI) * 0.06;
      ctx.translate(x + w / 2, y + h / 2);
      ctx.scale(s, s);
      ctx.translate(-(x + w / 2), -(y + h / 2));
      break;
    }
    case "baseline":
      ctx.globalAlpha = e;
      ctx.translate(0, (1 - e) * 24);
      break;
    case "drift":
      ctx.globalAlpha = e;
      ctx.translate((side === "L" ? -1 : 1) * (1 - e) * 30, (1 - e) * 10);
      break;
    case "tectonic":
      ctx.globalAlpha = e;
      ctx.translate((side === "L" ? -1 : 1) * (1 - e) * 120, 0);
      break;
    case "tumble": {
      ctx.globalAlpha = e;
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate((1 - e) * (side === "L" ? -0.6 : 0.6));
      ctx.translate(-(x + w / 2), -(y + h / 2));
      ctx.translate(0, (1 - e) * 30);
      break;
    }
  }

  roundRect(ctx, x, y, w, h, 6);
  ctx.fillStyle = color;
  ctx.fill();

  roundRect(ctx, x, y, h, h, 6);
  ctx.fillStyle = shade(color, -0.35);
  ctx.fill();

  const fs = Math.max(14, Math.min(48, Math.round(h * 0.55)));
  ctx.fillStyle = textColor;
  ctx.font = `800 ${fs}px system-ui, sans-serif`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(String(index + 1).padStart(2, "0"), x + h / 2, y + h / 2);

  ctx.textAlign = "left";
  ctx.font = `700 ${fs}px system-ui, sans-serif`;
  ctx.fillText(name.toUpperCase(), x + h + 14, y + h / 2);

  ctx.restore();
}

export function renderFrame(ctx: CanvasRenderingContext2D, m: Match, time: number) {
  const speed = Math.max(0.25, m.animation_speed);
  const t = time * speed;

  drawBackground(ctx, m);
  drawHeader(ctx, m, t);

  const colW = Math.max(200, Math.min(CANVAS_W / 2 - 60, m.card_width || 480));
  const sideMargin = Math.max(40, (CANVAS_W - colW * 2 - 120) / 2);
  const colAX = sideMargin;
  const colBX = CANVAS_W - sideMargin - colW;
  const headerY = 180;

  const teamProg = easeOut(clamp01((t - 0.2) / 0.5));
  drawTeamHeader(ctx, colAX, headerY, colW, m.team_a_name, m.team_a_color, m.player_text_color || "#1a1a1a", teamProg);
  drawTeamHeader(ctx, colBX, headerY, colW, m.team_b_name, m.team_b_color, m.player_text_color || "#1a1a1a", teamProg);

  // Team logos centered above each team header (user-supplied per match)
  const logoProg = easeOut(clamp01((t - 0.1) / 0.6));
  drawLogo(ctx, m.team_a_logo_url, colAX + colW / 2, headerY - 70, m.team_a_logo_scale, m.team_a_logo_x, m.team_a_logo_y, logoProg);
  drawLogo(ctx, m.team_b_logo_url, colBX + colW / 2, headerY - 70, m.team_b_logo_scale, m.team_b_logo_x, m.team_b_logo_y, logoProg);

  drawVS(ctx, t, m.vs_badge_url);

  const rowsStartY = headerY + 80;
  const bottomGap = 15;
  const rows = Math.max(m.team_a_players.length, m.team_b_players.length, 1);
  const rowGap = 6;
  // Auto-size row height so rows fill available space with a small bottom gap, or use manual override
  const available = CANVAS_H - rowsStartY - bottomGap;
  const autoH = Math.floor((available - rowGap * (rows - 1)) / rows);
  const rowH = m.card_height && m.card_height > 0
    ? Math.max(20, Math.min(120, m.card_height))
    : Math.max(28, Math.min(56, autoH));
  const stagger = ROW_DURATION;
  const rowAnimDur = ROW_DURATION * 1.2;

  for (let i = 0; i < rows; i++) {
    const rowStart = 0.6 + i * stagger * 0.8;
    const rowProg = clamp01((t - rowStart) / rowAnimDur);
    const y = rowsStartY + i * (rowH + rowGap);

    if (m.team_a_players[i]) {
      drawRow(ctx, colAX, y, colW, rowH, i, m.team_a_players[i], m.team_a_color, m.player_text_color || "#1a1a1a", rowProg, m.animation_style, "L");
    }
    if (m.team_b_players[i]) {
      drawRow(ctx, colBX, y, colW, rowH, i, m.team_b_players[i], m.team_b_color, m.player_text_color || "#1a1a1a", rowProg, m.animation_style, "R");
    }
  }
}
