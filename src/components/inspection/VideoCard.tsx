import { Play, Heart, MessageCircle, Share2, Zap, AlertTriangle } from 'lucide-react';
import type { Video } from '@/types';
import PlatformBadge from '@/components/shared/PlatformBadge';
import { formatNumber, formatRelativeTime, truncateText, formatPercent } from '@/utils/format';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';

interface Props {
  video: Video;
  index: number;
}

export default function VideoCard({ video, index }: Props) {
  const selectVideo = useAppStore(s => s.selectVideo);
  const navigate = useNavigate();

  const hasSpreadAlert = video.spreadScore >= 80;
  const hasNegativeAlert = video.negativeRate >= 0.4;
  const isSuspicious = hasSpreadAlert || hasNegativeAlert;

  const handleClick = () => {
    selectVideo(video);
    navigate('/risk');
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative rounded-lg border bg-monitor-card overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl animate-fade-in',
        isSuspicious
          ? 'border-risk-urgent/40 hover:border-risk-urgent/70 hover:shadow-risk-urgent/10'
          : 'border-monitor-border hover:border-slate-500'
      )}
      style={{ animationDelay: `${(index % 10) * 60}ms` }}
    >
      {/* 可疑条纹背景 */}
      {isSuspicious && <div className="absolute inset-0 risk-stripe opacity-40 pointer-events-none" />}

      {/* 封面 */}
      <div className="relative aspect-video overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
          style={{ background: video.coverUrl }}
        >
          <span className="font-bold text-white/90 text-4xl font-mono drop-shadow-lg">
            {video.title.slice(0, 2)}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* 平台角标 */}
        <div className="absolute top-2 left-2">
          <PlatformBadge platform={video.platform} size="sm" />
        </div>

        {/* 新内容标签 */}
        {video.isNew && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono text-white bg-brand-blue animate-pulse">
              <span className="w-1 h-1 rounded-full bg-white animate-ping" />
              NEW
            </span>
          </div>
        )}

        {/* 播放量 */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 text-white text-[11px] font-mono backdrop-blur-sm">
            <Play size={11} fill="white" />
            {formatNumber(video.playCount)}
          </span>
        </div>

        {/* 告警标识 */}
        {hasSpreadAlert && (
          <div className="absolute bottom-2 right-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-risk-urgent text-white text-[10px] font-bold animate-pulse-glow">
              <Zap size={11} fill="currentColor" />
              传播
            </span>
          </div>
        )}
      </div>

      {/* 内容 */}
      <div className="relative p-3 space-y-2">
        {/* 标题 */}
        <h4 className="text-sm font-medium text-slate-200 leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {video.title}
        </h4>

        {/* 匹配关键词 */}
        {video.matchedKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {video.matchedKeywords.slice(0, 3).map(kw => (
              <span
                key={kw}
                className="inline-flex items-center px-1.5 py-0.5 rounded bg-brand-blue/15 text-brand-blue text-[10px] font-mono border border-brand-blue/30"
              >
                #{kw}
              </span>
            ))}
          </div>
        )}

        {/* 作者 */}
        <div className="flex items-center gap-2 pt-1">
          <img
            src={video.authorAvatar}
            alt={video.authorName}
            className="w-5 h-5 rounded-full"
          />
          <span className="text-xs text-monitor-muted truncate flex-1">{video.authorName}</span>
          <span className="text-[10px] text-monitor-muted font-mono shrink-0">
            {formatRelativeTime(video.publishedAt)}
          </span>
        </div>

        {/* 数据指标 */}
        <div className="flex items-center gap-3 pt-1 border-t border-monitor-border/50">
          <div className="flex items-center gap-1 text-[11px] text-monitor-muted">
            <Heart size={12} /> {formatNumber(video.likeCount)}
          </div>
          <div className={cn(
            'flex items-center gap-1 text-[11px]',
            hasNegativeAlert ? 'text-risk-urgent' : 'text-monitor-muted'
          )}>
            <MessageCircle size={12} /> {formatNumber(video.commentCount)}
            {hasNegativeAlert && (
              <span className="ml-1 text-[9px] font-mono">
                ↓{formatPercent(video.negativeRate, 0)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-monitor-muted">
            <Share2 size={12} /> {formatNumber(video.shareCount)}
          </div>
          <div className="flex-1" />
          {isSuspicious && (
            <AlertTriangle size={13} className="text-risk-urgent" />
          )}
        </div>
      </div>
    </div>
  );
}
