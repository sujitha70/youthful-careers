import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JobResult {
  id: string;
  company: string;
  title: string;
  type: string;
  skills: string[] | null;
  salary: string | null;
  location: string;
  created_at: string;
  description: string | null;
  requirements: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch all active jobs from database
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError);
    }

    const jobsContext = jobs?.map((job: JobResult) => ({
      id: job.id,
      company: job.company,
      title: job.title,
      type: job.type,
      skills: job.skills || [],
      salary: job.salary || "Not disclosed",
      location: job.location,
      posted: getTimeAgo(new Date(job.created_at)),
      description: job.description?.substring(0, 200) || "",
      requirements: job.requirements?.substring(0, 200) || "",
    })) || [];

    const systemPrompt = `You are an AI-powered job search assistant specifically designed for freshers and entry-level candidates (0-2 years experience). You help users find suitable jobs through natural language conversations.

## Your Capabilities:
- Search and filter jobs based on role, location, skills, and salary
- Provide fresher-specific job recommendations
- Answer questions about job listings
- Suggest internships when full-time roles aren't available
- Provide skill gap recommendations

## Available Jobs in Database:
${JSON.stringify(jobsContext, null, 2)}

## Response Guidelines:
1. When users search for jobs, analyze their query and match it with available positions
2. Always prioritize fresher-friendly roles (0-2 years experience)
3. Format job recommendations as structured cards with key details
4. If no exact matches, suggest similar roles or related opportunities
5. Be encouraging and helpful to fresh graduates
6. If asked about salary, provide ranges when available or note "salary not disclosed"
7. Always include the job ID in your response so users can apply

## Response Format for Job Listings:
When showing jobs, format each as:
**[Job Title]** at **[Company]**
📍 [Location] | 💼 [Type] | 💰 [Salary]
🛠️ Skills: [skill1, skill2, ...]
🆔 Job ID: [id]

## Important:
- Only recommend jobs from the available database
- Be conversational and friendly
- Ask clarifying questions if the user's request is vague (e.g., location, preferred role)
- Highlight "fresher-friendly" or "no experience required" aspects
- If no jobs match, explain what types of jobs ARE available`;

    const allMessages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []),
      ...messages,
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: allMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limits reached. Please try again later." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("job-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "today";
  if (diffInDays === 1) return "1 day ago";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 14) return "1 week ago";
  return `${Math.floor(diffInDays / 7)} weeks ago`;
}
