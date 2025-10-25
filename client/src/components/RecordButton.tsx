import { Mic, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';

interface RecordButtonProps {
  isRecording: boolean;
  onToggle: () => void;
  disabled?: boolean;
  onRecordingStart?: () => void;
  onRecordingStop?: (audioBlob: Blob) => void;
}

export default function RecordButton({ 
  isRecording, 
  onToggle, 
  disabled, 
  onRecordingStart, 
  onRecordingStop 
}: RecordButtonProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onRecordingStop?.(audioBlob);
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      onRecordingStart?.();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      disabled={disabled}
      data-testid="button-record"
      className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${
        disabled
          ? 'bg-muted cursor-not-allowed'
          : isRecording
          ? 'bg-destructive shadow-lg'
          : 'bg-primary shadow-lg hover:shadow-xl'
      }`}
    >
      {isRecording && (
        <motion.div
          className="absolute inset-0 rounded-full bg-destructive"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
      <div className="relative z-10">
        {isRecording ? (
          <Square className="w-8 h-8 text-white fill-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
      </div>
    </motion.button>
  );
}
