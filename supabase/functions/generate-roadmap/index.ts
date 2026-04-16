import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { goal, level, hours, timeline } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert educational advisor and career counselor. Create detailed, actionable learning roadmaps for students.

Your roadmaps MUST follow this exact markdown structure:

# 🎯 Learning Roadmap: [Topic]

## 📋 Overview
A brief 2-3 sentence summary of the learning path.

**Level:** [level] | **Commitment:** [hours]h/week | **Timeline:** [timeline]

---

## 🏗️ Phase 1: Foundation (Week X-Y)
### Goals
- Goal 1
- Goal 2

### Topics to Cover
1. **Topic Name** — Brief description
2. **Topic Name** — Brief description

### Resources
- 📚 [Resource type]: Description
- 🎥 [Resource type]: Description

### Mini Project
Build a [project description] to solidify your understanding.

---

(Repeat phases as needed based on timeline)

## 🏆 Final Milestone
Description of what the student should be able to do by the end.

## 💡 Pro Tips
- Tip 1
- Tip 2
- Tip 3

Make the roadmap specific, practical, and motivating. Include real tool/framework names, realistic project ideas, and concrete milestones. Tailor depth and pace to the student's level and time commitment.`;

    const userPrompt = `Create a detailed learning roadmap with the following parameters:
- **Goal:** ${goal}
- **Current Level:** ${level}
- **Time Commitment:** ${hours} hours per week
- **Target Timeline:** ${timeline}

Please create a comprehensive, phase-by-phase roadmap with specific topics, resources, and projects.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-roadmap error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
