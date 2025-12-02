import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X } from "lucide-react";

interface Project {
  id?: string;
  title: string;
  description: string;
  detailed_description: string;
  thumbnail_url: string;
  project_images: string[];
  tags: string[];
  category: string;
  visible: boolean;
  featured: boolean;
  github_url: string;
  live_url: string;
  display_order: number;
}

const ProjectsTab = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    loadProjects();
  }, []);
  
  const loadProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
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
    
    setProjects(data || []);
  };
  
  const handleAdd = () => {
    setProjects([...projects, {
      title: "",
      description: "",
      detailed_description: "",
      thumbnail_url: "",
      project_images: [],
      tags: [],
      category: "Uncategorized",
      visible: true,
      featured: false,
      github_url: "",
      live_url: "",
      display_order: projects.length,
    }]);
    setEditingIndex(projects.length);
  };
  
  const handleRemove = async (index: number) => {
    const project = projects[index];
    
    if (project.id) {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }
    
    setProjects(projects.filter((_, i) => i !== index));
    setEditingIndex(null);
  };
  
  const handleImageUpload = async (file: File, type: 'thumbnail' | 'gallery', index: number) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('project-images')
      .getPublicUrl(fileName);
    
    const newProjects = [...projects];
    if (type === 'thumbnail') {
      newProjects[index].thumbnail_url = publicUrl;
    } else {
      newProjects[index].project_images = [...newProjects[index].project_images, publicUrl];
    }
    setProjects(newProjects);
  };
  
  const handleSave = async (index: number) => {
    setLoading(true);
    
    try {
      const project = projects[index];
      
      if (project.id) {
        const { error } = await supabase
          .from("projects")
          .update({
            title: project.title,
            description: project.description,
            detailed_description: project.detailed_description,
            thumbnail_url: project.thumbnail_url,
            project_images: project.project_images,
            tags: project.tags,
            category: project.category,
            visible: project.visible,
            featured: project.featured,
            github_url: project.github_url,
            live_url: project.live_url,
            display_order: project.display_order,
          })
          .eq("id", project.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("projects")
          .insert({
            title: project.title,
            description: project.description,
            detailed_description: project.detailed_description,
            thumbnail_url: project.thumbnail_url,
            project_images: project.project_images,
            tags: project.tags,
            category: project.category,
            visible: project.visible,
            featured: project.featured,
            github_url: project.github_url,
            live_url: project.live_url,
            display_order: project.display_order,
          });
        
        if (error) throw error;
      }
      
      toast({
        title: "Success!",
        description: "Project saved successfully",
      });
      
      setEditingIndex(null);
      loadProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };
  
  const handleChange = (index: number, field: keyof Project, value: any) => {
    const newProjects = [...projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setProjects(newProjects);
  };
  
  const removeGalleryImage = (projectIndex: number, imageIndex: number) => {
    const newProjects = [...projects];
    newProjects[projectIndex].project_images = newProjects[projectIndex].project_images.filter((_, i) => i !== imageIndex);
    setProjects(newProjects);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>Manage your portfolio projects</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.map((project, index) => (
          <div key={project.id || index} className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">{project.title || `New Project`}</h3>
              <div className="flex gap-2">
                {editingIndex === index ? (
                  <Button
                    size="sm"
                    onClick={() => handleSave(index)}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingIndex(index)}
                  >
                    Edit
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(index)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
            
            {editingIndex === index && (
              <div className="space-y-3 pt-3">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={project.title}
                    onChange={(e) => handleChange(index, "title", e.target.value)}
                    placeholder="Project Title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={project.category || "Uncategorized"}
                    onChange={(e) => handleChange(index, "category", e.target.value)}
                    placeholder="e.g., Web Development, Mobile App, AI/ML"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Short Description</Label>
                  <Textarea
                    value={project.description}
                    onChange={(e) => handleChange(index, "description", e.target.value)}
                    placeholder="Brief description for the card"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Detailed Description</Label>
                  <Textarea
                    value={project.detailed_description}
                    onChange={(e) => handleChange(index, "detailed_description", e.target.value)}
                    placeholder="Full project description for detail page"
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Thumbnail Image</Label>
                  {project.thumbnail_url && (
                    <img src={project.thumbnail_url} alt="Thumbnail" className="w-32 h-32 object-cover rounded" />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'thumbnail', index);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Gallery Images</Label>
                  <div className="flex flex-wrap gap-2">
                    {project.project_images.map((img, imgIndex) => (
                      <div key={imgIndex} className="relative">
                        <img src={img} alt={`Gallery ${imgIndex}`} className="w-24 h-24 object-cover rounded" />
                        <button
                          onClick={() => removeGalleryImage(index, imgIndex)}
                          className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'gallery', index);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    value={project.tags?.join(", ") || ""}
                    onChange={(e) => handleChange(index, "tags", e.target.value.split(",").map(t => t.trim()))}
                    placeholder="React, TypeScript, etc."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>GitHub URL</Label>
                    <Input
                      value={project.github_url}
                      onChange={(e) => handleChange(index, "github_url", e.target.value)}
                      placeholder="https://github.com/..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Live URL</Label>
                    <Input
                      value={project.live_url}
                      onChange={(e) => handleChange(index, "live_url", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={project.visible}
                    onCheckedChange={(checked) => handleChange(index, "visible", checked)}
                  />
                  <Label>Visible on website</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={project.featured}
                    onCheckedChange={(checked) => handleChange(index, "featured", checked)}
                  />
                  <Label>Featured on homepage</Label>
                </div>
                
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={project.display_order}
                    onChange={(e) => handleChange(index, "display_order", parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
        
        <Button onClick={handleAdd} variant="outline" className="w-full">
          <Plus className="mr-2" size={16} />
          Add Project
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProjectsTab;