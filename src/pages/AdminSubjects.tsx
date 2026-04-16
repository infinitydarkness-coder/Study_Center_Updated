import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2, FolderOpen, GraduationCap, Layers } from "lucide-react";
import { Link } from "react-router-dom";

const AdminSubjects = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add department
  const [deptOpen, setDeptOpen] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [deptCourseName, setDeptCourseName] = useState("");

  // Add semester
  const [semOpen, setSemOpen] = useState(false);
  const [semName, setSemName] = useState("");
  const [semDeptName, setSemDeptName] = useState("");
  const [semCourseName, setSemCourseName] = useState("");

  // Add subject
  const [subOpen, setSubOpen] = useState(false);
  const [subName, setSubName] = useState("");
  const [subSemName, setSubSemName] = useState("");
  const [subDeptName, setSubDeptName] = useState("");
  const [subCourseName, setSubCourseName] = useState("");

  const fetchData = async () => {
    const [c, d, s, sub] = await Promise.all([
      supabase.from("courses").select("*").order("name"),
      supabase.from("departments").select("*, courses(name)").order("name"),
      supabase.from("semesters").select("*, departments(name)").order("name"),
      supabase.from("subjects").select("*, semesters(name, departments(name, courses(name)))").order("name"),
    ]);
    setCourses(c.data || []);
    setDepartments((d.data as any) || []);
    setSemesters((s.data as any) || []);
    setSubjects((sub.data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const findOrCreateCourse = async (name: string) => {
    const trimmed = name.trim();
    const { data } = await supabase.from("courses").select("id").ilike("name", trimmed).maybeSingle();
    if (data) return data.id;
    const { data: created, error } = await supabase.from("courses").insert({ name: trimmed }).select("id").single();
    if (error) throw error;
    return created.id;
  };

  const findOrCreateDept = async (name: string, courseId: string) => {
    const trimmed = name.trim();
    const { data } = await supabase.from("departments").select("id").ilike("name", trimmed).eq("course_id", courseId).maybeSingle();
    if (data) return data.id;
    const { data: created, error } = await supabase.from("departments").insert({ name: trimmed, course_id: courseId }).select("id").single();
    if (error) throw error;
    return created.id;
  };

  const findOrCreateSem = async (name: string, deptId: string) => {
    const trimmed = name.trim();
    const { data } = await supabase.from("semesters").select("id").ilike("name", trimmed).eq("department_id", deptId).maybeSingle();
    if (data) return data.id;
    const { data: created, error } = await supabase.from("semesters").insert({ name: trimmed, department_id: deptId }).select("id").single();
    if (error) throw error;
    return created.id;
  };

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCourseName.trim()) return;
    try {
      const courseId = await findOrCreateCourse(deptCourseName);
      const { error } = await supabase.from("departments").insert({ name: deptName.trim(), course_id: courseId });
      if (error) { toast.error(error.message); return; }
      toast.success("Department added");
      setDeptName(""); setDeptCourseName(""); setDeptOpen(false);
      fetchData();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleAddSem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!semName.trim() || !semDeptName.trim() || !semCourseName.trim()) return;
    try {
      const courseId = await findOrCreateCourse(semCourseName);
      const deptId = await findOrCreateDept(semDeptName, courseId);
      const { error } = await supabase.from("semesters").insert({ name: semName.trim(), department_id: deptId });
      if (error) { toast.error(error.message); return; }
      toast.success("Semester added");
      setSemName(""); setSemDeptName(""); setSemCourseName(""); setSemOpen(false);
      fetchData();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || !subSemName.trim() || !subDeptName.trim() || !subCourseName.trim()) return;
    try {
      const courseId = await findOrCreateCourse(subCourseName);
      const deptId = await findOrCreateDept(subDeptName, courseId);
      const semId = await findOrCreateSem(subSemName, deptId);
      const { error } = await supabase.from("subjects").insert({ name: subName.trim(), semester_id: semId, course_id: null } as any);
      if (error) { toast.error(error.message); return; }
      toast.success("Subject added");
      setSubName(""); setSubSemName(""); setSubDeptName(""); setSubCourseName(""); setSubOpen(false);
      fetchData();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (table: string, id: string) => {
    const { error } = await (supabase.from(table as any) as any).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted successfully");
    fetchData();
  };

  if (loading) {
    return <DashboardLayout><div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Academic Structure</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage departments, semesters, and subjects</p>
        </div>
        <Button asChild variant="outline" size="sm"><Link to="/admin/courses">Manage Courses</Link></Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "DEPARTMENTS", value: departments.length, icon: GraduationCap },
          { label: "SEMESTERS", value: semesters.length, icon: Layers },
          { label: "SUBJECTS", value: subjects.length, icon: FolderOpen },
        ].map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="p-5">
              <s.icon className="mb-2 h-5 w-5 text-primary" />
              <p className="font-display text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="departments">
        <TabsList className="mb-4">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="semesters">Semesters</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
        </TabsList>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <div className="mb-4 flex justify-end">
            <Dialog open={deptOpen} onOpenChange={setDeptOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" />Add Department</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Department / Branch</DialogTitle></DialogHeader>
                <form onSubmit={handleAddDept} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Course Name</Label>
                    <Input value={deptCourseName} onChange={(e) => setDeptCourseName(e.target.value)} placeholder="e.g. B.Tech" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Department Name</Label>
                    <Input value={deptName} onChange={(e) => setDeptName(e.target.value)} placeholder="e.g. Computer Engineering" required />
                  </div>
                  <Button type="submit" className="w-full">Add Department</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Card className="shadow-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Department</TableHead><TableHead>Course</TableHead><TableHead className="w-16"></TableHead></TableRow></TableHeader>
                <TableBody>
                  {departments.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No departments yet</TableCell></TableRow>
                  ) : departments.map((d: any) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell className="text-muted-foreground">{d.courses?.name || "—"}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => handleDelete("departments", d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Semesters Tab */}
        <TabsContent value="semesters">
          <div className="mb-4 flex justify-end">
            <Dialog open={semOpen} onOpenChange={setSemOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" />Add Semester</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Semester</DialogTitle></DialogHeader>
                <form onSubmit={handleAddSem} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Course Name</Label>
                    <Input value={semCourseName} onChange={(e) => setSemCourseName(e.target.value)} placeholder="e.g. B.Tech" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Department Name</Label>
                    <Input value={semDeptName} onChange={(e) => setSemDeptName(e.target.value)} placeholder="e.g. Computer Engineering" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Semester Name</Label>
                    <Input value={semName} onChange={(e) => setSemName(e.target.value)} placeholder="e.g. Semester 1" required />
                  </div>
                  <Button type="submit" className="w-full">Add Semester</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Card className="shadow-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Semester</TableHead><TableHead>Department</TableHead><TableHead className="w-16"></TableHead></TableRow></TableHeader>
                <TableBody>
                  {semesters.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No semesters yet</TableCell></TableRow>
                  ) : semesters.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-muted-foreground">{s.departments?.name || "—"}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => handleDelete("semesters", s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects">
          <div className="mb-4 flex justify-end">
            <Dialog open={subOpen} onOpenChange={setSubOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" />Add Subject</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Subject</DialogTitle></DialogHeader>
                <form onSubmit={handleAddSubject} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Course Name</Label>
                    <Input value={subCourseName} onChange={(e) => setSubCourseName(e.target.value)} placeholder="e.g. B.Tech" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Department Name</Label>
                    <Input value={subDeptName} onChange={(e) => setSubDeptName(e.target.value)} placeholder="e.g. Computer Engineering" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Semester Name</Label>
                    <Input value={subSemName} onChange={(e) => setSubSemName(e.target.value)} placeholder="e.g. Semester 1" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Subject Name</Label>
                    <Input value={subName} onChange={(e) => setSubName(e.target.value)} placeholder="e.g. Data Structures" required />
                  </div>
                  <Button type="submit" className="w-full">Add Subject</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Card className="shadow-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Semester</TableHead><TableHead>Department</TableHead><TableHead className="w-16"></TableHead></TableRow></TableHeader>
                <TableBody>
                  {subjects.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No subjects yet</TableCell></TableRow>
                  ) : subjects.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-muted-foreground">{s.semesters?.name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{s.semesters?.departments?.name || "—"}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => handleDelete("subjects", s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AdminSubjects;
