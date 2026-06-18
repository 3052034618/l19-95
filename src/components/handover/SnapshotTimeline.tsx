import { useState } from 'react';
import { Clock, Play, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { SnapshotNode } from '@/types';
import { SNAPSHOT_LABEL, PLATFORM_META, type SnapshotType } from '@/types';
import { formatDateTime, formatNumber, formatPercent } from '@/utils/format';
import { cn } from '@/lib/utils';

const snapshotIcon: Record<SnapshotType, string> = {
  shift_start: '🌅',
  manual_refresh: '🔄',
  mark_risk: '🚨',
  generate_summary: '📄',
};

interface Props {
  nodes: SnapshotNode[];
}

export function SnapshotTimeline({ nodes }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(nodes.length > 0 ? nodes[nodes.length - 1].snapshot.id : null);

  if (nodes.length === 0) {
    return (
      <div className="rounded-xl border border-monitor-border bg-monitor-card/80 p-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-keyword-brand" />
          <h3 className="text-sm font-semibold text-slate-200">值班过程时间轴</h3>
        </div>
        <div className="text-center py-8 text-monitor-muted text-sm">
          本班次暂无播放量快照记录
        </div>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp size={12} className="text-risk-urgent" />;
    if (delta < 0) return <TrendingDown size={12} className="text-risk-low" />;
    return <Minus size={12} className="text-monitor-muted" />;
  };

  return (
    <div className="rounded-xl border border-monitor-border bg-monitor-card/80 p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-keyword-brand" />
          <h3 className="text-sm font-semibold text-slate-200">值班过程时间轴</h3>
          <span className="text-[11px] text-monitor-muted font-mono">共 {nodes.length} 个节点</span>
        </div>
      </div>

      <div className="relative pl-5 space-y-1">
        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-gradient-to-b from-keyword-brand/60 via-keyword-ambassador/40 to-transparent" />

        {nodes.map((node, idx) => {
          const isExpanded = expandedId === node.snapshot.id;
          const isLatest = idx === nodes.length - 1;

          return (
            <div key={node.snapshot.id} className="relative">
              <button
                onClick={() => toggleExpand(node.snapshot.id)}
                className={cn(
                  'w-full text-left flex items-start gap-3 py-2.5 px-3 rounded-lg transition-all group',
                  isExpanded ? 'bg-keyword-brand/10' : 'hover:bg-monitor-border/40'
                )}
              >
                <div className="relative z-10 flex-shrink-0">
                  <div className={cn(
                    'w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px]',
                    isExpanded
                      ? 'bg-keyword-brand text-white ring-2 ring-keyword-brand/30'
                      : isLatest
                        ? 'bg-keyword-ambassador text-white ring-2 ring-keyword-ambassador/30'
                        : 'bg-slate-700 text-slate-300'
                  )}>
                    {snapshotIcon[node.snapshot.type]}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-xs font-medium',
                      isExpanded ? 'text-keyword-brand' : 'text-slate-200'
                    )}>
                      {SNAPSHOT_LABEL[node.snapshot.type]}
                    </span>
                    {isLatest && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-keyword-ambassador/20 text-keyword-ambassador font-medium">
                        最新
                      </span>
                    )}
                    <span className="text-[10px] text-monitor-muted font-mono ml-auto">
                      {formatDateTime(node.snapshot.at)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={13} className="text-monitor-muted" />
                    ) : (
                      <ChevronDown size={13} className="text-monitor-muted" />
                    )}
                  </div>
                  <p className="text-[11px] text-monitor-muted mt-0.5">
                    共记录 {node.snapshot.entries.length} 条视频 · Top 播放 {formatNumber(node.topEntries[0]?.playCount || 0)}
                  </p>
                </div>
              </button>

              {isExpanded && (
                <div className="ml-[27px] mt-1 mb-3 space-y-2 animate-fade-in">
                  {node.topEntries.map((entry, rank) => (
                    <div
                      key={entry.videoId}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-monitor-bg/60 border border-monitor-border/50"
                    >
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                        rank === 0 ? 'bg-risk-urgent text-white'
                          : rank === 1 ? 'bg-risk-high text-white'
                          : rank === 2 ? 'bg-risk-medium text-white'
                          : 'bg-slate-700 text-slate-300'
                      )}>
                        {rank + 1}
                      </div>

                      {entry.coverUrl ? (
                        <img
                          src={entry.coverUrl}
                          alt=""
                          className="w-12 h-9 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className={cn(
                          'w-12 h-9 rounded flex items-center justify-center text-lg flex-shrink-0',
                          PLATFORM_META[entry.platform]
                            ? `bg-[${PLATFORM_META[entry.platform].color}]`
                            : 'bg-slate-700'
                        )} style={{ backgroundColor: PLATFORM_META[entry.platform].color + '30' }}>
                          {PLATFORM_META[entry.platform]?.icon}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-200 truncate font-medium">
                          {entry.videoTitle}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-monitor-border/50 text-monitor-muted">
                            {PLATFORM_META[entry.platform]?.name}
                          </span>
                          <span className="text-[10px] text-monitor-muted font-mono flex items-center gap-1">
                            <Play size={9} /> {formatNumber(entry.playCount)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {getDeltaIcon(entry.delta)}
                        <div className="text-right">
                          <p className={cn(
                            'text-xs font-mono font-semibold',
                            entry.delta > 0 ? 'text-risk-urgent'
                              : entry.delta < 0 ? 'text-risk-low'
                              : 'text-monitor-muted'
                          )}>
                            {entry.delta > 0 ? '+' : ''}{formatNumber(entry.delta)}
                          </p>
                          <p className={cn(
                            'text-[9px] font-mono',
                            entry.deltaPercent > 0.2 ? 'text-risk-urgent'
                              : entry.deltaPercent > 0.05 ? 'text-risk-medium'
                              : 'text-monitor-muted'
                          )}>
                            {entry.deltaPercent > 0 ? '+' : ''}{formatPercent(entry.deltaPercent)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <p className="text-[10px] text-monitor-muted pl-1 pt-1">
                    对比上一节点（{idx > 0 ? formatDateTime(nodes[idx - 1].snapshot.at) : '无基准'}）
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
