import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SentenceCard from '@/components/SentenceCard';
import RecordButton from '@/components/RecordButton';
import ProgressStepper from '@/components/ProgressStepper';
import Mascot from '@/components/Mascot';
import PhoneticTranscript from '@/components/PhoneticTranscript';
import { audioStorage, type AudioRecording } from '@/lib/audioStorage';
import SpeechAnalysisResults from '@/components/SpeechAnalysisResults';
import { sentenceService, predefinedSentences } from '@/lib/sentences';

import UploadButton from '@/components/uploadButton';

import sentence1 from '@assets/generated_images/Boy_drinking_cola_illustration_088a92ea.png';
import sentence2 from '@assets/generated_images/Sheep_on_ship_illustration_394dabde.png';
import sentence3 from '@assets/generated_images/Washing_dishes_illustration_0ad8b1e5.png';
import sentence4 from '@assets/generated_images/Watching_football_match_illustration_811b20fb.png';
import sentence5 from '@assets/generated_images/Granny_in_golden_gown_698ef67d.png';

const sentences = predefinedSentences.map((sentence, index) => {
  const images = [sentence1, sentence2, sentence3, sentence4, sentence5];
  return {
    id: sentence.id,
    text: sentence.sentenceText,
    image: images[index] || sentence1,
    alt: `Practice sentence ${index + 1}`
  };
});

