import { useState } from 'react';
import { FileText, Copy, Check, Download, Handshake, AlertCircle, Sparkles } from 'lucide-react';
import type { HandoverSummary, Video } from '@/types';
import { RISK_LEVEL_META, SHIFT_META, PLATFORM_META } from '@/types';
import { formatNumber, formatPercent } from '@/utils/format';

interface SummaryExportPanelProps {
  summary: HandoverSummary;
  videos: Video[];
  onConfirm: (confirmedBy: string) => void;
}

export function SummaryExportPanel({ summary, videos, onConfirm }: SummaryExportPanelProps) {
  const [copied, setCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmName, setConfirmName] = useState('');

  const getVideo = (id: string) => videos.find(v => v.id === id);
  const shiftMeta = SHIFT_META[summary.shiftType];

  const generateText = () => {
    const lines: string[] = [];
    lines.push(`【${summary.date} ${shiftMeta.name}交接班摘要】`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`交班人：${summary.operatorName}`);
    lines.push(`生成时间：${new Date(summary.createdAt).toLocaleString('zh-CN')}`);
    lines.push('');

    lines.push('▎高风险视频汇总');
    if (summary.highRiskVideos.length === 0) {
      lines.push('  ✓ 本班次无高风险视频');
    } else {
      summary.highRiskVideos.forEach((r, i) => {
        const v = getVideo(r.videoId);
        const change = summary.playChanges.find(c => c.videoId === r.videoId);
        lines.push(`  ${i + 1}. [${RISK_LEVEL_META[r.riskLevel].name}] ${v?.title || '视频'}`);
        lines.push(`     平台：${v ? PLATFORM_META[v.platform].name : '-'} | 播放：${v ? formatNumber(v.playCount) : '-'}`);
        if (change && change.delta > 0) {
          lines.push(`     增量：+${formatNumber(change.delta)} (${formatPercent(change.deltaPercent)})`);
        }
        lines.push(`     研判：${r.opinion}`);
        lines.push('');
      });
    }
    lines.push('');

    lines.push('▎评论情绪分布');
    lines.push(`  正面：${formatPercent(summary.sentimentStats.positive)}`);
    lines.push(`  中性：${formatPercent(summary.sentimentStats.neutral)}`);
    lines.push(`  负面：${formatPercent(summary.sentimentStats.negative)}`);
    lines.push('');

    lines.push('▎协同部门');
    if (summary.contactedDepartments.length === 0) {
      lines.push('  无跨部门协同');
    } else {
      summary.contactedDepartments.forEach(d => {
        lines.push(`  · ${d.dept} - ${d.points}（${d.responsible}）`);
      });
    }
    lines.push('');

    lines.push('▎下一班重点关注');
    summary.nextShiftFocus.forEach((f, i) => {
      lines.push(`  ${i + 1}. ${f}`);
    });
    lines.push('');
    lines.push(`━━━━━━━━━━━━━━━━━━━━`);
    lines.push(summary.confirmedBy
      ? `接班人已确认：${summary.confirmedBy}`
      : `请接班人确认并回复「收到」`
    );

    return lines.join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = generateText();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generateText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `交接班摘要_${summary.date}_${summary.shiftType}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmHandover = () => {
    if (!confirmName.trim()) return;
    onConfirm(confirmName.trim());
    setShowConfirm(false);
    setConfirmName('');
  };

  return (
    <div className="card-gradient-border rounded-xl p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-keyword-ambassador/15 flex items-center justify-center">
            <FileText className="w-5 h-5 text-keyword-ambassador" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">摘要导出与交接确认</h3>
            <p className="text-xs text-slate-400">一键复制或下载交班文本</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-keyword-ambassador/10 text-keyword-ambassador border border-keyword-ambassador/30">
          <Sparkles className="inline w-3 h-3 mr-1" />
          已自动生成
        </span>
      </div>

      <div className="bg-slate-900/70 border border-slate-700/60 rounded-xl p-4 mb-4 max-h-72 overflow-y-auto custom-scrollbar">
        <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono text-slate-300">
{generateText()}
        </pre>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            copied
              ? 'bg-risk-low text-white'
              : 'bg-keyword-brand/80 hover:bg-keyword-brand text-white hover:scale-[1.02]'
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? '已复制到剪贴板' : '复制交班文本'}
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 hover:scale-[1.02] transition-all"
        >
          <Download className="w-4 h-4" />
          下载 TXT 文件
        </button>

        {!summary.confirmedBy ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-risk-high to-risk-urgent text-white hover:scale-[1.02] transition-all ml-auto animate-pulse-glow"
          >
            <Handshake className="w-4 h-4" />
            确认接班
          </button>
        ) : (
          <div className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-risk-low/15 text-risk-low border border-risk-low/30">
          <Check className="w-4 h-4" />
          已完成交接
        </div>
        )}
      </div>

      {summary.nextShiftFocus.length > 0 && (
        <div className="bg-risk-urgent/6 border border-risk-urgent/20 rounded-xl p-4">
          <div className="flex items-start gap-2.5 mb-2">
            <AlertCircle className="w-4.5 h-4.5 text-risk-urgent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-risk-urgent font-medium text-sm">下一班重点关注事项</p>
              <ul className="mt-2 space-y-1.5">
                {summary.nextShiftFocus.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="w-5 h-5 rounded-md bg-risk-urgent/15 text-risk-urgent text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-mono">
                      {i + 1}
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4 animate-slide-in-right shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-risk-low to-keyword-brand flex items-center justify-center text-2xl">
                🤝
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">确认接班</h4>
                <p className="text-xs text-slate-400">{summary.date} {shiftMeta.name} · 交班人 {summary.operatorName}</p>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs text-slate-400 mb-2">请输入您的姓名</label>
              <input
                type="text"
                value={confirmName}
                onChange={e => setConfirmName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleConfirmHandover()}
                placeholder="接班人姓名..."
                autoFocus
                className="input-base w-full"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowConfirm(false); setConfirmName(''); }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmHandover}
                disabled={!confirmName.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-risk-low to-keyword-brand text-white hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Handshake className="inline w-4 h-4 mr-1.5" />
                确认接班
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
