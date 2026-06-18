import { Rocket, TrendingUp, Flame, Play, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { TopGrower } from '@/types';
import { PLATFORM_META, RISK_LEVEL_META } from '@/types';
import { formatNumber, formatPercent } from '@/utils/format';
import { cn } from '@/lib/utils';

interface TopGrowersCardProps {
  growers: TopGrower[];
  onOpenVideo?: (videoId: string, videoUrl: string) => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handle}
      className="p-0.5 rounded hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors"
      title="复制视频链接"
    >
      {copied ? <Check className="w-3 h-3 text-risk-low" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

export function TopGrowersCard({ growers, onOpenVideo }: TopGrowersCardProps) {
  if (growers.length === 0) {
    return (
      <div className="card-gradient-border rounded-xl p-5 animate-fade-in">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-risk-high/15 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-risk-high" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">播放量增长最快 Top5</h3>
            <p className="text-xs text-slate-400">基于班次开始与生成摘要时的差值计算</p>
          </div>
        </div>
        <div className="py-10 text-center text-slate-500 text-sm">
          <div className="text-4xl mb-2 opacity-50">📊</div>
          <p>本班次暂无播放量显著增长的视频</p>
        </div>
      </div>
    );
  }

  const maxDelta = growers[0]?.delta || 1;

  return (
    <div className="card-gradient-border rounded-xl p-5 animate-fade-in overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-risk-high/30 to-risk-urgent/20 border border-risk-high/30 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-risk-high animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">播放量增长最快 Top5</h3>
            <p className="text-xs text-slate-400">初始值与当前值对比，含高风险与普通视频</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-risk-high/10 border border-risk-high/25 text-risk-high text-xs">
          <Flame className="w-3.5 h-3.5" />
          自动识别
        </div>
      </div>

      <div className="space-y-3">
        {growers.map((g, idx) => {
          const barWidth = Math.max((g.delta / maxDelta) * 100, 6);
          const pctMeta = PLATFORM_META[g.platform];
          const level = g.riskLevel ? RISK_LEVEL_META[g.riskLevel] : null;
          const isHighlight = g.deltaPercent > 0.5 || g.delta > 10000;

          return (
            <div
              key={g.videoId}
              className={cn(
                'relative p-3.5 rounded-xl border transition-all hover:scale-[1.005] animate-stagger',
                isHighlight
                  ? 'bg-risk-urgent/6 border-risk-urgent/25 hover:border-risk-urgent/45'
                  : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600/60'
              )}
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'relative w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-md',
                  idx === 0 && 'bg-gradient-to-br from-risk-urgent to-red-600 text-white',
                  idx === 1 && 'bg-gradient-to-br from-risk-high to-orange-500 text-white',
                  idx === 2 && 'bg-gradient-to-br from-risk-medium to-yellow-500 text-white',
                  idx > 2 && 'bg-slate-700/80 text-slate-300'
                )}>
                  {idx + 1}
                  {idx < 3 && (
                    <span className="absolute -top-1 -right-1 text-sm drop-shadow-lg">
                      {idx === 0 ? '🔥' : idx === 1 ? '🚀' : '⚡'}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div
                      className="flex items-center gap-2 cursor-pointer min-w-0"
                      onClick={() => g.videoUrl && window.open(g.videoUrl, '_blank')}
                      title={g.videoTitle}
                    >
                      <div className="relative w-12 h-9 rounded-md overflow-hidden shrink-0 border border-slate-700/60 bg-slate-800">
                        {g.coverUrl ? (
                          <img src={g.coverUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-base">
                            {pctMeta.icon}
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-200 truncate leading-tight min-w-0">
                        {g.videoTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300 border border-slate-600/40">
                        {pctMeta.icon} {pctMeta.name}
                      </span>
                      {level && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${level.bg} ${level.color}`}>
                          {level.name}
                        </span>
                      )}
                      {g.videoUrl && <CopyButton text={g.videoUrl} />}
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between gap-4 mb-1.5">
                    <div className="flex items-baseline gap-2 text-xs">
                      <span className="text-slate-500 flex items-center gap-0.5">
                        <Play className="w-2.5 h-2.5" />
                        <span className="font-mono text-slate-400">{formatNumber(g.initialPlayCount)}</span>
                      </span>
                      <TrendingUp className="w-3 h-3 text-risk-high" />
                      <span className={cn(
                        'font-bold font-mono',
                        isHighlight ? 'text-risk-urgent animate-pulse-glow' : 'text-risk-high'
                      )}>
                        +{formatNumber(g.delta)}
                      </span>
                      <span className="text-slate-500">→</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {formatNumber(g.latestPlayCount)}
                      </span>
                    </div>
                    <span className={cn(
                      'text-xs font-mono px-1.5 py-0.5 rounded',
                      g.deltaPercent > 0.5 ? 'bg-risk-urgent/15 text-risk-urgent' :
                      g.deltaPercent > 0.25 ? 'bg-risk-high/15 text-risk-high' :
                      'bg-risk-medium/15 text-risk-medium'
                    )}>
                      {formatPercent(g.deltaPercent)}
                    </span>
                  </div>

                  <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-1000 ease-out',
                        idx === 0 ? 'bg-gradient-to-r from-risk-high to-risk-urgent' :
                        idx === 1 ? 'bg-gradient-to-r from-risk-medium to-risk-high' :
                        'bg-gradient-to-r from-keyword-brand to-risk-medium'
                      )}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {growers.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-500">
          <span>Top1 增量：<span className="text-risk-high font-mono font-semibold">+{formatNumber(growers[0].delta)}</span>
          </span>
          <span>建议下一班重点监控前 3 条的评论风向变化</span>
        </div>
      )}
    </div>
  );
}
