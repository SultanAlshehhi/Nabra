import { motion } from 'framer-motion';
import mascotImage from '@assets/generated_images/Friendly_microphone_mascot_character_e8345ab8.png';

interface MascotProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

export default function Mascot({ size = 'medium', message, className = '' }: MascotProps) {
  const sizes = {
    small: 'w-20 h-20',
    medium: 'w-32 h-32',
    large: 'w-48 h-48',
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <motion.div
        className={sizes[size]}
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <img src={mascotImage} alt="Nabra Mascot" className="w-full h-full object-contain" />
      </motion.div>
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-card-border rounded-2xl px-6 py-3 shadow-sm max-w-xs text-center relative"
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-l border-t border-card-border rotate-45" />
          <p className="text-sm font-medium text-foreground relative z-10">{message}</p>
        </motion.div>
      )}
    </div>
  );
}
