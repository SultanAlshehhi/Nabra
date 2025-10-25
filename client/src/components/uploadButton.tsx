import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef } from 'react';

interface UploadButtonProps {
  disabled?: boolean;
  onUploadStart?: () => void;
  onUpload?: (audioBlob: Blob) => void;
}

export default function UploadButton({
  disabled,
  onUploadStart,
  onUpload,
}: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = ''; // allow re-selecting same file
    if (!file) return;

    // ✅ Only accept .wav files
    if (!file.name.toLowerCase().endsWith('.wav')) {
      alert('Please select a .wav audio file.');
      return;
    }

    onUploadStart?.();
    onUpload?.(file);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".wav" // ✅ restrict to .wav only
        className="hidden"
        onChange={handleFileChange}
      />
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        disabled={disabled}
        data-testid="button-upload"
        className={`w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all ${
          disabled
            ? 'border-muted text-muted cursor-not-allowed'
            : 'border-blue-500 hover:bg-blue-50'
        }`}
        aria-label="Upload audio"
        title="Upload audio"
      >
        <Upload className="w-8 h-8 text-blue-500" />
      </motion.button>
    </>
  );
}
