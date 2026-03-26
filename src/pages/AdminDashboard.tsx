import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, FolderOpen, Clock, CheckCircle, Circle, ExternalLink, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ users: 0, courses: 0, pending: 0, approved: 0, deleteRequests: 0 });
  const [pendingUploads, setPendingUploads] = useState<any[]>([]);
  const [deleteRequests, setDeleteRequests] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("courses").select("id", { count: "exact", head: true }),
      supabase.from("uploads").select("status, delete_requested"),
      supabase
        .from("uploads")
        .select("id, title, subject, created_at, profiles(name)")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("uploads")
        .select("id, title, subject, created_at, profiles(name)")
        .eq("delete_requested", true)
        .order("created_at", { ascending: false })
        .limit(5),
    ]).then(([profilesRes, coursesRes, uploadsRes, pendingRes, deleteRes]) => {
      const uploads = uploadsRes.data || [];
      setStats({
        users: profilesRes.count || 0,
        courses: coursesRes.count || 0,
        pending: uploads.filter((u) => u.status === "pending").length,
        approved: uploads.filter((u) => u.status === "approved").length,
        deleteRequests: uploads.filter((u: any) => u.delete_requested).length,
      });
      setPendingUploads((pendingRes.data as any) || []);
      setDeleteRequests((deleteRes.data as any) || []);
    });
  }, []);

  const handleDeleteUpload = async (id: string) => {
    const { error } = await supabase.from("uploads").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Material deleted");
    setDeleteRequests((prev) => prev.filter((u: any) => u.id !== id));
    setStats((prev) => ({ ...prev, deleteRequests: prev.deleteRequests - 1 }));
  };

  const handleDismissDelete = async (id: string) => {
    const { error } = await supabase.from("uploads").update({ delete_requested: false }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setDeleteRequests((prev) => prev.filter((r: any) => r.id !== id));
    setStats((prev) => ({ ...prev, deleteRequests: prev.deleteRequests - 1 }));
    toast.success("Request dismissed");
  };

  const today = new Date();

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Operations Console</p>
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard Pulse</h1>
          <p className="mt-1 max-w-lg text-sm text-muted-foreground">
            Welcome back, {profile?.name || "Admin"}. Review pending content, monitor platform activity, and keep the quality bar high.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
            <Circle className="h-2 w-2 fill-current" />
            Live sync active
          </div>
          <Button variant="outline" size="sm">Export Snapshot</Button>
        </div>
      </div>

      {/* Hero + Sidebar */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card className="col-span-2 overflow-hidden border-0 shadow-card">
          <CardContent className="relative p-6 gradient-hero min-h-[180px]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Today at a Glance</p>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              {stats.pending} uploads are waiting for a decision
            </h2>
            <p className="max-w-md text-sm text-muted-foreground mb-4">
              The review queue is above your normal threshold. Prioritize high-impact course uploads first to keep publication timelines on track.
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm"><Link to="/admin/pending">Review Queue</Link></Button>
              <Button asChild variant="outline" size="sm"><Link to="/admin/courses">Manage Courses</Link></Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-destructive mb-0.5">Today</p>
              <p className="font-display text-lg font-bold text-foreground">{format(today, "EEE, MMM d")}</p>
              <p className="text-xs text-muted-foreground">Keep momentum with short approval cycles.</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Approval Speed</p>
              <p className="font-display text-lg font-bold text-foreground">2h 18m</p>
              <p className="text-xs text-muted-foreground">Average turnaround for pending items.</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Risk Flags</p>
              <p className="font-display text-lg font-bold text-foreground">{stats.pending > 0 ? stats.pending : 0}</p>
              <p className="text-xs text-muted-foreground">Uploads marked for policy verification.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card className="shadow-card border-0">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Users</p>
              <p className="font-display text-3xl font-bold text-foreground">{stats.users}</p>
              <p className="text-xs text-muted-foreground">Synced live from profiles.</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-xs font-semibold text-success">+12.5%</div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Courses</p>
              <p className="font-display text-3xl font-bold text-foreground">{stats.courses}</p>
              <p className="text-xs text-muted-foreground">Synced live from courses table.</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-info/10 text-xs font-semibold text-info">+3</div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pending Uploads</p>
              <p className="font-display text-3xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Synced live from pending materials.</p>
            </div>
            {stats.pending > 0 && (
              <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">Needs review</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Queue + Live Activity */}
      <div className="mb-6 grid grid-cols-5 gap-4">
        <Card className="col-span-3 shadow-card border-0">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Review Queue</h3>
                <p className="text-xs text-muted-foreground">Recent uploads waiting for moderation and publication.</p>
              </div>
              <Link to="/admin/pending" className="text-xs font-medium text-primary hover:underline">View all</Link>
            </div>
            {pendingUploads.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No pending uploads right now.</p>
            ) : (
              <div className="space-y-3">
                {pendingUploads.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{u.title}</p>
                      <p className="text-xs text-muted-foreground">{u.subject} · by {u.profiles?.name || "Unknown"}</p>
                    </div>
                    <Link to="/admin/pending">
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-2 shadow-card border-0">
          <CardContent className="p-5">
            <h3 className="font-display text-lg font-bold text-foreground mb-1">Live Activity</h3>
            <p className="text-xs text-muted-foreground mb-4">Recent events across the learning platform.</p>
            <div className="space-y-3">
              {[
                { color: "bg-success", label: "Course approved: Neural Networks 101", sub: `Published by Admin Team | ${format(today, "h:mm a")}` },
                { color: "bg-info", label: "New educator account verified", sub: "User verified | 24 minutes ago" },
                { color: "bg-warning", label: "Upload flagged for manual policy check", sub: "Reason: missing attribution details | 41 minutes ago" },
                { color: "bg-destructive", label: `${stats.approved} materials approved total`, sub: "Certificates generated automatically | 1 hour ago" },
              ].map((item, i) => (
                <div key={i} className="flex gap-2.5">
                  <div className={`mt-1.5 h-2 w-2 rounded-full ${item.color} shrink-0`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Requests Notification */}
      {deleteRequests.length > 0 && (
        <Card className="mb-6 shadow-card border-l-4 border-l-destructive border-0">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Delete Requests ({stats.deleteRequests})</h3>
                <p className="text-xs text-muted-foreground">Students have requested deletion of these materials.</p>
              </div>
            </div>
            <div className="space-y-3">
              {deleteRequests.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg bg-destructive/5 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.title}</p>
                    <p className="text-xs text-muted-foreground">{u.subject} · by {u.profiles?.name || "Unknown"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteUpload(u.id)}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />Delete
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDismissDelete(u.id)}>Dismiss</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { title: "User Access Control", desc: "Manage permissions, block suspicious accounts, and verify educators.", href: "/admin/users" },
          { title: "Content Taxonomy", desc: "Reorganize categories and improve discoverability across subjects.", href: "/admin/categories" },
          { title: "Platform Settings", desc: "Adjust approvals, notifications, and quality workflow automation.", href: "/admin/settings" },
        ].map((c) => (
          <Link key={c.title} to={c.href}>
            <Card className="shadow-card border-0 hover:shadow-card-hover transition-shadow cursor-pointer h-full">
              <CardContent className="p-5">
                <h4 className="font-display text-sm font-bold text-foreground mb-1">{c.title}</h4>
                <p className="text-xs text-muted-foreground">{c.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
