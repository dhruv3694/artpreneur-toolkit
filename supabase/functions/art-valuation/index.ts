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
    const { 
      artworkTitle,
      artworkDescription, 
      materialsUsed, 
      timeSpent,
      expectedOutcome,
      actualFeelings,
      previousArtworkData,
      clientFeedback 
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert art and design financial advisor and critic. You evaluate artworks, designs, or creative projects by combining business logic with emotional and artistic understanding.
Your goal is to produce balanced insights — practical yet empathetic — that reflect both the creator's intent and the audience's perception.

Analyze the artwork and provide structured output with:
1. Objective Value (0-100): Market-based assessment considering materials, time, and skill
2. Subjective Value (0-100): Artistic merit, emotional impact, and creative innovation
3. Sentimental Score (0-100): Personal attachment, growth significance, and emotional investment
4. Market Comparison: How this compares to similar works in the market
5. Emotional Analysis: Deep dive into the creator's emotional journey
6. Expectations Gap: Analysis of expected vs actual outcome
7. Recommendations: Actionable advice for pricing and improvement`;

    const userPrompt = `Artwork Title: ${artworkTitle}

Description: ${artworkDescription}

Materials Used: ${materialsUsed}

Time Spent: ${timeSpent} hours

Expected Outcome: ${expectedOutcome || "Not specified"}

Actual Feelings: ${actualFeelings || "Not specified"}

Previous Artwork Context: ${previousArtworkData || "No previous work data provided"}

Client/Viewer Feedback: ${clientFeedback || "No feedback provided"}

Please provide a comprehensive analysis.`;

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
            name: "analyze_artwork",
            description: "Analyze artwork and provide structured valuation",
            parameters: {
              type: "object",
              properties: {
                objective_value: {
                  type: "number",
                  description: "Market-based value score 0-100"
                },
                subjective_value: {
                  type: "number",
                  description: "Artistic merit score 0-100"
                },
                sentimental_score: {
                  type: "number",
                  description: "Emotional attachment score 0-100"
                },
                market_comparison: {
                  type: "string",
                  description: "Comparison with similar works in market"
                },
                emotional_analysis: {
                  type: "string",
                  description: "Deep analysis of creator's emotional journey"
                },
                expectations_gap: {
                  type: "string",
                  description: "Analysis of expected vs actual outcome"
                },
                recommendations: {
                  type: "string",
                  description: "Actionable advice for pricing and improvement"
                }
              },
              required: [
                "objective_value",
                "subjective_value", 
                "sentimental_score",
                "market_comparison",
                "emotional_analysis",
                "expectations_gap",
                "recommendations"
              ],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "analyze_artwork" } }
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
    
    // Extract tool call response
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in art-valuation function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
