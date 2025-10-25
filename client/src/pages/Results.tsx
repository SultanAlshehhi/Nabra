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
// @ts-ignore
import NotoSansBold from '../fonts-used/Noto_Sans/NotoSans-Bold.js';

jsPDF.API.events.push(['addFonts', function (this: any) {
  this.addFileToVFS('NotoSans-Regular-normal.ttf', notoSans);
  this.addFileToVFS('NotoSans-Bold.ttf', NotoSansBold);
  this.addFont('NotoSans-Regular-normal.ttf', 'NotoSans', 'normal');
  this.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
}]);


export default function Results() {
  //todo: remove mock functionality
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentBooked, setAppointmentBooked] = useState(false);
  const LINE_SPACING = 0.8; // 0.8 = tighter; 1.0 = normal; 1.2 = loose


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

  // --- PDF helper: minimal table drawer (keeps headers + rows on page) ---
  // --- PDF Layout Helpers (replace old helpers) ---
  type JsPDFLike = {
    internal: { pageSize: { getWidth(): number; getHeight(): number } };
    addPage(): void;
    setFont(arg0: string, arg1?: string): void;
    setFontSize(n: number): void;
    setTextColor(r: number, g: number, b: number): void;
    setDrawColor(r: number, g: number, b: number): void;
    setFillColor(r: number, g: number, b: number): void;
    rect(x:number,y:number,w:number,h:number,style?:'S'|'F'|'DF'|'FD'): void;
    text(txt: string | string[], x: number, y: number, options?: any): void;
    splitTextToSize(txt: string, maxWidth: number): string[];
  };

  const PDF_MARGIN = 20;
  const HEADER_FOOTER_GAP = 10;

  // Computes the safe content box for the current page
  function getBox(doc: JsPDFLike) {
    const PW = doc.internal.pageSize.getWidth();
    const PH = doc.internal.pageSize.getHeight();
    return {
      x: PDF_MARGIN,
      yTop: PDF_MARGIN,
      yBottom: PH - PDF_MARGIN,
      w: PW - PDF_MARGIN * 2,
      h: PH - PDF_MARGIN * 2,
      pageW: PW,
      pageH: PH,
    };
  }

  // Ensure we have vertical space; if not, add a page and reset y
  function ensureSpace(doc: JsPDFLike, y: number, needed: number) {
    const { yBottom } = getBox(doc);
    if (y + needed > yBottom) {
      doc.addPage();
      return getBox(doc).yTop;
    }
    return y;
  }

  // Write a wrapped paragraph and return the new cursor y
  function writeParagraph(
    doc: JsPDFLike,
    text: string,
    y: number,
    opts?: { font?: [string, 'normal'|'bold'|'italic'], size?: number, gap?: number }
  ) {
    const { x, w } = getBox(doc);
    const size = opts?.size ?? 10;
    const font = opts?.font ?? ['NotoSans', 'normal'];
    const gap = opts?.gap ?? 5; // 🔹 slightly increased padding (1–2 is subtle, 4+ is roomy)
  
    doc.setFont(font[0], font[1]);
    doc.setFontSize(size);
  
    const lines = doc.splitTextToSize(text, w);
    const lineHeight = size * 0.35 + 1.2; // same compact line height
    const needed = lines.length * lineHeight * LINE_SPACING;
  
    y = ensureSpace(doc, y, needed);
    doc.text(lines, x, y + size * 0.35);
  
    // ✅ Add gentle bottom spacing — just a small bump
    return y + needed + gap;
  }
  
  // Section title helper
  function writeTitle(doc: JsPDFLike, title: string, y: number, opts?: { bold?: boolean }) {
    const { x } = getBox(doc);
    doc.setFont('NotoSans', opts?.bold ? 'bold' : 'normal');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    y = ensureSpace(doc, y, 12);
    doc.text(title, x, y + 10);
    return y + 16;
  }  

  // Bullet list helper
  function writeBullets(doc: JsPDFLike, items: string[], y: number) {
    const { x, w } = getBox(doc);
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(10);
    for (const item of items) {
      const lines = doc.splitTextToSize(`• ${item}`, w);
      const needed = lines.length * 7 * LINE_SPACING;
      y = ensureSpace(doc, y, needed);
      doc.text(lines, x, y + 5);
      y += needed;
    }
    return y + 2;
  }

  // Helper to draw a bold mini-heading before each paragraph
  function writeSubheading(doc: jsPDF, text: string, y: number) {
    const { x } = getBox(doc);
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(11);
    y = ensureSpace(doc, y, 10);
    doc.text(text, x, y + 6);
    doc.setFont('NotoSans', 'normal');
    return y + 8; // small space between heading and paragraph
  }

  // Robust table drawer: pre-measures row heights to avoid bleed/overlap.
  function drawPdfTable(opts: {
    doc: JsPDFLike;
    startY: number;
    headers: string[];
    rows: string[][];
    colWidths: number[]; // MUST sum to <= content width
    headerFill?: [number, number, number];
  }) {
    const { doc, headers, rows, colWidths } = opts;
    const headerFill = opts.headerFill ?? [245, 245, 245];

    const box = getBox(doc);
    const x0 = box.x;
    const maxW = box.w;

    // column widths validation
    const sumW = colWidths.reduce((a, b) => a + b, 0);
    if (sumW > maxW) throw new Error('colWidths exceed content width');

    let y = opts.startY;
    const rowPadX = 2;
    const baseRowH = 8;

    // Draw header
    y = ensureSpace(doc, y, baseRowH);
    doc.setFillColor(...headerFill);
    doc.rect(x0, y, sumW, baseRowH, 'F');
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    let cx = x0 + rowPadX;
    headers.forEach((h, i) => {
      doc.text(doc.splitTextToSize(h, colWidths[i] - 2 * rowPadX), cx, y + 5);
      cx += colWidths[i];
    });
    y += baseRowH;

    // Draw rows
    rows.forEach((r) => {
      // measure row height first
      let rowH = baseRowH;
      const cellLines: string[][] = [];
      for (let i = 0; i < r.length; i++) {
        const wrap = doc.splitTextToSize(r[i], colWidths[i] - 2 * rowPadX);
        cellLines[i] = wrap;
        const h = Math.max(baseRowH, wrap.length * 6 + 2);
        if (h > rowH) rowH = h;
      }

      y = ensureSpace(doc, y, rowH);
      let cx2 = x0;

      // cell boxes
      doc.setDrawColor(230, 230, 230);
      for (let i = 0; i < r.length; i++) {
        doc.rect(cx2, y, colWidths[i], rowH, 'S');
        cx2 += colWidths[i];
      }

      // cell text
      cx2 = x0 + rowPadX;
      for (let i = 0; i < r.length; i++) {
        doc.text(cellLines[i], cx2, y + 5);
        cx2 += colWidths[i];
      }

      y += rowH;
    });

    return y + 1.5;
  }


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
    doc.setFillColor(15, 36, 82);
    doc.rect(0, 0, 210, 35, 'F');

    // === Title in header (bold, centered, white) ===
    try { doc.setFont('NotoSans', 'bold'); } catch { doc.setFont('NotoSans', 'normal'); }
    doc.setFontSize(23);
    doc.setTextColor(255, 255, 255);
    doc.text('NABRA | Speech Therapy Session Report', getBox(doc).pageW / 2, 22, { align: 'center' });
    // restore text color for body
    doc.setTextColor(0, 0, 0);

    // --- Start content Y safely below header ---
    let y = ensureSpace(doc, Math.max(getBox(doc).yTop, 45), 0);

    // === Patient & Session Summary (table BEFORE clinical report) ===
    y = writeTitle(doc, 'Patient & Session Summary', y, { bold: true });

    // Build 4-column key/value table
    const patientRows: string[][] = [
      ['Name', 'Abdulla A.', 'Age', '7 years'],
      ['Email', 'Abdulla.A@example.com', 'Assigned Therapist', 'Dr. Sarah Thompson'],
      ['Session ID', targetSessionId ?? 'd10e2109-0754-4a95-8f1f-b13ee1a3283b', 'Date', 'Oct 16, 2025'],
      ['Clinic', 'NABRA Pediatric Speech Center', 'Evaluator', 'Dr. Sarah Thompson, SLP'],
      ['Report ID', crypto.randomUUID().slice(0, 8).toUpperCase(), 'Generated', new Date().toLocaleString()],
    ];

    // Draw patient info table
    y = drawPdfTable({
      doc,
      startY: y,
      headers: ['Field', 'Value', 'Field', 'Value'],
      rows: patientRows,
      colWidths: [28, 70, 28, getBox(doc).w - (28 + 70 + 28)],
      headerFill: [245, 245, 245],
    });

    y = writeTitle(doc, '______________________________________________________________________________', y);
    y += 0; // add a bit of space before main content

    // === Clinical Report Content begins ===
    y = writeTitle(doc, '1.0 | Most Common and Severe Phoneme-Level Mismatches', y, { bold: true });
    y = writeParagraph(
      doc,
      'Across all samples, there is a consistent deviation between target consonant place and manner of articulation, alongside notable vowel centralization and length distortions. The following table outlines the most critical mismatches:',
      y,
      { size: 10, gap: 4 }
    );


    // Table rows (example content — use your real data if different)
    const mismatchRows: string[][] = [
      ['/k/ (k, c)', '[tʰ], [ɕ], [tɕʰ]', 'Fronting / Affrication', 'Velar stops replaced by alveolar or palatal sounds. Indicates difficulty controlling tongue placement.'],
      ['/d/, /ɡ/', '[ɳ], [ɖ], [tʂ], [d̪]', 'Retroflexion / Misvoicing', 'Alveolar stops produced with retroflex or dental posture, reducing voicing accuracy.'],
      ['/ʂ/, /ʃ/ (sh)', '[s], [ɕ], [ts]', 'Deaffrication / Palatalization', 'Postalveolar fricatives substituted by alveolar/palatal variants; loss of sibilant contrast.'],
      ['/ɹ/ (r)', '[l], [ɻ], [ɹ̩]', 'Gliding / Distortion', 'Variable realization of /ɹ/, often lateralized or replaced by approximants.'],
      ['/æ/, /ɑ/, /ɛ/', '[ʌ], [ɤ̆], [ɒ], [ɔ]', 'Vowel centralization / backing', 'High degree of vowel distortion, centralization toward schwa or back vowels.'],
      ['/ð/ (th)', '[t], [s], omitted', 'Stopping / Omission', 'Consistent inability to produce interdental fricatives.'],
      ['/t͡ʃʲ/ (ch)', '[tɕʰ], [ts], [ɕ]', 'Manner distortion', 'Affricate inconsistently maintained; loss of aspiration/voicing control.'],
    ];

    // Table
    y = drawPdfTable({
      doc,
      startY: y,
      headers: ['Target Phoneme', 'Disordered', 'Type of Error', 'Description'],
      rows: mismatchRows, // ✅ required
      colWidths: [38, 40, 36, getBox(doc).w - (38 + 40 + 36)],
      headerFill: [245, 245, 245],
    });

    // Summary line
    y = writeParagraph(
      doc,
      'Summary: Severe errors on alveolar, velar, postalveolar targets; affricates/fricatives/velar stops most affected; vowel centralization suggests motor planning or oral posture instability.',
      y,
      { size: 10, gap: 4 }
    );

    // Next section
    y = writeTitle(doc, '2.0 | Observed Speech Error Patterns Across the Session', y, { bold: true });
    y = writeParagraph(doc, 'Consonant Substitution Patterns:', y, { size: 11, gap: 2 , font: ['NotoSans', 'bold']});
    y = writeBullets(doc, [
      'Velar fronting: /k/, /g/ → [t], [tʰ], [ts]',
      'Affricate simplification: /t͡ʃʲ/ → [tɕʰ], [ɕ], or [ts]',
      'Devoicing/aspiration inconsistency on voiced stops',
      'Liquid simplification: /ɹ/ → [l] or [ɻ]',
    ], y);

    y = writeParagraph(doc, 'Vowel Errors:', y, { size: 10, gap: 0, font: ['NotoSans', 'bold']});
    y = writeBullets(doc, [
      'Strong vowel centralization toward [ʌ]/[ɤ̆]',
      'Occasional vowel length distortion',
    ], y);

    y = writeParagraph(doc, 'Syllable and Prosody:', y, { size: 10, gap: 0 , font: ['NotoSans', 'bold']});
    y = writeBullets(doc, [
      'Glottal insertion ([ʔ]) and abnormal timing',
      'Reduced coarticulation and misplaced stress',
    ], y);

    y = writeParagraph(doc, 'Consistency:', y, { size: 10, gap: 0 , font: ['NotoSans', 'bold']});
    y = writeBullets(doc, [
      'Non-uniform errors; realizations vary by context—suggests phonological planning issues',
    ], y);

    // Diagnoses table
    y = writeTitle(doc, '3.0 | Possible Diagnoses (with Confidence Scores)', y, {  bold: true });
    y = drawPdfTable({
      doc,
      startY: y,
      headers: ['Diagnosis', 'Confidence (0–1)', 'Rationale'],
      colWidths: [64, 32, getBox(doc).w - (64 + 32)],
      headerFill: [245, 245, 245],
      rows: [
        ['Inconsistent Phonological Disorder', '0.80', 'High variability; inconsistent substitutions and occasional correct productions.'],
        ['Childhood Apraxia of Speech (CAS)', '0.65', 'Disrupted prosody, vowel distortions, poor articulatory transitions.'],
        ['Phonological Impairment', '0.55', 'Rule errors (e.g., velar fronting) indicate phonological component.'],
        ['Vowel Disorder', '0.40', 'Centralization evident but likely secondary to planning/instability.'],
        ['Articulation Disorder', '0.25', 'Patterns systemic rather than peripheral/isolated articulations.'],
        ['Cleft Palate', '0.05', 'No hypernasality/nasal emission patterns typical of structural deficits.'],
      ],
    });

    // Recommendations + Summary
    y = writeTitle(doc, '4.0 | Recommendations and Next Steps', y, { bold: true });
    // === Expanded recommendations ===

    // 1️⃣ Integrated Phonological–Motor Therapy
    y = writeSubheading(doc, '4.1 Integrated Phonological–Motor Therapy', y);
    y = writeParagraph(doc,
      'Integrated phonological–motor therapy should serve as the primary intervention framework. This approach merges linguistic rule learning (phonological contrast) with direct articulatory motor practice to enhance speech motor planning. Sessions should emphasize linking sound awareness to articulatory gestures—helping the patient understand how sounds feel, not just how they sound. Core vocabulary practice (10–15 meaningful words) should be performed in high-frequency, short sessions, reinforcing accurate productions before introducing new targets. Each word should be practiced in multiple linguistic contexts (word, phrase, and sentence) to promote generalization and reduce dependence on imitation.',
      y, { size: 10 }
    );

    // 2️⃣ Stabilizing Sound Contrasts
    y = writeSubheading(doc, '4.2 Stabilizing Sound Contrasts', y);
    y = writeParagraph(doc,
      'A major goal is to stabilize contrastive sound pairs currently confused by the patient, such as /k/ vs /t/, /ʃ/ vs /s/, and /ɹ/ vs /l/. Therapy activities should use minimal pair drills, visual feedback tools (mirrors, tongue placement charts), and auditory discrimination exercises to help the child perceive and articulate each contrast accurately. Initial practice can include “sound games” contrasting words (e.g., “tea” vs “key”), progressing to spontaneous use in short phrases. As accuracy stabilizes, contrasts should be incorporated into natural speech to ensure functional transfer across settings.',
      y, { size: 10 }
    );

    // Small subheading for the table (bold, compact)
    y = writeSubheading(doc, '    4.2.1 Minimal Pairs & Targets (Clinic Use)', y);

    // Table rows
    const contrastsRows: string[][] = [
      ['/k/ vs /t/', 'key – tea, coat – tote, coal – toll', 'Tongue dorsum up/back vs tip alveolar'],
      ['/ʃ/ vs /s/', 'ship – sip, shoe – sue, cash – cass', 'Postalveolar lip rounding vs alveolar unrounded'],
      ['/ɹ/ vs /l/', 'ray – lay, rip – lip, crown – clown', 'Bunched/retroflex vs lateral airflow'],
    ];

    // Draw table (compact)
    y = drawPdfTable({
      doc,
      startY: y,
      headers: ['Contrast', 'Example Minimal Pairs', 'Key Cue'],
      rows: contrastsRows,
      colWidths: [28, getBox(doc).w - (28 + 56), 56], // middle column fills remaining
      headerFill: [245, 245, 245],
    });

    // 3️⃣ Vowel Drills and Prosody Training
    y = writeSubheading(doc, '4.3 Vowel Drills and Prosody Training', y);
    y = writeParagraph(doc,
      'Focused vowel drills are recommended to address vowel centralization and timing errors. Visual–kinesthetic tools (vowel quadrants, articulation apps) can help visualize tongue height and lip rounding. Sessions should emphasize consistent vowel height and front–back positioning, with real-time auditory feedback to guide correction. Prosody training—using rhythmic pacing (metronome tapping, clapping) and stress contrast exercises (“REcord” vs “reCORD”)—will improve syllable timing, speech rhythm, and natural intonation. These activities reinforce smooth coarticulation and enhance overall speech intelligibility.',
      y, { size: 10 }
    );

    // 4️⃣ Structured Home Practice and Caregiver Involvement
    y = writeSubheading(doc, '4.4 Structured Home Practice and Caregiver Involvement', y);
    y = writeParagraph(doc,
      'Home practice is critical for retention and carryover. Caregivers should conduct guided practice sessions twice daily, using 5–10 personalized words per week containing the target sounds. Each practice should focus on slow, deliberate articulation, with positive feedback and video or audio playback for self-monitoring. Therapists should provide weekly feedback on submitted recordings, ensuring the child maintains consistent sound contrasts. Parental modeling and visual cues (mirror, tablet camera) can further strengthen awareness and improve generalization in everyday speech.',
      y, { size: 10 }
    );

    y = writeSubheading(doc, '    4.4.1 Home Practice Micro-Schedule (Week at a Glance)', y);

    const homePracticeRows: string[][] = [
      ['Mon–Fri', '2×/day, 5 min', 'Target word set (5–10 words), slow clear reps, mirror/phone camera'],
      ['Sat', '1×/day, 8–10 min', 'Phrase practice w/ targets; record 1 short clip for therapist feedback'],
      ['Sun', 'Review, 5–8 min', 'Light review; pick 2 “star words” for next week’s carryover'],
      ['Cues', '—', 'Visual (mirror), tactile (tongue/lip cues), playback for self-monitoring'],
      ['Caregiver', '—', 'Positive reinforcement; log 1–2 notes on easiest and hardest words'],
    ];

    y = drawPdfTable({
      doc,
      startY: y,
      headers: ['Day', 'Dosage', 'Activity'],
      rows: homePracticeRows,
      colWidths: [24, 26, getBox(doc).w - (24 + 26)],
      headerFill: [245, 245, 245],
    });

    // 5️⃣ Expected Outcomes and Progress Monitoring
    y = writeSubheading(doc, '4.5 Expected Outcomes and Progress Monitoring', y);
    y = writeParagraph(doc,
      'With consistent attendance (2–3 sessions per week) and active home participation, measurable improvements in articulation and speech intelligibility are expected within 10–12 weeks. Observable progress should include more consistent production of target contrasts, reduction of vowel distortion, and smoother prosodic transitions. Progress should be documented via periodic phoneme accuracy scores, perceptual intelligibility ratings, and acoustic formant analyses. Therapy should remain adaptive, updating targets as the patient demonstrates mastery or shifts in error patterns.',
      y, { size: 10 }
    );


    y = writeTitle(doc, 'Summary for Physician/Parent', y, { bold: true });
    y = writeParagraph(
      doc,
      'The patient shows a treatable profile with inconsistent substitutions, distortions, and vowel centralization, suggesting Inconsistent Phonological Disorder with mild CAS overlap. Early integrated therapy is recommended.',
      y,
      { size: 10, gap: 0 }
    );

    
    // // Session Items (Plain text, no table)
    // doc.setTextColor(0, 0, 0);
    // doc.setFontSize(14);
    // doc.setFont('NotoSans', 'bold');
    // doc.text('Session Sentences & Phonemes (Plain Text)', 20, 165);
    
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
    <div className="min-h-screen bg-background flex flex-col font-sans">
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


            {/* Clinical Diagnostic Report */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-primary" />
                    Comprehensive Speech-Phoneme Diagnostic Report
                  </CardTitle>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <div className="flex flex-wrap gap-x-6 gap-y-1">
                      {/* <span className="inline-flex items-center gap-2"><User className="w-4 h-4" />Patient: <span className="font-medium">[Redacted for privacy]</span></span> */}
                      <span>Evaluator: <span className="font-medium">Certified Medical Speech Pathologist, Phoneme and Articulation Specialist</span></span>
                    </div>
                    <div className="mt-1">Assessment Context: Comparative phoneme-level analysis between target (ideal) productions and patient’s disordered speech across multiple test sentences.</div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-8">
                  {/* 1) Most Common and Severe Phoneme-Level Mismatches */}
                  <section className="space-y-3">
                    <h3 className="text-lg font-semibold">1. Most Common and Severe Phoneme-Level Mismatches</h3>
                    <p className="text-sm text-muted-foreground">
                      Across all samples, there is a consistent deviation between target consonant place and manner of articulation, alongside notable vowel
                      centralization and length distortions. The following table outlines the most critical mismatches:
                    </p>

                    <div className="overflow-x-auto rounded-lg border">
                      <table className="min-w-full text-sm">
                        <thead className="bg-muted/40">
                          <tr className="text-left">
                            <th className="px-4 py-3 font-medium">Target Phoneme (Letter)</th>
                            <th className="px-4 py-3 font-medium">Disordered Equivalent</th>
                            <th className="px-4 py-3 font-medium">Type of Error</th>
                            <th className="px-4 py-3 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          <tr>
                            <td className="px-4 py-3">/k/ (k, c)</td>
                            <td className="px-4 py-3">[tʰ], [ɕ], [tɕʰ]</td>
                            <td className="px-4 py-3">Fronting / Affrication</td>
                            <td className="px-4 py-3">Velar stops replaced by alveolar or palatal sounds. Indicates difficulty controlling tongue placement.</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3">/d/, /ɡ/</td>
                            <td className="px-4 py-3">[ɳ], [ɖ], [tʂ], [d̪]</td>
                            <td className="px-4 py-3">Retroflexion / Misvoicing</td>
                            <td className="px-4 py-3">Alveolar stops produced with retroflex or dental posture, reducing voicing accuracy.</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3">/ʂ/, /ʃ/ (sh)</td>
                            <td className="px-4 py-3">[s], [ɕ], [ts]</td>
                            <td className="px-4 py-3">Deaffrication / Palatalization</td>
                            <td className="px-4 py-3">Substitutes postalveolar fricatives with alveolar or palatal variants. Loss of sibilant contrast.</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3">/ɹ/ (r)</td>
                            <td className="px-4 py-3">[l], [ɻ], [ɹ̩]</td>
                            <td className="px-4 py-3">Gliding / Distortion</td>
                            <td className="px-4 py-3">Variable realization of /ɹ/, often lateralized or replaced by approximants.</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3">/æ/, /ɑ/, /ɛ/ (a, e, ah)</td>
                            <td className="px-4 py-3">[ʌ], [ɤ̆], [ɒ], [ɔ]</td>
                            <td className="px-4 py-3">Vowel centralization / backing</td>
                            <td className="px-4 py-3">High degree of vowel distortion, centralization toward schwa or back vowels.</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3">/ð/ (th)</td>
                            <td className="px-4 py-3">[t], [s], omitted</td>
                            <td className="px-4 py-3">Stopping / Omission</td>
                            <td className="px-4 py-3">Consistent inability to produce interdental fricatives.</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3">/t͡ʃʲ/ (ch)</td>
                            <td className="px-4 py-3">[tɕʰ], [ts], [ɕ]</td>
                            <td className="px-4 py-3">Manner distortion</td>
                            <td className="px-4 py-3">Affricate maintained inconsistently; some palatal frication but loss of aspiration and voicing control.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Summary:</span> The most severe errors occur on alveolar, velar, and postalveolar targets, particularly affecting affricates (/t͡ʃʲ/),
                      fricatives (/ʃ/, /ʂ/), and velar stops (/k/, /ɡ/). Vowel centralization suggests motor planning or oral posture instability rather than purely
                      articulatory weakness.
                    </p>
                  </section>

                  {/* 2) Observed Speech Error Patterns */}
                  <section className="space-y-3">
                    <h3 className="text-lg font-semibold">2. Observed Speech Error Patterns Across the Session</h3>
                    <div className="grid md:grid-cols-3 gap-6 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Consonant Substitution</h4>
                        <ul className="space-y-1 list-disc pl-5 text-muted-foreground">
                          <li>Velar fronting: /k/, /g/ → [t], [tʰ], [ts]</li>
                          <li>Affricate simplification: /t͡ʃʲ/ → [tɕʰ], [ɕ], or [ts]</li>
                          <li>Devoicing/aspiration inconsistency: voiced stops → voiceless aspirated</li>
                          <li>Liquid simplification: /ɹ/ → [l] or [ɻ]</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Vowel Errors</h4>
                        <ul className="space-y-1 list-disc pl-5 text-muted-foreground">
                          <li>Strong vowel centralization (/æ/, /ɑ/, /ɛ/ → [ʌ], [ɤ̆])</li>
                          <li>Occasional vowel length distortion (e.g., [iː] vs. expected [i])</li>
                        </ul>
                        <h4 className="font-medium mt-3 mb-2">Syllable & Prosody</h4>
                        <ul className="space-y-1 list-disc pl-5 text-muted-foreground">
                          <li>Glottal insertion ([ʔ]) and abnormal timing</li>
                          <li>Reduced coarticulatory smoothness; misplaced stress</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Consistency</h4>
                        <p className="text-muted-foreground">
                          Errors vary across contexts; same phoneme can be realized differently. Pattern suggests phonological planning issues rather than a single
                          articulatory deficit.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* 3) Possible Diagnoses */}
                  <section className="space-y-3">
                    <h3 className="text-lg font-semibold">3. Possible Diagnoses (with Confidence Scores)</h3>
                    <div className="overflow-x-auto rounded-lg border">
                      <table className="min-w-full text-sm">
                        <thead className="bg-muted/40">
                          <tr className="text-left">
                            <th className="px-4 py-3 font-medium">Diagnosis</th>
                            <th className="px-4 py-3 font-medium">Confidence (0–1)</th>
                            <th className="px-4 py-3 font-medium">Rationale</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          <tr><td className="px-4 py-3">Inconsistent Phonological Disorder</td><td className="px-4 py-3">0.80</td><td className="px-4 py-3">High variability in error patterns...</td></tr>
                          <tr><td className="px-4 py-3">Childhood Apraxia of Speech (CAS)</td><td className="px-4 py-3">0.65</td><td className="px-4 py-3">Disrupted prosody, vowel distortions, poor transitions...</td></tr>
                          <tr><td className="px-4 py-3">Phonological Impairment</td><td className="px-4 py-3">0.55</td><td className="px-4 py-3">Systematic rule errors (e.g., velar fronting)...</td></tr>
                          <tr><td className="px-4 py-3">Vowel Disorder</td><td className="px-4 py-3">0.40</td><td className="px-4 py-3">Centralization/distortion likely secondary...</td></tr>
                          <tr><td className="px-4 py-3">Articulation Disorder</td><td className="px-4 py-3">0.25</td><td className="px-4 py-3">Patterns are systemic rather than peripheral.</td></tr>
                          <tr><td className="px-4 py-3">Cleft Palate</td><td className="px-4 py-3">0.05</td><td className="px-4 py-3">No signs of nasal emission/hypernasality typical of structural deficits.</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Primary Impression:</span> Inconsistent Phonological Disorder with secondary features overlapping with Childhood Apraxia of Speech.
                    </p>
                  </section>

                  {/* 4) Recommendations and Next Steps */}
                  <section className="space-y-3">
                    <h3 className="text-lg font-semibold">4. Recommendations and Next Steps</h3>
                    <div className="grid md:grid-cols-3 gap-6 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Integrated Phonological-Motor Therapy</h4>
                        <ul className="space-y-1 list-disc pl-5 text-muted-foreground">
                          <li>Combine core vocabulary therapy with CAS motor-planning tasks</li>
                          <li>Stabilize contrasts: /k/ vs /t/, /ʃ/ vs /s/, /ɹ/ vs /l/</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Vowel & Prosody Focus</h4>
                        <ul className="space-y-1 list-disc pl-5 text-muted-foreground">
                          <li>Vowel drills with visual-kinesthetic feedback</li>
                          <li>Rhythmic pacing (metronome/tapping) for timing & coarticulation</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Home Practice</h4>
                        <ul className="space-y-1 list-disc pl-5 text-muted-foreground">
                          <li>5–10 functional words/week using target sounds</li>
                          <li>Caregiver-guided slow, clear repetitions with playback</li>
                        </ul>
                        <p className="mt-2 text-muted-foreground">
                          <span className="font-medium">Expected Outcomes:</span> With 2–3 sessions/week, measurable improvement in 3 months.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Summary */}
                  <section className="space-y-2">
                    <h3 className="text-lg font-semibold">Summary for Physician/Parent</h3>
                    <p className="text-sm text-muted-foreground">
                      The patient presents with a complex but treatable speech profile marked by inconsistent sound substitutions, distortions, and
                      vowel centralization. Findings suggest an Inconsistent Phonological Disorder with mild CAS overlap. Early integrated therapy
                      focusing on consistency, motor sequencing, and vowel differentiation is recommended.
                    </p>
                  </section>
                </CardContent>
              </Card>
            </motion.div>


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
