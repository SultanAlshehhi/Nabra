import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Download, Home, RotateCcw, Sparkles, Calendar, Stethoscope, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RadialGauge from '@/components/RadialGauge';
import MotivationalCard from '@/components/MotivationalCard';
import Mascot from '@/components/Mascot';
import { jsPDF } from 'jspdf';

export default function Results() {
  //todo: remove mock functionality
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentBooked, setAppointmentBooked] = useState(false);

  const result = {
    classification: 'Articulation Disorder',
    confidence: 86,
    sessionId: 'S004',
    date: 'Oct 16, 2025',
  };

  const patientInfo = {
    name: 'Abdulla A.',
    age: 7,
    email: 'Abdulla.A@example.com',
    therapist: 'Dr. Sarah Thompson',
  };

  const doctors = [
    { id: 'dr1', name: 'Dr. Sarah Thompson', specialty: 'Speech Therapy', available: ['2025-10-20', '2025-10-22', '2025-10-24'] },
    { id: 'dr2', name: 'Dr. Michael Chen', specialty: 'ENT Specialist', available: ['2025-10-21', '2025-10-23', '2025-10-25'] },
    { id: 'dr3', name: 'Dr. Emily Rodriguez', specialty: 'Pediatric Speech', available: ['2025-10-20', '2025-10-22', '2025-10-24'] },
  ];

  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  const handleBookAppointment = () => {
    if (selectedDoctor && selectedDate && selectedTime) {
      setAppointmentBooked(true);
      setIsBookingOpen(false);
      // In a real app, this would save to a database
      console.log('Appointment booked:', { selectedDoctor, selectedDate, selectedTime });
    }
  };


  const motivationalMessages = [
    "Great job on completing today's session! Your pronunciation is getting better with each practice.",
    "Keep up the excellent work! Remember, practice makes perfect, and you're doing wonderfully.",
  ];

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(168, 200, 194);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Nabra', 20, 18);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Speech Therapy Session Report', 20, 26);
    
    // Patient Information
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information', 20, 50);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${patientInfo.name}`, 20, 58);
    doc.text(`Age: ${patientInfo.age} years`, 20, 64);
    doc.text(`Email: ${patientInfo.email}`, 20, 70);
    doc.text(`Assigned Therapist: ${patientInfo.therapist}`, 20, 76);
    
    // Session Details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Session Details', 20, 88);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Session ID: ${result.sessionId}`, 20, 96);
    doc.text(`Date: ${result.date}`, 20, 102);
    
    // Analysis Results
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Analysis Results', 20, 115);
    
    doc.setFillColor(240, 249, 255);
    doc.rect(20, 120, 170, 25, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Classification:', 25, 130);
    doc.setFont('helvetica', 'normal');
    doc.text(result.classification, 25, 137);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Confidence Score:', 25, 143);
    doc.setFontSize(16);
    doc.setTextColor(76, 175, 80);
    doc.text(`${result.confidence}%`, 25, 150);
    
    // Phonetic Transcript Analysis
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Phonetic Transcript Analysis', 20, 165);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Detailed transcript data with analysis
    const transcriptData = [
      { 
        word: 'Kenny', 
        phonetic: '/ˈkɛni/', 
        correct: true, 
        analysis: 'Clear /k/ onset, proper vowel production'
      },
      { 
        word: 'drank', 
        phonetic: '/dræŋk/', 
        correct: false, 
        analysis: 'Substitution of /d/ for /dr/, nasal /ŋ/ unclear'
      },
      { 
        word: 'a', 
        phonetic: '/ə/', 
        correct: true, 
        analysis: 'Schwa sound produced correctly'
      },
      { 
        word: 'tiny', 
        phonetic: '/ˈtaɪni/', 
        correct: true, 
        analysis: 'Good diphthong /aɪ/ production'
      },
      { 
        word: 'tin', 
        phonetic: '/tɪn/', 
        correct: true, 
        analysis: 'Clear alveolar /t/ and /n/ sounds'
      },
      { 
        word: 'of', 
        phonetic: '/ʌv/', 
        correct: true, 
        analysis: 'Proper /v/ production'
      },
      { 
        word: 'coke', 
        phonetic: '/koʊk/', 
        correct: false, 
        analysis: 'Final /k/ omitted, diphthong /oʊ/ unclear'
      },
    ];
    
    let yPos = 175;
    
    // Overall Statistics
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Session Summary:', 20, yPos);
    yPos += 7;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('• Total words analyzed: 7', 25, yPos);
    yPos += 5;
    doc.text('• Words pronounced correctly: 5 (71%)', 25, yPos);
    yPos += 5;
    doc.text('• Words needing improvement: 2 (29%)', 25, yPos);
    yPos += 5;
    doc.text('• Primary error patterns: Cluster reduction, Final consonant deletion', 25, yPos);
    yPos += 8;
    
    // Detailed Analysis
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Phonetic Analysis:', 20, yPos);
    yPos += 7;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    transcriptData.forEach(item => {
      if (!item.correct) {
        doc.setTextColor(200, 0, 0); // Red for incorrect
        doc.text(`❌ ${item.word} (${item.phonetic})`, 25, yPos);
        yPos += 4;
        doc.text(`   Error: ${item.analysis}`, 30, yPos);
        yPos += 6;
      } else {
        doc.setTextColor(0, 150, 0); // Green for correct
        doc.text(`✅ ${item.word} (${item.phonetic}) - ${item.analysis}`, 25, yPos);
        yPos += 5;
      }
    });
    
    doc.setTextColor(0, 0, 0);
    yPos += 5;
    
    // AI Observations
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Observations', 20, yPos + 5);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const observations = doc.splitTextToSize(
      'The patient demonstrated good effort during the session. Mispronunciation patterns were detected in alveolar consonants, particularly /r/ and /k/ phonemes. The patient showed difficulty with final consonant sounds and voiced/voiceless distinctions.',
      170
    );
    doc.text(observations, 20, yPos + 15);
    
    // Next Steps & Recommendations
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Next Steps & Recommendations', 20, yPos + 35);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Immediate Actions
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Immediate Actions (Next 1-2 weeks):', 20, yPos + 45);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('• Continue AI practice sessions 3x per week focusing on cluster sounds', 25, yPos + 52);
    doc.text('• Practice /dr/ and /kr/ blends using provided exercises', 25, yPos + 58);
    doc.text('• Work on final consonant production (/k/, /t/, /n/)', 25, yPos + 64);
    doc.text('• Monitor progress with weekly assessments', 25, yPos + 70);
    
    // Appointment-Specific Recommendations
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Appointment-Specific Next Steps:', 20, yPos + 82);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Speech Therapy Appointment
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('🎯 Speech Therapy Appointment (Recommended: Within 2 weeks)', 25, yPos + 90);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('• In-person assessment of oral motor function', 30, yPos + 97);
    doc.text('• Detailed articulation testing with standardized tools', 30, yPos + 103);
    doc.text('• Custom therapy plan development based on error patterns', 30, yPos + 109);
    doc.text('• Parent/caregiver training for home practice', 30, yPos + 115);
    
    // ENT Consultation
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('🏥 ENT Consultation (Recommended: Within 1 month)', 25, yPos + 127);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('• Comprehensive hearing evaluation', 30, yPos + 134);
    doc.text('• Oral cavity and throat examination', 30, yPos + 140);
    doc.text('• Rule out structural abnormalities affecting speech', 30, yPos + 146);
    doc.text('• Assessment of nasal resonance and airflow', 30, yPos + 152);
    
    // Follow-up Schedule
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('📅 Follow-up Schedule:', 20, yPos + 164);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('• Week 1-2: Daily AI practice + Speech therapy evaluation', 25, yPos + 171);
    doc.text('• Week 3-4: Begin formal therapy + ENT consultation', 25, yPos + 177);
    doc.text('• Month 2: Progress assessment and therapy plan adjustment', 25, yPos + 183);
    doc.text('• Month 3: Comprehensive re-evaluation', 25, yPos + 189);
    
    // Footer
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 275, 210, 22, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by Nabra AI Platform', 20, 285);
    doc.text(`Report generated on: ${new Date().toLocaleDateString()}`, 20, 291);
    
    // Save the PDF
    doc.save(`Nabra_Report_${result.sessionId}_${patientInfo.name.replace(/\s+/g, '_')}.pdf`);
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
            className="space-y-8"
          >
            {/* Next Steps Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  Next Steps & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Immediate Actions</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        Continue regular practice sessions (2x per week)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        Practice tongue placement exercises for /r/ and /k/ sounds
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        Focus on final consonant sounds
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Medical Recommendations</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                        Schedule throat scan to rule out structural issues
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                        Consider ENT consultation for comprehensive evaluation
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                        Book in-person assessment with speech therapist
                      </li>
                    </ul>
                  </div>
                </div>

                {appointmentBooked ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 text-green-800 dark:text-green-400">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">Appointment Booked Successfully!</span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Your appointment has been scheduled. You'll receive a confirmation email shortly.
                    </p>
                  </motion.div>
                ) : (
                  <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" data-testid="button-book-appointment">
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Book an Appointment</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="doctor">Select Doctor</Label>
                          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a doctor" />
                            </SelectTrigger>
                            <SelectContent>
                              {doctors.map((doctor) => (
                                <SelectItem key={doctor.id} value={doctor.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{doctor.name}</span>
                                    <span className="text-xs text-muted-foreground">{doctor.specialty}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="date">Select Date</Label>
                          <Select value={selectedDate} onValueChange={setSelectedDate}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a date" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedDoctor && doctors.find(d => d.id === selectedDoctor)?.available.map((date) => (
                                <SelectItem key={date} value={date}>
                                  {new Date(date).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="time">Select Time</Label>
                          <Select value={selectedTime} onValueChange={setSelectedTime}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Button 
                          onClick={handleBookAppointment} 
                          className="w-full"
                          disabled={!selectedDoctor || !selectedDate || !selectedTime}
                        >
                          Confirm Appointment
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
