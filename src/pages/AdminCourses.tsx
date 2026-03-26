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
import { Plus, Trash2, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

interface Course {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

const AdminCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  const [approvedCount, setApprovedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchCourses = async () => {
    const [coursesRes, uploadsRes] = await Promise.all([
      supabase.from("courses").select("*").order("name"),
      supabase.from("uploads").select("status"),
    ]);
    setCourses(coursesRes.data || []);
    const uploads = uploadsRes.data || [];
    setApprovedCount(uploads.filter((u) => u.status === "approved").length);
    setPendingCount(uploads.filter((u) => u.status === "pending").length);
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const { error } = await supabase.from("courses").insert({ name: name.trim(), description: description.trim() || null });
    if (error) { toast.error(error.message); return; }
    toast.success("Course added");
    setName(""); setDescription(""); setOpen(false);
    fetchCourses();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Course deleted");
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Fresh Workspace</p>
          <h1 className="font-display text-3xl font-bold text-foreground">Courses Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {courses.length === 0 ? "Your catalog has been reset. Create your first course to start building the learning structure." : `Manage your ${courses.length} courses and their structure.`}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" />Create Course</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display">Add New Course</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label>Course Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Computer Science" required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
                </div>
                <Button type="submit" className="w-full">Add Course</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm">Import Template</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "TOTAL COURSES", value: courses.length, sub: courses.length === 0 ? "No programs created yet in courses table." : `${courses.length} programs available.` },
          { label: "APPROVED MATERIALS", value: approvedCount, sub: approvedCount === 0 ? "No approved materials yet." : `${approvedCount} approved materials.` },
          { label: "PENDING MATERIALS", value: pendingCount, sub: pendingCount === 0 ? "No materials currently waiting review." : `${pendingCount} materials waiting review.` },
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

      {/* Content */}
      {courses.length === 0 ? (
        <Card className="shadow-card border-0 mb-6">
          <CardContent className="p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <BarChart3 className="h-6 w-6 text-success" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">No course entries yet</h3>
            <p className="max-w-md text-sm text-muted-foreground mb-4">
              Start with one course, attach subjects, and define duration. Once you publish, it will appear instantly for students.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setOpen(true)}>Add First Course</Button>
              <Button asChild variant="outline" size="sm"><Link to="/admin/subjects">Manage Subjects</Link></Button>
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
                {courses.map((c) => (
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

      {/* Tips */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { title: "Define Structure", desc: "Create course title, code, and timeline first to keep your catalog clean." },
          { title: "Attach Subjects", desc: "Link each course with subjects and categories for better discoverability." },
          { title: "Publish Safely", desc: "Use drafts while reviewing details, then switch to active when ready." },
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

export default AdminCourses;
