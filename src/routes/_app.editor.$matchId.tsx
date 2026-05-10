import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Download, Image as ImageIcon, Loader2, Plus, Save, Trash2, Play, Upload, X } from "lucide-react";
import { ANIMATION_STYLES, FONT_OPTIONS, type Match } from "@/lib/lineup-types";
import { LineupCanvas } from "@/components/LineupCanvas";
import { downloadBlob, exportLineupVideo } from "@/lib/lineup-export";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_app/editor/$matchId")({
  component: Editor,
});

function Editor() {
  const { matchId } = useParams({ from: "/_app/editor/$matchId" });
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [playKey, setPlayKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<null | { progress: number; format: string }>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const uploadAsset = async (
    file: File,
    field: "bg_image_url" | "team_a_logo_url" | "team_b_logo_url" | "vs_badge_url",
  ) => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) { toast.error("Not signed in"); return; }
    setUploading(field);
    const ext = file.name.split(".").pop() || "png";
    const path = `${uid}/${field}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("lineup-assets").upload(path, file, {
      cacheControl: "3600", upsert: true, contentType: file.type,
    });
    if (upErr) { setUploading(null); toast.error(upErr.message); return; }
    const { data: pub } = supabase.storage.from("lineup-assets").getPublicUrl(path);
    update({ [field]: pub.publicUrl } as Partial<Match>);
    setUploading(null);
    setPlayKey(k => k + 1);
    toast.success("Uploaded");
  };

  useEffect(() => {
    supabase.from("matches").select("*").eq("id", matchId).single().then(({ data, error }) => {
      if (error) { toast.error(error.message); navigate({ to: "/dashboard" }); return; }
      setMatch({
        ...data,
        team_a_players: (data.team_a_players as string[]) ?? [],
        team_b_players: (data.team_b_players as string[]) ?? [],
        animation_style: data.animation_style as Match["animation_style"],
      });
    });
  }, [matchId, navigate]);

  const update = (patch: Partial<Match>) => setMatch(m => m ? { ...m, ...patch } : m);

  const save = async () => {
    if (!match) return;
    setSaving(true);
    const { error } = await supabase.from("matches").update({
      title: match.title, subtitle: match.subtitle,
      team_a_name: match.team_a_name, team_a_players: match.team_a_players, team_a_color: match.team_a_color,
      team_b_name: match.team_b_name, team_b_players: match.team_b_players, team_b_color: match.team_b_color,
      bg_from: match.bg_from, bg_to: match.bg_to,
      bg_image_url: match.bg_image_url, bg_image_opacity: match.bg_image_opacity,
      team_a_logo_url: match.team_a_logo_url, team_a_logo_scale: match.team_a_logo_scale,
      team_a_logo_x: match.team_a_logo_x, team_a_logo_y: match.team_a_logo_y,
      team_b_logo_url: match.team_b_logo_url, team_b_logo_scale: match.team_b_logo_scale,
      team_b_logo_x: match.team_b_logo_x, team_b_logo_y: match.team_b_logo_y,
      vs_badge_url: match.vs_badge_url,
      title_color: match.title_color, title_font: match.title_font, title_size: match.title_size,
      subtitle_color: match.subtitle_color, player_text_color: match.player_text_color,
      card_width: match.card_width, card_height: match.card_height,
      animation_style: match.animation_style, animation_speed: match.animation_speed,
    }).eq("id", match.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Saved");
  };

  const exportVideo = async (format: "mp4" | "webm") => {
    if (!match) return;
    setExporting({ progress: 0, format });
    try {
      const { blob, ext } = await exportLineupVideo(match, format, (p) =>
        setExporting({ progress: p, format })
      );
      const safeName = match.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      downloadBlob(blob, `${safeName}-${match.team_a_name}-vs-${match.team_b_name}.${ext}`);
      toast.success(`Exported as .${ext}`);
    } catch (e) {
      toast.error("Export failed");
      console.error(e);
    } finally {
      setExporting(null);
    }
  };

  const playerEditor = (side: "a" | "b") => {
    if (!match) return null;
    const players = side === "a" ? match.team_a_players : match.team_b_players;
    const set = (next: string[]) => update(side === "a" ? { team_a_players: next } : { team_b_players: next });
    return (
      <div className="space-y-3">
        <BulkImport onImport={(names, mode) => set(mode === "replace" ? names : [...players, ...names])} />
        <div className="space-y-2">
          {players.map((p, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-xs text-muted-foreground w-6 self-center">{String(i + 1).padStart(2, "0")}</span>
              <Input value={p} onChange={(e) => { const c = [...players]; c[i] = e.target.value; set(c); }} />
              <Button size="icon" variant="ghost" onClick={() => set(players.filter((_, j) => j !== i))}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => set([...players, "NEW PLAYER"])}>
              <Plus className="w-4 h-4 mr-1" />Add player
            </Button>
            {players.length > 0 && (
              <Button size="sm" variant="ghost" onClick={() => set([])}>Clear all</Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const stylePreviewMatch = useMemo(() => match, [match]);

  if (!match || !stylePreviewMatch) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <Button asChild variant="ghost" size="sm"><Link to="/dashboard"><ArrowLeft className="w-4 h-4 mr-2" />Dashboard</Link></Button>
          <Input value={match.title} onChange={(e) => update({ title: e.target.value })} className="max-w-md font-semibold" />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPlayKey(k => k + 1)}><Play className="w-4 h-4 mr-2" />Replay</Button>
            <Button size="sm" onClick={save} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save"}</Button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-6 grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* Preview */}
        <div className="space-y-4">
          <LineupCanvas match={match} playKey={playKey} />
          <Card className="p-4 bg-card">
            <h3 className="font-semibold mb-3">Export</h3>
            {exporting ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Rendering {exporting.format.toUpperCase()}… {Math.round(exporting.progress * 100)}%</p>
                <div className="h-2 bg-muted rounded overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${exporting.progress * 100}%` }} />
                </div>
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => exportVideo("mp4")}><Download className="w-4 h-4 mr-2" />Download MP4</Button>
                <Button variant="outline" onClick={() => exportVideo("webm")}><Download className="w-4 h-4 mr-2" />Download WebM</Button>
                <p className="text-xs text-muted-foreground self-center">Browser-recorded. MP4 falls back to WebM on Firefox.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Side panel */}
        <Card className="p-5 bg-card h-fit">
          <Tabs defaultValue="content">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="anim">Animation</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input value={match.subtitle} onChange={(e) => update({ subtitle: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Team A (e.g. batch year)</Label>
                  <Input value={match.team_a_name} onChange={(e) => update({ team_a_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Team B</Label>
                  <Input value={match.team_b_name} onChange={(e) => update({ team_b_name: e.target.value })} />
                </div>
              </div>

              <Tabs defaultValue="a">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="a">{match.team_a_name} players</TabsTrigger>
                  <TabsTrigger value="b">{match.team_b_name} players</TabsTrigger>
                </TabsList>
                <TabsContent value="a" className="pt-3 max-h-[420px] overflow-y-auto">{playerEditor("a")}</TabsContent>
                <TabsContent value="b" className="pt-3 max-h-[420px] overflow-y-auto">{playerEditor("b")}</TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="style" className="space-y-5 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Team A color</Label>
                  <Input type="color" value={match.team_a_color} onChange={(e) => update({ team_a_color: e.target.value })} className="h-10 p-1" />
                </div>
                <div className="space-y-2">
                  <Label>Team B color</Label>
                  <Input type="color" value={match.team_b_color} onChange={(e) => update({ team_b_color: e.target.value })} className="h-10 p-1" />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-border">
                <p className="text-sm font-medium pt-3">Title & text</p>
                <div className="space-y-2">
                  <Label>Title font</Label>
                  <Select value={match.title_font} onValueChange={(v) => update({ title_font: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map(f => <SelectItem key={f.id} value={f.id} style={{ fontFamily: f.id }}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Title size: {Math.round(match.title_size)}px</Label>
                  <Slider value={[match.title_size]} min={20} max={96} step={1}
                    onValueChange={([v]) => update({ title_size: v })} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Title color</Label>
                    <Input type="color" value={match.title_color} onChange={(e) => update({ title_color: e.target.value })} className="h-10 p-1" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Subtitle color</Label>
                    <Input type="color" value={match.subtitle_color} onChange={(e) => update({ subtitle_color: e.target.value })} className="h-10 p-1" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Player text</Label>
                    <Input type="color" value={match.player_text_color} onChange={(e) => update({ player_text_color: e.target.value })} className="h-10 p-1" />
                  </div>
                </div>
              </div>

              <p className="text-sm font-medium pt-2">Background</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Input type="color" value={match.bg_from} onChange={(e) => update({ bg_from: e.target.value })} className="h-10 p-1" />
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input type="color" value={match.bg_to} onChange={(e) => update({ bg_to: e.target.value })} className="h-10 p-1" />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-xs text-muted-foreground">Quick presets</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["#1e1b4b", "#7f1d1d"],
                    ["#0f172a", "#1e3a8a"],
                    ["#3b0764", "#581c87"],
                    ["#064e3b", "#022c22"],
                    ["#7c2d12", "#431407"],
                  ].map(([a, b]) => (
                    <button key={a + b} onClick={() => update({ bg_from: a, bg_to: b })}
                      className="w-12 h-8 rounded border border-border" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} />
                  ))}
                </div>
              </div>

              {/* Background image */}
              <div className="space-y-2 pt-4 border-t border-border">
                <Label className="text-sm font-medium flex items-center gap-2"><ImageIcon className="w-4 h-4" />Background image</Label>
                {match.bg_image_url ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <img src={match.bg_image_url} alt="bg" className="w-full h-24 object-cover rounded border border-border" />
                      <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => { update({ bg_image_url: null }); setPlayKey(k => k + 1); }}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Opacity: {Math.round(match.bg_image_opacity * 100)}%</Label>
                      <Slider value={[match.bg_image_opacity]} min={0} max={1} step={0.05}
                        onValueChange={([v]) => update({ bg_image_opacity: v })} />
                    </div>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 h-20 border border-dashed border-border rounded cursor-pointer hover:bg-muted/40 transition">
                    {uploading === "bg_image_url" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4" /><span className="text-sm">Upload background</span></>}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAsset(f, "bg_image_url"); }} />
                  </label>
                )}
              </div>

              {/* Logos */}
              {(["a", "b"] as const).map((side) => {
                const field = side === "a" ? "team_a_logo_url" : "team_b_logo_url";
                const scaleField = side === "a" ? "team_a_logo_scale" : "team_b_logo_scale";
                const xField = side === "a" ? "team_a_logo_x" : "team_b_logo_x";
                const yField = side === "a" ? "team_a_logo_y" : "team_b_logo_y";
                const url = match[field];
                const scale = match[scaleField];
                const x = match[xField];
                const y = match[yField];
                const teamLabel = side === "a" ? match.team_a_name : match.team_b_name;
                return (
                  <div key={side} className="space-y-2 pt-4 border-t border-border">
                    <Label className="text-sm font-medium">{teamLabel} logo</Label>
                    {url ? (
                      <div className="space-y-3">
                        <div className="relative w-fit">
                          <img src={url} alt="logo" className="h-20 w-20 object-contain rounded border border-border bg-muted/30 p-1" />
                          <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => update({ [field]: null } as Partial<Match>)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Size: {scale.toFixed(2)}x</Label>
                          <Slider value={[scale]} min={0.3} max={3} step={0.05}
                            onValueChange={([v]) => update({ [scaleField]: v } as Partial<Match>)} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Offset X: {x}px</Label>
                            <Slider value={[x]} min={-300} max={300} step={1}
                              onValueChange={([v]) => update({ [xField]: v } as Partial<Match>)} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Offset Y: {y}px</Label>
                            <Slider value={[y]} min={-200} max={200} step={1}
                              onValueChange={([v]) => update({ [yField]: v } as Partial<Match>)} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 h-16 border border-dashed border-border rounded cursor-pointer hover:bg-muted/40 transition">
                        {uploading === field ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4" /><span className="text-sm">Upload {teamLabel} logo</span></>}
                        <input type="file" accept="image/*" className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAsset(f, field); }} />
                      </label>
                    )}
                  </div>
                );
              })}

              {/* VS badge */}
              <div className="space-y-2 pt-4 border-t border-border">
                <Label className="text-sm font-medium flex items-center gap-2"><ImageIcon className="w-4 h-4" />VS badge (transparent PNG)</Label>
                {match.vs_badge_url ? (
                  <div className="relative w-fit">
                    <img src={match.vs_badge_url} alt="vs" className="h-20 w-20 object-contain rounded border border-border bg-muted/30 p-1" />
                    <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => { update({ vs_badge_url: null }); setPlayKey(k => k + 1); }}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 h-16 border border-dashed border-border rounded cursor-pointer hover:bg-muted/40 transition">
                    {uploading === "vs_badge_url" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4" /><span className="text-sm">Upload VS badge</span></>}
                    <input type="file" accept="image/png,image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAsset(f, "vs_badge_url"); }} />
                  </label>
                )}
                <p className="text-xs text-muted-foreground">Defaults to the built-in VS graphic if empty.</p>
              </div>
            </TabsContent>

            <TabsContent value="anim" className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label>Animation style</Label>
                <Select value={match.animation_style} onValueChange={(v) => { update({ animation_style: v as Match["animation_style"] }); setPlayKey(k => k + 1); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ANIMATION_STYLES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Speed: {match.animation_speed.toFixed(2)}x</Label>
                <Slider value={[match.animation_speed]} min={0.5} max={2} step={0.05}
                  onValueChange={([v]) => update({ animation_speed: v })} />
              </div>
              <p className="text-xs text-muted-foreground">All animations rise from the bottom by default. Each style applies a unique entrance treatment per row.</p>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
