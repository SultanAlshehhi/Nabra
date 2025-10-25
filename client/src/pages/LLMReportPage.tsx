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

import { marked } from 'marked';
marked.use({ async: false });
declare module 'html-to-text';
import { htmlToText } from 'html-to-text';

import { jsPDF } from 'jspdf';
// @ts-ignore
import notoSans from '../fonts-used/Noto_Sans/NotoSans-Regular.js';

jsPDF.API.events.push(['addFonts', function (this: any) {
  this.addFileToVFS('NotoSans-Regular-normal.ttf', notoSans);
  this.addFont('NotoSans-Regular-normal.ttf', 'NotoSans', 'normal');
}]);


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

  const handleDownloadReport = async () => {
    const doc = new jsPDF();
    
    // Determine target sessionId by inspecting server recordings (fallback to result.sessionId)
    let targetSessionId: string | null = null;
    let recordingsList: Array<{ id: string; sessionId: string; sentence: string; idealPhonemes: string; recordedPhonemes: string; createdAt?: string }> = [];
    try {
      const recRes = await fetch('/api/recordings/with-sentences');
      if (recRes.ok) {
        const recData = await recRes.json();
        const recs: typeof recordingsList = Array.isArray(recData?.recordings) ? recData.recordings : [];
        // sort by createdAt desc if present
        recs.sort((a, b) => {
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tb - ta;
        });
        recordingsList = recs;
        if (recs.length) {
          targetSessionId = recs[0].sessionId;
        }
      }
    } catch {}

    // Fallback to mocked session id if nothing found
    if (!targetSessionId) targetSessionId = result.sessionId;

    // Fetch ONE combined LLM analysis for detected session
    let combined: { analysis: { sessionId: string; analysis: string; items: Array<{ sentence: string; idealPhonemes: string; recordedPhonemes: string }>; timestamp: string } } | null = null;
    try {
      const res = await fetch(`/api/analysis/generate-session/${encodeURIComponent(targetSessionId)}`, { method: 'POST' });
      if (res.ok) {
        combined = await res.json();
      }
    } catch {
      combined = null;
    }
    
    // Header
    doc.setFillColor(168, 200, 194);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('NotoSans', 'bold');
    doc.text('Nabra', 20, 18);
    
    doc.setFontSize(12);
    doc.setFont('NotoSans', 'normal');
    doc.text('Speech Therapy Session Report', 20, 26);
    
    // Patient Information
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('NotoSans', 'bold');
    doc.text('Patient Information', 20, 50);
    
    doc.setFontSize(10);
    doc.setFont('NotoSans', 'normal');
    doc.text(`Name: ${patientInfo.name}`, 20, 58);
    doc.text(`Age: ${patientInfo.age} years`, 20, 64);
    doc.text(`Email: ${patientInfo.email}`, 20, 70);
    doc.text(`Assigned Therapist: ${patientInfo.therapist}`, 20, 76);
    
    // Session Details
    doc.setFontSize(14);
    doc.setFont('NotoSans', 'bold');
    doc.text('Session Details', 20, 88);
    
    doc.setFontSize(10);
    doc.setFont('NotoSans', 'normal');
    doc.text(`Session ID: ${targetSessionId}`, 20, 96);
    doc.text(`Date: ${result.date}`, 20, 102);
    
    // Analysis Results
    doc.setFontSize(14);
    doc.setFont('NotoSans', 'bold');
    doc.text('Analysis Results', 20, 115);
    
    doc.setFillColor(240, 249, 255);
    doc.rect(20, 120, 170, 25, 'F');
    
    doc.setFontSize(11);
    doc.setFont('NotoSans', 'bold');
    doc.text('Classification:', 25, 130);
    doc.setFont('NotoSans', 'normal');
    doc.text(result.classification, 25, 137);
    
    doc.setFont('NotoSans', 'bold');
    doc.text('Confidence Score:', 25, 143);
    doc.setFontSize(16);
    doc.setTextColor(76, 175, 80);
    doc.text(`${result.confidence}%`, 25, 150);
    
    // Session Items (Plain text, no table)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('NotoSans', 'bold');
    doc.text('Session Sentences & Phonemes (Plain Text)', 20, 165);
    
    // layout helpers
    const marginLeft = 20; const contentWidth = 170;
    let yPos = 175;
    const addPageIfNeeded = (neededHeight: number) => {
      if (yPos + neededHeight > 270) { doc.addPage(); yPos = 20; }
    };
    const drawDivider = () => {
      doc.setDrawColor(230, 230, 230);
      doc.line(marginLeft, yPos, marginLeft + contentWidth, yPos);
      yPos += 6;
    };
    
    doc.setFontSize(9);
    doc.setFont('NotoSans', 'normal');

    const items = combined?.analysis?.items || [];
    if (!items.length) {
      const msg = doc.splitTextToSize('No sentences available yet. Record some audio to generate a report.', contentWidth);
      addPageIfNeeded(msg.length * 5.5 + 6);
      doc.text(msg, marginLeft, yPos);
      yPos += msg.length * 5.5 + 6;
    } else {
      items.forEach((it, idx) => {
        const s1 = doc.splitTextToSize(`${idx + 1}. Sentence: ${it.sentence}`, contentWidth);
        const s2 = doc.splitTextToSize(`Ideal phonemes: ${it.idealPhonemes || '-'}`, contentWidth);
        const s3 = doc.splitTextToSize(`Recorded phonemes: ${it.recordedPhonemes || '-'}`, contentWidth);
        const blockHeight = (s1.length + s2.length + s3.length) * 5.5 + 6;
        addPageIfNeeded(blockHeight);
        doc.text(s1, marginLeft, yPos); yPos += s1.length * 5.5;
        doc.text(s2, marginLeft, yPos); yPos += s2.length * 5.5;
        doc.text(s3, marginLeft, yPos); yPos += s3.length * 5.5 + 4;
      });
      drawDivider();
    }
    
    // AI Observations (single combined analysis)
    // Reuse addPageIfNeeded and drawDivider from above
    
    doc.setFontSize(14);
    doc.setFont('NotoSans', 'bold');
    addPageIfNeeded(20);
    doc.text('AI Observations (LLM-Based)', 20, yPos + 5);
    yPos += 15;
    
    if (!combined?.analysis?.analysis) {
      doc.setFontSize(10);
      doc.setFont('NotoSans', 'normal');
      const fallback = doc.splitTextToSize(
        'No AI observations are available yet. Please ensure recordings are processed and try again.',
        170
      );
      addPageIfNeeded(fallback.length * 6 + 10);
      doc.text(fallback, 20, yPos);
      yPos += fallback.length * 6 + 6;
    } else {
  
      
      // Convert Markdown → HTML → plain text, preserving readable structure
      const normalizeAnalysis = async (markdown: string) => {
        if (!markdown) return '';
        const html = await marked(markdown, { breaks: true });
      
        const text = htmlToText(html, {
          wordwrap: 130,
          selectors: [
            { selector: 'strong', format: 'inline' }, // ✅ valid format option
            { selector: 'em', format: 'inline' },     // ✅ same here
          ],
        });
      
        return text;
      };      

      // Title
      doc.setFont('NotoSans', 'bold');
      addPageIfNeeded(6);
      doc.text('LLM Consolidated Analysis:', 20, yPos);
      yPos += 8;
      
      // --- Improved AI Observations rendering ---
      const analysisText = await normalizeAnalysis(combined.analysis.analysis); // <-- await here

      // ✅ use Unicode-safe font (added later in Step 2)
      doc.setFont('NotoSans', 'normal');
      doc.setFontSize(8); // slightly bigger for IPA readability

      // Split first so we can size the shaded box correctly
      const lines = doc.splitTextToSize(analysisText, 170);
      const lineHeight = 5;
      const estimateHeight = lines.length * lineHeight + 6;

      // addPageIfNeeded(estimateHeight);

      // draw background AFTER measuring height
      doc.setFillColor(248, 249, 250);
      doc.rect(18, yPos - 4, 174, estimateHeight + 8, 'F');

      // then draw text
      lines.forEach((ln: string) => {
        addPageIfNeeded(lineHeight + 2);
        doc.text(ln, 20, yPos);
        yPos += lineHeight;
      });

      // restore font
      doc.setFont('NotoSans', 'normal');
      doc.setFontSize(10);
      yPos += 4;
      drawDivider();


      // Restore default size for subsequent sections
      doc.setFontSize(10);
      yPos += 4;
      drawDivider();
    }
    
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
