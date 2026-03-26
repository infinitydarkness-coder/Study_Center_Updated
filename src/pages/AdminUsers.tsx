import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Users as UsersIcon } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  role: string;
  course: string | null;
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setUsers(data || []);
      setLoading(false);
    });
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    if (error) { toast.error("Failed to update role"); return; }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    toast.success("Role updated");
  };

  const students = users.filter((u) => u.role === "student").length;
  const admins = users.filter((u) => u.role === "admin").length;
  const now = new Date();
  const thisMonth = users.filter((u) => {
    const d = new Date(u.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Fresh Workspace</p>
          <h1 className="font-display text-3xl font-bold text-foreground">Users Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {users.length === 0 ? "User registry has been reset. Invite students and admins to start building your active community." : `Manage ${users.length} users and their roles.`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm">+ Invite User</Button>
          <Button variant="outline" size="sm">Import Users</Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          { label: "TOTAL USERS", value: users.length, sub: users.length === 0 ? "No users added yet." : `${users.length} registered users.` },
          { label: "STUDENTS", value: students, sub: "Learner accounts will show here." },
          { label: "ADMINS", value: admins, sub: "Admin operators in your workspace." },
          { label: "NEW THIS MONTH", value: thisMonth, sub: "Recently onboarded accounts." },
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
      ) : users.length === 0 ? (
        <Card className="shadow-card border-0 mb-6">
          <CardContent className="p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <UsersIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">No user directory yet</h3>
            <p className="max-w-md text-sm text-muted-foreground mb-4">
              Add your first users to begin platform activity. You can onboard learners, assign roles, and review account status from this page once records are available.
            </p>
            <div className="flex gap-2">
              <Button size="sm">Add First User</Button>
              <Button variant="outline" size="sm">Permission Settings</Button>
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
                  <TableHead>Course</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.course || "—"}</TableCell>
                    <TableCell>
                      <Select value={u.role} onValueChange={(val) => handleRoleChange(u.id, val)}>
                        <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { title: "Invite in Batches", desc: "Import departments or classes together to reduce onboarding time." },
          { title: "Define Roles Early", desc: "Assign role boundaries up front so governance stays clear." },
          { title: "Audit Access", desc: "Run regular checks for inactive or duplicate accounts." },
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

export default AdminUsers;
