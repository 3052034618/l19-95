import { useAppStore } from '@/store/useAppStore';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const options = [
  { hours: 2, label: '近2小时', desc: '快速巡检' },
  { hours: 6, label: '近6小时', desc: '标准巡检' },
  { hours: 12, label: '近12小时', desc: '半天汇总' },
  { hours: 24, label: '近24小时', desc: '全天汇总' },
];

export default function TimeRangeSelector() {
  const current = useAppStore(s => s.config.timeRangeHours);
  const setTimeRange = useAppStore(s => s.setTimeRange);

  return (
    <div className="rounded-lg border border-monitor-border bg-monitor-card p-5 animate-fade-in" style={{ animationDelay: '120ms' }}>
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} className="text-brand-blue" />
        <h3 className="text-sm font-semibold text-slate-200">巡检时间范围</h3>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {options.map(opt => {
          const active = current === opt.hours;
          return (
            <button
              key={opt.hours}
              onClick={() => setTimeRange(opt.hours)}
              className={cn(
                'flex flex-col items-center gap-1 p-3 rounded-lg border transition-all duration-200 text-left',
                active
                  ? 'bg-brand-blue/15 border-brand-blue/50 shadow-inner'
                  : 'border-monitor-border bg-monitor-bg/50 hover:border-slate-500 hover:bg-monitor-bg'
              )}
            >
              <div className={cn(
                'w-full flex items-center justify-between',
                active ? 'text-brand-blue' : 'text-slate-400'
              )}>
                <span className="font-mono font-bold text-sm">{opt.hours}h</span>
                {active && <span className="w-2 h-2 rounded-full bg-brand-blue" />}
              </div>
              <div className="w-full">
                <div className={cn(
                  'text-xs font-medium',
                  active ? 'text-slate-200' : 'text-slate-400'
                )}>{opt.label}</div>
                <div className="text-[10px] text-monitor-muted mt-0.5">{opt.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
