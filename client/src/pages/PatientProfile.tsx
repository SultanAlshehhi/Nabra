import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import SessionCard from '@/components/SessionCard';

export default function PatientProfile() {
  const [location] = useLocation();
  const isTherapist = location.includes('therapist');

  //todo: remove mock functionality
  const patientData = {
    name: 'John Doe',
    age: 7,
    email: 'john.doe@example.com',
    therapist: 'Dr. Sarah Thompson',
    totalSessions: 5,
    latestClassification: 'Articulation Disorder',
  };

  const [sessions] = useState([
    { sessionId: 'S003', date: 'Oct 15, 2025', classification: 'Articulation Disorder', confidence: 86 },
    { sessionId: 'S002', date: 'Oct 13, 2025', classification: 'Phonological Impairment', confidence: 78 },
    { sessionId: 'S001', date: 'Oct 11, 2025', classification: 'Articulation Disorder', confidence: 72 },
  ]);

  const initials = patientData.name.split(' ').map(n => n[0]).join('').toUpperCase();
  const backUrl = isTherapist ? '/dashboard/therapist' : '/dashboard/patient';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={backUrl}>
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Patient Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-foreground">{patientData.name}</h2>
                  <p className="text-lg text-muted-foreground">Age {patientData.age}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-base font-medium text-foreground">{patientData.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned Therapist</p>
                    <p className="text-base font-medium text-foreground">{patientData.therapist}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                    <p className="text-base font-medium text-foreground">{patientData.totalSessions}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Latest Result</p>
                    <p className="text-base font-medium text-foreground">{patientData.latestClassification}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Session History</h2>
            <div className="grid gap-6">
              {sessions.map((session, index) => (
                <motion.div
                  key={session.sessionId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SessionCard
                    {...session}
                    viewerRole={isTherapist ? 'therapist' : 'patient'}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
