import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Sparkles } from "lucide-react";
import { toast } from "sonner";

const StudentAIRoadmap = () => {
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("");
  const [hours, setHours] = useState("10");
  const [timeline, setTimeline] = useState("");
  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!goal.trim() || !level || !timeline) {
      toast.error("Please fill in all fields");
      return;
    }
    setGenerating(true);
    // Simulated AI roadmap generation
    setTimeout(() => {
      setRoadmap(
        `## 🎯 Learning Roadmap: ${goal}\n\n` +
        `**Level:** ${level} | **Time:** ${hours}h/week | **Timeline:** ${timeline}\n\n` +
        `### Phase 1: Foundations (Weeks 1-2)\n` +
        `- Core concepts and fundamentals\n- Setup development environment\n- Complete beginner exercises\n\n` +
        `### Phase 2: Building Skills (Weeks 3-5)\n` +
        `- Intermediate projects and practice\n- Deep dive into key topics\n- Build mini-projects\n\n` +
        `### Phase 3: Advanced & Portfolio (Weeks 6-8)\n` +
        `- Real-world project development\n- Advanced patterns and best practices\n- Portfolio-ready project completion`
      );
      setGenerating(false);
      toast.success("Roadmap generated!");
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center gap-3">
        <Bot className="h-8 w-8 text-primary" />
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">AI Roadmap Generator</h1>
          <p className="text-muted-foreground">Create personalized learning paths powered by AI</p>
        </div>
      </div>

      <Card className="shadow-card border-2 border-dashed border-primary/20">
        <CardContent className="p-6">
          <h2 className="font-display text-xl font-bold text-foreground">Generate Your Custom Roadmap</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us your learning goals and current skill level, and our AI will create a personalized study plan just for you.
          </p>

          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label className="font-semibold">What do you want to learn?</Label>
              <Input
                placeholder="e.g., Full Stack Development, Machine Learning, Data Science"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Your Current Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Time Commitment (hours per week)</Label>
              <Input
                type="number"
                placeholder="10"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Target Timeline</Label>
              <Select value={timeline} onValueChange={setTimeline}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-month">1 Month</SelectItem>
                  <SelectItem value="3-months">3 Months</SelectItem>
                  <SelectItem value="6-months">6 Months</SelectItem>
                  <SelectItem value="1-year">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGenerate} disabled={generating} className="w-full" size="lg">
              <Sparkles className="mr-2 h-4 w-4" />
              {generating ? "Generating..." : "Generate AI Roadmap"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {roadmap && (
        <Card className="mt-6 shadow-card">
          <CardContent className="p-6">
            <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">{roadmap}</pre>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default StudentAIRoadmap;
