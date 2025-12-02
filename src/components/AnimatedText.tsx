import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface AnimatedTextProps {
  texts: string[];
  className?: string;
}

const AnimatedText = ({ texts, className = "" }: AnimatedTextProps) => {
  const [index, setIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [texts.length]);
  
  return (
    <div className={`relative h-12 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="text-2xl md:text-3xl font-bold glow-text">
            {texts[index]}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedText;