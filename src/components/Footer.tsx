import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Github, Linkedin, Mail, Instagram, Twitter } from "lucide-react";

const iconMap: Record<string, any> = {
  Github,
  Linkedin,
  Mail,
  Instagram,
  Twitter,
};

const Footer = () => {
  const { data: contactInfo } = useQuery({
    queryKey: ["contact-info"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_info")
        .select("*")
        .eq("visible", true)
        .order("display_order");
      
      if (error) throw error;
      return data;
    },
  });
  
  return (
    <motion.footer 
      className="border-t border-border bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.8 }}
    >
      <div className="container-luxe py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} All rights reserved
          </div>
          
          {contactInfo && contactInfo.length > 0 && (
            <div className="flex items-center gap-6">
              {contactInfo.map((item) => {
                const Icon = iconMap[item.icon] || Mail;
                return (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                    aria-label={item.label}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                  </a>
                );
              })}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Designed with precision
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;