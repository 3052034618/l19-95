import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
  deltaPercent?: number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'amber' | 'purple';
  formatFn?: (n: number) => string;
}

function useCountUp(target: number, duration: number = 800) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof target !== 'number') { setValue(target); return; }
    startRef.current = null;
    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return value;
}

const colorMap = {
  blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-300',
  green: 'from-green-500/20 to-green-500/5 border-green-500/30 text-green-300',
  red: 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-300',
  amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-300',
  purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-300',
};

export default function StatCard({
  label, value, suffix = '', prefix = '', deltaPercent, icon, color = 'blue', formatFn,
}: Props) {
  const numericValue = typeof value === 'number' ? value : 0;
  const displayValue = typeof value === 'number' ? useCountUp(value) : value;
  const finalDisplay = formatFn ? formatFn(displayValue as number) : displayValue;

  const hasDelta = deltaPercent !== undefined;
  const deltaColor = deltaPercent! > 0 ? 'text-risk-urgent' : deltaPercent! < 0 ? 'text-risk-low' : 'text-monitor-muted';
  const DeltaIcon = deltaPercent! > 0 ? TrendingUp : deltaPercent! < 0 ? TrendingDown : Minus;

  return (
    <div className={cn(
      'relative rounded-lg border p-4 bg-gradient-to-br backdrop-blur',
      'transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
      colorMap[color],
      'animate-fade-in'
    )}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        {icon && <div className="opacity-70">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        {prefix && <span className="text-2xl font-mono font-semibold">{prefix}</span>}
        <span className="text-3xl font-mono font-bold text-white tracking-tight animate-count-up">
          {finalDisplay}
        </span>
        {suffix && <span className="text-sm text-slate-400 font-mono">{suffix}</span>}
      </div>
      {hasDelta && (
        <div className={`inline-flex items-center gap-1 text-xs font-medium ${deltaColor}`}>
          <DeltaIcon size={12} />
          <span>{deltaPercent! > 0 ? '+' : ''}{(deltaPercent! * 100).toFixed(1)}%</span>
          <span className="text-slate-500 ml-1">vs 上一班</span>
        </div>
      )}
    </div>
  );
}
