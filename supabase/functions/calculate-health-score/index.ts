import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid user");
    }

    const userId = user.id;

    // Calculate productivity score based on recent artwork valuations
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: recentArtwork, error: artworkError } = await supabase
      .from("art_valuations")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", thirtyDaysAgo.toISOString());

    if (artworkError) throw artworkError;

    const productivityScore = Math.min(100, (recentArtwork?.length || 0) * 20);

    // Calculate financial health based on expenses and pricing calculations
    const { data: expenses, error: expensesError } = await supabase
      .from("expenses")
      .select("amount")
      .eq("user_id", userId)
      .gte("date", thirtyDaysAgo.toISOString().split('T')[0]);

    if (expensesError) throw expensesError;

    const { data: pricingCalcs, error: pricingError } = await supabase
      .from("pricing_calculations")
      .select("recommended_price")
      .eq("user_id", userId)
      .gte("created_at", thirtyDaysAgo.toISOString());

    if (pricingError) throw pricingError;

    const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
    const avgPrice = pricingCalcs?.length 
      ? pricingCalcs.reduce((sum, p) => sum + Number(p.recommended_price), 0) / pricingCalcs.length 
      : 0;
    
    const financialHealthScore = Math.min(100, Math.max(0, 
      avgPrice > 0 ? ((avgPrice - totalExpenses) / avgPrice) * 100 : 50
    ));

    // Calculate learning engagement (placeholder - could be enhanced with actual learning interactions)
    const learningEngagementScore = 50; // Default score

    // Calculate community participation based on forum activity
    const { data: forumPosts, error: postsError } = await supabase
      .from("forum_posts")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", thirtyDaysAgo.toISOString());

    if (postsError) throw postsError;

    const { data: forumComments, error: commentsError } = await supabase
      .from("forum_comments")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", thirtyDaysAgo.toISOString());

    if (commentsError) throw commentsError;

    const communityParticipationScore = Math.min(100, 
      ((forumPosts?.length || 0) * 15) + ((forumComments?.length || 0) * 5)
    );

    // Calculate overall score as weighted average
    const overallScore = Math.round(
      (productivityScore * 0.3) +
      (financialHealthScore * 0.3) +
      (learningEngagementScore * 0.2) +
      (communityParticipationScore * 0.2)
    );

    // Save or update the health score
    const { data: existingScore } = await supabase
      .from("creative_health_scores")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingScore) {
      await supabase
        .from("creative_health_scores")
        .update({
          overall_score: overallScore,
          productivity_score: productivityScore,
          financial_health_score: financialHealthScore,
          learning_engagement_score: learningEngagementScore,
          community_participation_score: communityParticipationScore,
          last_calculated_at: new Date().toISOString(),
        })
        .eq("id", existingScore.id);
    } else {
      await supabase
        .from("creative_health_scores")
        .insert({
          user_id: userId,
          overall_score: overallScore,
          productivity_score: productivityScore,
          financial_health_score: financialHealthScore,
          learning_engagement_score: learningEngagementScore,
          community_participation_score: communityParticipationScore,
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        scores: {
          overall_score: overallScore,
          productivity_score: productivityScore,
          financial_health_score: financialHealthScore,
          learning_engagement_score: learningEngagementScore,
          community_participation_score: communityParticipationScore,
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in calculate-health-score function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
