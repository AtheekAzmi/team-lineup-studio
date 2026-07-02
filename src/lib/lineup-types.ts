export type AnimationStyle =
  | "rise" | "pan" | "fade" | "pop" | "wipe" | "blur"
  | "succession" | "breathe" | "baseline" | "drift" | "tectonic" | "tumble";

export const ANIMATION_STYLES: { id: AnimationStyle; label: string }[] = [
  { id: "rise", label: "Rise" },
  { id: "pan", label: "Pan" },
  { id: "fade", label: "Fade" },
  { id: "pop", label: "Pop" },
  { id: "wipe", label: "Wipe" },
  { id: "blur", label: "Blur" },
  { id: "succession", label: "Succession" },
  { id: "breathe", label: "Breathe" },
  { id: "baseline", label: "Baseline" },
  { id: "drift", label: "Drift" },
  { id: "tectonic", label: "Tectonic" },
  { id: "tumble", label: "Tumble" },
];

export interface Match {
  id: string;
  title: string;
  subtitle: string;
  team_a_name: string;
  team_a_players: string[];
  team_a_color: string;
  team_b_name: string;
  team_b_players: string[];
  team_b_color: string;
  bg_from: string;
  bg_to: string;
  bg_image_url: string | null;
  bg_image_opacity: number;
  bg_video_url: string | null;
  team_a_logo_url: string | null;
  team_a_logo_scale: number;
  team_a_logo_x: number;
  team_a_logo_y: number;
  team_b_logo_url: string | null;
  team_b_logo_scale: number;
  team_b_logo_x: number;
  team_b_logo_y: number;
  vs_badge_url: string | null;
  title_color: string;
  title_font: string;
  title_size: number;
  subtitle_color: string;
  player_text_color: string;
  card_width: number;
  card_height: number;
  canvas_width: number;
  canvas_height: number;
  column_gap: number;
  brand_left_scale: number;
  brand_left_x: number;
  brand_left_y: number;
  brand_right_scale: number;
  brand_right_x: number;
  brand_right_y: number;
  animation_style: AnimationStyle;
  animation_speed: number;
}

export const RESOLUTION_PRESETS: { id: string; label: string; w: number; h: number }[] = [
  { id: "6x4m", label: "LED 6m × 4m (1536×1024)", w: 1536, h: 1024 },
  { id: "1080p", label: "Full HD 1920×1080", w: 1920, h: 1080 },
  { id: "720p", label: "HD 1280×720", w: 1280, h: 720 },
  { id: "square", label: "Square 1080×1080", w: 1080, h: 1080 },
  { id: "vertical", label: "Vertical 1080×1920", w: 1080, h: 1920 },
  { id: "4k", label: "4K UHD 3840×2160", w: 3840, h: 2160 },
];

export const FONT_OPTIONS: { id: string; label: string }[] = [
  { id: "system-ui, sans-serif", label: "System Sans" },
  { id: "'Inter', system-ui, sans-serif", label: "Inter" },
  { id: "'Bebas Neue', Impact, sans-serif", label: "Bebas Neue" },
  { id: "'Oswald', Impact, sans-serif", label: "Oswald" },
  { id: "'Anton', Impact, sans-serif", label: "Anton" },
  { id: "'Archivo Black', system-ui, sans-serif", label: "Archivo Black" },
  { id: "'Bebas Neue', 'Archivo Black', sans-serif", label: "Display Condensed" },
  { id: "'Montserrat', sans-serif", label: "Montserrat" },
  { id: "'Poppins', sans-serif", label: "Poppins" },
  { id: "Georgia, 'Times New Roman', serif", label: "Serif" },
  { id: "'Playfair Display', Georgia, serif", label: "Playfair" },
  { id: "Impact, 'Arial Black', sans-serif", label: "Impact" },
];

export const defaultMatch = (): Omit<Match, "id"> => ({
  title: "HUMAISARIAN SPORTS FESTIVAL - 2026",
  subtitle: "CENTENARY TROPHY SEASON 2",
  team_a_name: "2006",
  team_a_players: ["FOUS MOULANA","ASJAD","IHSAN","FAROOS","ALFAS","RAHMY","IFATH","NASRATH","RAFSAN","AHLAS","SHAHMY","SILMI","ASHIQ","SHAFRAN","NUSHAN"],
  team_a_color: "#facc15",
  team_b_name: "2007",
  team_b_players: ["AFRAJ","NAFLAN","SHASNI","SHAZNY","ISBAHAN","MAKKI","SHIFAK","RASMY","THAARIK","MIHRAJ","RAHMATHULLAH","MUBARAK KASHIR","SHAAZIR","SARHAN","AJMAL SALLY"],
  team_b_color: "#facc15",
  bg_from: "#1e1b4b",
  bg_to: "#7f1d1d",
  bg_image_url: null,
  bg_image_opacity: 0.6,
  bg_video_url: null,
  brand_left_scale: 1,
  brand_left_x: 0,
  brand_left_y: 0,
  brand_right_scale: 1,
  brand_right_x: 0,
  brand_right_y: 0,
  team_a_logo_url: null,
  team_a_logo_scale: 1,
  team_a_logo_x: 0,
  team_a_logo_y: 0,
  team_b_logo_url: null,
  team_b_logo_scale: 1,
  team_b_logo_x: 0,
  team_b_logo_y: 0,
  vs_badge_url: null,
  title_color: "#ffffff",
  title_font: "system-ui, sans-serif",
  title_size: 44,
  subtitle_color: "#e5e7eb",
  player_text_color: "#1a1a1a",
  card_width: 480,
  card_height: 0,
  canvas_width: 1536,
  canvas_height: 1024,
  column_gap: 280,
  animation_style: "rise",
  animation_speed: 1,
});
