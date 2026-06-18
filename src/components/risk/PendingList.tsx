import { useState, useMemo } from 'react';
import {
  AlertTriangle, Filter, CheckCircle, Clock,
  Flame, ArrowUpDown, Search,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import RiskCard from './RiskCard';
import EmptyState from '@/components/shared/EmptyState';
import StatCard from '@/components/shared/StatCard';
import type { RiskLevel, HandleStatus } from '@/types';
import { RISK_LEVEL_META, STATUS_META } from '@/types';
import { cn } from '@/lib/utils';

type FilterLevel = 'all' | RiskLevel;
type FilterStatus = 'all' | HandleStatus;

export default function PendingList() {
  const riskRecords = useAppStore(s => s.riskRecords);
  const videos = useAppStore(s => s.videos);
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<'level' | 'time'>('level');

  // 统计
  const stats = useMemo(() => ({
    total: riskRecords.length,
    urgent: riskRecords.filter(r => r.riskLevel === 'urgent' && r.status !== 'resolved').length,
    pending: riskRecords.filter(r => r.status === 'pending').length,
    processing: riskRecords.filter(r => r.status === 'processing').length,
  }), [riskRecords]);

  // 排序与过滤
  const sorted = useMemo(() => {
    const levelRank = { urgent: 4, high: 3, medium: 2, low: 1 };
    let result = [...riskRecords];
    if (filterLevel !== 'all') result = result.filter(r => r.riskLevel === filterLevel);
    if (filterStatus !== 'all') result = result.filter(r => r.status === filterStatus);
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(r => {
        const v = videos.find(v => v.id === r.videoId);
        return r.opinion.toLowerCase().includes(s)
          || v?.title.toLowerCase().includes(s)
          || v?.authorName.toLowerCase().includes(s)
          || r.operator.toLowerCase().includes(s);
      });
    }
    if (sortMode === 'level') {
      result.sort((a, b) => {
        if (levelRank[b.riskLevel] !== levelRank[a.riskLevel]) return levelRank[b.riskLevel] - levelRank[a.riskLevel];
        return b.createdAt - a.createdAt;
      });
    } else {
      result.sort((a, b) => b.createdAt - a.createdAt);
    }
    return result;
  }, [riskRecords, videos, filterLevel, filterStatus, search, sortMode]);

  const levelFilters: { key: FilterLevel; label: string; count?: number }[] = [
    { key: 'all', label: '全部' },
    { key: 'urgent', label: RISK_LEVEL_META.urgent.name, count: stats.urgent },
    { key: 'high', label: RISK_LEVEL_META.high.name },
    { key: 'medium', label: RISK_LEVEL_META.medium.name },
    { key: 'low', label: RISK_LEVEL_META.low.name },
  ];

  const statusFilters: { key: FilterStatus; label: string; count?: number }[] = [
    { key: 'all', label: '所有状态' },
    { key: 'pending', label: STATUS_META.pending.name, count: stats.pending },
    { key: 'processing', label: STATUS_META.processing.name, count: stats.processing },
    { key: 'resolved', label: STATUS_META.resolved.name },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 统计概览 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="风险总数" value={stats.total} suffix="条" icon={<AlertTriangle size={16} />} color="amber" />
        <StatCard label="紧急风险" value={stats.urgent} suffix="条" icon={<Flame size={16} />} color="red" deltaPercent={stats.urgent > 0 ? 0.1 : 0} />
        <StatCard label="待处理" value={stats.pending} suffix="条" icon={<Clock size={16} />} color="purple" />
        <StatCard label="处理中" value={stats.processing} suffix="条" icon={<CheckCircle size={16} />} color="blue" />
      </div>

      {/* 筛选条 */}
      <div className="rounded-lg border border-monitor-border bg-monitor-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* 搜索 */}
          <div className="relative md:w-64 shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-monitor-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索标题/意见/操作人..."
              className="w-full pl-8 pr-3 py-2 input-base text-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-monitor-muted">
            <Filter size={13} />
            <span>等级</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {levelFilters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilterLevel(f.key)}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-all',
                  filterLevel === f.key
                    ? f.key === 'all' ? 'bg-brand-blue/15 border-brand-blue/40 text-brand-blue'
                      : `${RISK_LEVEL_META[f.key as RiskLevel].bg}/15 border-current ${RISK_LEVEL_META[f.key as RiskLevel].color}`
                    : 'bg-monitor-bg border-monitor-border text-monitor-muted hover:text-slate-300 hover:border-slate-500'
                )}
              >
                {f.label}
                {f.count !== undefined && f.count > 0 && (
                  <span className="font-mono bg-black/20 rounded px-1 text-[10px]">{f.count}</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <button
            onClick={() => setSortMode(s => s === 'level' ? 'time' : 'level')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-monitor-bg border border-monitor-border text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all"
          >
            <ArrowUpDown size={12} />
            {sortMode === 'level' ? '按等级排序' : '按时间排序'}
          </button>
        </div>

        {/* 状态筛选 */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-monitor-border/40">
          <span className="text-xs text-monitor-muted mr-1">状态</span>
          {statusFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all border',
                filterStatus === f.key
                  ? f.key === 'all' ? 'bg-brand-blue/15 border-brand-blue/40 text-brand-blue'
                    : `${STATUS_META[f.key as HandleStatus].bg} border-current ${STATUS_META[f.key as HandleStatus].color}`
                  : 'bg-monitor-bg border-monitor-border text-monitor-muted hover:text-slate-300 hover:border-slate-500'
              )}
            >
              {f.label}
              {f.count !== undefined && f.count > 0 && (
                <span className="font-mono text-[10px]">{f.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 列表 */}
      {sorted.length === 0 ? (
        <EmptyState
          variant="risk"
          title="暂无匹配的风险记录"
          description="调整筛选条件或返回巡检清单标记可疑视频"
        />
      ) : (
        <div className="space-y-3 animate-stagger">
          {sorted.map(record => {
            const video = videos.find(v => v.id === record.videoId);
            return (
              <RiskCard
                key={record.id}
                record={record}
                video={video}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
