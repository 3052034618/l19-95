import { useEffect, useState } from 'react';
import { RefreshCw, Bell, Settings, ChevronDown, Clock, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatNumber } from '@/utils/format';
import { RISK_LEVEL_META } from '@/types';

export default function TopBar() {
  const [now, setNow] = useState(new Date());
  const fetchVideos = useAppStore(s => s.fetchVideos);
  const videos = useAppStore(s => s.videos);
  const riskRecords = useAppStore(s => s.riskRecords);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchVideos();
    setTimeout(() => setRefreshing(false), 800);
  };

  const urgentCount = riskRecords.filter(r => r.riskLevel === 'urgent' && r.status !== 'resolved').length;
  const newVideos = videos.filter(v => v.isNew).length;
  const totalPlay = videos.reduce((s, v) => s + v.playCount, 0);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()];

  return (
    <header className="h-16 bg-monitor-card border-b border-monitor-border px-6 flex items-center gap-6 shrink-0">
      {/* 实时指标条 */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-monitor-bg border border-monitor-border/50">
          <span className="w-2 h-2 rounded-full bg-risk-low animate-pulse" />
          <span className="text-xs text-monitor-muted">实时监控</span>
          <span className="font-mono text-xs text-slate-300">{timeStr}</span>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-monitor-muted">新增视频</span>
            <span className="font-mono font-semibold text-brand-blue">+{newVideos}</span>
          </div>
          <div className="w-px h-4 bg-monitor-border" />
          <div className="flex items-center gap-1.5">
            <span className="text-monitor-muted">总播放</span>
            <span className="font-mono font-semibold text-slate-200">{formatNumber(totalPlay)}</span>
          </div>
          <div className="w-px h-4 bg-monitor-border" />
          <div className="flex items-center gap-1.5">
            <AlertCircle size={12} className={urgentCount > 0 ? 'text-risk-urgent animate-pulse' : 'text-monitor-muted'} />
            <span className="text-monitor-muted">紧急风险</span>
            <span className={`font-mono font-semibold ${urgentCount > 0 ? RISK_LEVEL_META.urgent.color : 'text-slate-400'}`}>
              {urgentCount}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1" />

      {/* 日期 */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-monitor-bg border border-monitor-border/50">
        <Clock size={13} className="text-monitor-muted" />
        <span className="text-xs font-mono text-slate-300">{dateStr}</span>
        <span className="text-xs text-monitor-muted">{weekday}</span>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-monitor-border/40 transition-all duration-200 group"
        >
          <RefreshCw
            size={16}
            className={`transition-transform duration-500 ${refreshing ? 'animate-spin text-brand-blue' : 'group-hover:rotate-180'}`}
          />
          <span className="hidden sm:inline">刷新数据</span>
        </button>

        <button className="relative p-2 rounded-md text-slate-300 hover:bg-monitor-border/40 transition-all duration-200">
          <Bell size={18} />
          {urgentCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-risk-urgent text-white text-[10px] font-bold font-mono flex items-center justify-center animate-pulse-glow">
              {urgentCount}
            </span>
          )}
        </button>

        <button className="p-2 rounded-md text-slate-300 hover:bg-monitor-border/40 transition-all duration-200">
          <Settings size={18} />
        </button>

        <div className="w-px h-6 bg-monitor-border mx-1" />

        <button className="flex items-center gap-1.5 p-1 pr-2 rounded-md hover:bg-monitor-border/40 transition-all duration-200">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
            张
          </div>
          <ChevronDown size={14} className="text-monitor-muted" />
        </button>
      </div>
    </header>
  );
}
