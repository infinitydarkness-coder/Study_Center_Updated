import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Sparkles, RotateCcw, Copy, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const ROADMAP_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-roadmap`;

const StudentAIRoadmap = () => {
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("");
  const [hours, setHours] = useState("10");
  const [timeline, setTimeline] = useState("");
  const [roadmap, setRoadmap] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!goal.trim() || !level || !timeline) {
      toast.error("Please fill in all fields");
      return;
    }
    setGenerating(true);
    setRoadmap("");

    try {
      const resp = await fetch(ROADMAP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ goal, level, hours, timeline }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Failed to generate roadmap" }));
        throw new Error(err.error || "Failed to generate roadmap");
      }

      if (!resp.body) throw new Error("No response stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setRoadmap(fullText);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      toast.success("Roadmap generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate roadmap");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(roadmap);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
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
                <SelectTrigger><SelectValue placeholder="Select your level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Time Commitment (hours per week)</Label>
              <Input type="number" placeholder="10" value={hours} onChange={(e) => setHours(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Target Timeline</Label>
              <Select value={timeline} onValueChange={setTimeline}>
                <SelectTrigger><SelectValue placeholder="Select timeline" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 month">1 Month</SelectItem>
                  <SelectItem value="3 months">3 Months</SelectItem>
                  <SelectItem value="6 months">6 Months</SelectItem>
                  <SelectItem value="1 year">1 Year</SelectItem>
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

      {(roadmap || generating) && (
        <Card className="mt-6 shadow-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Your AI Roadmap</span>
              {generating && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  Generating...
                </span>
              )}
            </div>
            {roadmap && !generating && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleGenerate}>
                  <RotateCcw className="h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            )}
          </div>
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-display prose-h1:text-2xl prose-h2:text-xl prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h3:text-lg prose-strong:text-foreground prose-li:marker:text-primary">
              <ReactMarkdown>{roadmap}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default StudentAIRoadmap;
