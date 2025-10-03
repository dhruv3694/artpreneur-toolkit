import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { Plus, Trash2 } from "lucide-react";

const CATEGORIES = ["Materials", "Rent", "Marketing", "Software", "Travel", "Other"];
const COLORS = ["#8B5CF6", "#14B8A6", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899"];

interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  notes: string;
}

const ExpenseTracker = ({ userId }: { userId: string }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Materials");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchExpenses();
  }, [userId]);

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) {
      toast({ title: "Error fetching expenses", variant: "destructive" });
    } else {
      setExpenses(data || []);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("expenses").insert({
      user_id: userId,
      amount: parseFloat(amount),
      category,
      date,
      notes,
    });

    if (error) {
      toast({ title: "Error adding expense", variant: "destructive" });
    } else {
      toast({ title: "Expense added!" });
      setAmount("");
      setNotes("");
      fetchExpenses();
    }

    setLoading(false);
  };

  const handleDeleteExpense = async (id: string) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting expense", variant: "destructive" });
    } else {
      toast({ title: "Expense deleted" });
      fetchExpenses();
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  const categoryData = CATEGORIES.map((cat) => ({
    name: cat,
    value: expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + Number(e.amount), 0),
  })).filter((d) => d.value > 0);

  const monthlyData = expenses.reduce((acc: any[], exp) => {
    const month = exp.date.substring(0, 7);
    const existing = acc.find((d) => d.month === month);
    if (existing) {
      existing.amount += Number(exp.amount);
    } else {
      acc.push({ month, amount: Number(exp.amount) });
    }
    return acc;
  }, []).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-card">
        <h2 className="text-2xl font-bold mb-4">Add Expense</h2>
        <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional details..."
              rows={1}
            />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-card">
          <h3 className="text-xl font-semibold mb-4">Expenses by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `₹${entry.value.toFixed(0)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No expenses yet</p>
          )}
        </Card>

        <Card className="p-6 shadow-card">
          <h3 className="text-xl font-semibold mb-4">Monthly Trend</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Line type="monotone" dataKey="amount" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No data yet</p>
          )}
        </Card>
      </div>

      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Recent Expenses</h3>
          <p className="text-lg font-medium">
            Total: <span className="text-primary">₹{totalExpenses.toFixed(2)}</span>
          </p>
        </div>
        <div className="space-y-2">
          {expenses.length > 0 ? (
            expenses.slice(0, 10).map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <div>
                  <p className="font-medium">₹{Number(expense.amount).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    {expense.category} • {expense.date}
                  </p>
                  {expense.notes && (
                    <p className="text-sm text-muted-foreground mt-1">{expense.notes}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteExpense(expense.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No expenses recorded. Add your first expense above!
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ExpenseTracker;
