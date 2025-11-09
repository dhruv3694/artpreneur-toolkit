import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, TrendingUp, Heart, Target, Upload, X, Image as ImageIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    try {
      let imageBase64 = null;
      if (imageFile) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(imageFile);
        });
      }

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
          artworkImage: imageBase64,
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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-6 py-3 glass rounded-full shadow-glass">
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          <h2 className="font-heading text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AI-Powered Art Valuation
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Upload your artwork and get comprehensive analysis with visual insights, emotional value, and market intelligence
        </p>
      </div>

      <Card className="glass shadow-glass border-white/20 hover-lift">
        <div className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label htmlFor="artwork-upload" className="flex items-center gap-2 text-base font-semibold">
              <ImageIcon className="h-5 w-5 text-primary" />
              Upload Your Artwork
              {imageFile && <Badge className="ml-2 bg-gradient-primary text-white">✨ Vision AI Enabled</Badge>}
            </Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative group glass border-2 border-dashed border-primary/40 rounded-2xl p-12 text-center cursor-pointer hover:border-primary hover:shadow-glow transition-all duration-500"
            >
              {imagePreview ? (
                <div className="relative inline-block">
                  <div className="relative overflow-hidden rounded-2xl shadow-card-hover ring-4 ring-primary/20">
                    <img
                      src={imagePreview}
                      alt="Artwork preview"
                      className="max-h-80 object-contain"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-3 -right-3 rounded-full shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    <span>AI will analyze composition, colors, and visual style</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-float">
                  <div className="inline-flex p-6 rounded-full bg-gradient-primary/10">
                    <Upload className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">Drop your artwork here or click to browse</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      PNG, JPG up to 10MB • AI will analyze composition, colors, and style
                    </p>
                    <Badge variant="secondary" className="mt-3">
                      Visual AI Analysis Available
                    </Badge>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              id="artwork-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="title" className="text-base font-semibold">Artwork Title *</Label>
            <Input
              id="title"
              value={formData.artworkTitle}
              onChange={(e) => setFormData({ ...formData, artworkTitle: e.target.value })}
              required
              placeholder="e.g., Sunset Dreams"
              className="h-12 glass border-primary/30 rounded-xl"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-base font-semibold">Artwork Description *</Label>
            <Textarea
              id="description"
              value={formData.artworkDescription}
              onChange={(e) => setFormData({ ...formData, artworkDescription: e.target.value })}
              required
              placeholder="Describe your artwork, the inspiration, and what it represents..."
              rows={4}
              className="glass border-primary/30 rounded-xl resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="materials" className="text-base font-semibold">Materials Used *</Label>
              <Input
                id="materials"
                value={formData.materialsUsed}
                onChange={(e) => setFormData({ ...formData, materialsUsed: e.target.value })}
                required
                placeholder="e.g., Acrylic on canvas, digital"
                className="h-12 glass border-primary/30 rounded-xl"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="time" className="text-base font-semibold">Time Spent (hours) *</Label>
              <Input
                id="time"
                type="number"
                step="0.1"
                value={formData.timeSpent}
                onChange={(e) => setFormData({ ...formData, timeSpent: e.target.value })}
                required
                placeholder="e.g., 40"
                className="h-12 glass border-primary/30 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="expected" className="text-base font-semibold">Expected Outcome</Label>
              <Textarea
                id="expected"
                value={formData.expectedOutcome}
                onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
                placeholder="What did you expect from this artwork?"
                rows={3}
                className="glass border-primary/30 rounded-xl resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="feelings" className="text-base font-semibold">Actual Feelings</Label>
              <Textarea
                id="feelings"
                value={formData.actualFeelings}
                onChange={(e) => setFormData({ ...formData, actualFeelings: e.target.value })}
                placeholder="How do you feel about the finished work?"
                rows={3}
                className="glass border-primary/30 rounded-xl resize-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="previous" className="text-base font-semibold">Previous Artwork Data</Label>
            <Textarea
              id="previous"
              value={formData.previousArtworkData}
              onChange={(e) => setFormData({ ...formData, previousArtworkData: e.target.value })}
              placeholder="Describe similar previous work, prices, feedback..."
              rows={3}
              className="glass border-primary/30 rounded-xl resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="feedback" className="text-base font-semibold">Client/Viewer Feedback</Label>
            <Textarea
              id="feedback"
              value={formData.clientFeedback}
              onChange={(e) => setFormData({ ...formData, clientFeedback: e.target.value })}
              placeholder="What feedback have you received?"
              rows={3}
              className="glass border-primary/30 rounded-xl resize-none"
            />
          </div>

          <Button type="submit" className="w-full h-14 text-base font-semibold rounded-xl" size="lg" disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                Analyzing with AI Magic...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Get AI-Powered Valuation
              </>
            )}
          </Button>
        </form>
        </div>
      </Card>

      {analysis && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-heading font-bold flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Target className="h-6 w-6 text-white" />
              </div>
              Valuation Results
            </h3>
            <Badge className="bg-gradient-secondary text-white px-4 py-2 text-sm shadow-card">
              ✨ AI Analysis Complete
            </Badge>
          </div>

          <Card className="glass shadow-glass border-primary/30 p-8 hover-lift">
            <h4 className="text-xl font-heading font-semibold mb-6 text-center">Value Scores</h4>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-base font-semibold">Objective Value</span>
                  <span className="text-lg font-bold text-primary">{analysis.objective_value}/100</span>
                </div>
                <div className="bg-muted/30 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-primary rounded-full h-4 transition-all duration-1000 shadow-glow" 
                    style={{ width: `${analysis.objective_value}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-base font-semibold">Subjective Value</span>
                  <span className="text-lg font-bold text-secondary">{analysis.subjective_value}/100</span>
                </div>
                <div className="bg-muted/30 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-secondary rounded-full h-4 transition-all duration-1000 shadow-glow" 
                    style={{ width: `${analysis.subjective_value}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-base font-semibold flex items-center gap-2">
                    <Heart className="h-5 w-5 text-destructive" />
                    Sentimental Score
                  </span>
                  <span className="text-lg font-bold text-destructive">{analysis.sentimental_score}/100</span>
                </div>
                <div className="bg-muted/30 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-destructive to-destructive/70 rounded-full h-4 transition-all duration-1000 shadow-glow" 
                    style={{ width: `${analysis.sentimental_score}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="glass shadow-glass border-success/30 p-8 hover-lift">
            <h4 className="text-xl font-heading font-semibold mb-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              Market Comparison
            </h4>
            <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {analysis.market_comparison}
            </p>
          </Card>

          <Card className="glass shadow-glass border-destructive/30 p-8 hover-lift">
            <h4 className="text-xl font-heading font-semibold mb-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Heart className="h-5 w-5 text-destructive" />
              </div>
              Emotional Analysis
            </h4>
            <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {analysis.emotional_analysis}
            </p>
          </Card>

          <Card className="glass shadow-glass border-warning/30 p-8 hover-lift">
            <h4 className="text-xl font-heading font-semibold mb-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Target className="h-5 w-5 text-warning" />
              </div>
              Expectations Gap
            </h4>
            <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {analysis.expectations_gap}
            </p>
          </Card>

          <Card className="bg-gradient-primary shadow-card-hover p-8 hover-lift">
            <h4 className="text-xl font-heading font-semibold mb-4 text-white flex items-center gap-3">
              <Sparkles className="h-5 w-5" />
              Recommendations
            </h4>
            <p className="text-base leading-relaxed text-white/95 whitespace-pre-wrap">
              {analysis.recommendations}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdvancedPricingCalculator;
