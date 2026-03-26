import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Clock, BookOpen, Sparkles, Activity, User, Map } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const StudentDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [recentUploads, setRecentUploads] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("uploads")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setStats({
            total: data.length,
            approved: data.filter((u) => u.status === "approved").length,
            pending: data.filter((u) => u.status === "pending").length,
            rejected: data.filter((u) => u.status === "rejected").length,
          });
          setRecentUploads(data.slice(0, 5));
        }
      });
  }, [profile]);

  const firstName = profile?.name?.split(" ")[0] || "Student";
  const today = format(new Date(), "EEE, MMM d");

  return (
    <DashboardLayout>
      {/* Hero Section */}
      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 shadow-card">
          <CardContent className="p-6">
            <Badge variant="outline" className="mb-3 border-success/30 bg-success/10 text-success text-xs">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-success" />
              Updated {today}
            </Badge>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student Command Center</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-foreground">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              Keep your learning momentum strong. Continue active courses, track your progress, and let the AI assistant help you prepare smarter sessions.
            </p>
            <div className="mt-4 flex gap-3">
              <Button asChild>
                <Link to="/dashboard/courses">Explore Courses</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard/roadmap">Open AI Roadmap</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Study Streak</p>
              <p className="font-display text-2xl font-bold text-foreground">0 days</p>
              <p className="text-xs text-muted-foreground">Small daily steps beat irregular marathons.</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Next Milestone</p>
              <p className="font-display text-lg font-bold text-foreground">Start first course</p>
              <p className="text-xs text-muted-foreground">Complete one unit to unlock deeper recommendations.</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Today</p>
              <p className="font-display text-lg font-bold text-foreground">{today}</p>
              <p className="text-xs text-muted-foreground">Consistency creates long-term mastery.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Enrolled Courses</p>
              <Badge className="bg-primary/10 text-primary text-[10px] hover:bg-primary/10">Active</Badge>
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-foreground">0</p>
            <p className="mt-1 text-xs text-muted-foreground">Your current learning tracks.</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completed Courses</p>
              <Badge className="bg-success/10 text-success text-[10px] hover:bg-success/10">Achieved</Badge>
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-foreground">0</p>
            <p className="mt-1 text-xs text-muted-foreground">Courses finished with progress at 100%.</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">My Uploads</p>
              <Badge className="bg-warning/10 text-warning text-[10px] hover:bg-warning/10">Moderation</Badge>
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-foreground">{stats.total}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pending {stats.pending} | Approved {stats.approved} | Rejected {stats.rejected} · Course files {stats.total}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning + AI Recommendations */}
      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Continue Learning</h2>
                <p className="text-xs text-muted-foreground">Your active modules and progress snapshots.</p>
              </div>
              <Link to="/dashboard/courses" className="text-xs font-semibold text-primary hover:underline">View all</Link>
            </div>
            <div className="mt-4 flex items-center justify-center rounded-lg border border-dashed border-border py-8">
              <p className="text-sm text-muted-foreground">No courses enrolled yet. Start your learning journey!</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-5">
            <h2 className="font-display text-lg font-bold text-foreground">AI Recommendations</h2>
            <p className="text-xs text-muted-foreground">Personalized tips to boost progress.</p>
            <div className="mt-4 flex items-center justify-center rounded-lg border border-dashed border-border py-8">
              <p className="text-center text-sm text-muted-foreground">Start learning to receive personalized AI recommendations.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mb-6 shadow-card">
        <CardContent className="p-5">
          <h2 className="font-display text-lg font-bold text-foreground">Recent Activity</h2>
          <p className="text-xs text-muted-foreground">Latest updates from your learning journey.</p>
          <div className="mt-4 rounded-lg border border-dashed border-border py-8 text-center">
            {recentUploads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity yet. Start your first lesson today.</p>
            ) : (
              <div className="space-y-2 px-4 text-left">
                {recentUploads.map((u) => (
                  <div key={u.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{u.title}</p>
                      <p className="text-xs text-muted-foreground">{u.subject} · {format(new Date(u.created_at), "MMM d")}</p>
                    </div>
                    <Badge variant={u.status === "approved" ? "default" : u.status === "rejected" ? "destructive" : "secondary"} className="text-[10px]">
                      {u.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Action Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card border-t-2 border-t-primary">
          <CardContent className="p-5">
            <h3 className="font-display font-bold text-foreground">Upload Materials</h3>
            <p className="mt-1 text-xs text-muted-foreground">Share notes, PDFs, or tutorials with your class community.</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-t-2 border-t-info">
          <CardContent className="p-5">
            <h3 className="font-display font-bold text-foreground">Update Profile</h3>
            <p className="mt-1 text-xs text-muted-foreground">Keep your academic info and preferences up to date.</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-t-2 border-t-success">
          <CardContent className="p-5">
            <h3 className="font-display font-bold text-foreground">Build Study Plan</h3>
            <p className="mt-1 text-xs text-muted-foreground">Create a focused roadmap based on your learning goals.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
