import { motion } from 'framer-motion';

interface Phoneme {
  symbol: string;
  isCorrect: boolean;
  word: string;
}

interface PhoneticTranscriptProps {
  sentence: string;
  isVisible: boolean;
  className?: string;
}

// Mock phonetic data for demo purposes
const getPhoneticData = (sentence: string): Phoneme[] => {
  const phoneticMaps: Record<string, Phoneme[]> = {
    'Kenny drank a tiny tin of coke': [
      { symbol: '/ˈkɛni/', word: 'Kenny', isCorrect: true },
      { symbol: '/dræŋk/', word: 'drank', isCorrect: false },
      { symbol: '/ə/', word: 'a', isCorrect: true },
      { symbol: '/ˈtaɪni/', word: 'tiny', isCorrect: true },
      { symbol: '/tɪn/', word: 'tin', isCorrect: true },
      { symbol: '/ʌv/', word: 'of', isCorrect: true },
      { symbol: '/koʊk/', word: 'coke', isCorrect: false },
    ],
    'Sean the sheep was on the ship': [
      { symbol: '/ʃɔn/', word: 'Sean', isCorrect: false },
      { symbol: '/ðə/', word: 'the', isCorrect: true },
      { symbol: '/ʃip/', word: 'sheep', isCorrect: true },
      { symbol: '/wʌz/', word: 'was', isCorrect: true },
      { symbol: '/ɑn/', word: 'on', isCorrect: true },
      { symbol: '/ðə/', word: 'the', isCorrect: true },
      { symbol: '/ʃɪp/', word: 'ship', isCorrect: false },
    ],
    'Funny Sean was washing a dirty dish': [
      { symbol: '/ˈfʌni/', word: 'Funny', isCorrect: true },
      { symbol: '/ʃɔn/', word: 'Sean', isCorrect: false },
      { symbol: '/wʌz/', word: 'was', isCorrect: true },
      { symbol: '/ˈwɑʃɪŋ/', word: 'washing', isCorrect: true },
      { symbol: '/ə/', word: 'a', isCorrect: true },
      { symbol: '/ˈdɜrti/', word: 'dirty', isCorrect: false },
      { symbol: '/dɪʃ/', word: 'dish', isCorrect: true },
    ],
    "Cheeky Charlie's watching a football match": [
      { symbol: '/ˈtʃiki/', word: 'Cheeky', isCorrect: true },
      { symbol: '/ˈtʃɑrli/', word: 'Charlie', isCorrect: false },
      { symbol: '/ˈwɑtʃɪŋ/', word: 'watching', isCorrect: true },
      { symbol: '/ə/', word: 'a', isCorrect: true },
      { symbol: '/ˈfʊtˌbɔl/', word: 'football', isCorrect: true },
      { symbol: '/mætʃ/', word: 'match', isCorrect: false },
    ],
    'My granny Maggie got a golden gown': [
      { symbol: '/maɪ/', word: 'My', isCorrect: true },
      { symbol: '/ˈgræni/', word: 'granny', isCorrect: false },
      { symbol: '/ˈmægi/', word: 'Maggie', isCorrect: true },
      { symbol: '/gɑt/', word: 'got', isCorrect: true },
      { symbol: '/ə/', word: 'a', isCorrect: true },
      { symbol: '/ˈgoʊldən/', word: 'golden', isCorrect: true },
      { symbol: '/gaʊn/', word: 'gown', isCorrect: false },
    ],
  };

  return phoneticMaps[sentence] || [];
};

export default function PhoneticTranscript({ sentence, isVisible, className = '' }: PhoneticTranscriptProps) {
  const phonemes = getPhoneticData(sentence);

  if (!isVisible || phonemes.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className={`bg-card border border-border rounded-lg p-6 shadow-sm ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">Phonetic Transcription</h3>
        <p className="text-sm text-muted-foreground">
          Red phonemes indicate areas that need improvement
        </p>
      </div>
      
      <div className="space-y-3">
        {phonemes.map((phoneme, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3"
          >
            <span className="text-sm font-medium text-foreground min-w-[60px]">
              {phoneme.word}
            </span>
            <span
              className={`text-sm font-mono px-2 py-1 rounded ${
                phoneme.isCorrect
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}
            >
              {phoneme.symbol}
            </span>
            {!phoneme.isCorrect && (
              <span className="text-xs text-red-600 dark:text-red-400">
                Needs practice
              </span>
            )}
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 dark:bg-green-900/20 rounded"></div>
            <span>Correct pronunciation</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 dark:bg-red-900/20 rounded"></div>
            <span>Needs improvement</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
