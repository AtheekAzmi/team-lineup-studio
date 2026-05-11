import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Trash2, Edit3, LogOut, LayoutGrid, List, GripVertical, X } from "lucide-react";
import { defaultMatch } from "@/lib/lineup-types";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  sort_order: number;
}

function Dashboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editOpen, setEditOpen] = useState(false);
  const [editFields, setEditFields] = useState({ title: "", subtitle: "" });
  const [view, setView] = useState<"grid" | "list">(() => {
    if (typeof window === "undefined") return "grid";
    return (localStorage.getItem("matches_view") as "grid" | "list") || "grid";
  });
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("matches_view", view);
  }, [view]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("matches")
      .select("id,title,subtitle,team_a_name,team_b_name,updated_at,sort_order")
      .order("sort_order", { ascending: true })
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
    const nextOrder = (rows[0]?.sort_order ?? 0) - 1; // place new on top
    const { data, error } = await supabase
      .from("matches")
      .insert({ ...m, team_a_players: m.team_a_players, team_b_players: m.team_b_players, user_id: u.user.id, sort_order: nextOrder })
      .select("id").single();
    if (error) { toast.error(error.message); return; }
    navigate({ to: "/editor/$matchId", params: { matchId: data.id } });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this match?")) return;
    const { error } = await supabase.from("matches").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setRows(rows.filter(r => r.id !== id));
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const allSelected = rows.length > 0 && selected.size === rows.length;
  const toggleSelectAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(rows.map(r => r.id)));
  };

  const clearSelection = () => setSelected(new Set());

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} match${selected.size > 1 ? "es" : ""}?`)) return;
    const ids = Array.from(selected);
    const { error } = await supabase.from("matches").delete().in("id", ids);
    if (error) { toast.error(error.message); return; }
    setRows(rows.filter(r => !selected.has(r.id)));
    clearSelection();
    toast.success("Deleted");
  };

  const openBulkEdit = () => {
    setEditFields({ title: "", subtitle: "" });
    setEditOpen(true);
  };

  const applyBulkEdit = async () => {
    const patch: { title?: string; subtitle?: string } = {};
    if (editFields.title.trim()) patch.title = editFields.title.trim();
    if (editFields.subtitle.trim()) patch.subtitle = editFields.subtitle.trim();
    if (Object.keys(patch).length === 0) { toast.error("Enter at least one field to update"); return; }
    const ids = Array.from(selected);
    const { error } = await supabase.from("matches").update(patch).in("id", ids);
    if (error) { toast.error(error.message); return; }
    setRows(rows.map(r => selected.has(r.id) ? { ...r, ...patch } as Row : r));
    setEditOpen(false);
    clearSelection();
    toast.success(`Updated ${ids.length} match${ids.length > 1 ? "es" : ""}`);
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = rows.findIndex(r => r.id === active.id);
    const newIndex = rows.findIndex(r => r.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(rows, oldIndex, newIndex).map((r, i) => ({ ...r, sort_order: i }));
    setRows(reordered);
    // Persist new sort_order for affected rows
    const updates = reordered.map(r => supabase.from("matches").update({ sort_order: r.sort_order }).eq("id", r.id));
    const results = await Promise.all(updates);
    const failed = results.find(res => res.error);
    if (failed?.error) toast.error(failed.error.message);
  };

  const ids = useMemo(() => rows.map(r => r.id), [rows]);

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
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Your Matches</h1>
            <p className="text-muted-foreground text-sm mt-1">Drag to reorder. Select to bulk edit or delete.</p>
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

        {rows.length > 0 && (
          <div className="flex items-center gap-3 mb-4 px-1">
            <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-label="Select all" />
            <span className="text-sm text-muted-foreground">
              {selected.size > 0 ? `${selected.size} selected` : "Select all"}
            </span>
            {selected.size > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <Button size="sm" variant="outline" onClick={openBulkEdit}><Edit3 className="w-4 h-4 mr-1" />Edit together</Button>
                <Button size="sm" variant="destructive" onClick={bulkDelete}><Trash2 className="w-4 h-4 mr-1" />Delete</Button>
                <Button size="icon" variant="ghost" onClick={clearSelection} aria-label="Clear"><X className="w-4 h-4" /></Button>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <Card className="p-12 text-center bg-card">
            <p className="text-muted-foreground mb-4">No matches yet</p>
            <Button onClick={create}><Plus className="w-4 h-4 mr-2" />Create your first match</Button>
          </Card>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ids} strategy={view === "grid" ? rectSortingStrategy : verticalListSortingStrategy}>
              {view === "grid" ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {rows.map(r => (
                    <SortableMatchCard
                      key={r.id}
                      row={r}
                      view="grid"
                      selected={selected.has(r.id)}
                      onToggle={() => toggleSelect(r.id)}
                      onRemove={() => remove(r.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {rows.map(r => (
                    <SortableMatchCard
                      key={r.id}
                      row={r}
                      view="list"
                      selected={selected.has(r.id)}
                      onToggle={() => toggleSelect(r.id)}
                      onRemove={() => remove(r.id)}
                    />
                  ))}
                </div>
              )}
            </SortableContext>
          </DndContext>
        )}
      </main>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {selected.size} match{selected.size > 1 ? "es" : ""}</DialogTitle>
            <DialogDescription>Only filled fields are applied to all selected matches.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={editFields.title} placeholder="Leave empty to keep" onChange={(e) => setEditFields(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Subtitle</Label>
              <Input value={editFields.subtitle} placeholder="Leave empty to keep" onChange={(e) => setEditFields(f => ({ ...f, subtitle: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={applyBulkEdit}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SortableMatchCard({
  row: r, view, selected, onToggle, onRemove,
}: {
  row: Row;
  view: "grid" | "list";
  selected: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: r.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  if (view === "list") {
    return (
      <div ref={setNodeRef} style={style}>
        <Card className={`p-3 bg-card hover:border-primary/50 transition-colors flex items-center gap-3 ${selected ? "border-primary" : ""}`}>
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none" aria-label="Drag">
            <GripVertical className="w-4 h-4" />
          </button>
          <Checkbox checked={selected} onCheckedChange={onToggle} aria-label="Select match" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold truncate">{r.title}</h3>
            <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>
          </div>
          <p className="text-sm hidden sm:block whitespace-nowrap">
            <span className="font-bold text-primary">{r.team_a_name}</span> <span className="text-muted-foreground">vs</span> <span className="font-bold text-primary">{r.team_b_name}</span>
          </p>
          <div className="flex gap-2 shrink-0">
            <Button asChild size="sm">
              <Link to="/editor/$matchId" params={{ matchId: r.id }}><Edit3 className="w-4 h-4 mr-1" />Edit</Link>
            </Button>
            <Button size="icon" variant="ghost" onClick={onRemove}><Trash2 className="w-4 h-4" /></Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`p-5 bg-card hover:border-primary/50 transition-colors ${selected ? "border-primary" : ""}`}>
        <div className="flex items-center justify-between mb-2">
          <Checkbox checked={selected} onCheckedChange={onToggle} aria-label="Select match" />
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none" aria-label="Drag">
            <GripVertical className="w-4 h-4" />
          </button>
        </div>
        <h3 className="font-semibold truncate">{r.title}</h3>
        <p className="text-sm text-muted-foreground truncate">{r.subtitle}</p>
        <p className="text-sm mt-3"><span className="font-bold text-primary">{r.team_a_name}</span> <span className="text-muted-foreground">vs</span> <span className="font-bold text-primary">{r.team_b_name}</span></p>
        <div className="flex gap-2 mt-4">
          <Button asChild size="sm" className="flex-1">
            <Link to="/editor/$matchId" params={{ matchId: r.id }}><Edit3 className="w-4 h-4 mr-1" />Edit</Link>
          </Button>
          <Button size="icon" variant="ghost" onClick={onRemove}><Trash2 className="w-4 h-4" /></Button>
        </div>
      </Card>
    </div>
  );
}
