import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ProfileTab = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    loadProfile();
  }, []);
  
  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (data) {
      setFullName(data.full_name || "");
      setEmail(data.email || "");
      setTitle(data.title || "Innovator | Cybersecurity Engineer");
      setCurrentImageUrl(data.profile_image_url || "");
    }
  };
  
  const handleImageUpload = async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };
  
  const handleSave = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      let imageUrl = currentImageUrl;
      
      if (profileImage) {
        imageUrl = await handleImageUpload(profileImage) || currentImageUrl;
      }
      
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: fullName,
          title: title,
          profile_image_url: imageUrl,
        });
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Profile updated successfully",
      });
      
      loadProfile();
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
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Update your profile information and photo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your Name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email (Read-only)</Label>
          <Input
            id="email"
            value={email}
            disabled
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="title">Animated Title (use | to separate)</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Developer | Designer | Innovator"
          />
          <p className="text-sm text-muted-foreground">
            Separate titles with | (pipe) character for animation
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="profileImage">Profile Picture</Label>
          {currentImageUrl && (
            <img
              src={currentImageUrl}
              alt="Current profile"
              className="w-32 h-32 rounded-full object-cover border-2 border-border mb-2"
            />
          )}
          <Input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
          />
        </div>
        
        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileTab;