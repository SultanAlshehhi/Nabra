import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Calendar, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RadialGauge from '@/components/RadialGauge';
import MotivationalCard from '@/components/MotivationalCard';
import { jsPDF } from 'jspdf';

export default function SessionDetails() {
  const [location] = useLocation();
  const isTherapist = location.includes('therapist');
  const LINE_SPACING = 0.8;

  //todo: remove mock functionality
  const sessionData = {
    sessionId: 'S003',
    date: 'Oct 15, 2025',
    classification: 'Articulation Disorder',
    confidence: 86,
    patientName: 'Abdulla A.',
    patientAge: 7,
    patientEmail: 'Abdulla.A@example.com',
    therapist: 'Dr. Sarah Thompson',
    sentencesUsed: [
      'Kenny drank a tiny tin of coke',
      'Sean the sheep was on the ship',
      'Funny Sean was washing a dirty dish',
      "Cheeky Charlie's watching a football match",
      'My granny Maggie got a golden gown',
    ],
    aiNotes: 'The patient demonstrated good effort during the session. Some mispronunciation patterns were detected in alveolar consonants, particularly /r/ and /s/ phonemes. Continued practice with tongue placement exercises is recommended.',
    recommendations: [
      'Continue with regular practice sessions focusing on articulation',
      'Practice tongue placement exercises for /r/ and /s/ sounds',
      'Recommended follow-up: 2 sessions per week',
    ],
  };

  const motivationalMessages = [
    "Great job on completing this session! Your pronunciation is getting better with each practice.",
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
  const handleDownloadReport = () => {
    const doc = new jsPDF();
    
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
      ['Session ID', 'S004', 'Date', 'Oct 16, 2025'],
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
    doc.save(`Nabra_Report_Analysis}.pdf`);
  };

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
          <Button onClick={handleDownloadReport} data-testid="button-download-report">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Session Details</h1>
            <p className="text-lg text-muted-foreground">
              Complete analysis and results for {sessionData.sessionId}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Session Date</p>
                  <p className="text-lg font-semibold text-foreground">{sessionData.date}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="text-lg font-semibold text-foreground">{sessionData.patientName}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Session ID</p>
                  <p className="text-lg font-semibold text-foreground">{sessionData.sessionId}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <RadialGauge value={sessionData.confidence} label="Confidence Score" size={200} />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Classification</p>
                  <Badge className="text-base px-4 py-1 bg-chart-1/10 text-chart-1">
                    {sessionData.classification}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Name</p>
                    <p className="text-base font-medium text-foreground">{sessionData.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Age</p>
                    <p className="text-base font-medium text-foreground">{sessionData.patientAge} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="text-base font-medium text-foreground">{sessionData.patientEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Assigned Therapist</p>
                    <p className="text-base font-medium text-foreground">{sessionData.therapist}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sentences Practiced</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sessionData.sentencesUsed.map((sentence, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {index + 1}
                    </span>
                    <p className="text-foreground">{sentence}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Observations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{sessionData.aiNotes}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {sessionData.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-foreground">{rec}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {!isTherapist && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Encouraging Words</h2>
              {motivationalMessages.map((message, index) => (
                <MotivationalCard
                  key={index}
                  message={message}
                  icon={index === 0 ? 'trophy' : 'star'}
                />
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
