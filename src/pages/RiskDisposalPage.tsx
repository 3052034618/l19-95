import { useNavigate } from 'react-router-dom';
import { AlertOctagon, ArrowRight, Video } from 'lucide-react';
import PendingList from '@/components/risk/PendingList';
import VideoDetailDrawer from '@/components/risk/VideoDetailDrawer';
import { useAppStore } from '@/store/useAppStore';

export default function RiskDisposalPage() {
  const navigate = useNavigate();
  const selectedVideo = useAppStore(s => s.selectedVideo);
  const videos = useAppStore(s => s.videos);
  const selectVideo = useAppStore(s => s.selectVideo);
  const riskRecords = useAppStore(s => s.riskRecords);

  // 未被标记为风险的可疑视频推荐（传播分>=70或负面率>=0.35 且 不在风险记录中）
  const riskyVideoIds = new Set(riskRecords.map(r => r.videoId));
  const suggestedVideos = videos
    .filter(v => !riskyVideoIds.has(v.id) && (v.spreadScore >= 70 || v.negativeRate >= 0.35))
    .slice(0, 5);

  return (
    <div className="min-h-full p-6">
      {/* 页面标题 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-risk-urgent to-risk-high flex items-center justify-center shadow-lg shadow-risk-urgent/20">
            <AlertOctagon size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-wide">风险分级处置</h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-risk-urgent/15 text-risk-urgent border border-risk-urgent/30 animate-pulse">
                LIVE
              </span>
            </div>
            <p className="text-sm text-monitor-muted mt-1">
              查看可疑视频详情，标记风险类型与等级，跟踪处理进展
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/inspection')}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-monitor-card border border-monitor-border text-slate-300 text-sm font-medium hover:bg-monitor-border/40 hover:border-slate-500 transition-all duration-200"
          >
            <Video size={15} />
            返回巡检清单
            <ArrowRight size={15} className="rotate-180" />
          </button>
          <button
            onClick={() => navigate('/handover')}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-brand-blue/15 border border-brand-blue/40 text-brand-blue text-sm font-medium hover:bg-brand-blue/25 transition-all duration-200"
          >
            生成交接班摘要
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* 主区：待处理列表 */}
        <div className="xl:col-span-3">
          <PendingList />
        </div>

        {/* 侧栏：快速推荐 */}
        <div className="space-y-4">
          <div className="rounded-lg border border-monitor-border bg-monitor-card p-4 animate-fade-in" style={{ animationDelay: '120ms' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-risk-medium animate-pulse" />
              <h3 className="text-sm font-semibold text-slate-200">待标记可疑视频</h3>
              <span className="text-[11px] font-mono text-monitor-muted">{suggestedVideos.length}</span>
            </div>
            {suggestedVideos.length === 0 ? (
              <div className="text-center py-6 text-xs text-monitor-muted">
                暂无可疑视频推荐
              </div>
            ) : (
              <div className="space-y-2">
                {suggestedVideos.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => selectVideo(v)}
                    className="w-full flex gap-2 p-2 rounded-md border border-transparent hover:border-monitor-border hover:bg-monitor-bg transition-all text-left group animate-fade-in"
                    style={{ animationDelay: `${i * 40 + 180}ms` }}
                  >
                    <div
                      className="w-12 h-9 shrink-0 rounded overflow-hidden flex items-center justify-center text-[11px] font-bold text-white/80"
                      style={{ background: v.coverUrl }}
                    >
                      {v.title.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 leading-snug line-clamp-2 group-hover:text-white transition-colors">
                        {v.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-monitor-muted">
                        <span className={v.spreadScore >= 80 ? 'text-risk-urgent' : ''}>传播{v.spreadScore}</span>
                        <span>·</span>
                        <span className={v.negativeRate >= 0.4 ? 'text-purple-400' : ''}>负面{(v.negativeRate * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 操作规范提示 */}
          <div className="rounded-lg border border-monitor-border bg-monitor-card p-4 animate-fade-in" style={{ animationDelay: '240ms' }}>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">处置规范</h3>
            <ul className="space-y-2 text-xs text-monitor-muted leading-relaxed">
              <li className="flex gap-2">
                <span className="text-risk-urgent shrink-0">①</span>
                <span>紧急/高风险：15分钟内完成研判，30分钟内联系协同部门</span>
              </li>
              <li className="flex gap-2">
                <span className="text-risk-medium shrink-0">②</span>
                <span>中风险：2小时内完成研判，必要时联系部门</span>
              </li>
              <li className="flex gap-2">
                <span className="text-risk-low shrink-0">③</span>
                <span>低风险：写入研判意见，纳入日常监控即可</span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand-blue shrink-0">④</span>
                <span>每条记录必须填写研判意见，方可流转到下一状态</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 视频详情抽屉 */}
      <VideoDetailDrawer />
    </div>
  );
}
