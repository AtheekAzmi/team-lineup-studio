import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Download, Palette, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-bold">Lineup Studio</div>
          <div className="flex gap-2">
            <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
            <Button asChild><Link to="/auth">Get started</Link></Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-sm mb-6">
          <Sparkles className="w-4 h-4 text-primary" /> Animated team line-ups for your livestream
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Build broadcast-ready<br />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">line-up animations</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Customise teams, players, batch years, colors and backgrounds. Pick from 12 entrance animations. Export to MP4 or WebM.
        </p>
        <Button asChild size="lg"><Link to="/auth">Start building →</Link></Button>

        <div className="grid md:grid-cols-3 gap-6 mt-24 text-left">
          {[
            { icon: Zap, title: "12 animation styles", desc: "Rise, Pan, Fade, Pop, Wipe, Blur, Succession, Breathe, Baseline, Drift, Tectonic, Tumble." },
            { icon: Palette, title: "Two-color theming", desc: "Pick a color per match for the lineup chart and a custom gradient background." },
            { icon: Download, title: "MP4 / WebM export", desc: "Render directly in your browser and download a video file ready for stream overlays." },
          ].map(f => (
            <div key={f.title} className="p-6 rounded-xl bg-card border border-border">
              <f.icon className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
