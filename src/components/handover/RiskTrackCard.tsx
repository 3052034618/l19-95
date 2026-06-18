import { useState } from 'react';
import { Copy, ExternalLink, TrendingUp, TrendingDown, Info, AlertCircle } from 'lucide-react';
import type { VideoTrack } from '@/types';
import {
  PLATFORM_META, RISK_LEVEL_META, STATUS_META, RISK_TRACK_STATUS_META, RISK_TYPE_META
} from '@/types';
import { formatNumber, formatPercent, formatRelativeTime, formatDateTime } from '@/utils/format';
import { cn } from '@/lib/utils';

interface Props {
  track: VideoTrack;
  onOpenVideo?: () => void;
}

export function RiskTrackCard({ track, onOpenVideo }: Props) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const { record, trackStatus, latestDelta, latestDeltaPercent, curvePoints } = track;
  const snap = record.videoSnapshot;
  const statusMeta = RISK_TRACK_STATUS_META[trackStatus];
  const riskMeta = RISK_LEVEL_META[record.riskLevel];

  const copyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (snap.videoUrl) {
      navigator.clipboard?.writeText(snap.videoUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }
  };

  const maxPlay = Math.max(...curvePoints.map(p => p.playCount));
  const minPlay = Math.min(...curvePoints.map(p => p.playCount));
  const range = maxPlay - minPlay || 1;
  const chartWidth = 240;
  const chartHeight = 50;
  const points = curvePoints.map((p, i) => {
    const x = (i / (curvePoints.length - 1 || 1)) * chartWidth;
    const y = chartHeight - ((p.playCount - minPlay) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const pathD = curvePoints.map((p, i) => {
    const x = (i / (curvePoints.length - 1 || 1)) * chartWidth;
    const y = chartHeight - ((p.playCount - minPlay) / range) * chartHeight;
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');

  const areaD = `${pathD} L${chartWidth},${chartHeight} L0,${chartHeight} Z`;

  const getTrendColor = () => {
    if (trackStatus === 'fast_rising') return '#ef4444';
    if (trackStatus === 'falling') return '#22c55e';
    if (trackStatus === 'just_marked') return '#3b82f6';
    return '#64748b';
  };

  return (
    <div className="rounded-xl border border-monitor-border bg-monitor-card/80 overflow-hidden hover:border-keyword-brand/40 transition-all group">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {snap.coverUrl ? (
            <img
              src={snap.coverUrl}
              alt=""
              className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-20 h-14 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: PLATFORM_META[snap.platform].color + '30' }}
            >
              {PLATFORM_META[snap.platform].icon}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded font-medium',
                statusMeta.bg, statusMeta.color
              )}>
                {statusMeta.icon} {statusMeta.name}
              </span>
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded font-medium',
                riskMeta.bg, riskMeta.color
              )}>
                {riskMeta.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-monitor-border/50 text-monitor-muted">
                {PLATFORM_META[snap.platform].name}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-monitor-bg text-monitor-muted">
                {RISK_TYPE_META[record.riskType].emoji} {RISK_TYPE_META[record.riskType].name}
              </span>
            </div>

            <h4 className="text-sm font-semibold text-slate-200 mt-1.5 line-clamp-2 group-hover:text-white transition-colors">
              {snap.title}
            </h4>

            <div className="flex items-center gap-2 mt-1.5">
              <a
                href={snap.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => { e.stopPropagation(); }}
                className="text-[11px] text-keyword-brand hover:text-keyword-ambassador inline-flex items-center gap-1"
              >
                <ExternalLink size={10} /> 查看原视频
              </a>
              <button
                onClick={copyLink}
                className="text-[11px] text-monitor-muted hover:text-slate-200 inline-flex items-center gap-1"
              >
                {copied ? (
                  <><span className="text-risk-low">✓</span> 已复制</>
                ) : (
                  <><Copy size={10} /> 复制链接</>
                )}
              </button>
            </div>
          </div>

          <div className="flex-shrink-0 text-right">
            <div className="flex items-center justify-end gap-1 mb-0.5">
              {latestDelta > 0 ? (
                <TrendingUp size={13} className="text-risk-urgent" />
              ) : latestDelta < 0 ? (
                <TrendingDown size={13} className="text-risk-low" />
              ) : (
                <Info size={13} className="text-monitor-muted" />
              )}
              <span className={cn(
                'text-sm font-mono font-bold',
                latestDelta > 0 ? 'text-risk-urgent' : latestDelta < 0 ? 'text-risk-low' : 'text-monitor-muted'
              )}>
                {latestDelta > 0 ? '+' : ''}{formatNumber(latestDelta)}
              </span>
            </div>
            <p className={cn(
              'text-[11px] font-mono',
              latestDeltaPercent > 0.2 ? 'text-risk-urgent'
                : latestDeltaPercent > 0.05 ? 'text-risk-medium'
                : 'text-monitor-muted'
            )}>
              {latestDeltaPercent > 0 ? '+' : ''}{formatPercent(latestDeltaPercent)}
            </p>
            <p className="text-[10px] text-monitor-muted mt-1">
              {formatNumber(record.initialPlayCount)} → {formatNumber(record.currentPlayCount)}
            </p>
          </div>
        </div>

        {curvePoints.length >= 2 && (
          <div className="mt-3 pt-3 border-t border-monitor-border/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-monitor-muted flex items-center gap-1">
                <AlertCircle size={10} /> 播放量变化曲线
              </span>
              <span className="text-[10px] text-monitor-muted font-mono">
                共 {curvePoints.length} 个采样点
              </span>
            </div>
            <div className="relative h-[50px] w-full">
              <svg
                width="100%"
                height={chartHeight}
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                preserveAspectRatio="none"
                className="w-full"
              >
                <defs>
                  <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={getTrendColor()} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={getTrendColor()} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={areaD} fill="url(#curveGrad)" />
                <polyline
                  points={points}
                  fill="none"
                  stroke={getTrendColor()}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {curvePoints.map((p, i) => {
                  const x = (i / (curvePoints.length - 1 || 1)) * chartWidth;
                  const y = chartHeight - ((p.playCount - minPlay) / range) * chartHeight;
                  const isFirst = i === 0;
                  const isLast = i === curvePoints.length - 1;
                  return (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={y}
                        r={isFirst || isLast ? 3 : 2}
                        fill={getTrendColor()}
                        stroke="#0f172a"
                        strokeWidth="1"
                      />
                      {isFirst && (
                        <text x={x} y={y - 6} textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="monospace">
                          {formatNumber(p.playCount)}
                        </text>
                      )}
                      {isLast && (
                        <text x={x} y={y - 6} textAnchor="middle" fontSize="9" fill={getTrendColor()} fontFamily="monospace" fontWeight="bold">
                          {formatNumber(p.playCount)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-monitor-muted font-mono px-0.5">
                <span>{formatDateTime(curvePoints[0].at).slice(5)}</span>
                <span>{formatDateTime(curvePoints[curvePoints.length - 1].at).slice(5)}</span>
              </div>
            </div>
          </div>
        )}

        {curvePoints.length < 2 && (
          <div className="mt-3 pt-3 border-t border-monitor-border/60 flex items-center justify-center py-3 text-[11px] text-monitor-muted">
            <Info size={12} className="mr-1.5" />
            采样点不足，等待后续刷新后生成曲线
          </div>
        )}

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-3 w-full text-[10px] text-monitor-muted hover:text-slate-200 flex items-center justify-center gap-1 py-1"
        >
          {showDetails ? '收起详情' : '查看研判与处置记录'}
        </button>

        {showDetails && (
          <div className="mt-2 pt-3 border-t border-monitor-border/60 space-y-2 animate-fade-in">
            <div>
              <p className="text-[10px] text-monitor-muted mb-1">风险研判</p>
              <p className="text-xs text-slate-300 bg-monitor-bg/50 p-2 rounded">{record.opinion}</p>
            </div>
            {record.contactDepartments.length > 0 && (
              <div>
                <p className="text-[10px] text-monitor-muted mb-1">协同部门</p>
                <div className="flex flex-wrap gap-1">
                  {record.contactDepartments.map(d => (
                    <span key={d} className="text-[10px] px-2 py-0.5 rounded bg-keyword-brand/15 text-keyword-brand">
                      {d === 'customer_service' ? '客服部'
                        : d === 'legal' ? '法务部'
                          : d === 'product' ? '产品部'
                            : d === 'marketing' ? '市场部' : '门店运营'}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {record.handleNotes.length > 0 && (
              <div>
                <p className="text-[10px] text-monitor-muted mb-1">处置记录</p>
                <div className="space-y-1">
                  {record.handleNotes.map((n, i) => (
                    <p key={i} className="text-xs text-slate-400 bg-monitor-bg/30 p-1.5 rounded">
                      {i + 1}. {n}
                    </p>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between text-[10px] text-monitor-muted pt-1">
              <span>标记于 {formatRelativeTime(record.createdAt)}</span>
              <span className={cn(
                'px-2 py-0.5 rounded',
                STATUS_META[record.status].bg, STATUS_META[record.status].color
              )}>
                {STATUS_META[record.status].name}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
