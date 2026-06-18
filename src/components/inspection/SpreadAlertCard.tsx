import { Zap, AlertTriangle, TrendingUp, ExternalLink, MessageSquare } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import PlatformBadge from '@/components/shared/PlatformBadge';
import { formatNumber, formatPercent, truncateText, formatRelativeTime } from '@/utils/format';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function SpreadAlertCard() {
  const videos = useAppStore(s => s.videos);
  const selectVideo = useAppStore(s => s.selectVideo);
  const navigate = useNavigate();

  const alerts = videos
    .filter(v => v.spreadScore >= 70 || v.negativeRate >= 0.35)
    .sort((a, b) => {
      const aScore = a.spreadScore + a.negativeRate * 100;
      const bScore = b.spreadScore + b.negativeRate * 100;
      return bScore - aScore;
    })
    .slice(0, 5);

  const handleClick = (v: typeof videos[0]) => {
    selectVideo(v);
    navigate('/risk');
  };

  return (
    <div className="rounded-lg border border-risk-urgent/30 bg-monitor-card overflow-hidden animate-fade-in" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-risk-urgent/20 via-risk-high/10 to-transparent border-b border-risk-urgent/20">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Zap size={16} className="text-risk-urgent" />
            <span className="absolute inset-0 animate-ping">
              <Zap size={16} className="text-risk-urgent opacity-50" />
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-200">传播苗头预警</h3>
          <span className="text-[11px] font-mono text-risk-urgent px-1.5 py-0.5 rounded bg-risk-urgent/10">
            {alerts.length} 条待关注
          </span>
        </div>
        <TrendingUp size={15} className="text-risk-high" />
      </div>

      <div className="divide-y divide-monitor-border/40">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-monitor-muted text-sm">
            暂无高风险传播内容，继续保持！
          </div>
        ) : (
          alerts.map((v, i) => {
            const spreadType = v.spreadScore >= 80 ? 'velocity' : v.negativeRate >= 0.4 ? 'negative' : 'mixed';
            return (
              <button
                key={v.id}
                onClick={() => handleClick(v)}
                className={cn(
                  'w-full flex gap-3 p-4 text-left transition-all duration-200 hover:bg-monitor-border/20 group'
                )}
              >
                <div className="flex flex-col items-center pt-0.5">
                  <span className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs font-mono',
                    i === 0 && 'bg-risk-urgent text-white',
                    i === 1 && 'bg-risk-high text-white',
                    i >= 2 && 'bg-monitor-border text-slate-300'
                  )}>
                    {i + 1}
                  </span>
                  {i < alerts.length - 1 && (
                    <div className="w-px flex-1 bg-monitor-border/40 mt-1" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <PlatformBadge platform={v.platform} />
                    {spreadType === 'velocity' && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-risk-urgent/15 text-risk-urgent text-[10px] font-medium">
                        <Zap size={9} /> 高速传播
                      </span>
                    )}
                    {spreadType === 'negative' && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 text-[10px] font-medium">
                        <MessageSquare size={9} /> 负面偏高
                      </span>
                    )}
                    {spreadType === 'mixed' && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-risk-medium/15 text-risk-medium text-[10px] font-medium">
                        <AlertTriangle size={9} /> 需关注
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-200 leading-snug line-clamp-1 group-hover:text-white">
                    {truncateText(v.title, 40)}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-monitor-muted font-mono">
                    <span className="flex items-center gap-1">
                      播放 <span className="text-slate-300">{formatNumber(v.playCount)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      传播分 <span className={v.spreadScore >= 80 ? 'text-risk-urgent font-semibold' : 'text-slate-300'}>{v.spreadScore}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      负面率 <span className={v.negativeRate >= 0.4 ? 'text-purple-400 font-semibold' : 'text-slate-300'}>{formatPercent(v.negativeRate, 0)}</span>
                    </span>
                    <span>{formatRelativeTime(v.publishedAt)}</span>
                  </div>
                </div>

                <ExternalLink
                  size={14}
                  className="shrink-0 text-monitor-muted opacity-0 group-hover:opacity-100 group-hover:text-brand-blue transition-all mt-1"
                />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
