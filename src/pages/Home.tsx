import { motion, useScroll, useTransform } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import NixieClock from "@/components/NixieClock";
import AnimatedText from "@/components/AnimatedText";
import { ArrowRight } from "lucide-react";

const Home = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, -100]);
  const y2 = useTransform(scrollY, [0, 1000], [0, 100]);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: homeContent } = useQuery({
    queryKey: ["home-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_content")
        .select("*")
        .eq("section", "parallax_sections")
        .maybeSingle();
      
      if (error) throw error;
      return data?.content || {
        featured_work_title: "Featured Work",
        featured_work_description: "Explore innovative solutions crafted with precision and creativity.",
        philosophy_title: "Philosophy",
        philosophy_description: "Merging technical excellence with creative innovation to build experiences that matter.",
      };
    },
  });

  const { data: featuredProjects } = useQuery({
    queryKey: ["featured-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("visible", true)
        .eq("featured", true)
        .order("display_order")
        .limit(6);
      
      if (error) throw error;
      return data;
    },
  });
  
  const { data: heroStats } = useQuery({
    queryKey: ["hero-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_stats")
        .select("*")
        .order("display_order");
      
      if (error) throw error;
      return data;
    },
  });
  
  const { data: resume } = useQuery({
    queryKey: ["resume"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resume")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });
  
  const titles = profile?.title ? profile.title.split("|").map(t => t.trim()) : ["Innovator", "Problem Solver"];
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 overflow-visible">
          <div className="container mx-auto px-4 lg:px-8 relative">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-center">
              {/* Left Side - Content */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                className="space-y-16 max-w-4xl"
              >
                {/* Profile Image */}
                {profile?.profile_image_url && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="flex justify-center xl:justify-start"
                  >
                    <img
                      src={profile.profile_image_url}
                      alt={profile.full_name || "Profile"}
                      className="w-40 h-40 rounded-full border-2 border-border object-cover"
                    />
                  </motion.div>
                )}
                
                {/* Main Content */}
                <div className="space-y-12">
                  <div className="space-y-8">
                    <motion.h1 
                      className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight break-words"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    >
                      {profile?.full_name || "Your Name"}
                    </motion.h1>
                    
                    <motion.div 
                      className="text-2xl md:text-3xl text-muted-foreground font-light"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.8 }}
                    >
                      {titles[0]}
                    </motion.div>
                  </div>
                
                  
                  {/* Stats Grid */}
                  {heroStats && heroStats.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.1, duration: 0.8 }}
                      className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border mt-16"
                    >
                      {heroStats.map((stat, index) => (
                        <motion.div
                          key={stat.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.3 + index * 0.1, duration: 0.6 }}
                          className="bg-background p-8 hover:bg-card transition-colors duration-300"
                        >
                          <div className="text-4xl font-bold text-foreground mb-2 tracking-tighter">
                            {stat.value}
                          </div>
                          <div className="text-sm text-muted-foreground uppercase tracking-wider">
                            {stat.label}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                  
                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4 pt-8"
                  >
                    <Link to="/projects">
                      <Button 
                        size="lg" 
                        className="bg-foreground text-background hover:bg-foreground/90 rounded-none h-14 px-8 font-medium transition-all duration-300"
                      >
                        View Work
                        <ArrowRight className="ml-2" size={20} />
                      </Button>
                    </Link>
                    <Link to="/contact">
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="border-border text-foreground hover:bg-foreground hover:text-background rounded-none h-14 px-8 font-medium transition-all duration-300"
                      >
                        Contact
                      </Button>
                    </Link>
                    {resume && (
                      <a href={resume.file_url} download target="_blank" rel="noopener noreferrer">
                        <Button 
                          size="lg" 
                          variant="outline"
                          className="border-border text-muted-foreground hover:text-foreground hover:border-foreground rounded-none h-14 px-8 font-medium transition-all duration-300"
                        >
                          Resume
                        </Button>
                      </a>
                    )}
                  </motion.div>
                </div>
              </motion.div>

              {/* Right Side - Nixie Clock */}
              <div className="hidden xl:flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 1 }}
                >
                  <NixieClock />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Parallax Scrolling Content Sections */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1 }}
          className="section-spacing space-y-48"
        >
          <div className="container-luxe space-y-48">
            {/* Featured Work Section */}
            <div className="space-y-16">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8 }}
                className="text-center space-y-6"
              >
                <h2 className="text-5xl md:text-6xl font-bold text-foreground">
                  {(homeContent as any)?.featured_work_title || "Featured Work"}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                  {(homeContent as any)?.featured_work_description || "Explore innovative solutions crafted with precision and creativity."}
                </p>
                <Link to="/projects">
                  <Button 
                    variant="outline" 
                    className="border-foreground text-foreground hover:bg-foreground hover:text-background mt-4"
                  >
                    VIEW PROJECTS
                  </Button>
                </Link>
              </motion.div>
              
              {/* Featured Projects Grid - 2 per row, alternating animations */}
              {featuredProjects && featuredProjects.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                  {featuredProjects.map((project: any, index: number) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ 
                        duration: 0.8,
                        delay: 0.1 * (index % 2),
                        ease: [0.4, 0, 0.2, 1]
                      }}
                    >
                      <Link to={`/project/${project.id}`} className="group block">
                        <div className="aspect-video overflow-hidden border border-border bg-card">
                          <img 
                            src={project.thumbnail_url || ""} 
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                        <div className="mt-6 space-y-3">
                          <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                            {project.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                            {project.description}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Philosophy Section */}
            <motion.div
              style={{ y: y2 }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              {(homeContent as any)?.philosophy_image_url && (
                <div className="aspect-square border border-border overflow-hidden">
                  <img 
                    src={(homeContent as any).philosophy_image_url} 
                    alt="Philosophy"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-6">
                <h2 className="text-5xl md:text-6xl font-bold text-foreground">
                  {(homeContent as any)?.philosophy_title || "Philosophy"}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {(homeContent as any)?.philosophy_description || "Merging technical excellence with creative innovation to build experiences that matter."}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
