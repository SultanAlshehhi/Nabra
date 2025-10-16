import { Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface SessionCardProps {
  sessionId: string;
  date: string;
  classification: string;
  confidence: number;
  onViewDetails?: () => void;
}

export default function SessionCard({ sessionId, date, classification, confidence, onViewDetails }: SessionCardProps) {
  const getClassificationColor = (cls: string) => {
    const colors: Record<string, string> = {
      'Articulation Disorder': 'bg-chart-1/10 text-chart-1',
      'Phonological Impairment': 'bg-chart-2/10 text-chart-2',
      'Vowel Disorder': 'bg-chart-3/10 text-chart-3',
      'Childhood Apraxia of Speech': 'bg-chart-4/10 text-chart-4',
      'Inconsistent Phonological Impairment': 'bg-chart-5/10 text-chart-5',
      'Cleft Palate': 'bg-primary/10 text-primary',
    };
    return colors[cls] || 'bg-muted text-muted-foreground';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover-elevate">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{date}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {sessionId}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Badge className={getClassificationColor(classification)}>{classification}</Badge>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-success"
                />
              </div>
              <span className="text-sm font-semibold text-foreground">{confidence}%</span>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={onViewDetails}
            data-testid={`button-view-details-${sessionId}`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
