import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userProfile, artworkHistory } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a funding and grant specialist for artists and creatives. Analyze the artist's profile and artwork history to recommend relevant grants, fellowships, and funding opportunities.

Consider:
1. Their artistic medium and style
2. Career stage and experience level
3. Income type and financial situation
4. Geographic location (if provided)
5. Past artwork themes and market positioning

Provide realistic, actionable funding recommendations that match their profile.`;

    const userPrompt = `Artist Profile:
Role: ${userProfile?.role || "Artist"}
Income Type: ${userProfile?.income_type || "Not specified"}

Recent Artwork:
${artworkHistory && artworkHistory.length > 0 
  ? artworkHistory.map((art: any) => `- ${art.artwork_title}: ${art.materials_used}`).join('\n')
  : "No artwork history available"}

Based on this profile, recommend 3-5 relevant grants, fellowships, or funding opportunities. For each recommendation, provide detailed information about eligibility, amount, and how to apply.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "recommend_funding",
            description: "Generate funding and grant recommendations for an artist",
            parameters: {
              type: "object",
              properties: {
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      grant_name: { type: "string", description: "Name of the grant or funding opportunity" },
                      organization: { type: "string", description: "Organization offering the funding" },
                      amount_range: { type: "string", description: "Funding amount range (e.g., '$5,000-$25,000')" },
                      deadline: { type: "string", description: "Application deadline or 'Rolling basis'" },
                      eligibility: { type: "string", description: "Key eligibility requirements" },
                      description: { type: "string", description: "Detailed description of the opportunity" },
                      application_url: { type: "string", description: "URL to application (use placeholder if unknown)" },
                      match_score: { type: "number", description: "Match score 0-100 based on artist profile" }
                    },
                    required: ["grant_name", "organization", "amount_range", "eligibility", "description", "match_score"]
                  }
                }
              },
              required: ["recommendations"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "recommend_funding" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
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

    const data = await response.json();
    
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const recommendations = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ 
        success: true,
        recommendations: recommendations.recommendations
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in funding-recommender function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
