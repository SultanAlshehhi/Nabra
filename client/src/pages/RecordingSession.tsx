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

import sentence1 from '@assets/generated_images/Boy_drinking_cola_illustration_088a92ea.png';
import sentence2 from '@assets/generated_images/Sheep_on_ship_illustration_394dabde.png';
import sentence3 from '@assets/generated_images/Washing_dishes_illustration_0ad8b1e5.png';
import sentence4 from '@assets/generated_images/Watching_football_match_illustration_811b20fb.png';
import sentence5 from '@assets/generated_images/Granny_in_golden_gown_698ef67d.png';

const sentences = [
  { text: 'Kenny drank a tiny tin of coke', image: sentence1, alt: 'Boy drinking cola' },
  { text: 'Sean the sheep was on the ship', image: sentence2, alt: 'Sheep on ship' },
  { text: 'Funny Sean was washing a dirty dish', image: sentence3, alt: 'Washing dishes' },
  { text: "Cheeky Charlie's watching a football match", image: sentence4, alt: 'Watching football' },
  { text: 'My granny Maggie got a golden gown', image: sentence5, alt: 'Granny in gown' },
];

export default function RecordingSession() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

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

  const handleRecordingStop = (audioBlob: Blob) => {
    console.log('Stopped recording');
    setRecordedAudio(audioBlob);
    setHasRecorded(true);
    
    // Create URL for playback
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
  };

  const handleNext = () => {
    if (currentStep < sentences.length) {
      setCurrentStep(currentStep + 1);
      setHasRecorded(false);
      setRecordedAudio(null);
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
              <RecordButton
                isRecording={isRecording}
                onToggle={handleRecord}
                disabled={false}
                onRecordingStart={handleRecordingStart}
                onRecordingStop={handleRecordingStop}
              />

              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-foreground">
                  {isRecording ? 'Recording... Speak clearly!' : hasRecorded ? 'Recording complete!' : 'Press to start recording'}
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
                  isVisible={true}
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
