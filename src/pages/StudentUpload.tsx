import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, FileUp, Clock, CheckSquare, XCircle, FileText, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const ACCEPTED_TYPES = ".pdf,.doc,.docx,.ppt,.pptx,.zip,.mp4,.avi,.mov";

const StudentUpload = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [myUploads, setMyUploads] = useState<any[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  // Hierarchical selection
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedSemId, setSelectedSemId] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    const fetchMeta = async () => {
      const [c, d, s, sub] = await Promise.all([
        supabase.from("courses").select("id, name").order("name"),
        supabase.from("departments").select("id, name, course_id").order("name"),
        supabase.from("semesters").select("id, name, department_id").order("name"),
        supabase.from("subjects").select("id, name, semester_id").order("name"),
      ]);
      setCourses(c.data || []);
      setDepartments(d.data || []);
      setSemesters(s.data || []);
      setSubjects(sub.data || []);
    };
    fetchMeta();
  }, []);

  const filteredDepts = departments.filter((d) => d.course_id === selectedCourseId);
  const filteredSems = semesters.filter((s) => s.department_id === selectedDeptId);
  const filteredSubjects = subjects.filter((s) => s.semester_id === selectedSemId);

  // Reset cascading selections
  useEffect(() => { setSelectedDeptId(""); setSelectedSemId(""); setSelectedSubject(""); }, [selectedCourseId]);
  useEffect(() => { setSelectedSemId(""); setSelectedSubject(""); }, [selectedDeptId]);
  useEffect(() => { setSelectedSubject(""); }, [selectedSemId]);

  const fetchUploads = async () => {
    if (!user) return;
    const { data } = await supabase.from("uploads").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) {
      setMyUploads(data);
      setStats({
        pending: data.filter((u) => u.status === "pending").length,
        approved: data.filter((u) => u.status === "approved").length,
        rejected: data.filter((u) => u.status === "rejected").length,
        total: data.length,
      });
    }
  };

  useEffect(() => { fetchUploads(); }, [user]);

  const handleClear = () => {
    setTitle(""); setDescription(""); setMaterialType(""); setDifficulty(""); setTags(""); setFile(null);
    setSelectedCourseId(""); setSelectedDeptId(""); setSelectedSemId(""); setSelectedSubject("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedSubject || !file || !user || !selectedDeptId || !selectedSemId) {
      toast.error("Please fill in all required fields (course, department, semester, subject) and select a file");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be under 50MB");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      // Use XMLHttpRequest for upload progress tracking
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const session = (await supabase.auth.getSession()).data.session;
      const token = session?.access_token || supabaseKey;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${supabaseUrl}/storage/v1/object/study-materials/${filePath}`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.setRequestHeader("apikey", supabaseKey);
        xhr.setRequestHeader("x-upsert", "false");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(xhr.responseText || "Upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      });

      const { data: urlData } = supabase.storage.from("study-materials").getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("uploads").insert({
        user_id: user.id,
        title: title.trim(),
        subject: selectedSubject,
        file_url: urlData.publicUrl,
        status: "pending",
        department_id: selectedDeptId,
        semester_id: selectedSemId,
      });
      if (dbError) throw dbError;

      toast.success("Material submitted for review!");
      handleClear();
      fetchUploads();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <Upload className="h-7 w-7 text-primary" />
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Upload Study Materials</h1>
          <p className="text-sm text-muted-foreground">Share your notes and study materials with others</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <Card className="shadow-card"><CardContent className="p-4"><Clock className="mb-2 h-5 w-5 text-warning" /><p className="font-display text-2xl font-bold">{stats.pending}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><CheckSquare className="mb-2 h-5 w-5 text-success" /><p className="font-display text-2xl font-bold">{stats.approved}</p><p className="text-xs text-muted-foreground">Approved</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><XCircle className="mb-2 h-5 w-5 text-destructive" /><p className="font-display text-2xl font-bold">{stats.rejected}</p><p className="text-xs text-muted-foreground">Rejected</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><FileText className="mb-2 h-5 w-5 text-primary" /><p className="font-display text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
      </div>

      {/* Upload Form */}
      <Card className="mb-6 shadow-card border-2 border-dashed border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">Upload New Material</h2>
            <p className="text-xs text-muted-foreground">All uploads are reviewed by admin before being published.</p>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            {/* Cascading selectors: Course → Department → Semester → Subject */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold">Course *</Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Department / Branch *</Label>
                <Select value={selectedDeptId} onValueChange={setSelectedDeptId} disabled={!selectedCourseId}>
                  <SelectTrigger><SelectValue placeholder={selectedCourseId ? "Select department" : "Select course first"} /></SelectTrigger>
                  <SelectContent>
                    {filteredDepts.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold">Semester *</Label>
                <Select value={selectedSemId} onValueChange={setSelectedSemId} disabled={!selectedDeptId}>
                  <SelectTrigger><SelectValue placeholder={selectedDeptId ? "Select semester" : "Select department first"} /></SelectTrigger>
                  <SelectContent>
                    {filteredSems.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Subject *</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedSemId}>
                  <SelectTrigger><SelectValue placeholder={selectedSemId ? "Select subject" : "Select semester first"} /></SelectTrigger>
                  <SelectContent>
                    {filteredSubjects.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Material Title *</Label>
              <Input placeholder="e.g., Sorting Algorithms Complete Notes" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Description</Label>
              <Textarea placeholder="Brief description of the material content..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold">Material Type</Label>
                <Select value={materialType} onValueChange={setMaterialType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notes">Notes</SelectItem>
                    <SelectItem value="slides">Slides</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Upload File *</Label>
              <Input type="file" accept={ACCEPTED_TYPES} ref={fileRef} onChange={(e) => setFile(e.target.files?.[0] || null)} required />
              <p className="text-xs text-muted-foreground">Accepted: PDF, DOC, DOCX, PPT, PPTX, ZIP, MP4, AVI, MOV (Max 50MB)</p>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Tags (optional)</Label>
              <Input placeholder="e.g., algorithms, sorting" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <p className="font-semibold text-sm text-primary flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> Upload Guidelines:</p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc pl-4">
                  <li>Your content is original or properly cited</li>
                  <li>Materials must be relevant to the selected subject</li>
                  <li>Files must be clear, readable, and properly formatted</li>
                  <li>Review takes up to 48 hours</li>
                </ul>
              </CardContent>
            </Card>

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="font-medium text-primary">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleClear} disabled={uploading}>Clear Form</Button>
              <Button type="submit" disabled={uploading}>
                <FileUp className="mr-2 h-4 w-4" />
                {uploading ? `Uploading ${uploadProgress}%` : "Submit Material"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* My Uploads */}
      <Card className="shadow-card">
        <CardContent className="p-5">
          <h2 className="font-display text-lg font-bold text-foreground mb-4">My Uploads</h2>
          {myUploads.length === 0 ? (
            <div className="flex items-center gap-4 py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">No Uploads Yet</h3>
                <p className="text-sm text-muted-foreground">Upload your first study material to share with others!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {myUploads.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{u.title}</p>
                      <p className="text-xs text-muted-foreground">{u.subject} · {format(new Date(u.created_at), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  <Badge variant={u.status === "approved" ? "default" : u.status === "rejected" ? "destructive" : "secondary"} className="text-[10px]">
                    {u.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default StudentUpload;
