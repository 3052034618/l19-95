import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, History, FileSearch, Eye, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { SHIFT_META, type ShiftType, type HandoverSummary, type Video } from '@/types';
import { formatDateTime, formatNumber, formatRelativeTime, formatPercent } from '@/utils/format';
import StatCard from '@/components/shared/StatCard';
import EmptyState from '@/components/shared/EmptyState';
import { ShiftInfoBar } from '@/components/handover/ShiftInfoBar';
import { HighRiskTable } from '@/components/handover/HighRiskTable';
import { SentimentChart } from '@/components/handover/SentimentChart';
import { CollaborationTimeline } from '@/components/handover/CollaborationTimeline';
import { SummaryExportPanel } from '@/components/handover/SummaryExportPanel';
import { TopGrowersCard } from '@/components/handover/TopGrowersCard';
import { cn } from '@/lib/utils';

export default function HandoverPage() {
  const navigate = useNavigate();
  const {
    riskRecords,
    videos,
    summaries,
    currentShiftSummary,
    generateSummary,
    confirmHandover,
    setCurrentSummary,
    selectVideo,
  } = useAppStore();

  const [shiftType, setShiftType] = useState<ShiftType>(
    new Date().getHours() >= 8 && new Date().getHours() < 18 ? 'morning' : 'evening'
  );
  const [operatorName, setOperatorName] = useState('张公关');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSummaryId, setActiveSummaryId] = useState<string | null>(
    currentShiftSummary?.id || null
  );
  const [showHistory, setShowHistory] = useState(false);

  const highRiskCount = riskRecords.filter(
    r => r.riskLevel === 'high' || r.riskLevel === 'urgent'
  ).length;
  const pendingCount = riskRecords.filter(r => r.status === 'pending').length;
  const resolvedCount = riskRecords.filter(r => r.status === 'resolved').length;
  const deptCount = new Set(riskRecords.flatMap(r => r.contactDepartments)).size;

  const activeSummary: HandoverSummary | null = useMemo(() => {
    if (activeSummaryId) {
      return summaries.find(s => s.id === activeSummaryId) || currentShiftSummary;
    }
    return currentShiftSummary;
  }, [activeSummaryId, summaries, currentShiftSummary]);

  const handleOpenVideo = (video: Video) => {
    selectVideo(video);
    navigate('/risk');
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const summary = generateSummary(operatorName, shiftType);
      setActiveSummaryId(summary.id);
      setIsGenerating(false);
    }, 600);
  };

  const handleConfirm = (confirmedBy: string) => {
    if (activeSummary) {
      confirmHandover(activeSummary.id, confirmedBy);
    }
  };

  const handleSelectHistory = (s: HandoverSummary) => {
    setActiveSummaryId(s.id);
    setCurrentSummary(s);
    setShowHistory(false);
  };

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/inspection')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/50 hover:border-slate-600 text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            返回巡检
          </button>
          <div className="h-6 w-px bg-slate-700" />
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              📋 交接班摘要
              <span className="text-xs font-normal text-slate-400 ml-2">
                每日早晚班固定流程
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              自动汇总本班次高风险、播放增量、情绪分布与跨部门协同记录
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!activeSummary && (
            <>
              <div className="flex items-center gap-1.5 bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
                <input
                  type="text"
                  value={operatorName}
                  onChange={e => setOperatorName(e.target.value)}
                  placeholder="交班人姓名"
                  className="w-24 bg-transparent text-sm text-slate-200 px-2 py-1.5 outline-none placeholder:text-slate-500"
                />
                <div className="h-5 w-px bg-slate-600" />
                <div className="flex rounded-md overflow-hidden">
                  {(['morning', 'evening'] as ShiftType[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setShiftType(s)}
                      className={`px-2.5 py-1 text-xs transition-all ${
                        shiftType === s
                          ? 'bg-keyword-brand text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {SHIFT_META[s].icon} {SHIFT_META[s].name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !operatorName.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-keyword-brand to-keyword-ambassador text-white hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? '生成中...' : '生成交班摘要'}
              </button>
            </>
          )}

          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-all ${
              showHistory
                ? 'bg-keyword-brand/15 border-keyword-brand/30 text-keyword-brand'
                : 'bg-slate-800/50 hover:bg-slate-700/60 text-slate-300 hover:text-white border-slate-700/50 hover:border-slate-600'
            }`}
          >
            <History className="w-4 h-4" />
            历史记录
            {summaries.length > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-mono">
                {summaries.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {showHistory && (
        <div className="card-gradient-border rounded-xl p-4 animate-slide-in-left">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <FileSearch className="w-4 h-4" />
              历史交接班记录
            </h4>
            <span className="text-xs text-slate-500">共 {summaries.length} 条</span>
          </div>

          {summaries.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">暂无历史记录</div>
          ) : (
            <div className="grid gap-2 max-h-64 overflow-y-auto custom-scrollbar">
              {summaries.map(s => {
                const meta = SHIFT_META[s.shiftType];
                const isActive = activeSummary?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelectHistory(s)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      isActive
                        ? 'bg-keyword-brand/10 border border-keyword-brand/30'
                        : 'bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 hover:border-slate-600/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                        s.shiftType === 'morning'
                          ? 'bg-amber-500/15 border border-amber-500/30'
                          : 'bg-indigo-500/15 border border-indigo-500/30'
                      }`}>
                        {meta.icon}
                      </div>
                      <div>
                        <p className="text-slate-200 font-medium text-sm">
                          {s.date} {meta.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          交班人：{s.operatorName} · {formatRelativeTime(s.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex gap-1 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-risk-urgent/15 text-risk-urgent">
                          高风险 {s.highRiskVideos.length}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-keyword-brand/15 text-keyword-brand">
                          协同 {s.contactedDepartments.length}
                        </span>
                      </div>
                      {s.confirmedBy ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-risk-low/15 text-risk-low">
                          ✓ {s.confirmedBy}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-risk-urgent/15 text-risk-urgent animate-pulse">
                          待确认
                        </span>
                      )}
                      {isActive && <Eye className="w-4 h-4 text-keyword-brand" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!activeSummary ? (
        <div className="card-gradient-border rounded-xl p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="高/紧急风险" value={highRiskCount} icon="⚠️" color="red" />
            <StatCard label="待处理事项" value={pendingCount} icon="📋" color="amber" />
            <StatCard label="已解决闭环" value={resolvedCount} icon="✅" color="green" />
            <StatCard label="协同部门数" value={deptCount} icon="🤝" color="purple" />
          </div>

          <EmptyState variant="handover" onAction={handleGenerate} />
        </div>
      ) : (
        <>
          <ShiftInfoBar
            shiftType={activeSummary.shiftType}
            operatorName={activeSummary.operatorName}
            confirmedBy={activeSummary.confirmedBy}
            createdAt={activeSummary.createdAt}
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="高风险视频"
              value={activeSummary.highRiskVideos.length}
              icon="🎯"
              color="red"
            />
            <StatCard
              label="播放量激增"
              value={activeSummary.playChanges.filter(c => c.deltaPercent > 0.15).length}
              icon="📈"
              color="amber"
            />
            <StatCard
              label="负面评论占比"
              value={`${Math.round(activeSummary.sentimentStats.negative * 100)}%`}
              icon="💬"
              color={activeSummary.sentimentStats.negative > 0.25 ? 'red' : 'amber'}
            />
            <StatCard
              label="跨部门协同"
              value={activeSummary.contactedDepartments.length}
              icon="🤝"
              color="purple"
            />
          </div>

          <HighRiskTable
            records={activeSummary.highRiskVideos}
            playChanges={activeSummary.playChanges}
            onOpenVideo={handleOpenVideo}
          />

          <TopGrowersCard growers={activeSummary.topGrowers || []} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SentimentChart stats={activeSummary.sentimentStats} />
            <CollaborationTimeline
              departments={activeSummary.contactedDepartments}
              riskRecords={activeSummary.highRiskVideos}
            />
          </div>

          <SummaryExportPanel
            summary={activeSummary}
            onConfirm={handleConfirm}
          />
        </>
      )}
    </div>
  );
}
