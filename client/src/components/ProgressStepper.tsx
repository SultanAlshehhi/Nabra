import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export default function ProgressStepper({ currentStep, totalSteps, labels }: ProgressStepperProps) {
  return (
    <div className="flex items-center justify-center gap-2 w-full max-w-2xl mx-auto">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isUpcoming = stepNumber > currentStep;

        return (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="relative">
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-10 h-10 rounded-full bg-success flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                ) : isCurrent ? (
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                    className="w-10 h-10 rounded-full border-4 border-primary bg-background flex items-center justify-center"
                  >
                    <span className="text-sm font-semibold text-primary">{stepNumber}</span>
                  </motion.div>
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-muted bg-background flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">{stepNumber}</span>
                  </div>
                )}
              </div>
              {labels && labels[index] && (
                <span className={`text-xs font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {labels[index]}
                </span>
              )}
            </div>
            {index < totalSteps - 1 && (
              <div className="flex-1 h-1 mx-2">
                <div className={`h-full rounded-full ${isCompleted ? 'bg-success' : 'bg-muted'}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
