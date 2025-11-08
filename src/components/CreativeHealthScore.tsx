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
    <div className="space-y-6">
      <Card className="p-6 shadow-card bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">Creative Health Score</h2>
              <p className="text-sm text-muted-foreground">Track your creative wellness</p>
            </div>
          </div>
          <Button onClick={calculateScores} disabled={isCalculating} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? "animate-spin" : ""}`} />
            {isCalculating ? "Calculating..." : "Refresh"}
          </Button>
        </div>

        {scores ? (
          <div className="space-y-6">
            <div className="text-center p-6 bg-background/50 rounded-lg">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(scores.overall_score)}`}>
                {scores.overall_score}
              </div>
              <div className="text-lg font-semibold">
                {getScoreLabel(scores.overall_score)}
              </div>
              {scores.last_calculated_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last updated: {new Date(scores.last_calculated_at).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Productivity</span>
                  <span className={`ml-auto font-bold ${getScoreColor(scores.productivity_score)}`}>
                    {scores.productivity_score}
                  </span>
                </div>
                <Progress value={scores.productivity_score} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Financial Health</span>
                  <span className={`ml-auto font-bold ${getScoreColor(scores.financial_health_score)}`}>
                    {scores.financial_health_score}
                  </span>
                </div>
                <Progress value={scores.financial_health_score} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Learning Engagement</span>
                  <span className={`ml-auto font-bold ${getScoreColor(scores.learning_engagement_score)}`}>
                    {scores.learning_engagement_score}
                  </span>
                </div>
                <Progress value={scores.learning_engagement_score} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Community Participation</span>
                  <span className={`ml-auto font-bold ${getScoreColor(scores.community_participation_score)}`}>
                    {scores.community_participation_score}
                  </span>
                </div>
                <Progress value={scores.community_participation_score} className="h-2" />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Calculate your Creative Health Score to track your creative wellness
            </p>
            <Button onClick={calculateScores} disabled={isCalculating}>
              <Activity className="h-4 w-4 mr-2" />
              Calculate Score
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CreativeHealthScore;
