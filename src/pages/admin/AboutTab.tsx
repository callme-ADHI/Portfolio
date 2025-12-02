import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AboutTab = () => {
  const [bio, setBio] = useState("");
  const [education, setEducation] = useState("");
  const [expertise, setExpertise] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    loadContent();
  }, []);
  
  const loadContent = async () => {
    const { data, error } = await supabase
      .from("about_content")
      .select("*");
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    data?.forEach((item) => {
      if (item.section === "bio") setBio(item.content);
      if (item.section === "education") setEducation(item.content);
      if (item.section === "expertise") setExpertise(item.content);
    });
  };
  
  const handleSave = async () => {
    setLoading(true);
    
    try {
      const updates = [
        { section: "bio", content: bio },
        { section: "education", content: education },
        { section: "expertise", content: expertise },
      ];
      
      for (const update of updates) {
        await supabase
          .from("about_content")
          .upsert(update, { onConflict: "section" });
      }
      
      toast({
        title: "Success!",
        description: "About content updated successfully",
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>About Page Content</CardTitle>
        <CardDescription>Edit the content displayed on your About page</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bio">Biography</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell your story..."
            rows={6}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="education">Education</Label>
          <Textarea
            id="education"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="Your educational background..."
            rows={4}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="expertise">Expertise (comma-separated)</Label>
          <Textarea
            id="expertise"
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
            placeholder="AI, Cybersecurity, Web Development, ..."
            rows={3}
          />
        </div>
        
        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AboutTab;