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
  team_a_logo_url: string | null;
  team_a_logo_scale: number;
  team_a_logo_x: number;
  team_a_logo_y: number;
  team_b_logo_url: string | null;
  team_b_logo_scale: number;
  team_b_logo_x: number;
  team_b_logo_y: number;
  animation_style: AnimationStyle;
  animation_speed: number;
}

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
  team_a_logo_url: null,
  team_a_logo_scale: 1,
  team_a_logo_x: 0,
  team_a_logo_y: 0,
  team_b_logo_url: null,
  team_b_logo_scale: 1,
  team_b_logo_x: 0,
  team_b_logo_y: 0,
  animation_style: "rise",
  animation_speed: 1,
});
