import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
  className?: string;
}

export function TestimonialCard({
  name,
  role, 
  avatar,
  content,
  rating,
  className = ""
}: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={className}
    >
      <Card className="glass-card hover:shadow-glow transition-all duration-300 h-full">
        <CardContent className="p-6 space-y-4">
          {/* Rating Stars */}
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.2 }}
              >
                <Star 
                  className={`h-4 w-4 ${
                    i < rating 
                      ? 'text-yellow-500 fill-yellow-500' 
                      : 'text-muted-foreground'
                  }`} 
                />
              </motion.div>
            ))}
          </div>
          
          {/* Testimonial Content */}
          <blockquote className="text-muted-foreground italic leading-relaxed">
            "{content}"
          </blockquote>
          
          {/* Author */}
          <div className="flex items-center gap-3 pt-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                  {name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            
            <div>
              <p className="font-medium text-sm">{name}</p>
              <p className="text-xs text-muted-foreground">{role}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}