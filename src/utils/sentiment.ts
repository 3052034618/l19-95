import type { Sentiment } from '@/types';

export function getSentimentColor(sentiment: Sentiment): string {
  switch (sentiment) {
    case 'positive': return 'text-sentiment-positive';
    case 'neutral': return 'text-sentiment-neutral';
    case 'negative': return 'text-sentiment-negative';
  }
}

export function getSentimentBg(sentiment: Sentiment): string {
  switch (sentiment) {
    case 'positive': return 'bg-sentiment-positive/10';
    case 'neutral': return 'bg-sentiment-neutral/10';
    case 'negative': return 'bg-sentiment-negative/10';
  }
}

export function getSentimentLabel(sentiment: Sentiment): string {
  switch (sentiment) {
    case 'positive': return '正面';
    case 'neutral': return '中性';
    case 'negative': return '负面';
  }
}

export function getSentimentBarColor(sentiment: Sentiment): string {
  switch (sentiment) {
    case 'positive': return 'bg-gradient-to-r from-green-500 to-emerald-400';
    case 'neutral': return 'bg-gradient-to-r from-slate-500 to-slate-400';
    case 'negative': return 'bg-gradient-to-r from-red-600 to-red-400';
  }
}
