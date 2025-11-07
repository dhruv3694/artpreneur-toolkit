import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, TrendingUp, Heart, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AnalysisResult {
  objective_value: number;
  subjective_value: number;
  sentimental_score: number;
  market_comparison: string;
  emotional_analysis: string;
  expectations_gap: string;
  recommendations: string;
}

const AdvancedPricingCalculator = ({ userId }: { userId: string }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    artworkTitle: "",
    artworkDescription: "",
    materialsUsed: "",
    timeSpent: "",
    expectedOutcome: "",
    actualFeelings: "",
    previousArtworkData: "",
    clientFeedback: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('art-valuation', {
        body: {
          artworkTitle: formData.artworkTitle,
          artworkDescription: formData.artworkDescription,
          materialsUsed: formData.materialsUsed,
          timeSpent: parseFloat(formData.timeSpent),
          expectedOutcome: formData.expectedOutcome,
          actualFeelings: formData.actualFeelings,
          previousArtworkData: formData.previousArtworkData,
          clientFeedback: formData.clientFeedback,
        }
      });

      if (error) throw error;

      if (data?.analysis) {
        setAnalysis(data.analysis);

        // Save to database
        await supabase.from("art_valuations").insert({
          user_id: userId,
          artwork_title: formData.artworkTitle,
          artwork_description: formData.artworkDescription,
          materials_used: formData.materialsUsed,
          time_spent: parseFloat(formData.timeSpent),
          expected_outcome: formData.expectedOutcome,
          actual_feelings: formData.actualFeelings,
          previous_artwork_data: formData.previousArtworkData,
          client_feedback: formData.clientFeedback,
          objective_value: data.analysis.objective_value,
          subjective_value: data.analysis.subjective_value,
          sentimental_score: data.analysis.sentimental_score,
          market_comparison: data.analysis.market_comparison,
          emotional_analysis: data.analysis.emotional_analysis,
          expectations_gap: data.analysis.expectations_gap,
          recommendations: data.analysis.recommendations,
          full_analysis: data.analysis,
        });

        toast({ title: "Analysis completed successfully!" });
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Advanced Art Valuation</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          AI-powered analysis combining objective pricing, subjective value, and sentimental worth
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Artwork Title *</Label>
            <Input
              id="title"
              value={formData.artworkTitle}
              onChange={(e) => setFormData({ ...formData, artworkTitle: e.target.value })}
              required
              placeholder="e.g., Sunset Dreams"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Artwork Description *</Label>
            <Textarea
              id="description"
              value={formData.artworkDescription}
              onChange={(e) => setFormData({ ...formData, artworkDescription: e.target.value })}
              required
              placeholder="Describe your artwork, the inspiration, and what it represents..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="materials">Materials Used *</Label>
              <Input
                id="materials"
                value={formData.materialsUsed}
                onChange={(e) => setFormData({ ...formData, materialsUsed: e.target.value })}
                required
                placeholder="e.g., Acrylic on canvas, digital"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time Spent (hours) *</Label>
              <Input
                id="time"
                type="number"
                step="0.1"
                value={formData.timeSpent}
                onChange={(e) => setFormData({ ...formData, timeSpent: e.target.value })}
                required
                placeholder="e.g., 40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expected">Expected Outcome</Label>
            <Textarea
              id="expected"
              value={formData.expectedOutcome}
              onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
              placeholder="What did you expect from this artwork?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feelings">Actual Feelings</Label>
            <Textarea
              id="feelings"
              value={formData.actualFeelings}
              onChange={(e) => setFormData({ ...formData, actualFeelings: e.target.value })}
              placeholder="How do you feel about the finished work?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="previous">Previous Artwork Data</Label>
            <Textarea
              id="previous"
              value={formData.previousArtworkData}
              onChange={(e) => setFormData({ ...formData, previousArtworkData: e.target.value })}
              placeholder="Describe similar previous work, prices, feedback..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Client/Viewer Feedback</Label>
            <Textarea
              id="feedback"
              value={formData.clientFeedback}
              onChange={(e) => setFormData({ ...formData, clientFeedback: e.target.value })}
              placeholder="What feedback have you received?"
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Artwork
              </>
            )}
          </Button>
        </form>
      </Card>

      {analysis && (
        <div className="space-y-4">
          <Card className="p-6 shadow-card bg-gradient-to-br from-primary/10 to-accent/10">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Value Scores
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Objective Value</span>
                  <span className="text-sm font-bold text-primary">{analysis.objective_value}/100</span>
                </div>
                <Progress value={analysis.objective_value} className="h-3" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Subjective Value</span>
                  <span className="text-sm font-bold text-primary">{analysis.subjective_value}/100</span>
                </div>
                <Progress value={analysis.subjective_value} className="h-3" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    Sentimental Score
                  </span>
                  <span className="text-sm font-bold text-primary">{analysis.sentimental_score}/100</span>
                </div>
                <Progress value={analysis.sentimental_score} className="h-3" />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-card">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Market Comparison
            </h3>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {analysis.market_comparison}
            </p>
          </Card>

          <Card className="p-6 shadow-card">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Emotional Analysis
            </h3>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {analysis.emotional_analysis}
            </p>
          </Card>

          <Card className="p-6 shadow-card">
            <h3 className="text-lg font-bold mb-3">Expectations Gap</h3>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {analysis.expectations_gap}
            </p>
          </Card>

          <Card className="p-6 shadow-card bg-gradient-primary text-white">
            <h3 className="text-lg font-bold mb-3">Recommendations</h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {analysis.recommendations}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdvancedPricingCalculator;
