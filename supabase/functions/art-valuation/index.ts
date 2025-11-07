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

    // Construct detailed prompt for art valuation
    const systemPrompt = `You are an expert art and design financial advisor and critic. You evaluate artworks, designs, or creative projects by combining business logic with emotional and artistic understanding.

Your goal is to produce balanced insights — practical yet empathetic — that reflect both the creator's intent and the audience's perception.

Analyze the artwork on multiple dimensions:
1. Objective Value (market-based pricing considering materials, time, skill level)
2. Subjective Value (artistic merit, emotional impact, uniqueness)
3. Sentimental Score (personal attachment, growth, emotional investment)
4. Market Comparison (how it compares to similar works)
5. Expectations Gap (difference between expected vs actual feelings)
6. Recommendations (actionable advice for pricing and improvement)`;

    const userPrompt = `Please analyze this artwork:

Title: ${artworkTitle}
Description: ${artworkDescription}
Materials Used: ${materialsUsed}
Time Spent: ${timeSpent} hours
Expected Outcome: ${expectedOutcome || 'Not specified'}
Actual Feelings: ${actualFeelings || 'Not specified'}
Previous Work Context: ${previousArtworkData || 'No previous work data'}
Client/Viewer Feedback: ${clientFeedback || 'No feedback yet'}

Provide a comprehensive analysis with scores and insights.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_artwork_value",
              description: "Analyze artwork and return structured valuation data",
              parameters: {
                type: "object",
                properties: {
                  objectiveValue: {
                    type: "number",
                    description: "Objective market value in rupees based on materials, time, and skill"
                  },
                  subjectiveValue: {
                    type: "number",
                    description: "Subjective artistic value score (0-100)"
                  },
                  sentimentalScore: {
                    type: "number",
                    description: "Sentimental attachment score (0-100)"
                  },
                  marketComparison: {
                    type: "string",
                    description: "How this artwork compares to similar pieces in the market"
                  },
                  emotionalAnalysis: {
                    type: "string",
                    description: "Analysis of the emotional journey and artistic growth"
                  },
                  expectationsGap: {
                    type: "string",
                    description: "Analysis of the gap between expected vs actual feelings"
                  },
                  recommendations: {
                    type: "string",
                    description: "Actionable recommendations for pricing and improvement"
                  }
                },
                required: [
                  "objectiveValue",
                  "subjectiveValue",
                  "sentimentalScore",
                  "marketComparison",
                  "emotionalAnalysis",
                  "expectationsGap",
                  "recommendations"
                ],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_artwork_value" } }
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
    console.log("AI Response:", JSON.stringify(data, null, 2));

    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call returned from AI");
    }

    const analysisResult = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis: analysisResult
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
