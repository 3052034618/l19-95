import { useAppStore } from '@/store/useAppStore';
import { PLATFORM_META, Platform } from '@/types';
import { cn } from '@/lib/utils';
import { Filter } from 'lucide-react';

const allPlatforms: Platform[] = ['douyin', 'kuaishou', 'shipinhao', 'bilibili', 'xiaohongshu'];

export default function PlatformFilter() {
  const platforms = useAppStore(s => s.config.platforms);
  const togglePlatform = useAppStore(s => s.togglePlatform);

  const allSelected = allPlatforms.every(p => platforms.includes(p));

  return (
    <div className="rounded-lg border border-monitor-border bg-monitor-card p-5 animate-fade-in" style={{ animationDelay: '60ms' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-brand-blue" />
          <h3 className="text-sm font-semibold text-slate-200">巡检平台</h3>
          <span className="text-[11px] text-monitor-muted font-mono">{platforms.length}/5</span>
        </div>
        <button
          onClick={() => {
            if (allSelected) {
              allPlatforms.forEach(p => {
                if (platforms.includes(p)) togglePlatform(p);
              });
            } else {
              allPlatforms.forEach(p => {
                if (!platforms.includes(p)) togglePlatform(p);
              });
            }
          }}
          className="text-xs text-brand-blue hover:text-blue-400 transition-colors"
        >
          {allSelected ? '全不选' : '全选'}
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {allPlatforms.map(p => {
          const meta = PLATFORM_META[p];
          const active = platforms.includes(p);
          return (
            <button
              key={p}
              onClick={() => togglePlatform(p)}
              className={cn(
                'relative flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all duration-200 group',
                active
                  ? 'border-transparent shadow-lg'
                  : 'border-monitor-border bg-monitor-bg/50 hover:border-slate-500 opacity-60 hover:opacity-100'
              )}
              style={active ? { backgroundColor: `${meta.color}15`, boxShadow: `0 0 0 1px ${meta.color}40` } : {}}
            >
              <span
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all duration-200',
                  active ? 'scale-110' : 'grayscale'
                )}
                style={{ backgroundColor: active ? meta.color : '#334155' }}
              >
                {meta.icon}
              </span>
              <span className={cn(
                'text-xs font-medium transition-colors',
                active ? 'text-slate-200' : 'text-monitor-muted'
              )}>
                {meta.name}
              </span>
              {active && (
                <span
                  className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: meta.color }}
                >
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
