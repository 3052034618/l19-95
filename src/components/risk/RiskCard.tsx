import { useState } from 'react';
import {
  ExternalLink, Eye, MessageSquare, Plus, Check,
  MoreHorizontal, StickyNote, ArrowRight,
} from 'lucide-react';
import type { RiskRecord, Video, HandleStatus, Department } from '@/types';
import { RISK_LEVEL_META, RISK_TYPE_META } from '@/types';
import { RiskLevelBadge, RiskTypeBadge, StatusBadge } from '@/components/shared/RiskBadge';
import PlatformBadge from '@/components/shared/PlatformBadge';
import DepartmentTagGroup from './DepartmentTagGroup';
import { useAppStore } from '@/store/useAppStore';
import { formatDateTime, formatNumber, formatDeltaPercent, truncateText } from '@/utils/format';
import { cn } from '@/lib/utils';

interface Props {
  record: RiskRecord;
  video: Video | undefined;
}

const statusFlow: HandleStatus[] = ['pending', 'processing', 'resolved'];

export default function RiskCard({ record, video }: Props) {
  const selectVideo = useAppStore(s => s.selectVideo);
  const updateRiskStatus = useAppStore(s => s.updateRiskStatus);
  const addHandleNote = useAppStore(s => s.addHandleNote);
  const addContactDepartment = useAppStore(s => s.addContactDepartment);
  const removeContactDepartment = useAppStore(s => s.removeContactDepartment);

  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showDeptSelector, setShowDeptSelector] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const levelMeta = RISK_LEVEL_META[record.riskLevel];
  const typeMeta = RISK_TYPE_META[record.riskType];
  const playDelta = record.currentPlayCount - record.initialPlayCount;
  const playDeltaPct = record.initialPlayCount > 0 ? playDelta / record.initialPlayCount : 0;
  const nextStatus = statusFlow[Math.min(statusFlow.indexOf(record.status) + 1, statusFlow.length - 1)];

  const handleNextStatus = () => updateRiskStatus(record.id, nextStatus);
  const handleSubmitNote = () => {
    if (!noteText.trim()) return;
    addHandleNote(record.id, `${formatDateTime(Date.now())} · ${noteText.trim()}`);
    setNoteText('');
    setShowNoteInput(false);
  };

  const toggleDept = (dept: Department) => {
    if (record.contactDepartments.includes(dept)) removeContactDepartment(record.id, dept);
    else addContactDepartment(record.id, dept);
  };

  return (
    <div
      className={cn(
        'relative rounded-lg border bg-monitor-card overflow-hidden transition-all duration-300 animate-slide-in-left',
        `border-l-4 ${levelMeta.border}`,
        record.riskLevel === 'urgent' && 'shadow-lg shadow-risk-urgent/10',
      )}
    >
      {/* 紧急级别闪烁效果 */}
      {record.riskLevel === 'urgent' && record.status === 'pending' && (
        <div className="absolute inset-0 risk-stripe opacity-30 pointer-events-none" />
      )}

      <div className="relative p-4">
        {/* 头部 */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <RiskLevelBadge level={record.riskLevel} />
            <RiskTypeBadge type={record.riskType} />
            <StatusBadge status={record.status} />
            {video && <PlatformBadge platform={video.platform} size="sm" />}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {video && (
              <button
                onClick={() => selectVideo(video)}
                className="p-1.5 rounded-md text-monitor-muted hover:text-brand-blue hover:bg-monitor-border/40 transition-all"
                title="查看详情"
              >
                <Eye size={15} />
              </button>
            )}
            <button
              onClick={() => setExpanded(e => !e)}
              className="p-1.5 rounded-md text-monitor-muted hover:text-slate-200 hover:bg-monitor-border/40 transition-all"
            >
              <MoreHorizontal size={15} className={cn(expanded && 'rotate-90 transition-transform')} />
            </button>
          </div>
        </div>

        {/* 视频标题 */}
        {video && (
          <div
            className="flex items-start gap-2 mb-3 group cursor-pointer"
            onClick={() => selectVideo(video)}
          >
            <div
              className="w-14 h-10 shrink-0 rounded overflow-hidden flex items-center justify-center text-white/80 text-sm font-bold"
              style={{ background: video.coverUrl }}
            >
              {video.title.slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 leading-snug line-clamp-2 group-hover:text-white transition-colors">
                {video.title}
              </p>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-monitor-muted font-mono">
                <span>{video.authorName}</span>
                <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        )}

        {/* 研判意见 */}
        <div className="mb-3 p-2.5 rounded-md bg-monitor-bg border border-monitor-border/60">
          <div className="flex items-center gap-1 text-[10px] text-monitor-muted uppercase tracking-wider mb-1">
            <MessageSquare size={10} /> 研判意见
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{record.opinion}</p>
        </div>

        {/* 数据指标行 */}
        <div className="flex items-center gap-3 flex-wrap mb-3 text-xs">
          <div className="flex items-center gap-1 text-monitor-muted">
            <span>播放量</span>
            <span className="font-mono font-semibold text-slate-200">{formatNumber(record.currentPlayCount)}</span>
            {playDelta !== 0 && (
              <span className={cn(
                'inline-flex items-center gap-0.5 font-mono text-[10px] font-semibold',
                playDelta > 0 ? 'text-risk-urgent animate-blink px-1.5 py-0.5 rounded' : 'text-risk-low'
              )}>
                <ArrowRight size={10} className={cn(playDelta > 0 ? 'rotate-45' : '-rotate-135')} />
                {formatNumber(Math.abs(playDelta))}（{formatDeltaPercent(playDeltaPct)}）
              </span>
            )}
          </div>
          <div className="w-px h-3 bg-monitor-border" />
          <span className="text-monitor-muted">
            操作人 <span className="text-slate-300">{record.operator}</span>
          </span>
          <div className="w-px h-3 bg-monitor-border" />
          <span className="text-monitor-muted font-mono text-[11px]">
            {formatDateTime(record.createdAt)}
          </span>
        </div>

        {/* 操作区 */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-monitor-border/40">
          {/* 部门标签 */}
          <div className="flex-1 min-w-0">
            <DepartmentTagGroup
              selected={record.contactDepartments}
              onToggle={toggleDept}
              variant="compact"
            />
          </div>

          {/* 状态流转按钮 */}
          {record.status !== 'resolved' && (
            <button
              onClick={handleNextStatus}
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                nextStatus === 'processing'
                  ? 'bg-risk-medium/15 text-risk-medium border border-risk-medium/40 hover:bg-risk-medium/25'
                  : 'bg-risk-low/15 text-risk-low border border-risk-low/40 hover:bg-risk-low/25'
              )}
            >
              <Check size={12} />
              {nextStatus === 'processing' ? '标记处理中' : '标记已解决'}
            </button>
          )}
          <button
            onClick={() => setShowDeptSelector(s => !s)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-monitor-border/50 text-slate-300 hover:bg-monitor-border transition-all"
          >
            <Plus size={12} /> 联系部门
          </button>
          <button
            onClick={() => setShowNoteInput(s => !s)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-monitor-border/50 text-slate-300 hover:bg-monitor-border transition-all"
          >
            <StickyNote size={12} /> 备注
          </button>
        </div>

        {/* 部门选择器（展开） */}
        {showDeptSelector && (
          <div className="mt-3 p-3 rounded-md bg-monitor-bg border border-monitor-border animate-fade-in">
            <DepartmentTagGroup
              selected={record.contactDepartments}
              onToggle={toggleDept}
            />
          </div>
        )}

        {/* 备注输入（展开） */}
        {showNoteInput && (
          <div className="mt-3 space-y-2 animate-fade-in">
            <textarea
              autoFocus
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="添加处置备注，例如：17:20 已与客服主管李XX同步情况..."
              rows={2}
              className="w-full input-base resize-none text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowNoteInput(false); setNoteText(''); }}
                className="btn-ghost text-xs py-1.5 px-3"
              >
                取消
              </button>
              <button
                onClick={handleSubmitNote}
                disabled={!noteText.trim()}
                className={cn(
                  'text-xs py-1.5 px-4 rounded-md font-medium transition-all',
                  noteText.trim()
                    ? 'bg-brand-blue text-white hover:bg-blue-500'
                    : 'bg-monitor-border text-monitor-muted cursor-not-allowed'
                )}
              >
                添加备注
              </button>
            </div>
          </div>
        )}

        {/* 展开的处理备注历史 */}
        {expanded && record.handleNotes.length > 0 && (
          <div className="mt-3 p-3 rounded-md bg-monitor-bg border border-monitor-border animate-fade-in">
            <div className="text-[11px] text-monitor-muted uppercase tracking-wider mb-2">处理日志</div>
            <div className="space-y-2">
              {record.handleNotes.map((note, i) => (
                <div key={i} className="text-xs text-slate-400 leading-relaxed border-l-2 border-monitor-border pl-2.5">
                  {note}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
