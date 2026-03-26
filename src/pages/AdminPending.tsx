import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, FileText, ExternalLink, RefreshCw, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface PendingUpload {
  id: string;
  title: string;
  subject: string;
  file_url: string;
  created_at: string;
  user_id: string;
  profiles: { name: string } | null;
}

const AdminPending = () => {
  const [uploads, setUploads] = useState<PendingUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewedToday, setReviewedToday] = useState(0);

  const fetchPending = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("uploads")
      .select("id, title, subject, file_url, created_at, user_id, profiles(name)")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    setUploads((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchPending(); }, []);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("uploads").update({ status }).eq("id", id);
    if (error) { toast.error("Failed to update status"); return; }
    toast.success(`Upload ${status}`);
    setUploads((prev) => prev.filter((u) => u.id !== id));
    setReviewedToday((p) => p + 1);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Fresh Workspace</p>
          <h1 className="font-display text-3xl font-bold text-foreground">Pending Uploads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The moderation queue is {uploads.length === 0 ? "empty" : "active"}. {uploads.length === 0 ? "New student submissions will appear here for review and approval." : `${uploads.length} items need your attention.`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={fetchPending}><RefreshCw className="mr-1.5 h-3.5 w-3.5" />Refresh Queue</Button>
          <Button asChild variant="outline" size="sm"><Link to="/admin/courses">Go To Courses</Link></Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "PENDING NOW", value: uploads.length, sub: uploads.length === 0 ? "No uploads waiting for moderation." : `${uploads.length} uploads need review.` },
          { label: "REVIEWED TODAY", value: reviewedToday, sub: "Approvals and rejections will be tracked here." },
          { label: "FLAGGED ITEMS", value: 0, sub: "Policy-risk uploads will be highlighted." },
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

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : uploads.length === 0 ? (
        <Card className="shadow-card border-0 mb-6">
          <CardContent className="p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Queue is clear</h3>
            <p className="max-w-md text-sm text-muted-foreground mb-4">
              There are currently no pending uploads. When students submit new materials, they will appear here for review and approval.
            </p>
            <Button asChild variant="outline" size="sm"><Link to="/admin/users">Review User Activity</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 mb-6">
          {uploads.map((u) => (
            <Card key={u.id} className="shadow-card border-0">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                    <FileText className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{u.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {u.subject} · by {u.profiles?.name || "Unknown"} · {new Date(u.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={u.file_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                  </Button>
                  <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground" onClick={() => handleAction(u.id, "approved")}>
                    <Check className="mr-1 h-3.5 w-3.5" />Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleAction(u.id, "rejected")}>
                    <X className="mr-1 h-3.5 w-3.5" />Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { title: "Review Consistency", desc: "Use the same acceptance criteria across all subjects to keep quality predictable." },
          { title: "Fast Triage", desc: "Prioritize metadata-complete files first, then return to incomplete submissions." },
          { title: "Audit Trail", desc: "Store clear reasons when rejecting content so contributors can fix quickly." },
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

export default AdminPending;
