import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("name");
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const { error } = await supabase.from("categories").insert({ name: name.trim(), description: description.trim() || null });
    if (error) { toast.error(error.message); return; }
    toast.success("Category created");
    setName(""); setDescription(""); setOpen(false);
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Category deleted");
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Fresh Workspace</p>
          <h1 className="font-display text-3xl font-bold text-foreground">Categories Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {categories.length === 0
              ? "Category groups are currently empty. Start defining buckets to organize materials clearly."
              : `Manage ${categories.length} categories for organizing materials.`}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" />Create Category</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display">Add New Category</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label>Category Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Notes, Videos, Practice Papers" required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
                </div>
                <Button type="submit" className="w-full">Add Category</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button asChild variant="outline" size="sm"><Link to="/admin/courses">Open Courses</Link></Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "TOTAL CATEGORIES", value: categories.length, sub: categories.length === 0 ? "No categories created yet." : `${categories.length} categories available.` },
          { label: "USED CATEGORIES", value: categories.length, sub: "Categories created for organizing materials." },
          { label: "UNASSIGNED MATERIALS", value: 0, sub: "Every material is categorized." },
        ].map((s) => (
          <Card key={s.label} className="shadow-card border-0">
            <CardContent className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
              <p className="font-display text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 ? (
        <Card className="shadow-card border-0 mb-6">
          <CardContent className="p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">No category collection yet</h3>
            <p className="max-w-md text-sm text-muted-foreground mb-4">
              Add categories like Notes, Videos, Practice Papers, or Labs to improve search, filtering, and quality control across the platform.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setOpen(true)}>Add First Category</Button>
              <Button asChild variant="outline" size="sm"><Link to="/admin/pending">Review Upload Queue</Link></Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card border-0 mb-6">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.description || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { title: "Keep Names Clear", desc: "Use simple names that immediately describe the content type." },
          { title: "Avoid Overlap", desc: "Use mutually distinct categories so uploads are classified consistently." },
          { title: "Audit Monthly", desc: "Review unused categories and merge duplicates to keep taxonomy healthy." },
        ].map((t) => (
          <Card key={t.title} className="shadow-card border-0">
            <CardContent className="p-5">
              <h4 className="font-display text-sm font-bold text-foreground mb-1">{t.title}</h4>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AdminCategories;
