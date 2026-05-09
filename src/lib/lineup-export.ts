import { BRAND_LEFT_LOGO, BRAND_RIGHT_LOGO, CANVAS_H, CANVAS_W, VS_BADGE_IMAGE, preloadImages, renderFrame, totalDuration } from "./lineup-renderer";
import type { Match } from "./lineup-types";

export type ExportFormat = "mp4" | "webm";

function pickMime(format: ExportFormat): { mime: string; ext: string } {
  if (format === "mp4") {
    const candidates = [
      "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
      "video/mp4;codecs=avc1",
      "video/mp4",
    ];
    for (const c of candidates) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) {
        return { mime: c, ext: "mp4" };
      }
    }
  }
  const webm = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  for (const c of webm) {
    if (MediaRecorder.isTypeSupported(c)) return { mime: c, ext: "webm" };
  }
  return { mime: "video/webm", ext: "webm" };
}

export async function exportLineupVideo(
  match: Match,
  format: ExportFormat,
  onProgress?: (p: number) => void
): Promise<{ blob: Blob; ext: string }> {
  await preloadImages([match.bg_image_url, match.team_a_logo_url, match.team_b_logo_url]);
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d")!;
  const fps = 30;
  const stream: MediaStream = (canvas as HTMLCanvasElement & { captureStream: (fps: number) => MediaStream }).captureStream(fps);

  const { mime, ext } = pickMime(format);
  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  const dur = totalDuration(match);
  const totalFrames = Math.ceil(dur * fps);

  return new Promise((resolve, reject) => {
    recorder.onstop = () => resolve({ blob: new Blob(chunks, { type: mime }), ext });
    recorder.onerror = (e) => reject(e);
    recorder.start();

    let frame = 0;
    const renderNext = () => {
      const t = frame / fps;
      renderFrame(ctx, match, t);
      onProgress?.(frame / totalFrames);
      frame++;
      if (frame <= totalFrames) {
        // Allow capture pipeline to grab the frame
        requestAnimationFrame(renderNext);
      } else {
        setTimeout(() => recorder.stop(), 200);
      }
    };
    requestAnimationFrame(renderNext);
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
