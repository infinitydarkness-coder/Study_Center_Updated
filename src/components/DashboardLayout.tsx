import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { BookOpen, LogOut, LayoutDashboard, FolderOpen, Layers, MessageSquare, Clock, Users, Settings, Upload, User, Map } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const isAdmin = profile?.role === "admin";

  const adminNav = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/courses", icon: FolderOpen, label: "Courses" },
    { href: "/admin/subjects", icon: Layers, label: "Subjects" },
    { href: "/admin/categories", icon: MessageSquare, label: "Categories" },
    { href: "/admin/pending", icon: Clock, label: "Pending Uploads" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  const studentNav = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/courses", icon: FolderOpen, label: "My Courses" },
    { href: "/dashboard/roadmap", icon: Map, label: "AI Roadmap" },
    { href: "/dashboard/upload", icon: Upload, label: "Upload Materials" },
    { href: "/dashboard/profile", icon: User, label: "Profile" },
  ];

  const navItems = isAdmin ? adminNav : studentNav;
  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-full w-56 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-sm font-bold text-primary">Study Center</span>
        </div>

        {/* User info */}
        <div className="mx-3 mb-4 flex items-center gap-2.5 rounded-lg bg-primary/5 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">{profile?.name || "User"}</p>
            <p className="truncate text-[10px] text-muted-foreground">{profile?.course || "Course"}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border px-3 py-4">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-destructive hover:bg-destructive/5 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 p-8">
        <div className="mx-auto max-w-[1200px] animate-fade-in">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
