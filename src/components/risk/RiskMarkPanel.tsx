import { useState } from 'react';
import { AlertTriangle, CheckCircle, Send } from 'lucide-react';
import { RiskType, RiskLevel, RISK_TYPE_META, RISK_LEVEL_META } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface Props {
  videoId: string;
  onSubmitted?: () => void;
}

const allTypes: RiskType[] = ['complaint', 'rant', 'rumor', 'parody', 'competition', 'safe'];
const allLevels: RiskLevel[] = ['low', 'medium', 'high', 'urgent'];

const placeholderMap: Record<RiskType, string> = {
  complaint: '例：用户反馈订单配送延迟，建议客服核查订单号并主动联系...',
  rant: '例：视频集中吐槽电池续航问题，建议产品团队评估是否存在批次缺陷...',
  rumor: '例：视频内容不实，涉及品牌声誉，建议法务评估是否需要发函...',
  parody: '例：恶搞剪辑虽无恶意但存在误导可能，建议观察传播趋势...',
  competition: '例：评论区疑似竞品水军带节奏，建议监测账号关联性...',
  safe: '例：内容为正常评测或正面推荐，无需特殊处理...',
};

export default function RiskMarkPanel({ videoId, onSubmitted }: Props) {
  const createRiskRecord = useAppStore(s => s.createRiskRecord);
  const [type, setType] = useState<RiskType>('rant');
  const [level, setLevel] = useState<RiskLevel>('medium');
  const [opinion, setOpinion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!opinion.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      createRiskRecord({
        videoId,
        riskType: type,
        riskLevel: level,
        opinion: opinion.trim(),
        operator: '张伟-PR',
      });
      setSubmitting(false);
      setOpinion('');
      onSubmitted?.();
    }, 500);
  };

  return (
    <div className="rounded-lg border border-monitor-border bg-monitor-card p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-5">
        <AlertTriangle size={16} className="text-risk-medium" />
        <h3 className="text-sm font-semibold text-slate-200">风险分级与研判</h3>
      </div>

      {/* 风险类型 */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-slate-400 mb-2.5 uppercase tracking-wider">风险类型</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {allTypes.map(t => {
            const meta = RISK_TYPE_META[t];
            const active = type === t;
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-md border text-sm font-medium transition-all duration-200 text-left',
                  active
                    ? 'bg-monitor-bg border-brand-blue/60 text-white shadow-inner shadow-brand-blue/10'
                    : 'bg-monitor-bg/50 border-monitor-border text-slate-400 hover:border-slate-500 hover:text-slate-200'
                )}
              >
                <span className="text-lg">{meta.emoji}</span>
                <div className="flex flex-col">
                  <span className={active ? meta.color : ''}>{meta.name}</span>
                </div>
                {active && (
                  <CheckCircle size={15} className="ml-auto text-brand-blue" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 风险等级 */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-slate-400 mb-2.5 uppercase tracking-wider">风险等级</label>
        <div className="grid grid-cols-4 gap-2">
          {allLevels.map(l => {
            const meta = RISK_LEVEL_META[l];
            const active = level === l;
            return (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-3 rounded-md border transition-all duration-200',
                  active
                    ? `${meta.border} border-2 ${meta.bg}/20 shadow-md`
                    : 'border-monitor-border bg-monitor-bg/50 hover:border-slate-500'
                )}
              >
                <div className={cn(
                  'w-4 h-4 rounded-full transition-transform duration-200',
                  meta.bg,
                  active && 'scale-125',
                  l === 'urgent' && active && 'animate-pulse-glow'
                )} />
                <span className={cn(
                  'text-xs font-medium',
                  active ? meta.color.replace('text-white', 'text-slate-200') : 'text-monitor-muted'
                )}>{meta.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 研判意见 */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-slate-400 mb-2.5 uppercase tracking-wider">
          研判意见 <span className="text-risk-urgent">*</span>
        </label>
        <textarea
          value={opinion}
          onChange={e => setOpinion(e.target.value)}
          rows={3}
          placeholder={placeholderMap[type]}
          className="w-full input-base resize-none leading-relaxed"
        />
        <div className="flex justify-between mt-1.5 text-[11px] text-monitor-muted font-mono">
          <span>建议包含：风险描述 + 处置建议 + 需协同的部门</span>
          <span>{opinion.length}/500</span>
        </div>
      </div>

      {/* 提交 */}
      <button
        onClick={handleSubmit}
        disabled={!opinion.trim() || submitting}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all duration-200',
          opinion.trim() && !submitting
            ? `${RISK_LEVEL_META[level].bg} text-white hover:opacity-90 shadow-lg hover:shadow-xl`
            : 'bg-monitor-border text-monitor-muted cursor-not-allowed'
        )}
      >
        <Send size={15} className={submitting ? 'animate-pulse' : ''} />
        {submitting ? '提交中...' : `标记为${RISK_LEVEL_META[level].name}并加入待处理`}
      </button>
    </div>
  );
}
