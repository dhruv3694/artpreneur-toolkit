import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Palette } from "lucide-react";
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
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass shadow-glass sticky top-0 z-10 border-b border-white/20">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Palette className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-heading font-bold bg-gradient-primary bg-clip-text text-transparent">
              Artpreneur
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-sm text-muted-foreground hidden sm:block">
              Welcome, <span className="font-semibold text-foreground">{profile?.name || "Artist"}</span>
            </p>
            <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold shadow-card cursor-pointer hover:shadow-card-hover transition-all duration-300 hover:scale-105">
              {(profile?.name || "U").charAt(0).toUpperCase()}
            </div>
            <Button onClick={handleLogout} variant="glass" size="sm">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-10">
        <Tabs defaultValue="health" className="space-y-8">
          <TabsList className="glass shadow-glass border border-white/20 p-2 grid w-full grid-cols-3 lg:grid-cols-9 lg:w-auto lg:inline-grid gap-2 h-auto">
            <TabsTrigger 
              value="health" 
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-card rounded-lg transition-all duration-300 hover:scale-105 py-2.5"
            >
              Health
            </TabsTrigger>
            <TabsTrigger 
              value="mentor"
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-card rounded-lg transition-all duration-300 hover:scale-105 py-2.5"
            >
              AI Mentor
            </TabsTrigger>
            <TabsTrigger 
              value="funding"
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-card rounded-lg transition-all duration-300 hover:scale-105 py-2.5"
            >
              Funding
            </TabsTrigger>
            <TabsTrigger 
              value="market"
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-card rounded-lg transition-all duration-300 hover:scale-105 py-2.5"
            >
              Market
            </TabsTrigger>
            <TabsTrigger 
              value="expenses"
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-card rounded-lg transition-all duration-300 hover:scale-105 py-2.5"
            >
              Expenses
            </TabsTrigger>
            <TabsTrigger 
              value="pricing"
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-card rounded-lg transition-all duration-300 hover:scale-105 py-2.5"
            >
              Pricing
            </TabsTrigger>
            <TabsTrigger 
              value="advanced"
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-card rounded-lg transition-all duration-300 hover:scale-105 py-2.5"
            >
              Valuation
            </TabsTrigger>
            <TabsTrigger 
              value="learning"
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-card rounded-lg transition-all duration-300 hover:scale-105 py-2.5"
            >
              Learning
            </TabsTrigger>
            <TabsTrigger 
              value="community"
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-card rounded-lg transition-all duration-300 hover:scale-105 py-2.5"
            >
              Community
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health">
            <CreativeHealthScore userId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="mentor">
            <AIMentor userId={user?.id || ""} userProfile={profile} />
          </TabsContent>

          <TabsContent value="funding">
            <FundingRecommender userId={user?.id || ""} userProfile={profile} />
          </TabsContent>

          <TabsContent value="market">
            <MarketAnalytics />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseTracker userId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="pricing">
            <PricingCalculator userId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="advanced">
            <AdvancedPricingCalculator userId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="learning">
            <LearningHub />
          </TabsContent>

          <TabsContent value="community">
            <CommunityForum userId={user?.id || ""} userName={profile?.name || "User"} />
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Assistant */}
      <AIAssistant />

      {/* Footer */}
      <footer className="mt-20 glass shadow-glass border-t border-white/20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-card">
                <Palette className="h-4 w-4 text-white" />
              </div>
              <span className="font-heading text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
                Artpreneur
              </span>
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Empowering Creative Sustainability through Smart Financial Tools
            </p>
            <p className="text-xs text-muted-foreground">
              © 2025 Artpreneur – Built with passion for artists
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
