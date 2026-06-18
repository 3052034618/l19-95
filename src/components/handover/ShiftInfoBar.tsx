import { Sun, Moon, Clock, User, Calendar } from 'lucide-react';
import { SHIFT_META, type ShiftType } from '@/types';
import { formatDateTime } from '@/utils/format';

interface ShiftInfoBarProps {
  shiftType: ShiftType;
  operatorName: string;
  confirmedBy?: string;
  createdAt: number;
}

export function ShiftInfoBar({ shiftType, operatorName, confirmedBy, createdAt }: ShiftInfoBarProps) {
  const meta = SHIFT_META[shiftType];
  const isMorning = shiftType === 'morning';

  return (
    <div className="card-gradient-border rounded-xl p-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${
            isMorning
              ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30'
              : 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30'
          }`}>
            {meta.icon}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">{meta.name}交接班摘要</h2>
              <span className={`px-3 py-0.5 rounded-full text-xs font-medium ${
                isMorning
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
              }`}>
                {isMorning ? <Sun className="inline w-3 h-3 mr-1" /> : <Moon className="inline w-3 h-3 mr-1" />}
                {meta.time}
              </span>
              {confirmedBy && (
                <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-risk-low/15 text-risk-low border border-risk-low/30">
                  ✓ 已交接
                </span>
              )}
            </div>
            <div className="flex items-center gap-6 mt-2 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDateTime(createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                班次时长 {isMorning ? '10' : '14'} 小时
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">交班人</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-keyword-brand to-keyword-product flex items-center justify-center text-white text-xs font-bold">
                {operatorName.slice(0, 1)}
              </div>
              <span className="text-slate-200 font-medium">{operatorName}</span>
            </div>
          </div>
          {confirmedBy && (
            <>
              <div className="w-px h-10 bg-slate-700" />
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">接班人</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-risk-low to-keyword-store flex items-center justify-center text-white text-xs font-bold">
                    {confirmedBy.slice(0, 1)}
                  </div>
                  <span className="text-slate-200 font-medium">{confirmedBy}</span>
                </div>
              </div>
            </>
          )}
          {!confirmedBy && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-risk-urgent/10 border border-risk-urgent/30">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-urgent opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-risk-urgent" />
              </span>
              <span className="text-risk-urgent text-sm font-medium">等待接班确认</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
