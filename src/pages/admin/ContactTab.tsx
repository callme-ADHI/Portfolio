import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ContactItem {
  id?: string;
  platform: string;
  label: string;
  url: string;
  icon: string;
  phone?: string;
  visible: boolean;
  display_order: number;
}

const ContactTab = () => {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const iconOptions = ["Mail", "Github", "Linkedin", "Twitter", "Instagram", "Phone", "MessageCircle"];
  
  useEffect(() => {
    loadContacts();
  }, []);
  
  const loadContacts = async () => {
    const { data, error } = await supabase
      .from("contact_info")
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
    
    setContacts(data || []);
  };
  
  const handleAdd = () => {
    setContacts([...contacts, {
      platform: "",
      label: "",
      url: "",
      icon: "Mail",
      visible: true,
      display_order: contacts.length,
    }]);
  };
  
  const handleRemove = async (index: number) => {
    const contact = contacts[index];
    
    if (contact.id) {
      const { error } = await supabase
        .from("contact_info")
        .delete()
        .eq("id", contact.id);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }
    
    setContacts(contacts.filter((_, i) => i !== index));
  };
  
  const handleChange = (index: number, field: keyof ContactItem, value: any) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setContacts(newContacts);
  };
  
  const handleSave = async () => {
    setLoading(true);
    
    try {
      for (const contact of contacts) {
        if (!contact.platform || !contact.url) continue;
        
        if (contact.id) {
          await supabase
            .from("contact_info")
            .update({
              platform: contact.platform,
              label: contact.label,
              url: contact.url,
              icon: contact.icon,
              phone: contact.phone,
              visible: contact.visible,
              display_order: contact.display_order,
            })
            .eq("id", contact.id);
        } else {
          await supabase
            .from("contact_info")
            .insert({
              platform: contact.platform,
              label: contact.label,
              url: contact.url,
              icon: contact.icon,
              phone: contact.phone,
              visible: contact.visible,
              display_order: contact.display_order,
            });
        }
      }
      
      toast({
        title: "Success!",
        description: "Contact info updated successfully",
      });
      
      loadContacts();
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
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>Manage your social links and contact methods</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {contacts.map((contact, index) => (
          <div key={index} className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <Label>Contact #{index + 1}</Label>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleRemove(index)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Input
                  value={contact.platform}
                  onChange={(e) => handleChange(index, "platform", e.target.value)}
                  placeholder="email, github, whatsapp, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={contact.label}
                  onChange={(e) => handleChange(index, "label", e.target.value)}
                  placeholder="Email, GitHub, WhatsApp, etc."
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Phone Number (for WhatsApp)</Label>
              <Input
                value={contact.phone || ""}
                onChange={(e) => handleChange(index, "phone", e.target.value)}
                placeholder="+1234567890"
              />
              <p className="text-xs text-muted-foreground">
                Include country code (e.g., +1 for US). Required for WhatsApp functionality.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={contact.url}
                onChange={(e) => handleChange(index, "url", e.target.value)}
                placeholder="https:// or mailto:"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <Label>Icon</Label>
                <Select
                  value={contact.icon}
                  onValueChange={(value) => handleChange(index, "icon", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2 pt-7">
                <Switch
                  checked={contact.visible}
                  onCheckedChange={(checked) => handleChange(index, "visible", checked)}
                />
                <Label>Visible</Label>
              </div>
            </div>
          </div>
        ))}
        
        <Button onClick={handleAdd} variant="outline" className="w-full">
          <Plus className="mr-2" size={16} />
          Add Contact
        </Button>
        
        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save All Changes"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ContactTab;