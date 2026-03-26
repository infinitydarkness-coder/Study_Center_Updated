import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [course, setCourse] = useState("");
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    supabase.from("courses").select("id, name").order("name").then(({ data }) => setCourses(data || []));
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim() || !course) {
      toast.error("Please fill in all fields"); return;
    }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, course, role: "student" }, emailRedirectTo: window.location.origin },
    });
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success("Account created! You can now sign in.");
    navigate("/login");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-sm font-bold text-foreground">Study Center</span>
        </div>
        <Link to="/" className="text-sm font-medium text-primary hover:underline">Back to Home</Link>
      </div>

      <div className="mx-auto flex max-w-4xl items-start gap-0 px-6 pt-12">
        {/* Left Panel */}
        <div className="flex-1 pr-12 pt-8">
          <span className="inline-block rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-success">
            Start Strong
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-foreground">
            Create your account and begin structured learning.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Pick your course, unlock guided roadmaps, and track your progress with verified study material from day one.
          </p>

          <div className="mt-auto pt-24">
            <div className="relative">
              <div className="absolute -top-8 right-0 h-24 w-24 rounded-full bg-accent/10" />
              <div className="flex gap-3">
                {[
                  { value: "Smart", label: "Roadmap planning" },
                  { value: "Clean", label: "Progress tracking" },
                  { value: "Fast", label: "Material access" },
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
          <h2 className="font-display text-2xl font-bold text-foreground">Create Account</h2>
          <p className="mt-1 text-sm text-muted-foreground mb-6">Set up your profile to personalize your learning path.</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Full Name</Label>
              <Input placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Email Address</Label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Course</Label>
              {courses.length > 0 ? (
                <Select value={course} onValueChange={setCourse}>
                  <SelectTrigger><SelectValue placeholder="Select your course" /></SelectTrigger>
                  <SelectContent>{courses.map((c) => (<SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>))}</SelectContent>
                </Select>
              ) : (
                <Input placeholder="Enter your course" value={course} onChange={(e) => setCourse(e.target.value)} required />
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Password</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase text-destructive hover:text-destructive/80">
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Confirm Password</Label>
              <div className="relative">
                <Input type={showConfirm ? "text" : "password"} placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase text-destructive hover:text-destructive/80">
                  {showConfirm ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-foreground underline hover:no-underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
