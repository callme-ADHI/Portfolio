import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Trash2, ExternalLink } from "lucide-react";

const ResumeTab = () => {
  const [resume, setResume] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    loadResume();
  }, []);
  
  const loadResume = async () => {
    const { data, error } = await supabase
      .from("resume")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    setResume(data);
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }
    
    // Check file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Only PDF and Word documents are allowed",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    
    try {
      // Delete old file if exists
      if (resume?.file_url) {
        const oldPath = resume.file_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('project-images')
            .remove([`resumes/${oldPath}`]);
        }
      }
      
      // Upload new file
      const fileExt = file.name.split('.').pop();
      const fileName = `resume-${Date.now()}.${fileExt}`;
      const filePath = `resumes/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);
      
      // Update database
      if (resume?.id) {
        await supabase
          .from("resume")
          .update({
            file_url: publicUrl,
            file_name: file.name,
            updated_at: new Date().toISOString(),
          })
          .eq("id", resume.id);
      } else {
        await supabase
          .from("resume")
          .insert({
            file_url: publicUrl,
            file_name: file.name,
          });
      }
      
      toast({
        title: "Success!",
        description: "Resume uploaded successfully",
      });
      
      loadResume();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setUploading(false);
  };
  
  const handleDelete = async () => {
    if (!resume) return;
    
    try {
      // Delete file from storage
      const filePath = resume.file_url.split('/').pop();
      if (filePath) {
        await supabase.storage
          .from('project-images')
          .remove([`resumes/${filePath}`]);
      }
      
      // Delete from database
      const { error } = await supabase
        .from("resume")
        .delete()
        .eq("id", resume.id);
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Resume deleted successfully",
      });
      
      setResume(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume Management</CardTitle>
        <CardDescription>Upload and manage your resume/CV file</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {resume ? (
          <div className="border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-4">
              <FileText className="w-12 h-12 text-primary" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{resume.file_name}</h3>
                <p className="text-sm text-muted-foreground">
                  Uploaded: {new Date(resume.uploaded_at).toLocaleDateString()}
                </p>
                {resume.updated_at !== resume.uploaded_at && (
                  <p className="text-sm text-muted-foreground">
                    Updated: {new Date(resume.updated_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <a href={resume.file_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ExternalLink className="mr-2" size={16} />
                  View Resume
                </Button>
              </a>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No resume uploaded yet
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="resume-upload">
            {resume ? "Replace Resume" : "Upload Resume"}
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
              className="flex-1"
            />
            <Button disabled={uploading} variant="secondary">
              <Upload className="mr-2" size={16} />
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Accepted formats: PDF, DOC, DOCX (Max 10MB)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeTab;
