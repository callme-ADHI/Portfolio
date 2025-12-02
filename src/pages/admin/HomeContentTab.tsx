import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface HomeContent {
  featured_work_title: string;
  featured_work_description: string;
  featured_work_image_url?: string;
  philosophy_title: string;
  philosophy_description: string;
  philosophy_image_url?: string;
}

const HomeContentTab = () => {
  const [content, setContent] = useState<HomeContent>({
    featured_work_title: "Featured Work",
    featured_work_description: "Explore innovative solutions crafted with precision and creativity.",
    featured_work_image_url: "",
    philosophy_title: "Philosophy",
    philosophy_description: "Merging technical excellence with creative innovation to build experiences that matter.",
    philosophy_image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    loadContent();
  }, []);
  
  const loadContent = async () => {
    const { data, error } = await supabase
      .from("home_content")
      .select("*")
      .eq("section", "parallax_sections")
      .maybeSingle();
    
    if (error) {
      console.error("Error loading content:", error);
      return;
    }
    
    if (data?.content) {
      setContent(data.content as any);
    }
  };
  
  const handleSave = async () => {
    setLoading(true);
    
    try {
      const { data: existing } = await supabase
        .from("home_content")
        .select("id")
        .eq("section", "parallax_sections")
        .maybeSingle();
      
      if (existing) {
        const { error } = await supabase
          .from("home_content")
          .update({
            content: content as any,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("home_content")
          .insert({
            section: "parallax_sections",
            content: content as any,
          });
        
        if (error) throw error;
      }
      
      toast({
        title: "Success!",
        description: "Home page content saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };
  
  const handleChange = (field: keyof HomeContent, value: string) => {
    setContent({ ...content, [field]: value });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Home Page Content</CardTitle>
        <CardDescription>Edit the parallax sections content on the homepage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 border border-border rounded-lg p-4">
          <h3 className="font-bold">Featured Work Section</h3>
          
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={content.featured_work_title}
              onChange={(e) => handleChange("featured_work_title", e.target.value)}
              placeholder="Featured Work"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={content.featured_work_description}
              onChange={(e) => handleChange("featured_work_description", e.target.value)}
              placeholder="Description text"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Image URL (optional)</Label>
            <Input
              value={content.featured_work_image_url || ""}
              onChange={(e) => handleChange("featured_work_image_url", e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground">Leave empty to show featured project instead</p>
          </div>
        </div>
        
        <div className="space-y-4 border border-border rounded-lg p-4">
          <h3 className="font-bold">Philosophy Section</h3>
          
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={content.philosophy_title}
              onChange={(e) => handleChange("philosophy_title", e.target.value)}
              placeholder="Philosophy"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={content.philosophy_description}
              onChange={(e) => handleChange("philosophy_description", e.target.value)}
              placeholder="Description text"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input
              value={content.philosophy_image_url || ""}
              onChange={(e) => handleChange("philosophy_image_url", e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground">Upload your custom image for this section</p>
          </div>
        </div>
        
        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default HomeContentTab;
