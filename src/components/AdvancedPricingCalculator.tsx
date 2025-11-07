import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, TrendingUp, Heart, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface AnalysisResult {
  objectiveValue: number;
  subjectiveValue: number;
  sentimentalScore: number;
  marketComparison: string;
  emotionalAnalysis: string;
  expectationsGap: string;
  recommendations: string;
}

const AdvancedPricingCalculator = ({ userId }: { userId: string }) => {
  const [loading, setLoading] = useState(false);
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
    clientFeedback: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call the edge function for AI analysis
      const { data: functionData, error: functionError } = await supabase.functions.invoke('art-valuation', {
        body: {
          artworkTitle: formData.artworkTitle,
          artworkDescription: formData.artworkDescription,
          materialsUsed: formData.materialsUsed,
          timeSpent: parseFloat(formData.timeSpent),
          expectedOutcome: formData.expectedOutcome,
          actualFeelings: formData.actualFeelings,
          previousArtworkData: formData.previousArtworkData,
          clientFeedback: formData.clientFeedback
        }
      });

      if (functionError) {
        throw functionError;
      }

      const analysisResult = functionData.analysis;
      setAnalysis(analysisResult);

      // Save to database
      const { error: dbError } = await supabase.from("art_valuations").insert({
        user_id: userId,
        artwork_title: formData.artworkTitle,
        artwork_description: formData.artworkDescription,
        materials_used: formData.materialsUsed,
        time_spent: parseFloat(formData.timeSpent),
        expected_outcome: formData.expectedOutcome,
        actual_feelings: formData.actualFeelings,
        previous_artwork_data: formData.previousArtworkData,
        client_feedback: formData.clientFeedback,
        objective_value: analysisResult.objectiveValue,
        subjective_value: analysisResult.subjectiveValue,
        sentimental_score: analysisResult.sentimentalScore,
        market_comparison: analysisResult.marketComparison,
        emotional_analysis: analysisResult.emotionalAnalysis,
        expectations_gap: analysisResult.expectationsGap,
        recommendations: analysisResult.recommendations,
        full_analysis: analysisResult
      });

      if (dbError) {
        console.error("Database error:", dbError);
        toast({ title: "Analysis complete but failed to save", variant: "destructive" });
      } else {
        toast({ title: "Art valuation complete!", description: "Analysis saved successfully" });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({ 
        title: "Analysis failed", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = analysis ? [
    { name: "Objective Value", value: Math.min(analysis.objectiveValue / 1000, 100) },
    { name: "Subjective Value", value: analysis.subjectiveValue },
    { name: "Sentimental Score", value: analysis.sentimentalScore }
  ] : [];

  const radarData = analysis ? [
    { aspect: "Market Value", score: Math.min(analysis.objectiveValue / 1000, 100) },
    { aspect: "Artistic Merit", score: analysis.subjectiveValue },
    { aspect: "Emotional Impact", score: analysis.sentimentalScore },
    { aspect: "Technical Skill", score: analysis.subjectiveValue * 0.9 },
    { aspect: "Uniqueness", score: analysis.subjectiveValue * 1.1 }
  ] : [];

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Advanced Art Valuation</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Get AI-powered insights on your artwork's objective value, subjective worth, and sentimental significance
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="timeSpent">Time Spent (hours) *</Label>
              <Input
                id="timeSpent"
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
            <Label htmlFor="description">Artwork Description *</Label>
            <Textarea
              id="description"
              value={formData.artworkDescription}
              onChange={(e) => setFormData({ ...formData, artworkDescription: e.target.value })}
              required
              placeholder="Describe your artwork, its concept, and what you aimed to express..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="materials">Materials Used *</Label>
            <Textarea
              id="materials"
              value={formData.materialsUsed}
              onChange={(e) => setFormData({ ...formData, materialsUsed: e.target.value })}
              required
              placeholder="e.g., Oil paints, canvas, brushes, varnish..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expected">Expected Outcome</Label>
              <Textarea
                id="expected"
                value={formData.expectedOutcome}
                onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
                placeholder="What did you hope to achieve with this piece?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual">Actual Feelings</Label>
              <Textarea
                id="actual"
                value={formData.actualFeelings}
                onChange={(e) => setFormData({ ...formData, actualFeelings: e.target.value })}
                placeholder="How do you feel about the final result?"
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="previous">Previous Artwork Data</Label>
            <Textarea
              id="previous"
              value={formData.previousArtworkData}
              onChange={(e) => setFormData({ ...formData, previousArtworkData: e.target.value })}
              placeholder="Share details about similar previous works (titles, prices, reception)..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Client/Viewer Feedback</Label>
            <Textarea
              id="feedback"
              value={formData.clientFeedback}
              onChange={(e) => setFormData({ ...formData, clientFeedback: e.target.value })}
              placeholder="What feedback have you received about this or similar works?"
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Artwork Value"}
          </Button>
        </form>
      </Card>

      {analysis && (
        <>
          <Card className="p-6 shadow-card">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Valuation Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gradient-primary rounded-lg text-white">
                <p className="text-sm opacity-90">Objective Market Value</p>
                <p className="text-3xl font-bold">₹{analysis.objectiveValue.toFixed(0)}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-secondary to-secondary/80 rounded-lg text-secondary-foreground">
                <p className="text-sm opacity-90">Subjective Value Score</p>
                <p className="text-3xl font-bold">{analysis.subjectiveValue.toFixed(0)}/100</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-accent to-accent/80 rounded-lg text-accent-foreground">
                <p className="text-sm opacity-90">Sentimental Score</p>
                <p className="text-3xl font-bold">{analysis.sentimentalScore.toFixed(0)}/100</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 shadow-card">
            <h3 className="text-xl font-bold mb-4">Multi-Dimensional Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="aspect" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Artwork Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 shadow-card">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Market Comparison
              </h3>
              <p className="text-muted-foreground">{analysis.marketComparison}</p>
            </Card>

            <Card className="p-6 shadow-card">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Emotional Analysis
              </h3>
              <p className="text-muted-foreground">{analysis.emotionalAnalysis}</p>
            </Card>
          </div>

          <Card className="p-6 shadow-card">
            <h3 className="text-lg font-bold mb-3">Expectations vs Reality</h3>
            <p className="text-muted-foreground mb-4">{analysis.expectationsGap}</p>
            
            <h3 className="text-lg font-bold mb-3 mt-6">Recommendations</h3>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-foreground whitespace-pre-wrap">{analysis.recommendations}</p>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdvancedPricingCalculator;
