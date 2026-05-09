import { useEffect, useRef } from "react";
import { BRAND_LEFT_LOGO, BRAND_RIGHT_LOGO, CANVAS_H, CANVAS_W, VS_BADGE_IMAGE, preloadImages, renderFrame, totalDuration } from "@/lib/lineup-renderer";
import type { Match } from "@/lib/lineup-types";

interface Props {
  match: Match;
  playKey: number; // change to restart
  loop?: boolean;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export function LineupCanvas({ match, playKey, loop = true, onCanvasReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    onCanvasReady?.(canvas);
    startRef.current = performance.now();
    const dur = totalDuration(match);

    const tick = (now: number) => {
      let t = (now - startRef.current) / 1000;
      if (loop && t > dur + 0.5) {
        startRef.current = now;
        t = 0;
      }
      renderFrame(ctx, match, Math.min(t, dur));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [match, playKey, loop, onCanvasReady]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className="w-full h-auto rounded-lg shadow-2xl bg-black"
    />
  );
}
