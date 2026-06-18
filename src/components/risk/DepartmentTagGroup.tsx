import { Department, DEPT_META } from '@/types';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  selected: Department[];
  onToggle: (dept: Department) => void;
  variant?: 'compact' | 'full';
}

const allDepts: Department[] = ['customer_service', 'legal', 'product', 'marketing', 'store'];

export default function DepartmentTagGroup({ selected, onToggle, variant = 'full' }: Props) {
  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-1">
        {selected.map(dept => (
          <span
            key={dept}
            className={cn(
              'inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium',
              DEPT_META[dept].color
            )}
          >
            <span>{DEPT_META[dept].emoji}</span>
            {DEPT_META[dept].name}
          </span>
        ))}
        {selected.length === 0 && (
          <span className="text-[10px] text-monitor-muted italic">尚未联系部门</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-300">已联系部门</label>
      <div className="flex flex-wrap gap-2">
        {allDepts.map(dept => {
          const active = selected.includes(dept);
          const meta = DEPT_META[dept];
          return (
            <button
              key={dept}
              onClick={() => onToggle(dept)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all duration-200',
                active
                  ? `${meta.color} border-transparent shadow-md`
                  : 'bg-monitor-bg border-monitor-border text-monitor-muted hover:text-slate-300 hover:border-slate-500'
              )}
            >
              <span className="text-sm">{meta.emoji}</span>
              <span>{meta.name}</span>
              {active && <X size={12} className="opacity-70 hover:opacity-100" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