export default function RecordingSession() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [isUploading, setIsUploading] = useState(false);
  const [speechAnalysis, setSpeechAnalysis] = useState<any>(null);
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);
  const [speechAnalysisError, setSpeechAnalysisError] = useState<string | null>(null);

  const currentSentence = sentences[currentStep - 1];

  // Cleanup audio URL on component unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setHasRecorded(false);
      setRecordedAudio(null);
      setAudioUrl(null);
    } else {
      setIsRecording(false);
    }
  };

  const handleRecordingStart = () => {
    console.log('Started recording');
  };

  const handleUploadAudio = async (audioBlob: Blob) => {
    setRecordedAudio(audioBlob);
    setHasRecorded(true);
  
    // Create URL for playback
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
  
    // Save recording to local storage and upload to server
    try {
      setIsUploading(true);
  
      const recording: AudioRecording = {
        id: crypto.randomUUID(),
        sessionId,
        sentenceId: currentSentence.id,
        audioBlob,
        duration: Math.round(audioBlob.size / 1000), // Rough estimate
        fileSize: audioBlob.size,
        mimeType: audioBlob.type || 'audio/webm',
        sentence: currentSentence.text,
        step: currentStep,
      };
  
      // Save to local storage
      await audioStorage.saveRecording(recording);
  
      // Upload to server for processing
      const uploadResult = await audioStorage.uploadToServer(recording);
      const recordingId = uploadResult.recordingId;
      const audioFilePath = uploadResult.audioFilePath;
  
      // Start speech analysis
      setIsProcessingSpeech(true);
      setSpeechAnalysisError(null);
  
      try {
        const analysisResult = await audioStorage.processRecording(recordingId, audioFilePath);
        setSpeechAnalysis(analysisResult);
      } catch (error) {
        console.error('Speech analysis failed:', error);
        setSpeechAnalysisError(error instanceof Error ? error.message : 'Analysis failed');
      } finally {
        setIsProcessingSpeech(false);
      }
    } catch (error) {
      console.error('Failed to save uploaded audio:', error);
    } finally {
      setIsUploading(false);
    }
  };  

  const handleRecordingStop = async (audioBlob: Blob) => {
    console.log('Stopped recording');
    setRecordedAudio(audioBlob);
    setHasRecorded(true);
    
    // Create URL for playback
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);

    // Save recording to local storage and upload to server
    try {
      setIsUploading(true);
      
      const recording: AudioRecording = {
        id: crypto.randomUUID(),
        sessionId,
        sentenceId: currentSentence.id, // Add this line
        audioBlob,
        duration: Math.round(audioBlob.size / 1000), // Rough estimate
        fileSize: audioBlob.size,
        mimeType: audioBlob.type,
        sentence: currentSentence.text,
        step: currentStep
      };

      // Save to local storage
      await audioStorage.saveRecording(recording);

      // Upload to server for processing
      const uploadResult = await audioStorage.uploadToServer(recording);
      const recordingId = uploadResult.recordingId;
      const audioFilePath = uploadResult.audioFilePath;
      
      console.log('Recording saved and uploaded successfully');
      
      // Start speech analysis
      setIsProcessingSpeech(true);
      setSpeechAnalysisError(null);
      
      try {
        const analysisResult = await audioStorage.processRecording(recordingId, audioFilePath);
        setSpeechAnalysis(analysisResult);
        console.log('Speech analysis completed:', analysisResult);
      } catch (error) {
        console.error('Speech analysis failed:', error);
        setSpeechAnalysisError(error instanceof Error ? error.message : 'Analysis failed');
      } finally {
        setIsProcessingSpeech(false);
      }
    } catch (error) {
      console.error('Failed to save recording:', error);
      // Don't show error to user, just log it
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < sentences.length) {
      setCurrentStep(currentStep + 1);
      setHasRecorded(false);
      setRecordedAudio(null);
      setSpeechAnalysis(null);
      setSpeechAnalysisError(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
    } else {
      setLocation('/results');
    }
  };

  const handlePlayback = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  };

  const mascotMessages = [
    "Great! Let's read this sentence together.",
    'Doing awesome! Keep going!',
    "You're making great progress!",
    'Almost there! One more to go!',
    'Last one! You can do it!',
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard/patient">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <span className="text-sm font-medium text-muted-foreground">
            Session {currentStep} of {sentences.length}
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="max-w-4xl mx-auto w-full px-6 py-8">
          <ProgressStepper
            currentStep={currentStep}
            totalSteps={sentences.length}
            labels={sentences.map((_, i) => `Step ${i + 1}`)}
          />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-4xl space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <SentenceCard
                  sentence={currentSentence.text}
                  image={currentSentence.image}
                  imageAlt={currentSentence.alt}
                />
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-row items-center justify-center gap-6">
                <RecordButton
                  isRecording={isRecording}
                  onToggle={handleRecord}
                  disabled={false}
                  onRecordingStart={handleRecordingStart}
                  onRecordingStop={handleRecordingStop}
                />

                <UploadButton
                  disabled={isRecording}
                  onUploadStart={() => {
                    setHasRecorded(false);
                    setRecordedAudio(null);
                    if (audioUrl) {
                      URL.revokeObjectURL(audioUrl);
                      setAudioUrl(null);
                    }
                  }}
                  onUpload={handleUploadAudio}
                />
              </div>

              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-foreground">
                  {isRecording 
                    ? 'Recording... Speak clearly!' 
                    : hasRecorded 
                      ? isUploading 
                        ? 'Saving recording...' 
                        : 'Recording complete!' 
                      : 'Press to start recording'
                  }
                </p>
                {hasRecorded && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePlayback}
                    data-testid="button-playback"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Play Recording
                  </Button>
                )}
              </div>

              {/* Speech Analysis Results */}
              <SpeechAnalysisResults
                analysis={speechAnalysis}
                isProcessing={isProcessingSpeech}
                error={speechAnalysisError || undefined}
                className="mt-6"
              />

              {hasRecorded && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <Button
                    variant="outline"
                    onClick={() => {
                      setHasRecorded(false);
                      console.log('Try again');
                    }}
                    data-testid="button-try-again"
                  >
                    Try Again
                  </Button>
                  <Button onClick={handleNext} size="lg" data-testid="button-next">
                    {currentStep < sentences.length ? 'Next Sentence' : 'View Results'}
                  </Button>
                </motion.div>
              )}
            </div>

            {hasRecorded && (
              <div className="w-full max-w-2xl mx-auto">
                <PhoneticTranscript 
                  sentence={currentSentence.text} 
                  isVisible={true} // set false for now 
                  className="mb-6"
                />
              </div>
            )}

            <div className="flex justify-center pt-4">
              <Mascot size="medium" message={mascotMessages[currentStep - 1]} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
