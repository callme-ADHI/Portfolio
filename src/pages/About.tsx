import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const About = () => {
  const { data: aboutContent } = useQuery({
    queryKey: ["about-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about_content")
        .select("*");
      
      if (error) throw error;
      
      const content: Record<string, string> = {};
      data.forEach((item) => {
        content[item.section] = item.content;
      });
      return content;
    },
  });
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 section-spacing pt-32">
        <div className="container-luxe max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="space-y-24"
          >
            {/* Header */}
            <div>
              <motion.h1 
                className="text-7xl md:text-9xl font-bold text-foreground leading-none mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                About
              </motion.h1>
              <div className="luxe-divider" />
            </div>
            
            {/* Bio */}
            {aboutContent?.bio && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="space-y-6"
              >
                <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Biography</h2>
                <p className="text-2xl md:text-3xl leading-relaxed text-foreground font-light whitespace-pre-wrap">
                  {aboutContent.bio}
                </p>
              </motion.div>
            )}
            
            <div className="luxe-divider" />
            
            {/* Education */}
            {aboutContent?.education && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="space-y-6"
              >
                <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Education</h2>
                <p className="text-xl leading-relaxed text-foreground/80 whitespace-pre-wrap">
                  {aboutContent.education}
                </p>
              </motion.div>
            )}
            
            <div className="luxe-divider" />
            
            {/* Expertise */}
            {aboutContent?.expertise && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="space-y-8"
              >
                <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Expertise</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border">
                  {aboutContent.expertise.split(',').map((skill: string, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 + index * 0.05 }}
                      className="bg-background p-6 hover:bg-card transition-colors duration-300"
                    >
                      <span className="text-lg text-foreground">
                        {skill.trim()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;