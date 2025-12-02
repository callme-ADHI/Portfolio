import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ExternalLink, Github } from "lucide-react";
import { useState } from "react";

const Projects = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("visible", true)
        .order("display_order");
      
      if (error) throw error;
      return data;
    },
  });

  // Get unique categories
  const categories = ["All", ...new Set(projects?.map(p => p.category || "Uncategorized") || [])];

  // Filter projects by category
  const filteredProjects = selectedCategory === "All" 
    ? projects 
    : projects?.filter(p => (p.category || "Uncategorized") === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 section-spacing pt-32">
        <div className="container-luxe max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="space-y-24"
          >
            {/* Header */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-7xl md:text-9xl font-bold text-foreground leading-none mb-12">
                Projects
              </h1>
              <motion.div 
                className="luxe-divider"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.div>

            {/* Category Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex flex-wrap gap-3"
            >
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 border transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-foreground border-border hover:bg-card"
                  }`}
                >
                  <span className="text-xs uppercase tracking-widest">{category}</span>
                </button>
              ))}
            </motion.div>
            
            {/* Projects List */}
            {isLoading ? (
              <div className="text-center text-muted-foreground text-sm uppercase tracking-wider">
                Loading
              </div>
            ) : !filteredProjects || filteredProjects.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm uppercase tracking-wider">
                No projects available in this category
              </div>
            ) : (
              <div className="space-y-px bg-border">
                {filteredProjects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

const ProjectCard = ({ project, index }: { project: any; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ 
        duration: 1,
        delay: (index % 3) * 0.15,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="bg-background hover:bg-card transition-colors duration-500 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/project/${project.id}`} className="block">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-12">
          {/* Left - Number & Info */}
          <motion.div 
            className="lg:col-span-5 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div 
              className="text-sm uppercase tracking-widest text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {String(index + 1).padStart(2, '0')}
            </motion.div>
            
            <div>
              <motion.h3 
                className="text-3xl md:text-4xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                {project.title}
              </motion.h3>
              {project.category && (
                <div className="mb-3">
                  <span className="text-xs uppercase tracking-widest text-accent border border-border px-3 py-1">
                    {project.category}
                  </span>
                </div>
              )}
              <p className="text-base text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </div>
            
            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs uppercase tracking-wider text-muted-foreground border border-border px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Links */}
            <div className="flex items-center gap-6 pt-4">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-300 flex items-center gap-2"
                >
                  <Github size={18} strokeWidth={1.5} />
                  <span className="text-sm uppercase tracking-wider">Code</span>
                </a>
              )}
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-300 flex items-center gap-2"
                >
                  <ExternalLink size={18} strokeWidth={1.5} />
                  <span className="text-sm uppercase tracking-wider">Live</span>
                </a>
              )}
            </div>
          </motion.div>
          
          {/* Right - Image */}
          <motion.div 
            className="lg:col-span-7"
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {project.thumbnail_url && (
              <div className="aspect-video overflow-hidden border border-border">
                <motion.img
                  src={project.thumbnail_url}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  animate={{
                    scale: isHovered ? 1.15 : 1,
                  }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            )}
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
};

export default Projects;
