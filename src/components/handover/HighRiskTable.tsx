import { useState } from 'react';
import { ExternalLink, TrendingUp, Play, MessageSquare, AlertTriangle, Copy, Check } from 'lucide-react';
import type { RiskRecord, Video, PlayChange } from '@/types';
import { RISK_LEVEL_META, RISK_TYPE_META, STATUS_META, PLATFORM_META } from '@/types';
import { formatNumber, formatPercent, formatRelativeTime } from '@/utils/format';
import PlatformBadge from '@/components/shared/PlatformBadge';
import { RiskLevelBadge } from '@/components/shared/RiskBadge';

interface HighRiskTableProps {
  records: RiskRecord[];
  playChanges: PlayChange[];
  videoSnapshots?: Record<string, import('@/types').VideoSnapshot>;
  onOpenVideo?: (videoLike: Video) => void;
}

function snapshotToVideo(snap: import('@/types').VideoSnapshot): Video {
  return {
    id: snap.videoId,
    platform: snap.platform,
    title: snap.title,
    coverUrl: snap.coverUrl,
    videoUrl: snap.videoUrl,
    authorName: snap.authorName,
    authorAvatar: '',
    publishedAt: snap.snapshotAt,
    playCount: snap.playCount,
    likeCount: snap.likeCount,
    commentCount: snap.commentCount,
    shareCount: snap.shareCount,
    matchedKeywords: [],
    spreadScore: snap.spreadScore,
    negativeRate: snap.negativeRate,
    hotComments: [],
    isNew: false,
  };
}

function CopyableLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!url) return;
    navigator.clipboard.writeText(url).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center gap-1 max-w-[200px]">
      {url ? (
        <>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-xs text-keyword-brand hover:text-keyword-brand/80 truncate font-mono underline decoration-keyword-brand/30 hover:decoration-keyword-brand/60"
            title={url}
          >
            {url.length > 32 ? url.slice(0, 32) + '...' : url}
          </a>
          <button
            onClick={handleCopy}
            className="shrink-0 p-0.5 rounded hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors"
            title="复制链接"
          >
            {copied ? <Check className="w-3 h-3 text-risk-low" /> : <Copy className="w-3 h-3" />}
          </button>
        </>
      ) : (
        <span className="text-slate-600 text-xs">-</span>
      )}
    </div>
  );
}

export function HighRiskTable({ records, playChanges, onOpenVideo }: HighRiskTableProps) {
  if (records.length === 0) {
    return (
      <div className="card-gradient-border rounded-xl p-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-risk-urgent/15 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-risk-urgent" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">高风险视频汇总</h3>
            <p className="text-xs text-slate-400">本班次未产生高/紧急风险记录</p>
          </div>
        </div>
        <div className="py-12 text-center text-slate-500">
          <div className="text-5xl mb-3">✨</div>
          <p>当前班次未标记高风险或紧急级别的视频</p>
          <p className="text-sm mt-1">舆情态势平稳，继续保持巡检节奏</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-gradient-border rounded-xl overflow-hidden animate-fade-in">
      <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-risk-urgent/15 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-risk-urgent" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">高风险视频汇总</h3>
            <p className="text-xs text-slate-400">共 {records.length} 条需下一班重点跟进，所有视频信息已固化至交班摘要</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-risk-urgent/10 text-risk-urgent border border-risk-urgent/30">
          ⚠ 优先处理
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800/40 text-slate-400 text-xs uppercase tracking-wider">
              <th className="text-left px-5 py-3 font-medium">视频信息</th>
              <th className="text-left px-4 py-3 font-medium">风险等级</th>
              <th className="text-left px-4 py-3 font-medium">风险类型</th>
              <th className="text-left px-4 py-3 font-medium">研判意见</th>
              <th className="text-right px-4 py-3 font-medium">初始播放</th>
              <th className="text-right px-4 py-3 font-medium">当前播放</th>
              <th className="text-right px-4 py-3 font-medium">播放增量</th>
              <th className="text-left px-4 py-3 font-medium">原视频链接</th>
              <th className="text-left px-4 py-3 font-medium">状态</th>
              <th className="text-left px-4 py-3 font-medium">标记时间</th>
              <th className="text-center px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {records.map((r, idx) => {
              const snap = r.videoSnapshot;
              const change = playChanges.find(c => c.videoId === r.videoId);
              const typeMeta = RISK_TYPE_META[r.riskType];
              const statusMeta = STATUS_META[r.status];
              const isSignificant = change && (change.deltaPercent > 0.15 || change.delta > 5000);

              return (
                <tr
                  key={r.id}
                  className="hover:bg-slate-800/30 transition-colors animate-stagger"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 max-w-xs">
                      <div className="relative w-14 h-10 rounded-md overflow-hidden flex-shrink-0 border border-slate-700 bg-slate-800">
                        {snap.coverUrl ? (
                          <img src={snap.coverUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">
                            {PLATFORM_META[snap.platform].icon}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-200 font-medium truncate">{snap.title || '[视频已下线]'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <PlatformBadge platform={snap.platform} size="sm" />
                          {snap.authorName && (
                            <span className="text-xs text-slate-500">@{snap.authorName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <RiskLevelBadge level={r.riskLevel} />
                  </td>

                  <td className="px-4 py-4">
                    <span className="text-xs flex items-center gap-1">
                      <span>{typeMeta.emoji}</span>
                      <span className="text-slate-300">{typeMeta.name}</span>
                    </span>
                  </td>

                  <td className="px-4 py-4 max-w-[180px]">
                    <p className="text-slate-300 text-xs leading-relaxed line-clamp-2" title={r.opinion}>
                      {r.opinion}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 text-slate-400 font-mono text-xs">
                      <Play className="w-3 h-3" />
                      {formatNumber(r.initialPlayCount)}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 text-slate-200 font-mono">
                      <Play className="w-3 h-3 text-slate-500" />
                      {formatNumber(r.currentPlayCount)}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-right">
                    {change && change.delta > 0 ? (
                      <div className={`flex items-center justify-end gap-1 font-mono text-sm ${
                        isSignificant ? 'text-risk-urgent animate-pulse-glow font-semibold' : 'text-risk-high'
                      }`}>
                        <TrendingUp className="w-3.5 h-3.5" />
                        +{formatNumber(change.delta)}
                        <span className="text-xs opacity-75">({formatPercent(change.deltaPercent)})</span>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <CopyableLink url={snap.videoUrl} />
                  </td>

                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs ${statusMeta.bg} ${statusMeta.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        r.status === 'pending' ? 'bg-risk-urgent animate-pulse' :
                        r.status === 'processing' ? 'bg-risk-medium' : 'bg-risk-low'
                      }`} />
                      {statusMeta.name}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-slate-400 text-xs whitespace-nowrap">
                    {formatRelativeTime(r.createdAt)}
                  </td>

                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => onOpenVideo?.(snapshotToVideo(snap))}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      处置
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
