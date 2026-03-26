import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BookOpen, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); setLoading(false); return; }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
    toast.success("Login successful!");
    navigate(profile?.role === "admin" ? "/admin" : "/dashboard");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-card">
      {/* Top Nav */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-sm font-bold text-foreground">Study Center</span>
        </div>
        <Link to="/" className="text-sm font-medium text-primary hover:underline">Back to Home</Link>
      </div>

      {/* Content */}
      <div className="mx-auto flex max-w-4xl items-start gap-0 px-6 pt-12">
        {/* Left Panel */}
        <div className="flex-1 pr-12 pt-8">
          <span className="inline-block rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-warning">
            Focus with Direction
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-foreground">
            Welcome back. Your next milestone is waiting.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Resume your plan, continue your tracked progress, and access verified resources without searching everywhere.
          </p>

          {/* Stats at bottom */}
          <div className="mt-auto pt-24">
            <div className="relative">
              <div className="absolute -top-8 right-0 h-24 w-24 rounded-full bg-accent/10" />
              <div className="flex gap-3">
                {[
                  { value: "500+", label: "Verified materials" },
                  { value: "50+", label: "Subjects covered" },
                  { value: "24/7", label: "AI study support" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-border bg-card px-4 py-2.5 text-center">
                    <p className="font-display text-sm font-bold text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-[360px] rounded-xl border border-border bg-card p-8">
          <h2 className="font-display text-2xl font-bold text-foreground">Log In</h2>
          <p className="mt-1 text-sm text-muted-foreground mb-6">Sign in to continue your learning dashboard.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Email Address</Label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-foreground">Password</Label>
                <button type="button" className="text-xs font-medium text-primary hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase text-destructive hover:text-destructive/80"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={loading}>
              {loading ? "Signing in..." : "Log In"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Do not have an account?{" "}
            <Link to="/signup" className="font-semibold text-foreground underline hover:no-underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
