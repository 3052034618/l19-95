import { useState, useEffect } from 'react';
import {
  X, Play, Heart, MessageCircle, Share2, User, Clock,
  TrendingUp, BarChart3, ThumbsUp, ThumbsDown, Minus, Send,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import PlatformBadge from '@/components/shared/PlatformBadge';
import { getSentimentBg, getSentimentColor, getSentimentLabel } from '@/utils/sentiment';
import { formatNumber, formatRelativeTime, formatPercent, formatDateTime } from '@/utils/format';
import RiskMarkPanel from './RiskMarkPanel';
import { cn } from '@/lib/utils';
import type { Comment } from '@/types';

export default function VideoDetailDrawer() {
  const selectedVideo = useAppStore(s => s.selectedVideo);
  const selectVideo = useAppStore(s => s.selectVideo);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSubmitted(false);
  }, [selectedVideo?.id]);

  const isOpen = !!selectedVideo;
  const v = selectedVideo;

  if (!v) return null;

  const sentStats = {
    positive: v.hotComments.filter(c => c.sentiment === 'positive').length,
    neutral: v.hotComments.filter(c => c.sentiment === 'neutral').length,
    negative: v.hotComments.filter(c => c.sentiment === 'negative').length,
    total: v.hotComments.length,
  };

  return (
    <>
      {/* 遮罩 */}
      <div
        className={cn(
          'fixed inset-0 z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100 bg-black/60 backdrop-blur-sm' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => selectVideo(null)}
      />
      {/* 抽屉 */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-full max-w-3xl bg-monitor-bg border-l border-monitor-border shadow-2xl transition-transform duration-300 ease-out flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* 提交成功提示 */}
        {submitted && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-risk-low/20 border border-risk-low/40 text-risk-low text-sm font-medium animate-slide-in-left">
            <ThumbsUp size={15} />
            已标记风险并加入待处理列表！
          </div>
        )}

        {/* Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-monitor-border bg-monitor-card shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <PlatformBadge platform={v.platform} size="md" />
            <span className="text-sm font-medium text-slate-200 truncate max-w-sm">视频详情</span>
          </div>
          <button
            onClick={() => selectVideo(null)}
            className="p-1.5 rounded-md hover:bg-monitor-border text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* 视频预览区 */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-monitor-border shadow-lg animate-fade-in">
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: v.coverUrl }}
              >
                <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center shadow-2xl group cursor-pointer hover:scale-110 transition-transform duration-300">
                  <Play size={28} fill="white" className="text-white ml-1" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="text-lg font-semibold text-white leading-snug mb-2 line-clamp-2">{v.title}</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  {v.matchedKeywords.map(kw => (
                    <span key={kw} className="px-2 py-0.5 rounded bg-brand-blue/30 text-brand-blue-100 text-[11px] font-mono border border-brand-blue/40">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
              {v.isNew && (
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono text-white bg-brand-blue animate-pulse">
                  NEW
                </span>
              )}
            </div>

            {/* 作者和时间 */}
            <div className="flex items-center justify-between flex-wrap gap-3 animate-fade-in" style={{ animationDelay: '60ms' }}>
              <div className="flex items-center gap-2.5">
                <img src={v.authorAvatar} className="w-9 h-9 rounded-full border border-monitor-border" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-200">{v.authorName}</span>
                  <span className="text-[11px] text-monitor-muted font-mono flex items-center gap-1">
                    <User size={10} /> 创作者
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-monitor-muted font-mono">
                <span className="flex items-center gap-1"><Clock size={11} /> {formatDateTime(v.publishedAt)}</span>
                <span>（{formatRelativeTime(v.publishedAt)}）</span>
              </div>
            </div>

            {/* 数据指标卡 */}
            <div className="grid grid-cols-4 gap-2.5 animate-fade-in" style={{ animationDelay: '120ms' }}>
              <DataMetric icon={<Play size={14} />} label="播放量" value={formatNumber(v.playCount)} color="blue" />
              <DataMetric icon={<Heart size={14} />} label="点赞" value={formatNumber(v.likeCount)} color="red" />
              <DataMetric icon={<MessageCircle size={14} />} label="评论" value={formatNumber(v.commentCount)} color="amber" />
              <DataMetric icon={<Share2 size={14} />} label="转发" value={formatNumber(v.shareCount)} color="green" />
            </div>

            {/* 传播评分条 */}
            <div className="rounded-lg border border-monitor-border bg-monitor-card p-4 animate-fade-in" style={{ animationDelay: '180ms' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={15} className="text-risk-high" />
                  <span className="text-xs font-medium text-slate-300">传播与风险指标</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <ScoreBar label="传播分数" score={v.spreadScore} color={v.spreadScore >= 80 ? 'risk-urgent' : v.spreadScore >= 60 ? 'risk-high' : 'brand-blue'} />
                <ScoreBar label="负面评论率" score={v.negativeRate * 100} color={v.negativeRate >= 0.4 ? 'risk-urgent' : v.negativeRate >= 0.25 ? 'risk-high' : 'risk-low'} suffix="%" />
              </div>
            </div>

            {/* 评论情绪分布 */}
            <div className="rounded-lg border border-monitor-border bg-monitor-card p-4 animate-fade-in" style={{ animationDelay: '240ms' }}>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={15} className="text-purple-400" />
                <span className="text-xs font-medium text-slate-300">样本评论情绪分布（{sentStats.total}条）</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden bg-monitor-bg flex mb-3">
                {sentStats.positive > 0 && (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-700" style={{ width: `${(sentStats.positive / sentStats.total) * 100}%` }} />
                )}
                {sentStats.neutral > 0 && (
                  <div className="bg-gradient-to-r from-slate-500 to-slate-400 transition-all duration-700" style={{ width: `${(sentStats.neutral / sentStats.total) * 100}%` }} />
                )}
                {sentStats.negative > 0 && (
                  <div className="bg-gradient-to-r from-red-600 to-red-400 transition-all duration-700" style={{ width: `${(sentStats.negative / sentStats.total) * 100}%` }} />
                )}
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1"><ThumbsUp size={11} className="text-sentiment-positive" /> 正面 <span className="font-mono font-semibold text-slate-200">{formatPercent(sentStats.positive / sentStats.total)}</span></span>
                <span className="flex items-center gap-1"><Minus size={11} className="text-sentiment-neutral" /> 中性 <span className="font-mono font-semibold text-slate-200">{formatPercent(sentStats.neutral / sentStats.total)}</span></span>
                <span className="flex items-center gap-1"><ThumbsDown size={11} className="text-sentiment-negative" /> 负面 <span className="font-mono font-semibold text-slate-200">{formatPercent(sentStats.negative / sentStats.total)}</span></span>
              </div>
            </div>

            {/* 热评列表 */}
            <div className="rounded-lg border border-monitor-border bg-monitor-card p-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle size={15} className="text-brand-blue" />
                <span className="text-xs font-medium text-slate-300">热门评论（Top {Math.min(8, v.hotComments.length)}）</span>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {v.hotComments.slice(0, 8).map((c, i) => (
                  <CommentItem key={c.id} comment={c} index={i} />
                ))}
              </div>
            </div>

            {/* 风险标记面板 */}
            <RiskMarkPanel videoId={v.id} onSubmitted={() => setSubmitted(true)} />
          </div>
        </div>
      </div>
    </>
  );
}

function DataMetric({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string;
  color: 'blue' | 'red' | 'amber' | 'green';
}) {
  const colorMap = {
    blue: 'text-brand-blue bg-brand-blue/10 border-brand-blue/20',
    red: 'text-risk-urgent bg-risk-urgent/10 border-risk-urgent/20',
    amber: 'text-risk-medium bg-risk-medium/10 border-risk-medium/20',
    green: 'text-risk-low bg-risk-low/10 border-risk-low/20',
  };
  return (
    <div className={cn('flex flex-col items-center gap-1 p-3 rounded-lg border', colorMap[color])}>
      {icon}
      <span className="text-xl font-mono font-bold text-white">{value}</span>
      <span className="text-[10px] text-monitor-muted">{label}</span>
    </div>
  );
}

function ScoreBar({ label, score, color, suffix = '' }: {
  label: string; score: number; color: string; suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-monitor-muted">{label}</span>
        <span className={`text-sm font-mono font-bold text-${color}`}>{Math.round(score)}{suffix}</span>
      </div>
      <div className="h-2 rounded-full bg-monitor-bg overflow-hidden">
        <div
          className={`h-full rounded-full bg-${color} transition-all duration-1000 ease-out`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}

function CommentItem({ comment, index }: { comment: Comment; index: number }) {
  return (
    <div
      className="flex gap-2.5 animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="w-7 h-7 shrink-0 rounded-full bg-monitor-border flex items-center justify-center text-[11px] font-bold text-slate-300">
        {comment.userName.slice(0, 1)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-slate-300">{comment.userName}</span>
          <span className={cn(
            'inline-flex items-center px-1.5 py-px rounded text-[9px] font-medium',
            getSentimentBg(comment.sentiment),
            getSentimentColor(comment.sentiment)
          )}>
            {getSentimentLabel(comment.sentiment)}
          </span>
          <span className="text-[10px] text-monitor-muted font-mono">{formatRelativeTime(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed mb-1">{comment.content}</p>
        <div className="flex items-center gap-0.5 text-[10px] text-monitor-muted">
          <Heart size={10} /> {comment.likeCount}
        </div>
      </div>
    </div>
  );
}
