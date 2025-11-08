import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, ExternalLink, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Recommendation {
  grant_name: string;
  organization: string;
  amount_range: string;
  deadline?: string;
  eligibility: string;
  description: string;
  application_url?: string;
  match_score: number;
}

const FundingRecommender = ({ userId, userProfile }: { userId: string; userProfile?: any }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateRecommendations = async () => {
    setIsGenerating(true);

    try {
      // Fetch user's artwork history
      const { data: artworkHistory } = await supabase
        .from("art_valuations")
        .select("artwork_title, materials_used, objective_value, subjective_value")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      const { data, error } = await supabase.functions.invoke("funding-recommender", {
        body: {
          userProfile,
          artworkHistory: artworkHistory || [],
        },
      });

      if (error) throw error;

      if (data?.recommendations) {
        setRecommendations(data.recommendations);

        // Save recommendations to database
        for (const rec of data.recommendations) {
          await supabase.from("funding_recommendations").insert({
            user_id: userId,
            grant_name: rec.grant_name,
            organization: rec.organization,
            amount_range: rec.amount_range,
            deadline: rec.deadline,
            eligibility: rec.eligibility,
            description: rec.description,
            application_url: rec.application_url,
            match_score: rec.match_score,
          });
        }

        toast({ title: "Funding recommendations generated!" });
      }
    } catch (error: any) {
      console.error("Error generating recommendations:", error);
      toast({
        title: "Failed to generate recommendations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Funding & Grant Recommender</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          AI-powered recommendations for grants, fellowships, and funding opportunities tailored to your profile
        </p>

        <Button onClick={generateRecommendations} disabled={isGenerating} className="w-full">
          <TrendingUp className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating Recommendations..." : "Find Funding Opportunities"}
        </Button>
      </Card>

      {recommendations.length > 0 && (
        <div className="space-y-4">
          {recommendations
            .sort((a, b) => b.match_score - a.match_score)
            .map((rec, index) => (
              <Card key={index} className="p-6 shadow-card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold">{rec.grant_name}</h3>
                      <Badge className={`${getMatchColor(rec.match_score)} text-white`}>
                        {rec.match_score}% Match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.organization}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold">{rec.amount_range}</span>
                  </div>

                  {rec.deadline && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Deadline: {rec.deadline}</span>
                    </div>
                  )}

                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold mb-1">Eligibility</p>
                        <p className="text-xs text-muted-foreground">{rec.eligibility}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed">{rec.description}</p>

                  {rec.application_url && rec.application_url !== "N/A" && (
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <a href={rec.application_url} target="_blank" rel="noopener noreferrer">
                        View Application
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};

export default FundingRecommender;
