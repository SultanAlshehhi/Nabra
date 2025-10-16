import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface RadialGaugeProps {
  value: number;
  size?: number;
  label?: string;
}

export default function RadialGauge({ value, size = 200, label }: RadialGaugeProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (displayValue / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        setDisplayValue(current);
        if (current >= value) {
          clearInterval(interval);
        }
      }, 15);
      return () => clearInterval(interval);
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const getColor = (val: number) => {
    if (val >= 80) return 'hsl(142, 52%, 56%)';
    if (val >= 60) return 'hsl(168, 65%, 58%)';
    if (val >= 40) return 'hsl(48, 96%, 65%)';
    return 'hsl(25, 85%, 60%)';
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={80}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={80}
            fill="none"
            stroke={getColor(displayValue)}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="text-5xl font-bold text-foreground"
          >
            {displayValue}%
          </motion.span>
          {label && <span className="text-sm text-muted-foreground mt-1">{label}</span>}
        </div>
      </div>
    </div>
  );
}
