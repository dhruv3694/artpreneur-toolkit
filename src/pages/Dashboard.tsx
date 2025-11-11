import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Palette, Sparkles, TrendingUp, DollarSign, BookOpen, Users, Heart, BarChart3, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ExpenseTracker from "@/components/ExpenseTracker";
import PricingCalculator from "@/components/PricingCalculator";
import AdvancedPricingCalculator from "@/components/AdvancedPricingCalculator";
import LearningHub from "@/components/LearningHub";
import CommunityForum from "@/components/CommunityForum";
import AIAssistant from "@/components/AIAssistant";
import CreativeHealthScore from "@/components/CreativeHealthScore";
import AIMentor from "@/components/AIMentor";
import FundingRecommender from "@/components/FundingRecommender";
import MarketAnalytics from "@/components/MarketAnalytics";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      setProfile(profileData);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out successfully" });
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-primary animate-float"></div>
          <p className="text-muted-foreground">Loading your creative space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Artistic Header */}
      <header className="glass shadow-glass sticky top-0 z-50 border-b border-white/30">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="h-12 w-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow animate-float">
              <Palette className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold bg-gradient-primary bg-clip-text text-transparent">
                Artpreneur
              </h1>
              <p className="text-xs text-muted-foreground font-body">Creative Sustainability Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-sm text-muted-foreground hidden md:block">
              Welcome back, <span className="font-semibold text-foreground bg-gradient-primary bg-clip-text text-transparent">{profile?.name || "Artist"}</span>
            </p>
            <div className="relative group">
              <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold shadow-card cursor-pointer transition-all duration-500 hover:shadow-glow hover:scale-110">
                {(profile?.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-success rounded-full border-2 border-background"></div>
            </div>
            <Button onClick={handleLogout} variant="glass" size="sm" className="hover:scale-105 transition-transform">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-8">
        <div className="hero-section text-white mb-10 animate-fade-in">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Your Creative Journey
            </h2>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl">
              Track your artistic growth, manage finances, and discover opportunities — all in one beautiful space.
            </p>
          </div>
        </div>
        {/* Main Content */}
        <Tabs defaultValue="health" className="space-y-8 animate-slide-up">
          <TabsList className="glass shadow-glass border border-white/30 p-3 grid w-full grid-cols-3 lg:grid-cols-8 lg:w-auto lg:inline-grid gap-3 h-auto">
            <TabsTrigger value="health" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-xl transition-all duration-500 hover:scale-105 py-3 flex flex-col sm:flex-row items-center gap-2">
              <Heart className="h-5 w-5" />
              <span className="text-xs sm:text-sm">Health</span>
            </TabsTrigger>
            <TabsTrigger value="mentor" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-xl transition-all duration-500 hover:scale-105 py-3 flex flex-col sm:flex-row items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs sm:text-sm">Mentor</span>
            </TabsTrigger>
            <TabsTrigger value="funding" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-xl transition-all duration-500 hover:scale-105 py-3 flex flex-col sm:flex-row items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <span className="text-xs sm:text-sm">Funding</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-xl transition-all duration-500 hover:scale-105 py-3 flex flex-col sm:flex-row items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs sm:text-sm">Market</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-xl transition-all duration-500 hover:scale-105 py-3 flex flex-col sm:flex-row items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs sm:text-sm">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-xl transition-all duration-500 hover:scale-105 py-3 flex flex-col sm:flex-row items-center gap-2">
              <Calculator className="h-5 w-5" />
              <span className="text-xs sm:text-sm">Pricing</span>
            </TabsTrigger>
            <TabsTrigger value="learning" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-xl transition-all duration-500 hover:scale-105 py-3 flex flex-col sm:flex-row items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="text-xs sm:text-sm">Learning</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-xl transition-all duration-500 hover:scale-105 py-3 flex flex-col sm:flex-row items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="text-xs sm:text-sm">Community</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="animate-fade-in">
            <CreativeHealthScore userId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="mentor" className="animate-fade-in">
            <AIMentor userId={user?.id || ""} userProfile={profile} />
          </TabsContent>

          <TabsContent value="funding" className="animate-fade-in">
            <FundingRecommender userId={user?.id || ""} userProfile={profile} />
          </TabsContent>

          <TabsContent value="market" className="animate-fade-in">
            <MarketAnalytics />
          </TabsContent>

          <TabsContent value="expenses" className="animate-fade-in">
            <ExpenseTracker userId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="pricing" className="animate-fade-in">
            <PricingCalculator userId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="learning" className="animate-fade-in">
            <LearningHub />
          </TabsContent>

          <TabsContent value="community" className="animate-fade-in">
            <CommunityForum userId={user?.id || ""} userName={profile?.name || "User"} />
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Assistant */}
      <AIAssistant />

      {/* Artistic Footer */}
      <footer className="mt-24 glass shadow-glass border-t border-white/30">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-card animate-float">
                <Palette className="h-5 w-5 text-white" />
              </div>
              <div className="text-center">
                <span className="font-heading text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Artpreneur
                </span>
                <p className="text-xs text-muted-foreground">Bridging Creativity and Sustainability</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-2xl leading-relaxed">
              Empowering creative professionals with AI-powered tools for financial wellness, artistic growth, and community connection.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>© 2025 Artpreneur</span>
              <span>•</span>
              <span>Built with ❤️ for Artists</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
