import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Github, Linkedin, Mail, Instagram, Twitter, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const iconMap: Record<string, any> = {
  Github,
  Linkedin,
  Mail,
  Instagram,
  Twitter,
  Phone,
};

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  message: z.string().trim().min(1, "Message is required").max(1000),
});

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const whatsappContact = contactInfo?.find(c => c.platform.toLowerCase() === 'whatsapp');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    if (whatsappContact?.phone) {
      const message = `Hi, I'm ${encodeURIComponent(formData.name)}.%0A%0AEmail: ${encodeURIComponent(formData.email)}%0A%0AMessage: ${encodeURIComponent(formData.message)}`;
      const whatsappUrl = `https://wa.me/${whatsappContact.phone.replace(/[^0-9]/g, '')}?text=${message}`;
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "Opening WhatsApp",
        description: "You'll be redirected to WhatsApp to send your message.",
      });
      
      setFormData({ name: "", email: "", message: "" });
    } else {
      toast({
        title: "Error",
        description: "WhatsApp contact not configured",
        variant: "destructive",
      });
    }
  };
  
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
                Contact
              </motion.h1>
              <div className="luxe-divider" />
            </div>
            
            {/* Contact Links */}
            {contactInfo && contactInfo.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border"
              >
                {contactInfo.map((item, index) => {
                  const Icon = iconMap[item.icon] || Mail;
                  return (
                    <motion.a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="bg-background p-8 hover:bg-card transition-colors duration-300 group"
                    >
                      <div className="flex items-center gap-4">
                        <Icon size={24} strokeWidth={1.5} className="text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
                        <div>
                          <div className="text-sm uppercase tracking-wider text-muted-foreground mb-1">
                            {item.platform}
                          </div>
                          <div className="text-lg text-foreground">
                            {item.label}
                          </div>
                        </div>
                      </div>
                    </motion.a>
                  );
                })}
              </motion.div>
            )}
            
            <div className="luxe-divider" />
            
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="space-y-8"
            >
              <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Send a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      placeholder="Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="bg-transparent border-border rounded-none h-14 text-foreground placeholder:text-muted-foreground focus:border-foreground"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-2">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="bg-transparent border-border rounded-none h-14 text-foreground placeholder:text-muted-foreground focus:border-foreground"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-2">{errors.email}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Textarea
                    placeholder="Message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={6}
                    className="bg-transparent border-border rounded-none text-foreground placeholder:text-muted-foreground focus:border-foreground resize-none"
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive mt-2">{errors.message}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  size="lg"
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-none h-14 px-12 font-medium"
                >
                  Send Message
                </Button>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
