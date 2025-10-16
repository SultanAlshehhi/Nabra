import { Star, Trophy, Heart, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface MotivationalCardProps {
  message: string;
  icon?: 'star' | 'trophy' | 'heart' | 'sparkles';
  delay?: number;
}

export default function MotivationalCard({ message, icon = 'star', delay = 0 }: MotivationalCardProps) {
  const icons = {
    star: Star,
    trophy: Trophy,
    heart: Heart,
    sparkles: Sparkles,
  };

  const Icon = icons[icon];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <p className="text-foreground leading-relaxed flex-1">{message}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
