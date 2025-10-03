import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calculator, History } from "lucide-react";

interface Calculation {
  id: string;
  hours_worked: number;
  hourly_rate: number;
  material_cost: number;
  profit_margin: number;
  recommended_price: number;
  created_at: string;
}

const PricingCalculator = ({ userId }: { userId: string }) => {
  const [hoursWorked, setHoursWorked] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [materialCost, setMaterialCost] = useState("");
  const [profitMargin, setProfitMargin] = useState("20");
  const [recommendedPrice, setRecommendedPrice] = useState<number | null>(null);
  const [history, setHistory] = useState<Calculation[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from("pricing_calculations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (data) setHistory(data);
  };

  const calculatePrice = async (e: React.FormEvent) => {
    e.preventDefault();

    const hours = parseFloat(hoursWorked);
    const rate = parseFloat(hourlyRate);
    const materials = parseFloat(materialCost);
    const margin = parseFloat(profitMargin);

    const laborCost = hours * rate;
    const subtotal = laborCost + materials;
    const price = subtotal * (1 + margin / 100);

    setRecommendedPrice(price);

    // Save calculation
    const { error } = await supabase.from("pricing_calculations").insert({
      user_id: userId,
      hours_worked: hours,
      hourly_rate: rate,
      material_cost: materials,
      profit_margin: margin,
      recommended_price: price,
    });

    if (error) {
      toast({ title: "Error saving calculation", variant: "destructive" });
    } else {
      toast({ title: "Calculation saved!" });
      fetchHistory();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Pricing Calculator</h2>
        </div>
        
        <form onSubmit={calculatePrice} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours Worked</Label>
              <Input
                id="hours"
                type="number"
                step="0.1"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                required
                placeholder="e.g., 40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Hourly Rate (₹)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                required
                placeholder="e.g., 500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="materials">Material Cost (₹)</Label>
              <Input
                id="materials"
                type="number"
                step="0.01"
                value={materialCost}
                onChange={(e) => setMaterialCost(e.target.value)}
                required
                placeholder="e.g., 2000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="margin">Profit Margin (%)</Label>
              <Input
                id="margin"
                type="number"
                step="1"
                value={profitMargin}
                onChange={(e) => setProfitMargin(e.target.value)}
                required
                placeholder="e.g., 20"
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Calculate Price
          </Button>
        </form>

        {recommendedPrice !== null && (
          <div className="mt-6 p-6 bg-gradient-primary rounded-lg text-white">
            <p className="text-sm opacity-90 mb-2">Recommended Project Price</p>
            <p className="text-4xl font-bold">₹{recommendedPrice.toFixed(2)}</p>
            <div className="mt-4 space-y-1 text-sm opacity-90">
              <p>Labor: ₹{(parseFloat(hoursWorked) * parseFloat(hourlyRate)).toFixed(2)}</p>
              <p>Materials: ₹{parseFloat(materialCost).toFixed(2)}</p>
              <p>Profit ({profitMargin}%): ₹{(recommendedPrice - (parseFloat(hoursWorked) * parseFloat(hourlyRate) + parseFloat(materialCost))).toFixed(2)}</p>
            </div>
          </div>
        )}
      </Card>

      {history.length > 0 && (
        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">Recent Calculations</h3>
          </div>
          <div className="space-y-2">
            {history.map((calc) => (
              <div
                key={calc.id}
                className="p-4 bg-muted rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-medium text-primary">
                      ₹{Number(calc.recommended_price).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {calc.hours_worked}h × ₹{calc.hourly_rate}/h + ₹{calc.material_cost} materials
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(calc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                    {calc.profit_margin}% profit
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PricingCalculator;
