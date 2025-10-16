import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Mic, Search, Users, Calendar, FileText, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import PatientCard from '@/components/PatientCard';

export default function TherapistDashboard() {
  //todo: remove mock functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [patients] = useState([
    { name: 'John Doe', age: 7, lastSession: 'Oct 15, 2025', totalSessions: 5, latestClassification: 'Articulation Disorder' },
    { name: 'Sarah Smith', age: 8, lastSession: 'Oct 14, 2025', totalSessions: 12, latestClassification: 'Phonological Impairment' },
    { name: 'Mike Johnson', age: 6, lastSession: 'Oct 13, 2025', totalSessions: 3, latestClassification: 'Vowel Disorder' },
    { name: 'Emma Wilson', age: 9, lastSession: 'Oct 12, 2025', totalSessions: 8, latestClassification: 'Childhood Apraxia of Speech' },
    { name: 'David Brown', age: 7, lastSession: 'Oct 11, 2025', totalSessions: 15, latestClassification: 'Articulation Disorder' },
    { name: 'Lisa Martinez', age: 10, lastSession: 'Oct 10, 2025', totalSessions: 6, latestClassification: 'Inconsistent Phonological Impairment' },
  ]);

  const stats = [
    { label: 'Total Patients', value: '24', icon: Users },
    { label: 'Sessions This Week', value: '18', icon: Calendar },
    { label: 'Pending Reports', value: '3', icon: FileText },
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Mic className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SpeechEase</span>
            <span className="text-sm text-muted-foreground ml-2">Therapist Portal</span>
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Therapist Dashboard</h1>
            <p className="text-lg text-muted-foreground">Manage and monitor your patients' progress</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <stat.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">Patient List</h2>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-patients"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient, index) => (
              <motion.div
                key={patient.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <PatientCard
                  {...patient}
                />
              </motion.div>
            ))}
          </div>

          {filteredPatients.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No patients found matching "{searchQuery}"</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
}
