import { Search, AlertTriangle, ClipboardList, FileText, RefreshCw } from 'lucide-react';

interface Props {
  variant?: 'search' | 'risk' | 'empty' | 'handover';
  title?: string;
  description?: string;
  action?: React.ReactNode;
  onAction?: () => void;
}

const presetMap = {
  search: { title: '未找到匹配内容', description: '调整搜索关键词或筛选条件后重试', Icon: Search },
  risk: { title: '暂无风险记录', description: '所有巡检内容均处于正常范围内', Icon: AlertTriangle },
  empty: { title: '暂无数据', description: '系统暂时没有可展示的内容', Icon: ClipboardList },
  handover: {
    title: '待生成交接班摘要',
    description: '点击右上角「生成交班摘要」按钮，系统将自动汇总本班次高风险视频、播放量变化、评论情绪及跨部门协同记录，生成标准化交班文本，方便下一班快速接棒，不用再在群里翻聊天记录。',
    Icon: FileText,
  },
};

export default function EmptyState({ variant = 'empty', title, description, action, onAction }: Props) {
  const preset = presetMap[variant];
  const Icon = preset.Icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 flex items-center justify-center mb-5 text-keyword-brand shadow-xl">
        <Icon size={36} />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title || preset.title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">{description || preset.description}</p>
      {action}
      {onAction && !action && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-keyword-brand to-keyword-ambassador text-white hover:scale-[1.03] transition-all shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          {variant === 'handover' ? '生成交班摘要' : '重新加载'}
        </button>
      )}
    </div>
  );
}
