import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Mic, Plus, TrendingUp, Calendar, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SessionCard from '@/components/SessionCard';
import Mascot from '@/components/Mascot';

export default function PatientDashboard() {
  //todo: remove mock functionality
  const [sessions] = useState([
    { sessionId: 'S003', date: 'Oct 15, 2025', classification: 'Articulation Disorder', confidence: 86 },
    { sessionId: 'S002', date: 'Oct 13, 2025', classification: 'Phonological Impairment', confidence: 78 },
    { sessionId: 'S001', date: 'Oct 11, 2025', classification: 'Articulation Disorder', confidence: 72 },
  ]);

  const stats = [
    { label: 'Total Sessions', value: '3', icon: Calendar },
    { label: 'Latest Score', value: '86%', icon: TrendingUp },
    { label: 'This Week', value: '2', icon: Mic },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Mic className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SpeechEase</span>
          </div>
          <Link href="/">
            <Button variant="ghost" data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back, John!</h1>
              <p className="text-lg text-muted-foreground">Ready for another practice session?</p>
            </div>
            <Link href="/session">
              <Button size="lg" className="h-12" data-testid="button-new-session">
                <Plus className="w-5 h-5 mr-2" />
                Start New Session
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Your Sessions</h2>
            </div>

            {sessions.length > 0 ? (
              <div className="grid gap-6">
                {sessions.map((session, index) => (
                  <motion.div
                    key={session.sessionId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <SessionCard
                      {...session}
                      onViewDetails={() => console.log('View details:', session.sessionId)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No sessions yet. Start your first session to begin!</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Overall Improvement</span>
                      <span className="font-semibold text-foreground">+14%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '72%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-success"
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-3">Keep practicing to improve your score!</p>
                    <Link href="/session">
                      <Button className="w-full" data-testid="button-practice-now">
                        Practice Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Mascot size="medium" message="Great progress! Keep it up!" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
