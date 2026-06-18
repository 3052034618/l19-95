import { useState } from 'react';
import { Hash } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { HotWord } from '@/types';
import { getSentimentColor } from '@/utils/sentiment';
import { cn } from '@/lib/utils';

export default function HotWordCloud() {
  const hotWords = useAppStore(s => s.hotWords);
  const keywords = useAppStore(s => s.config.keywords);
  const [hovered, setHovered] = useState<HotWord | null>(null);

  const enabledKeywordTexts = keywords.filter(k => k.enabled).map(k => k.text);

  if (enabledKeywordTexts.length === 0) {
    return (
      <div className="rounded-lg border border-monitor-border bg-monitor-card p-5 animate-fade-in" style={{ animationDelay: '240ms' }}>
        <div className="flex items-center gap-2 mb-4">
          <Hash size={16} className="text-brand-blue" />
          <h3 className="text-sm font-semibold text-slate-200">评论热词云</h3>
        </div>
        <div className="text-center py-10 text-monitor-muted text-sm">
          <Hash size={24} className="mx-auto mb-2 opacity-40" />
          <p>请先启用巡检关键词</p>
          <p className="text-xs mt-1 opacity-70">启用后将自动生成相关视频的评论热词</p>
        </div>
      </div>
    );
  }

  if (hotWords.length === 0) {
    return (
      <div className="rounded-lg border border-monitor-border bg-monitor-card p-5 animate-fade-in" style={{ animationDelay: '240ms' }}>
        <div className="flex items-center gap-2 mb-4">
          <Hash size={16} className="text-brand-blue" />
          <h3 className="text-sm font-semibold text-slate-200">评论热词云</h3>
        </div>
        <div className="text-center py-12 text-monitor-muted text-sm">暂无热词数据</div>
      </div>
    );
  }

  const maxFreq = Math.max(...hotWords.map(w => w.frequency));
  const minFreq = Math.min(...hotWords.map(w => w.frequency));

  const getSize = (freq: number) => {
    const t = (freq - minFreq) / (maxFreq - minFreq || 1);
    const size = 11 + t * 22;
    return `${size.toFixed(1)}px`;
  };

  const getOpacity = (freq: number) => {
    const t = (freq - minFreq) / (maxFreq - minFreq || 1);
    return 0.6 + t * 0.4;
  };

  return (
    <div className="rounded-lg border border-monitor-border bg-monitor-card p-5 animate-fade-in" style={{ animationDelay: '240ms' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Hash size={16} className="text-brand-blue" />
          <h3 className="text-sm font-semibold text-slate-200">评论热词云</h3>
          <span className="text-[11px] text-monitor-muted font-mono">Top {Math.min(15, hotWords.length)}</span>
        </div>
        {hovered && (
          <div className="flex items-center gap-2 text-[11px] font-mono px-2 py-1 rounded bg-monitor-bg border border-monitor-border animate-fade-in">
            <span className={getSentimentColor(hovered.sentiment)}>{hovered.word}</span>
            <span className="text-monitor-muted">频次</span>
            <span className="text-slate-200 font-semibold">{hovered.frequency}</span>
          </div>
        )}
      </div>

      <div className="min-h-[180px] flex flex-wrap items-center justify-center gap-x-4 gap-y-2 p-2 rounded-md bg-monitor-bg/50 border border-monitor-border/30">
        {hotWords.slice(0, 15).map((word, i) => (
          <button
            key={word.word}
            onMouseEnter={() => setHovered(word)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              'relative font-bold transition-all duration-300 cursor-pointer hover:scale-110',
              'hover:drop-shadow-lg',
              getSentimentColor(word.sentiment),
              hovered?.word === word.word && 'scale-125'
            )}
            style={{
              fontSize: getSize(word.frequency),
              opacity: getOpacity(word.frequency),
              animation: `fadeIn 0.5s ease-out ${i * 40}ms both`,
            }}
          >
            <span className="opacity-60 text-[0.6em] mr-0.5">#</span>
            {word.word}
            {hovered?.word === word.word && (
              <span
                className={cn(
                  'absolute -top-1 -right-1 w-2 h-2 rounded-full -mt-1 -mr-1',
                  word.sentiment === 'negative' && 'bg-risk-urgent',
                  word.sentiment === 'positive' && 'bg-risk-low',
                  word.sentiment === 'neutral' && 'bg-monitor-muted'
                )}
              />
            )}
          </button>
        ))}
      </div>

      {/* 情绪图例 */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-monitor-border/30">
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-sentiment-positive" />
          <span className="text-monitor-muted">正面</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-sentiment-neutral" />
          <span className="text-monitor-muted">中性</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-sentiment-negative" />
          <span className="text-monitor-muted">负面</span>
        </div>
      </div>
    </div>
  );
}
