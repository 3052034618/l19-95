import { useState, useMemo } from 'react';
import { Video, Search, SlidersHorizontal, ArrowUpDown, Sparkles, Flame } from 'lucide-react';
import VideoCard from './VideoCard';
import EmptyState from '@/components/shared/EmptyState';
import { useAppStore } from '@/store/useAppStore';
import StatCard from '@/components/shared/StatCard';
import { formatNumber } from '@/utils/format';

type SortKey = 'time' | 'play' | 'spread' | 'negative';

export default function VideoList() {
  const videos = useAppStore(s => s.videos);
  const keywords = useAppStore(s => s.config.keywords);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('time');
  const [onlySuspicious, setOnlySuspicious] = useState(false);

  const totalPlay = videos.reduce((s, v) => s + v.playCount, 0);
  const totalComments = videos.reduce((s, v) => s + v.commentCount, 0);
  const suspiciousCount = videos.filter(v => v.spreadScore >= 80 || v.negativeRate >= 0.4).length;
  const newCount = videos.filter(v => v.isNew).length;

  if (keywords.length === 0) {
    return (
      <div className="space-y-4 animate-fade-in" style={{ animationDelay: '180ms' }}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="视频总数" value={0} suffix="条" icon={<Video size={16} />} color="blue" />
          <StatCard label="新增内容" value={0} suffix="条" icon={<Sparkles size={16} />} color="green" />
          <StatCard label="总播放" value={0} icon={<Video size={16} />} color="purple" formatFn={formatNumber} />
          <StatCard label="可疑内容" value={0} suffix="条" icon={<Flame size={16} />} color="red" />
        </div>
        <EmptyState
          variant="search"
          title="请先添加巡检关键词"
          description="在左侧关键词管理面板添加品牌名、产品别称、门店简称、代言人或竞品词后，视频列表将自动按关键词刷新"
        />
      </div>
    );
  }

  const filtered = useMemo(() => {
    let result = [...videos];
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(v =>
        v.title.toLowerCase().includes(s) ||
        v.authorName.toLowerCase().includes(s) ||
        v.matchedKeywords.some(k => k.toLowerCase().includes(s))
      );
    }
    if (onlySuspicious) {
      result = result.filter(v => v.spreadScore >= 80 || v.negativeRate >= 0.4);
    }
    switch (sortBy) {
      case 'time': result.sort((a, b) => b.publishedAt - a.publishedAt); break;
      case 'play': result.sort((a, b) => b.playCount - a.playCount); break;
      case 'spread': result.sort((a, b) => b.spreadScore - a.spreadScore); break;
      case 'negative': result.sort((a, b) => b.negativeRate - a.negativeRate); break;
    }
    return result;
  }, [videos, search, sortBy, onlySuspicious]);

  const sortOptions: { key: SortKey; label: string; icon: React.ReactNode }[] = [
    { key: 'time', label: '最新', icon: <ArrowUpDown size={13} /> },
    { key: 'play', label: '播放量', icon: <Video size={13} /> },
    { key: 'spread', label: '传播分', icon: <Flame size={13} /> },
    { key: 'negative', label: '负面率', icon: <Sparkles size={13} /> },
  ];

  return (
    <div className="space-y-4 animate-fade-in" style={{ animationDelay: '180ms' }}>
      {/* 概览卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="视频总数" value={videos.length} suffix="条" icon={<Video size={16} />} color="blue" />
        <StatCard label="新增内容" value={newCount} suffix="条" icon={<Sparkles size={16} />} color="green" deltaPercent={0.12} />
        <StatCard label="总播放" value={totalPlay} icon={<Video size={16} />} color="purple" formatFn={formatNumber} />
        <StatCard label="可疑内容" value={suspiciousCount} suffix="条" icon={<Flame size={16} />} color="red" deltaPercent={0.05} />
      </div>

      {/* 筛选条 */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-monitor-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索标题、账号、关键词..."
            className="w-full pl-9 pr-3 py-2 input-base"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-monitor-card border border-monitor-border">
            {sortOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                  sortBy === opt.key
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-monitor-border/50'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setOnlySuspicious(v => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border transition-all duration-200 ${
              onlySuspicious
                ? 'bg-risk-urgent/15 border-risk-urgent/40 text-risk-urgent'
                : 'bg-monitor-card border-monitor-border text-slate-400 hover:text-slate-200 hover:border-slate-500'
            }`}
          >
            <SlidersHorizontal size={13} />
            仅看可疑
            {onlySuspicious && <span className="ml-0.5 font-mono">({suspiciousCount})</span>}
          </button>
        </div>
      </div>

      {/* 视频网格 */}
      {filtered.length === 0 ? (
        <EmptyState
          variant="search"
          title="未找到匹配视频"
          description="尝试修改搜索关键词或筛选条件"
        />
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-monitor-muted mb-2">
            <span>共 <span className="text-slate-300 font-mono font-semibold">{filtered.length}</span> 条结果</span>
            <span className="font-mono">按{sortOptions.find(o => o.key === sortBy)?.label}排序</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-stagger">
            {filtered.map((video, i) => (
              <VideoCard key={video.id} video={video} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
