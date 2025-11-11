import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Activity, TrendingUp, DollarSign, BookOpen, Users, RefreshCw } from "lucide-react";

interface HealthScores {
  overall_score: number;
  productivity_score: number;
  financial_health_score: number;
  learning_engagement_score: number;
  community_participation_score: number;
  last_calculated_at?: string;
}

const CreativeHealthScore = ({ userId }: { userId: string }) => {
  const [scores, setScores] = useState<HealthScores | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const fetchScores = async () => {
    const { data, error } = await supabase
      .from("creative_health_scores")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching scores:", error);
      return;
    }

    if (data) {
      setScores(data);
    }
  };

  const calculateScores = async () => {
    setIsCalculating(true);
    try {
      const { data, error } = await supabase.functions.invoke("calculate-health-score");

      if (error) throw error;

      if (data?.scores) {
        setScores(data.scores);
        toast({ title: "Creative Health Score updated!" });
      }
    } catch (error: any) {
      console.error("Error calculating scores:", error);
      toast({
        title: "Failed to calculate scores",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, [userId]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return "Excellent";
    if (score >= 40) return "Good";
    return "Needs Attention";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="shadow-card hover-lift overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 backdrop-blur-sm">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-primary/20 backdrop-blur-sm animate-float">
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-heading font-bold">Creative Health Score</h2>
                <p className="text-sm text-muted-foreground mt-1">Track your creative wellness journey</p>
              </div>
            </div>
            <Button onClick={calculateScores} disabled={isCalculating} variant="outline" className="rounded-xl hover:scale-105 transition-transform">
              <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? "animate-spin" : ""}`} />
              {isCalculating ? "Calculating..." : "Refresh"}
            </Button>
          </div>

          {scores ? (
            <div className="space-y-8">
              <div className="text-center p-10 bg-gradient-to-br from-background/80 to-background/60 rounded-2xl shadow-soft backdrop-blur-sm">
                <div className={`text-7xl font-bold mb-4 ${getScoreColor(scores.overall_score)} animate-pulse`}>
                  {scores.overall_score}
                </div>
                <div className="text-2xl font-heading font-semibold mb-2">
                  {getScoreLabel(scores.overall_score)}
                </div>
                {scores.last_calculated_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated: {new Date(scores.last_calculated_at).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 p-6 rounded-2xl bg-background/50 backdrop-blur-sm hover:shadow-soft transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-primary/10">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-base font-heading font-medium">Productivity</span>
                    <span className={`ml-auto text-xl font-bold ${getScoreColor(scores.productivity_score)}`}>
                      {scores.productivity_score}
                    </span>
                  </div>
                  <Progress value={scores.productivity_score} className="h-3 rounded-full" />
                </div>

                <div className="space-y-3 p-6 rounded-2xl bg-background/50 backdrop-blur-sm hover:shadow-soft transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-primary/10">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-base font-heading font-medium">Financial Health</span>
                    <span className={`ml-auto text-xl font-bold ${getScoreColor(scores.financial_health_score)}`}>
                      {scores.financial_health_score}
                    </span>
                  </div>
                  <Progress value={scores.financial_health_score} className="h-3 rounded-full" />
                </div>

                <div className="space-y-3 p-6 rounded-2xl bg-background/50 backdrop-blur-sm hover:shadow-soft transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-base font-heading font-medium">Learning Engagement</span>
                    <span className={`ml-auto text-xl font-bold ${getScoreColor(scores.learning_engagement_score)}`}>
                      {scores.learning_engagement_score}
                    </span>
                  </div>
                  <Progress value={scores.learning_engagement_score} className="h-3 rounded-full" />
                </div>

                <div className="space-y-3 p-6 rounded-2xl bg-background/50 backdrop-blur-sm hover:shadow-soft transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-base font-heading font-medium">Community Participation</span>
                    <span className={`ml-auto text-xl font-bold ${getScoreColor(scores.community_participation_score)}`}>
                      {scores.community_participation_score}
                    </span>
                  </div>
                  <Progress value={scores.community_participation_score} className="h-3 rounded-full" />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="p-4 rounded-2xl bg-gradient-primary/10 backdrop-blur-sm w-fit mx-auto mb-6 animate-float">
                <Activity className="h-20 w-20 text-primary opacity-70" />
              </div>
              <p className="text-lg font-heading text-muted-foreground mb-6 max-w-md mx-auto">
                Calculate your Creative Health Score to track your creative wellness and growth
              </p>
              <Button onClick={calculateScores} disabled={isCalculating} className="rounded-xl shadow-glow hover:scale-105 transition-transform">
                <Activity className="h-4 w-4 mr-2" />
                Calculate Score
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CreativeHealthScore;
