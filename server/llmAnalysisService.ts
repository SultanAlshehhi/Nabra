import { sentenceService } from '../client/src/lib/sentences';

interface RecordingData {
  id: string;
  sessionId: string;
  sentenceId: string;
  sentence: string;
  phonemeSequence: string;
  idealPhoneme: string;
  createdAt: string;
}

interface AnalysisResult {
  sentence: string;
  idealPhonemes: string;
  recordedPhonemes: string;
  analysis: string;
  timestamp: string;
}

export interface CombinedAnalysisItem {
  sentence: string;
  idealPhonemes: string;
  recordedPhonemes: string;
}

export interface CombinedAnalysisResult {
  sessionId: string;
  analysis: string;
  items: CombinedAnalysisItem[];
  timestamp: string;
}

class LLMAnalysisService {
  private readonly API_KEY = "AIzaSyC59IoS7X-vL-EIdNPSZ31v4lxe4opVvGQ";
  private readonly URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  // Convert model output to plain text: strip markdown, tables, code fences, extra spaces
  private normalizeAnalysisText(text: string): string {
    if (!text) return '';
    let t = text;
    // Remove code fences and inline backticks
    t = t.replace(/```[\s\S]*?```/g, ' ').replace(/`+/g, '');
    // Remove markdown headers/bold/italic markers
    t = t.replace(/^#{1,6}\s+/gm, '')
         .replace(/\*\*(.*?)\*\*/g, '$1')
         .replace(/\*(.*?)\*/g, '$1')
         .replace(/_(.*?)_/g, '$1');
    // Remove table borders/pipes and excessive hyphen lines
    t = t.replace(/[|]+/g, ' ')
         .replace(/^-{2,,}$/gm, ' ')
         .replace(/^-{3,}\s*$|^\s*-{3,}\s*$/gm, ' ');
    // Replace bullet markers with simple dashes
    t = t.replace(/^\s*[•\-]\s+/gm, '- ');
    // Collapse multiple spaces and normalize newlines
    t = t.replace(/[\t\r]+/g, ' ');
    t = t.replace(/\s{2,}/g, ' ').replace(/\s*\n\s*/g, '\n');
    // Trim lines and remove leading/trailing blank lines
    t = t.split('\n').map(s => s.trim()).join('\n');
    t = t.replace(/\n{3,}/g, '\n\n').trim();
    return t;
  }

  async generateAnalysis(recording: RecordingData): Promise<AnalysisResult> {
    const prompt = this.createPrompt(recording.sentence, recording.idealPhoneme, recording.phonemeSequence);
    
    try {
      const response = await fetch(this.URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.API_KEY
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const raw = data.candidates[0].content.parts[0].text || '';
      const analysis = this.normalizeAnalysisText(raw);

      return {
        sentence: recording.sentence,
        idealPhonemes: recording.idealPhoneme,
        recordedPhonemes: recording.phonemeSequence,
        analysis: analysis,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating LLM analysis:', error);
      throw new Error(`Failed to generate analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateAllAnalyses(recordings: RecordingData[]): Promise<AnalysisResult[]> {
    const analyses: AnalysisResult[] = [];
    
    for (const recording of recordings) {
      try {
        console.log(`Generating analysis for recording ${recording.id} - "${recording.sentence}"`);
        const analysis = await this.generateAnalysis(recording);
        analyses.push(analysis);
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to generate analysis for recording ${recording.id}:`, error);
        // Continue with other recordings even if one fails
      }
    }
    
    return analyses;
  }

  private createPrompt(sentence: string, idealPhonemes: string, recordedPhonemes: string): string {
    return `
You are a precise medical speech pathologist specializing in phoneme analysis.
Compare the following phonemes of the sentence "${sentence}" and generate a detailed report with paragraphs covering all 3 points:
When referencing specific phonemes, also provide the corresponding letter for easier readability.
Return PLAIN TEXT only (no markdown, no tables, no backticks). Use short paragraphs and numbered sections.

Ideal: ${idealPhonemes}
Person: ${recordedPhonemes}

1. Identify phoneme-level mismatches in a table, each row is a word (if any).
2. Describe the likely speech errors (if any).
3. Suggest possible diagnoses (if any) and confidence scores (0-1). You may take from this list: Phonological impairment, 
Vowel disorder, Childhood apraxia of speech, Inconsistent phonological disorder, Articulation disorder, Cleft palate
`;
  }

  private createCombinedPrompt(sessionId: string, items: CombinedAnalysisItem[]): string {
    const lines: string[] = [];
    lines.push(`You are a precise medical speech pathologist specializing in phoneme analysis.`);
    lines.push(`Generate ONE long detailed report for session ${sessionId} covering ALL sentences below.`);
    lines.push(`When referencing specific phonemes, also provide the corresponding letter for easier readability.`);
    lines.push(`Return response in markdown format, make sure to **bold** the sections and insert many lines in between sections.`);
    lines.push('');
    lines.push('Sentences and phonemes:');
    items.forEach((it, idx) => {
      lines.push(`Sentence ${idx + 1}: ${it.sentence}`);
      lines.push(`Ideal: ${it.idealPhonemes}`);
      lines.push(`Person: ${it.recordedPhonemes}`);
      lines.push('');
    });
    lines.push('Please produce a single very detailed analysis with these bold sections:');
    lines.push('1. Most common and severe Phoneme-level mismatches.');
    lines.push('2. Observed speech error patterns across the whole session.');
    lines.push('3. Possible diagnoses with confidence scores (0-1) chosen from: Phonological impairment, Vowel disorder, Childhood apraxia of speech, Inconsistent phonological disorder, Articulation disorder, Cleft palate.');
    lines.push('4. 3 Actionable recommendations for therapy and next steps.');
    return lines.join('\n');
  }

  async generateCombinedAnalysisForSession(sessionId: string, recordings: RecordingData[]): Promise<CombinedAnalysisResult> {
    const items: CombinedAnalysisItem[] = recordings.map(r => ({
      sentence: r.sentence,
      idealPhonemes: r.idealPhoneme,
      recordedPhonemes: r.phonemeSequence,
    }));

    const prompt = this.createCombinedPrompt(sessionId, items);

    try {
      const response = await fetch(this.URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.API_KEY
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const analysis = this.normalizeAnalysisText(raw);

      return {
        sessionId,
        analysis,
        items,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating combined LLM analysis:', error);
      throw new Error(`Failed to generate combined analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper method to format analysis results for console output
  formatAnalysisForConsole(analysis: AnalysisResult): string {
    return `
=== ANALYSIS FOR: "${analysis.sentence}" ===
Timestamp: ${analysis.timestamp}

Ideal Phonemes: ${analysis.idealPhonemes}
Recorded Phonemes: ${analysis.recordedPhonemes}

Analysis:
${analysis.analysis}

${'='.repeat(80)}
`;
  }
}

export const llmAnalysisService = new LLMAnalysisService();
