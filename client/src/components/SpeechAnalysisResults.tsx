import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface SpeechAnalysisResultsProps {
  analysis: {
    prediction: string;
    is_normal: boolean;
    confidence: number;
    raw_prediction: number;
    audio_duration: number;
    sample_rate: number;
  } | null;
  isProcessing: boolean;
  error?: string;
  className?: string;
}

export default function SpeechAnalysisResults({ 
  analysis, 
  isProcessing, 
  error, 
  className = '' 
}: SpeechAnalysisResultsProps) {
  if (isProcessing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-card border border-border rounded-lg p-6 shadow-sm ${className}`}
      >
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-lg font-medium text-foreground">
            Analyzing speech...
          </span>
        </div>
        <p className="text-sm text-muted-foreground text-center mt-2">
          Processing your recording with AI speech analysis
        </p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-destructive/10 border border-destructive/20 rounded-lg p-6 shadow-sm ${className}`}
      >
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <span className="text-lg font-medium text-destructive">
            Analysis Failed
          </span>
        </div>
        <p className="text-sm text-destructive/80">
          {error}
        </p>
      </motion.div>
    );
  }

  if (!analysis) {
    return null;
  }

  const isNormal = analysis.is_normal;
  const confidence = Math.round(analysis.confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border border-border rounded-lg p-6 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        {isNormal ? (
          <CheckCircle className="w-6 h-6 text-green-500" />
        ) : (
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        )}
        <h3 className="text-lg font-semibold text-foreground">
          Speech Analysis Results
        </h3>
      </div>

      <div className="space-y-4">
        {/* Main Prediction */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${
            isNormal ? 'text-green-600' : 'text-amber-600'
          }`}>
            {analysis.prediction}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Confidence: {confidence}%
          </div>
        </div>

        {/* Detailed Results */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="font-medium text-foreground">Analysis Type</div>
            <div className="text-muted-foreground">
              {isNormal ? 'Normal Speech Pattern' : 'Speech Issue Detected'}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="font-medium text-foreground">Audio Duration</div>
            <div className="text-muted-foreground">
              {analysis.audio_duration.toFixed(1)}s
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {!isNormal && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
              Recommendations
            </h4>
            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
              <li>• Practice the sentence slowly and clearly</li>
              <li>• Focus on pronunciation of difficult sounds</li>
              <li>• Consider consulting a speech therapist</li>
              <li>• Try recording again to track improvement</li>
            </ul>
          </div>
        )}

        {isNormal && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
              Great Job! 🎉
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your speech pattern appears normal. Keep practicing to maintain good pronunciation!
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
