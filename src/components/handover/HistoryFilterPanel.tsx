import { useState } from 'react';
import { Filter, Calendar, AlertTriangle, Monitor, X, ChevronDown } from 'lucide-react';
import type { HandoverSummary, ShiftType, RiskLevel, Platform } from '@/types';
import { SHIFT_META, RISK_LEVEL_META, PLATFORM_META } from '@/types';
import { cn } from '@/lib/utils';

interface Filters {
  shiftType: ShiftType | 'all';
  riskLevel: RiskLevel | 'all';
  platform: Platform | 'all';
  onlyUnconfirmed: boolean;
}

interface Props {
  summaries: HandoverSummary[];
  onFilterChange: (filtered: HandoverSummary[]) => void;
}

export function HistoryFilterPanel({ summaries, onFilterChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    shiftType: 'all',
    riskLevel: 'all',
    platform: 'all',
    onlyUnconfirmed: false,
  });

  const platforms = Array.from(
    new Set(summaries.flatMap(s => s.highRiskVideos.map(r => r.videoSnapshot.platform)))
  );

  const applyFilters = () => {
    const result = summaries.filter(s => {
      if (filters.shiftType !== 'all' && s.shiftType !== filters.shiftType) return false;
      if (filters.onlyUnconfirmed && s.confirmedBy) return false;
      if (filters.riskLevel !== 'all') {
        const hasLevel = s.highRiskVideos.some(r => r.riskLevel === filters.riskLevel);
        if (!hasLevel) return false;
      }
      if (filters.platform !== 'all') {
        const hasPlatform = s.highRiskVideos.some(r => r.videoSnapshot.platform === filters.platform);
        if (!hasPlatform) return false;
      }
      return true;
    });
    onFilterChange(result);
  };

  const handleChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    setTimeout(() => {
      const result = summaries.filter(s => {
        if (next.shiftType !== 'all' && s.shiftType !== next.shiftType) return false;
        if (next.onlyUnconfirmed && s.confirmedBy) return false;
        if (next.riskLevel !== 'all') {
          const hasLevel = s.highRiskVideos.some(r => r.riskLevel === next.riskLevel);
          if (!hasLevel) return false;
        }
        if (next.platform !== 'all') {
          const hasPlatform = s.highRiskVideos.some(r => r.videoSnapshot.platform === next.platform);
          if (!hasPlatform) return false;
        }
        return true;
      });
      onFilterChange(result);
    }, 0);
  };

  const resetFilters = () => {
    const reset: Filters = { shiftType: 'all', riskLevel: 'all', platform: 'all', onlyUnconfirmed: false };
    setFilters(reset);
    onFilterChange(summaries);
  };

  const activeCount = [
    filters.shiftType !== 'all',
    filters.riskLevel !== 'all',
    filters.platform !== 'all',
    filters.onlyUnconfirmed,
  ].filter(Boolean).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all',
          isOpen
            ? 'bg-keyword-brand/20 text-keyword-brand border border-keyword-brand/40'
            : 'bg-monitor-card/60 border border-monitor-border hover:border-keyword-brand/30 text-slate-300'
        )}
      >
        <Filter size={13} />
        <span>筛选历史</span>
        {activeCount > 0 && (
          <span className="bg-keyword-brand text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
            {activeCount}
          </span>
        )}
        <ChevronDown size={13} className={cn('transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 z-20 rounded-xl border border-monitor-border bg-monitor-card/95 backdrop-blur-sm shadow-2xl p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Filter size={12} className="text-keyword-brand" />
              筛选历史交接班
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-monitor-muted hover:text-slate-200"
            >
              <X size={13} />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-monitor-muted flex items-center gap-1 mb-1.5">
                <Calendar size={10} /> 班次类型
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleChange('shiftType', 'all')}
                  className={cn(
                    'text-[11px] py-1.5 rounded-md font-medium transition-all',
                    filters.shiftType === 'all'
                      ? 'bg-keyword-brand text-white'
                      : 'bg-monitor-bg text-monitor-muted hover:text-slate-200'
                  )}
                >
                  全部
                </button>
                {(Object.keys(SHIFT_META) as ShiftType[]).map(st => (
                  <button
                    key={st}
                    onClick={() => handleChange('shiftType', st)}
                    className={cn(
                      'text-[11px] py-1.5 rounded-md font-medium transition-all',
                      filters.shiftType === st
                        ? 'bg-keyword-brand text-white'
                        : 'bg-monitor-bg text-monitor-muted hover:text-slate-200'
                    )}
                  >
                    {SHIFT_META[st].icon} {SHIFT_META[st].name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-monitor-muted flex items-center gap-1 mb-1.5">
                <AlertTriangle size={10} /> 风险等级
              </label>
              <div className="grid grid-cols-5 gap-1">
                <button
                  onClick={() => handleChange('riskLevel', 'all')}
                  className={cn(
                    'text-[10px] py-1.5 rounded-md font-medium transition-all',
                    filters.riskLevel === 'all'
                      ? 'bg-keyword-brand text-white'
                      : 'bg-monitor-bg text-monitor-muted hover:text-slate-200'
                  )}
                >
                  全
                </button>
                {(Object.keys(RISK_LEVEL_META) as RiskLevel[]).map(rl => (
                  <button
                    key={rl}
                    onClick={() => handleChange('riskLevel', rl)}
                    className={cn(
                      'text-[10px] py-1.5 rounded-md font-medium transition-all',
                      filters.riskLevel === rl
                        ? RISK_LEVEL_META[rl].bg + ' ' + RISK_LEVEL_META[rl].color
                        : 'bg-monitor-bg text-monitor-muted hover:text-slate-200'
                    )}
                    title={RISK_LEVEL_META[rl].name}
                  >
                    {rl === 'urgent' ? '紧' : rl === 'high' ? '高' : rl === 'medium' ? '中' : '低'}
                  </button>
                ))}
              </div>
            </div>

            {platforms.length > 0 && (
              <div>
                <label className="text-[10px] text-monitor-muted flex items-center gap-1 mb-1.5">
                  <Monitor size={10} /> 视频平台
                </label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => handleChange('platform', 'all')}
                    className={cn(
                      'text-[10px] py-1.5 rounded-md font-medium transition-all',
                      filters.platform === 'all'
                        ? 'bg-keyword-brand text-white'
                        : 'bg-monitor-bg text-monitor-muted hover:text-slate-200'
                    )}
                  >
                    全部
                  </button>
                  {platforms.map(p => (
                    <button
                      key={p}
                      onClick={() => handleChange('platform', p)}
                      className={cn(
                        'text-[10px] py-1.5 rounded-md font-medium transition-all flex items-center justify-center gap-1',
                        filters.platform === p
                          ? 'bg-keyword-brand text-white'
                          : 'bg-monitor-bg text-monitor-muted hover:text-slate-200'
                      )}
                    >
                      <span>{PLATFORM_META[p].icon}</span>
                      <span className="truncate">{PLATFORM_META[p].name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={filters.onlyUnconfirmed}
                onChange={(e) => handleChange('onlyUnconfirmed', e.target.checked)}
                className="w-3.5 h-3.5 rounded border-monitor-border bg-monitor-bg text-keyword-brand focus:ring-keyword-brand"
              />
              <span className="text-[11px] text-slate-300">仅显示待确认交班</span>
            </label>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-monitor-border/50">
            <button
              onClick={resetFilters}
              className="text-[11px] text-monitor-muted hover:text-slate-200"
            >
              重置筛选
            </button>
            <button
              onClick={() => { applyFilters(); setIsOpen(false); }}
              className="text-[11px] px-3 py-1.5 rounded bg-keyword-brand text-white font-medium hover:bg-keyword-brand/90"
            >
              应用筛选
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
