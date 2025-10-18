import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Mic, Search, Users, Calendar, FileText, LogOut, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PatientCard from '@/components/PatientCard';
import nabraLogo from '@assets/attached_assets/Nabra.png';

export default function TherapistDashboard() {
  //todo: remove mock functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [patients] = useState([
    { name: 'Abdulla A.', age: 7, lastSession: 'Oct 15, 2025', totalSessions: 5, latestClassification: 'Articulation Disorder' },
    { name: 'Sarah Smith', age: 8, lastSession: 'Oct 14, 2025', totalSessions: 12, latestClassification: 'Phonological Impairment' },
    { name: 'Mike Abdullason', age: 6, lastSession: 'Oct 13, 2025', totalSessions: 3, latestClassification: 'Vowel Disorder' },
    { name: 'Emma Wilson', age: 9, lastSession: 'Oct 12, 2025', totalSessions: 8, latestClassification: 'Childhood Apraxia of Speech' },
    { name: 'David Brown', age: 7, lastSession: 'Oct 11, 2025', totalSessions: 15, latestClassification: 'Articulation Disorder' },
    { name: 'Lisa Martinez', age: 10, lastSession: 'Oct 10, 2025', totalSessions: 6, latestClassification: 'Inconsistent Phonological Impairment' },
  ]);

  const [appointments] = useState([
    { id: 'A001', patient: 'Abdulla A.', doctor: 'Dr. Sarah Thompson', date: 'Oct 20, 2025', time: '10:00 AM', status: 'confirmed', type: 'Speech Therapy' },
    { id: 'A002', patient: 'Sarah Smith', doctor: 'Dr. Michael Chen', date: 'Oct 21, 2025', time: '2:00 PM', status: 'pending', type: 'ENT Consultation' },
    { id: 'A003', patient: 'Mike Abdullason', doctor: 'Dr. Emily Rodriguez', date: 'Oct 22, 2025', time: '11:00 AM', status: 'confirmed', type: 'Pediatric Assessment' },
    { id: 'A004', patient: 'Emma Wilson', doctor: 'Dr. Sarah Thompson', date: 'Oct 23, 2025', time: '3:00 PM', status: 'pending', type: 'Follow-up' },
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
            <img src={nabraLogo} alt="Nabra Logo" className="w-10 h-10" />
            <span className="text-xl font-bold text-foreground">Nabra</span>
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
          <Tabs defaultValue="patients" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="patients">Patient Management</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="patients" className="space-y-6">
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
            </TabsContent>
            
            <TabsContent value="appointments" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground">Appointment Management</h2>
                <Badge variant="outline" className="text-sm">
                  {appointments.length} Total Appointments
                </Badge>
              </div>

              <div className="grid gap-4">
                {appointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{appointment.patient}</h3>
                              <p className="text-sm text-muted-foreground">{appointment.doctor}</p>
                              <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">{appointment.date}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">{appointment.time}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {appointment.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                              className="text-sm"
                            >
                              {appointment.status}
                            </Badge>
                            {appointment.status === 'pending' && (
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                  <XCircle className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
