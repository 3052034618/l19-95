import { MessageCircle, ThumbsUp, Minus, ThumbsDown, BarChart3 } from 'lucide-react';
import type { Sentiment } from '@/types';
import { formatPercent } from '@/utils/format';
import { getSentimentColor } from '@/utils/sentiment';

interface SentimentChartProps {
  stats: { positive: number; neutral: number; negative: number };
}

const SENTIMENT_META: Record<Sentiment, { name: string; icon: typeof ThumbsUp; color: string; bar: string }> = {
  positive: { name: '正面评论', icon: ThumbsUp, color: 'text-risk-low', bar: 'bg-risk-low' },
  neutral: { name: '中性评论', icon: Minus, color: 'text-slate-400', bar: 'bg-slate-400' },
  negative: { name: '负面评论', icon: ThumbsDown, color: 'text-risk-urgent', bar: 'bg-risk-urgent' },
};

export function SentimentChart({ stats }: SentimentChartProps) {
  const entries: [Sentiment, number][] = [
    ['positive', stats.positive],
    ['neutral', stats.neutral],
    ['negative', stats.negative],
  ];

  const total = stats.positive + stats.neutral + stats.negative;
  const negativeCount = Math.round(stats.negative * 1000);
  const isAlert = stats.negative > 0.25;

  return (
    <div className="card-gradient-border rounded-xl p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sentiment-negative/15 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-sentiment-negative" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">评论情绪分布</h3>
            <p className="text-xs text-slate-400">基于近 {total > 0 ? '~' + Math.round(total * 100) : 0} 条抽样热评</p>
          </div>
        </div>
        {isAlert && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-risk-urgent/10 text-risk-urgent border border-risk-urgent/30 animate-pulse-glow">
            ⚠ 负面占比偏高
          </span>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-400">情绪条渐变</span>
        </div>
        <div className="h-4 rounded-full overflow-hidden flex bg-slate-800">
          {entries.map(([key, value]) => {
            const meta = SENTIMENT_META[key];
            const width = value * 100;
            if (width < 1) return null;
            return (
              <div
                key={key}
                className={`h-full ${meta.bar} transition-all duration-1000 ease-out`}
                style={{ width: `${width}%` }}
                title={`${meta.name}: ${formatPercent(value)}`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-risk-low">正面 0%</span>
          <span className="text-[10px] text-slate-500">中性 50%</span>
          <span className="text-[10px] text-risk-urgent">负面 100%</span>
        </div>
      </div>

      <div className="space-y-4">
        {entries.map(([key, value], idx) => {
          const meta = SENTIMENT_META[key];
          const Icon = meta.icon;
          return (
            <div
              key={key}
              className="animate-stagger"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md ${meta.bar}/20 flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                  </div>
                  <span className="text-sm text-slate-300">{meta.name}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold font-mono ${meta.color}`}>
                    {formatPercent(value)}
                  </span>
                  <span className="text-xs text-slate-500">
                    ≈ {Math.round(value * 1000)} 条
                  </span>
                </div>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${meta.bar} transition-all duration-1000 ease-out`}
                  style={{ width: `${Math.max(value * 100, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className={`mt-5 p-4 rounded-xl ${
        isAlert
          ? 'bg-risk-urgent/8 border border-risk-urgent/25'
          : 'bg-risk-low/8 border border-risk-low/20'
      }`}>
        <div className="flex items-start gap-2.5">
          <div className={`text-lg ${isAlert ? 'animate-pulse' : ''}`}>
            {isAlert ? '🔴' : '🟢'}
          </div>
          <div className="flex-1 text-sm">
            <p className={`font-medium ${isAlert ? 'text-risk-urgent' : 'text-risk-low'}`}>
              {isAlert ? '情绪预警：负面声量需重点关注' : '情绪态势：整体口碑表现良好'}
            </p>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              {isAlert
                ? `当前负面评论占比 ${formatPercent(stats.negative)}，超过 25% 警戒线。建议下一班重点排查负面源头，必要时协调市场部出应对话术。`
                : `正面评论占主导（${formatPercent(stats.positive)}），品牌声量健康。继续保持常规巡检节奏即可。`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
