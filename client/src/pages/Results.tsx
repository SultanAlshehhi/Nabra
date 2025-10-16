import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Download, Home, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RadialGauge from '@/components/RadialGauge';
import MotivationalCard from '@/components/MotivationalCard';
import Mascot from '@/components/Mascot';

export default function Results() {
  //todo: remove mock functionality
  const result = {
    classification: 'Articulation Disorder',
    confidence: 86,
    sessionId: 'S004',
    date: 'Oct 16, 2025',
  };

  const motivationalMessages = [
    "Great job on completing today's session! Your pronunciation is getting better with each practice.",
    "Keep up the excellent work! Remember, practice makes perfect, and you're doing wonderfully.",
  ];

  const handleDownloadReport = () => {
    console.log('Downloading report...');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-foreground">Session Results</span>
          <Link href="/dashboard/patient">
            <Button variant="ghost" size="sm" data-testid="button-home">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6"
          >
            <div className="flex justify-center">
              <Mascot size="large" message="Amazing work! You completed the session!" />
            </div>

            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-4xl font-bold text-foreground mb-4">Session Complete!</h1>
                <p className="text-lg text-muted-foreground">Here's your analysis for today</p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            <RadialGauge value={result.confidence} label="Confidence Score" size={240} />
            
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Classification:</span>
                <Badge className="text-base px-4 py-1 bg-chart-1/10 text-chart-1">
                  {result.classification}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Session ID: {result.sessionId} • {result.date}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Encouraging Words</h2>
            </div>
            {motivationalMessages.map((message, index) => (
              <MotivationalCard
                key={index}
                message={message}
                icon={index === 0 ? 'trophy' : 'star'}
                delay={1 + index * 0.3}
              />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              variant="outline"
              onClick={handleDownloadReport}
              data-testid="button-download-report"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Report
            </Button>
            <Link href="/session">
              <Button size="lg" data-testid="button-next-session">
                <RotateCcw className="w-5 h-5 mr-2" />
                Start New Session
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
