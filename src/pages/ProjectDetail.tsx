import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ArrowLeft, Github, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProjectDetail = () => {
  const { id } = useParams();
  
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Link to="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/projects">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2" size={20} />
              Back to Projects
            </Button>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-5xl font-bold mb-4 glow-text">{project.title}</h1>
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags?.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-muted rounded-full text-sm border border-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {project.thumbnail_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl overflow-hidden border border-border"
              >
                <img
                  src={project.thumbnail_url}
                  alt={project.title}
                  className="w-full"
                />
              </motion.div>
            )}
            
            <div className="bg-card border border-border rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-4 text-primary">Description</h2>
              <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {project.detailed_description || project.description}
              </p>
            </div>
            
            {project.project_images && project.project_images.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-primary">Gallery</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {project.project_images.map((image: string, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="rounded-xl overflow-hidden border border-border hover:border-primary transition-colors"
                    >
                      <img
                        src={image}
                        alt={`${project.title} screenshot ${index + 1}`}
                        className="w-full"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-4">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-primary hover:bg-primary/90">
                    <Github className="mr-2" size={20} />
                    View on GitHub
                  </Button>
                </a>
              )}
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <ExternalLink className="mr-2" size={20} />
                    Live Demo
                  </Button>
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProjectDetail;