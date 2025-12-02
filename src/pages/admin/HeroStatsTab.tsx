import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface HeroStat {
  id?: string;
  label: string;
  value: string;
  display_order: number;
}

const HeroStatsTab = () => {
  const [stats, setStats] = useState<HeroStat[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    loadStats();
  }, []);
  
  const loadStats = async () => {
    const { data, error } = await supabase
      .from("hero_stats")
      .select("*")
      .order("display_order");
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    setStats(data || []);
  };
  
  const handleAdd = () => {
    setStats([...stats, { label: "", value: "", display_order: stats.length }]);
  };
  
  const handleRemove = async (index: number) => {
    const stat = stats[index];
    
    if (stat.id) {
      const { error } = await supabase
        .from("hero_stats")
        .delete()
        .eq("id", stat.id);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }
    
    setStats(stats.filter((_, i) => i !== index));
  };
  
  const handleChange = (index: number, field: keyof HeroStat, value: string) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setStats(newStats);
  };
  
  const handleSave = async () => {
    setLoading(true);
    
    try {
      for (const stat of stats) {
        if (!stat.label || !stat.value) continue;
        
        if (stat.id) {
          await supabase
            .from("hero_stats")
            .update({
              label: stat.label,
              value: stat.value,
              display_order: stat.display_order,
            })
            .eq("id", stat.id);
        } else {
          await supabase
            .from("hero_stats")
            .insert({
              label: stat.label,
              value: stat.value,
              display_order: stat.display_order,
            });
        }
      }
      
      toast({
        title: "Success!",
        description: "Hero stats updated successfully",
      });
      
      loadStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Stats</CardTitle>
        <CardDescription>Manage the statistics displayed on the homepage (e.g., "5+ Years", "100+ Projects")</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label>Value (e.g., "5+")</Label>
              <Input
                value={stat.value}
                onChange={(e) => handleChange(index, "value", e.target.value)}
                placeholder="5+"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>Label (e.g., "Years Experience")</Label>
              <Input
                value={stat.label}
                onChange={(e) => handleChange(index, "label", e.target.value)}
                placeholder="Years Experience"
              />
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleRemove(index)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
        
        <Button onClick={handleAdd} variant="outline" className="w-full">
          <Plus className="mr-2" size={16} />
          Add Stat
        </Button>
        
        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save All Changes"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default HeroStatsTab;