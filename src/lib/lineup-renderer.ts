import type { AnimationStyle, Match } from "./lineup-types";

export const CANVAS_W = 1280;
export const CANVAS_H = 720;
export const ROW_DURATION = 0.35; // seconds per row reveal
export const HOLD_DURATION = 2.5; // seconds after last row

export const totalDuration = (m: Match) => {
  const rows = Math.max(m.team_a_players.length, m.team_b_players.length);
  return (rows * ROW_DURATION + HOLD_DURATION) / Math.max(0.25, m.animation_speed);
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function drawBackground(ctx: CanvasRenderingContext2D, m: Match) {
  const grad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
  grad.addColorStop(0, m.bg_from);
  grad.addColorStop(1, m.bg_to);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // subtle vignette
  const v = ctx.createRadialGradient(CANVAS_W/2, CANVAS_H/2, 200, CANVAS_W/2, CANVAS_H/2, 800);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

function drawHeader(ctx: CanvasRenderingContext2D, m: Match, t: number) {
  const headerProg = easeOut(clamp01(t / 0.6));
  ctx.save();
  ctx.globalAlpha = headerProg;
  ctx.translate(0, (1 - headerProg) * -20);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "700 36px system-ui, sans-serif";
  ctx.fillText(m.title, CANVAS_W / 2, 60);
  ctx.font = "600 22px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(m.subtitle, CANVAS_W / 2, 95);
  ctx.restore();
}

function drawVS(ctx: CanvasRenderingContext2D, t: number) {
  const p = easeOut(clamp01((t - 0.4) / 0.6));
  ctx.save();
  ctx.globalAlpha = p;
  const cx = CANVAS_W / 2, cy = CANVAS_H / 2 + 20;
  const scale = 0.7 + 0.3 * p;
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  // bolt
  ctx.fillStyle = "#fde047";
  ctx.beginPath();
  ctx.moveTo(-30, -70); ctx.lineTo(10, -10); ctx.lineTo(-15, -5);
  ctx.lineTo(30, 70); ctx.lineTo(-10, 10); ctx.lineTo(15, 5);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "900 80px system-ui, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("VS", 0, 0);
  ctx.restore();
}

function drawTeamHeader(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, name: string, color: string, prog: number) {
  ctx.save();
  ctx.globalAlpha = prog;
  ctx.translate(0, (1 - prog) * 20);
  // gold/team gradient pill
  const g = ctx.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0, shade(color, -0.2));
  g.addColorStop(0.5, color);
  g.addColorStop(1, shade(color, -0.2));
  roundRect(ctx, x, y, w, 50, 8);
  ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "800 30px system-ui, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(name, x + w / 2, y + 25);
  ctx.restore();
}

function shade(hex: string, amt: number): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0,2), 16);
  const g = parseInt(c.substring(2,4), 16);
  const b = parseInt(c.substring(4,6), 16);
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
  index: number, name: string, color: string,
  rowProg: number, style: AnimationStyle, side: "L" | "R"
) {
  if (rowProg <= 0) return;
  const p = clamp01(rowProg);
  const e = easeOut(p);

  ctx.save();

  // Per-style transform/effects
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

  // pill
  roundRect(ctx, x, y, w, h, 6);
  ctx.fillStyle = color;
  ctx.fill();

  // index square
  roundRect(ctx, x, y, h, h, 6);
  ctx.fillStyle = shade(color, -0.35);
  ctx.fill();

  ctx.fillStyle = "#1a1a1a";
  ctx.font = "800 22px system-ui, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(String(index + 1).padStart(2, "0"), x + h / 2, y + h / 2);

  ctx.textAlign = "left";
  ctx.font = "700 22px system-ui, sans-serif";
  ctx.fillText(name.toUpperCase(), x + h + 14, y + h / 2);

  ctx.restore();
}

export function renderFrame(ctx: CanvasRenderingContext2D, m: Match, time: number) {
  const speed = Math.max(0.25, m.animation_speed);
  const t = time * speed;

  drawBackground(ctx, m);
  drawHeader(ctx, m, t);

  const colW = 380;
  const colAX = 120;
  const colBX = CANVAS_W - 120 - colW;
  const headerY = 130;

  drawTeamHeader(ctx, colAX, headerY, colW, m.team_a_name, m.team_a_color, easeOut(clamp01((t - 0.2) / 0.5)));
  drawTeamHeader(ctx, colBX, headerY, colW, m.team_b_name, m.team_b_color, easeOut(clamp01((t - 0.2) / 0.5)));

  drawVS(ctx, t);

  const rowH = 30;
  const rowGap = 4;
  const rowsStartY = headerY + 70;

  const rows = Math.max(m.team_a_players.length, m.team_b_players.length);
  const stagger = ROW_DURATION;
  const rowAnimDur = ROW_DURATION * 1.2;

  for (let i = 0; i < rows; i++) {
    const rowStart = 0.6 + i * stagger * 0.8;
    const rowProg = clamp01((t - rowStart) / rowAnimDur);
    const y = rowsStartY + i * (rowH + rowGap);

    if (m.team_a_players[i]) {
      drawRow(ctx, colAX, y, colW, rowH, i, m.team_a_players[i], m.team_a_color, rowProg, m.animation_style, "L");
    }
    if (m.team_b_players[i]) {
      drawRow(ctx, colBX, y, colW, rowH, i, m.team_b_players[i], m.team_b_color, rowProg, m.animation_style, "R");
    }
  }
}
