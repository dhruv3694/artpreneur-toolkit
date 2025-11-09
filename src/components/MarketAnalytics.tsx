import { Card } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Palette, BarChart3, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const MarketAnalytics = () => {
  const trendingCategories = [
    { name: "Digital Art", demand: 92, avgPrice: "₹15,000 - ₹45,000", growth: "+28%" },
    { name: "Abstract Paintings", demand: 85, avgPrice: "₹25,000 - ₹75,000", growth: "+18%" },
    { name: "Portrait Commissions", demand: 78, avgPrice: "₹8,000 - ₹30,000", growth: "+15%" },
    { name: "Illustration Work", demand: 72, avgPrice: "₹5,000 - ₹20,000", growth: "+22%" },
    { name: "Mixed Media", demand: 68, avgPrice: "₹12,000 - ₹40,000", growth: "+12%" },
  ];

  const colorTrends = [
    { palette: "Pastel Tones", popularity: 88, colors: ["#FFB5E8", "#B5DEFF", "#C7CEEA"] },
    { palette: "Earth & Natural", popularity: 82, colors: ["#8B7355", "#A0937D", "#C8B6A6"] },
    { palette: "Bold & Vibrant", popularity: 76, colors: ["#FF6B6B", "#4ECDC4", "#FFE66D"] },
    { palette: "Monochrome", popularity: 71, colors: ["#2C2C2C", "#606060", "#EBEBEB"] },
  ];

  const priceRanges = [
    { medium: "Digital Prints", range: "₹2,000 - ₹8,000", avg: "₹4,500" },
    { medium: "Acrylic Canvas", range: "₹15,000 - ₹50,000", avg: "₹28,000" },
    { medium: "Oil Paintings", range: "₹25,000 - ₹1,00,000", avg: "₹55,000" },
    { medium: "Watercolor", range: "₹8,000 - ₹25,000", avg: "₹15,000" },
    { medium: "Sculpture/3D", range: "₹30,000 - ₹1,50,000", avg: "₹75,000" },
  ];

  const marketInsights = [
    {
      title: "Peak Buying Season",
      description: "Art sales increase by 35% during October-December (festive season)",
      icon: Activity,
      color: "text-success",
    },
    {
      title: "Social Media Impact",
      description: "Artists with 10K+ followers command 40% premium pricing",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Size Matters",
      description: "Medium-sized works (24x36 inches) have highest sell-through rate at 67%",
      icon: BarChart3,
      color: "text-secondary",
    },
    {
      title: "Commission Premium",
      description: "Custom commissioned work averages 25-30% higher than ready-made pieces",
      icon: DollarSign,
      color: "text-warning",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-hero shadow-card">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-white" />
          <div>
            <h2 className="text-2xl font-bold text-white">Real-Time Market Analytics</h2>
            <p className="text-white/80 text-sm">
              Live insights from art marketplaces • Updated weekly
            </p>
          </div>
        </div>
      </Card>

      {/* Trending Categories */}
      <Card className="p-6 shadow-card">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Top Art Categories by Demand
        </h3>
        <div className="space-y-4">
          {trendingCategories.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-lg text-muted-foreground">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">{category.avgPrice}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-success/10 text-success">
                  {category.growth}
                </Badge>
              </div>
              <Progress value={category.demand} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Color Trends */}
      <Card className="p-6 shadow-card">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Trending Color Palettes
        </h3>
        <div className="space-y-4">
          {colorTrends.map((trend, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {trend.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{trend.palette}</span>
                </div>
                <span className="text-sm font-semibold text-primary">{trend.popularity}%</span>
              </div>
              <Progress value={trend.popularity} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Price Ranges by Medium */}
      <Card className="p-6 shadow-card">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Average Pricing by Medium
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-semibold">Medium</th>
                <th className="text-left py-3 font-semibold">Price Range</th>
                <th className="text-left py-3 font-semibold">Average</th>
              </tr>
            </thead>
            <tbody>
              {priceRanges.map((item, index) => (
                <tr key={index} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-4 font-medium">{item.medium}</td>
                  <td className="py-4 text-muted-foreground">{item.range}</td>
                  <td className="py-4">
                    <span className="font-semibold text-primary">{item.avg}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Market Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {marketInsights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <Card key={index} className="p-5 shadow-card hover:shadow-card-hover transition-shadow">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-muted ${insight.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pro Tip */}
      <Card className="p-6 bg-gradient-primary shadow-card">
        <h3 className="text-lg font-bold text-white mb-2">💡 Pro Pricing Strategy</h3>
        <p className="text-white/90 text-sm leading-relaxed">
          Based on market data: Price your work at the <strong>75th percentile</strong> of your category range 
          if you have strong portfolio + social presence. Start at <strong>50th percentile</strong> if building 
          reputation. Always factor in: (Materials + Time × ₹300-500/hour) + 30% profit margin.
        </p>
      </Card>
    </div>
  );
};

export default MarketAnalytics;
