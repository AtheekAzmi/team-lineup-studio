import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Edit3, LogOut, LayoutGrid, List } from "lucide-react";
import { defaultMatch } from "@/lib/lineup-types";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

interface Row {
  id: string;
  title: string;
  subtitle: string;
  team_a_name: string;
  team_b_name: string;
  updated_at: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">(() => {
    if (typeof window === "undefined") return "grid";
    return (localStorage.getItem("matches_view") as "grid" | "list") || "grid";
  });
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("matches_view", view);
  }, [view]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("matches")
      .select("id,title,subtitle,team_a_name,team_b_name,updated_at")
      .order("updated_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const m = defaultMatch();
    const { data, error } = await supabase
      .from("matches")
      .insert({ ...m, team_a_players: m.team_a_players, team_b_players: m.team_b_players, user_id: u.user.id })
      .select("id").single();
    if (error) { toast.error(error.message); return; }
    navigate({ to: "/editor/$matchId", params: { matchId: data.id } });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this match?")) return;
    const { error } = await supabase.from("matches").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setRows(rows.filter(r => r.id !== id));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-bold">Lineup Studio</Link>
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="w-4 h-4 mr-2" />Sign out</Button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Matches</h1>
            <p className="text-muted-foreground text-sm mt-1">Create and edit animated lineup videos</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-border overflow-hidden">
              <Button variant={view === "grid" ? "secondary" : "ghost"} size="sm" className="rounded-none" onClick={() => setView("grid")} aria-label="Grid view">
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button variant={view === "list" ? "secondary" : "ghost"} size="sm" className="rounded-none" onClick={() => setView("list")} aria-label="List view">
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={create}><Plus className="w-4 h-4 mr-2" />New Match</Button>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <Card className="p-12 text-center bg-card">
            <p className="text-muted-foreground mb-4">No matches yet</p>
            <Button onClick={create}><Plus className="w-4 h-4 mr-2" />Create your first match</Button>
          </Card>
        ) : view === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rows.map(r => (
              <Card key={r.id} className="p-5 bg-card hover:border-primary/50 transition-colors">
                <h3 className="font-semibold truncate">{r.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{r.subtitle}</p>
                <p className="text-sm mt-3"><span className="font-bold text-primary">{r.team_a_name}</span> <span className="text-muted-foreground">vs</span> <span className="font-bold text-primary">{r.team_b_name}</span></p>
                <div className="flex gap-2 mt-4">
                  <Button asChild size="sm" className="flex-1">
                    <Link to="/editor/$matchId" params={{ matchId: r.id }}><Edit3 className="w-4 h-4 mr-1" />Edit</Link>
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map(r => (
              <Card key={r.id} className="p-4 bg-card hover:border-primary/50 transition-colors flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{r.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>
                </div>
                <p className="text-sm hidden sm:block whitespace-nowrap"><span className="font-bold text-primary">{r.team_a_name}</span> <span className="text-muted-foreground">vs</span> <span className="font-bold text-primary">{r.team_b_name}</span></p>
                <div className="flex gap-2 shrink-0">
                  <Button asChild size="sm">
                    <Link to="/editor/$matchId" params={{ matchId: r.id }}><Edit3 className="w-4 h-4 mr-1" />Edit</Link>
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
