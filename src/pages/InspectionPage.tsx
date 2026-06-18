import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, ArrowRight } from 'lucide-react';
import KeywordManager from '@/components/inspection/KeywordManager';
import PlatformFilter from '@/components/inspection/PlatformFilter';
import TimeRangeSelector from '@/components/inspection/TimeRangeSelector';
import VideoList from '@/components/inspection/VideoList';
import HotWordCloud from '@/components/inspection/HotWordCloud';
import SpreadAlertCard from '@/components/inspection/SpreadAlertCard';
import { useAppStore } from '@/store/useAppStore';
import { RISK_LEVEL_META } from '@/types';

export default function InspectionPage() {
  const navigate = useNavigate();
  const riskRecords = useAppStore(s => s.riskRecords);
  const pendingCount = riskRecords.filter(r => r.status !== 'resolved').length;
  const urgentCount = riskRecords.filter(r => r.riskLevel === 'urgent' && r.status !== 'resolved').length;

  return (
    <div className="min-h-full p-6">
      {/* 页面标题 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-blue to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-blue/20">
            <ClipboardCheck size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-wide">巡检清单</h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-brand-blue/15 text-brand-blue border border-brand-blue/30">
                早班 · 第 1 轮
              </span>
            </div>
            <p className="text-sm text-monitor-muted mt-1">
              按关键词+平台清单自动拉取，完成早晚两轮标准巡检流程
            </p>
          </div>
        </div>

        {/* 快捷入口 */}
        <div className="flex items-center gap-3">
          {urgentCount > 0 && (
            <button
              onClick={() => navigate('/risk')}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-risk-urgent/15 border border-risk-urgent/40 text-risk-urgent text-sm font-medium hover:bg-risk-urgent/25 transition-all duration-200 animate-pulse-glow"
            >
              <span className={`w-2 h-2 rounded-full ${RISK_LEVEL_META.urgent.bg}`} />
              有 {urgentCount} 条紧急风险待处置
              <ArrowRight size={15} />
            </button>
          )}
          {pendingCount > 0 && urgentCount === 0 && (
            <button
              onClick={() => navigate('/risk')}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-risk-medium/15 border border-risk-medium/40 text-risk-medium text-sm font-medium hover:bg-risk-medium/25 transition-all duration-200"
            >
              {pendingCount} 条风险待处理
              <ArrowRight size={15} />
            </button>
          )}
          <button
            onClick={() => navigate('/handover')}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-monitor-card border border-monitor-border text-slate-300 text-sm font-medium hover:bg-monitor-border/40 hover:border-slate-500 transition-all duration-200"
          >
            生成交接班摘要
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* 左侧：配置区 */}
        <div className="xl:col-span-1 space-y-5">
          <KeywordManager />
          <PlatformFilter />
          <TimeRangeSelector />
          <HotWordCloud />
        </div>

        {/* 右侧：内容区 */}
        <div className="xl:col-span-2 space-y-5">
          <SpreadAlertCard />
          <VideoList />
        </div>
      </div>
    </div>
  );
}
