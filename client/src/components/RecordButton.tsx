import { Mic, Square } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecordButtonProps {
  isRecording: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export default function RecordButton({ isRecording, onToggle, disabled }: RecordButtonProps) {
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
