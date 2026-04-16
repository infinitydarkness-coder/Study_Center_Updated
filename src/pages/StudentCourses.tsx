import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, Download, FileText, GraduationCap, Layers, MoreVertical, Trash2, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const StudentCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Drill-down state
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedDept, setSelectedDept] = useState<any>(null);
  const [selectedSem, setSelectedSem] = useState<any>(null);

  useEffect(() => {
    const fetchAll = async () => {
      const [c, d, s, sub, mat] = await Promise.all([
        supabase.from("courses").select("*").order("name"),
        supabase.from("departments").select("*").order("name"),
        supabase.from("semesters").select("*").order("name"),
        supabase.from("subjects").select("*").order("name"),
        supabase.from("uploads").select("*").eq("status", "approved").order("created_at", { ascending: false }),
      ]);
      setCourses(c.data || []);
      setDepartments(d.data || []);
      setSemesters(s.data || []);
      setSubjects(sub.data || []);
      setMaterials(mat.data || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleDeleteRequest = async (uploadId: string) => {
    const { error } = await supabase
      .from("uploads")
      .update({ delete_requested: true, delete_reason: "Student requested deletion" })
      .eq("id", uploadId);
    if (error) { toast.error(error.message); return; }
    toast.success("Delete request sent to admin");
    setMaterials((prev) => prev.map((u) => u.id === uploadId ? { ...u, delete_requested: true } : u));
  };

  const goBack = () => {
    if (selectedSem) setSelectedSem(null);
    else if (selectedDept) setSelectedDept(null);
    else if (selectedCourse) setSelectedCourse(null);
  };

  const breadcrumb = [
    selectedCourse && selectedCourse.name,
    selectedDept && selectedDept.name,
    selectedSem && selectedSem.name,
  ].filter(Boolean);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  // Level 4: Show subjects & materials for selected semester
  if (selectedSem) {
    const semSubjects = subjects.filter((s) => s.semester_id === selectedSem.id);
    const semMaterials = materials.filter((m) => m.semester_id === selectedSem.id);

    return (
      <DashboardLayout>
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={goBack} className="mb-2">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                <span className={i === breadcrumb.length - 1 ? "text-foreground font-medium" : ""}>{b}</span>
              </span>
            ))}
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">{selectedSem.name}</h1>
          <p className="mt-1 text-muted-foreground">{semSubjects.length} subjects · {semMaterials.length} materials</p>
        </div>

        {semSubjects.length === 0 && semMaterials.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="text-lg font-medium text-muted-foreground">No subjects or materials yet</p>
              <p className="text-sm text-muted-foreground/70">Content will appear here once added by admin</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {semSubjects.map((sub) => {
              const subMaterials = semMaterials.filter((m) => m.subject === sub.name);
              return (
                <Card key={sub.id} className="shadow-card">
                  <CardContent className="p-5">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-3">{sub.name}</h3>
                    {subMaterials.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No materials uploaded for this subject yet</p>
                    ) : (
                      <div className="space-y-2">
                        {subMaterials.map((m) => (
                          <div key={m.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                <FileText className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{m.title}</p>
                                <p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</p>
                                {m.delete_requested && (
                                  <Badge variant="outline" className="mt-1 text-[10px] text-destructive border-destructive/30">Delete Requested</Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="outline" size="sm" asChild>
                                <a href={m.file_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                                </a>
                              </Button>
                              {m.user_id === user?.id && !m.delete_requested && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteRequest(m.id)}>
                                      <Trash2 className="mr-2 h-4 w-4" /> Request for Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {/* Materials not matched to any subject */}
            {semMaterials.filter((m) => !semSubjects.some((s) => s.name === m.subject)).length > 0 && (
              <Card className="shadow-card">
                <CardContent className="p-5">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-3">Other Materials</h3>
                  <div className="space-y-2">
                    {semMaterials.filter((m) => !semSubjects.some((s) => s.name === m.subject)).map((m) => (
                      <div key={m.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{m.title}</p>
                            <p className="text-xs text-muted-foreground">{m.subject}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={m.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DashboardLayout>
    );
  }

  // Level 3: Show semesters for selected department
  if (selectedDept) {
    const deptSemesters = semesters.filter((s) => s.department_id === selectedDept.id);
    return (
      <DashboardLayout>
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={goBack} className="mb-2">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                <span className={i === breadcrumb.length - 1 ? "text-foreground font-medium" : ""}>{b}</span>
              </span>
            ))}
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">{selectedDept.name}</h1>
          <p className="mt-1 text-muted-foreground">Select a semester to view subjects and materials</p>
        </div>
        {deptSemesters.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Layers className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="text-lg font-medium text-muted-foreground">No semesters added yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {deptSemesters.map((sem) => {
              const semSubCount = subjects.filter((s) => s.semester_id === sem.id).length;
              return (
                <Card key={sem.id} className="shadow-card cursor-pointer transition-shadow hover:shadow-card-hover" onClick={() => setSelectedSem(sem)}>
                  <CardContent className="p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/50">
                      <Layers className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{sem.name}</h3>
                    <p className="text-sm text-muted-foreground">{semSubCount} subjects</p>
                    <ChevronRight className="mt-2 h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </DashboardLayout>
    );
  }

  // Level 2: Show departments for selected course
  if (selectedCourse) {
    const courseDepts = departments.filter((d) => d.course_id === selectedCourse.id);
    return (
      <DashboardLayout>
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={goBack} className="mb-2">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span className="text-foreground font-medium">{selectedCourse.name}</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">{selectedCourse.name}</h1>
          <p className="mt-1 text-muted-foreground">Select a department / branch</p>
        </div>
        {courseDepts.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="text-lg font-medium text-muted-foreground">No departments added yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courseDepts.map((dept) => {
              const deptSemCount = semesters.filter((s) => s.department_id === dept.id).length;
              return (
                <Card key={dept.id} className="shadow-card cursor-pointer transition-shadow hover:shadow-card-hover" onClick={() => setSelectedDept(dept)}>
                  <CardContent className="p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{dept.name}</h3>
                    <p className="text-sm text-muted-foreground">{deptSemCount} semesters</p>
                    <ChevronRight className="mt-2 h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </DashboardLayout>
    );
  }

  // Level 1: Show all courses
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Courses</h1>
        <p className="mt-1 text-muted-foreground">Select a course to explore departments, semesters and study materials</p>
      </div>
      {courses.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-lg font-medium text-muted-foreground">No courses available yet</p>
            <p className="text-sm text-muted-foreground/70">Courses will appear here once added by admin</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const deptCount = departments.filter((d) => d.course_id === course.id).length;
            return (
              <Card key={course.id} className="shadow-card cursor-pointer transition-shadow hover:shadow-card-hover" onClick={() => setSelectedCourse(course)}>
                <CardContent className="p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{course.name}</h3>
                  <p className="text-sm text-muted-foreground">{deptCount} departments</p>
                  <ChevronRight className="mt-2 h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentCourses;
