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
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-card hover-lift overflow-hidden rounded-3xl">
        <div className="p-8 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-primary/20 backdrop-blur-sm">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-heading font-bold">Funding & Grant Recommender</h2>
              <p className="text-sm text-muted-foreground mt-1">Discover opportunities tailored to your creative journey</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            AI-powered recommendations for grants, fellowships, and funding opportunities based on your artistic profile and work
          </p>

          <Button onClick={generateRecommendations} disabled={isGenerating} className="w-full rounded-xl shadow-glow hover:scale-105 transition-transform">
            <TrendingUp className="mr-2 h-5 w-5" />
            {isGenerating ? "Generating Recommendations..." : "Find Funding Opportunities"}
          </Button>
        </div>
      </Card>

      {recommendations.length > 0 && (
        <div className="space-y-5">
          {recommendations
            .sort((a, b) => b.match_score - a.match_score)
            .map((rec, index) => (
              <Card key={index} className="artistic-card hover-lift overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-primary opacity-70"></div>
                <div className="p-8 pl-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-heading font-bold group-hover:text-primary transition-colors">{rec.grant_name}</h3>
                        <Badge className={`${getMatchColor(rec.match_score)} text-white rounded-full px-3 py-1`}>
                          {rec.match_score}% Match
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">{rec.organization}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-primary font-semibold">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <span className="text-lg">{rec.amount_range}</span>
                    </div>

                    {rec.deadline && (
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">Deadline: {rec.deadline}</span>
                      </div>
                    )}

                    <div className="bg-gradient-to-br from-muted/30 to-muted/50 rounded-xl p-5 backdrop-blur-sm">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-heading font-semibold mb-2 uppercase tracking-wide">Eligibility</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{rec.eligibility}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-muted-foreground">{rec.description}</p>

                    {rec.application_url && rec.application_url !== "N/A" && (
                      <Button variant="outline" size="sm" asChild className="w-full rounded-xl hover:bg-gradient-primary hover:text-white hover:border-transparent transition-all group">
                        <a href={rec.application_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                          View Application
                          <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};

export default FundingRecommender;
