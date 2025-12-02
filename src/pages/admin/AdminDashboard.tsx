import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ProjectsTab from "./ProjectsTab";
import ProfileTab from "./ProfileTab";
import HeroStatsTab from "./HeroStatsTab";
import AboutTab from "./AboutTab";
import ContactTab from "./ContactTab";
import ResumeTab from "./ResumeTab";
import HomeContentTab from "./HomeContentTab";

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    checkAdmin();
  }, []);
  
  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }
    
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();
    
    if (!roleData) {
      toast({
        title: "Access Denied",
        description: "You don't have admin permissions",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    
    setIsAdmin(true);
    setLoading(false);
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold glow-text">Admin Dashboard</h1>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="hero">Hero Stats</TabsTrigger>
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="logout" onClick={handleSignOut}>Logout</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>
          
          <TabsContent value="hero">
            <HeroStatsTab />
          </TabsContent>
          
          <TabsContent value="home">
            <HomeContentTab />
          </TabsContent>
          
          <TabsContent value="about">
            <AboutTab />
          </TabsContent>
          
          <TabsContent value="projects">
            <ProjectsTab />
          </TabsContent>
          
          <TabsContent value="contact">
            <ContactTab />
          </TabsContent>
          
          <TabsContent value="resume">
            <ResumeTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;