import { Users, CheckCircle2, Clock, Target } from 'lucide-react';
import type { ContactedDept, Department, RiskLevel, RiskRecord } from '@/types';
import { DEPT_META } from '@/types';
import { formatRelativeTime } from '@/utils/format';

interface CollaborationTimelineProps {
  departments: ContactedDept[];
  riskRecords: RiskRecord[];
}

export function CollaborationTimeline({ departments, riskRecords }: CollaborationTimelineProps) {
  const allDepts: Department[] = ['customer_service', 'legal', 'product', 'marketing', 'store'];

  const deptWorkloads = departments.length > 0
    ? departments
    : allDepts
        .filter(d => {
          const contacted = new Set(riskRecords.flatMap(r => r.contactDepartments));
          return contacted.has(d);
        })
        .map(d => {
          const meta = DEPT_META[d];
          const record = riskRecords.find(r => r.contactDepartments.includes(d));
          return {
            dept: d,
            points: record
              ? `${meta.name}已响应「${record.opinion.slice(0, 15)}」`
              : `${meta.name}待命`,
            responsible: record?.operator || '—',
          } as ContactedDept;
        });

  return (
    <div className="card-gradient-border rounded-xl p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-keyword-brand/15 flex items-center justify-center">
            <Users className="w-5 h-5 text-keyword-brand" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">部门协同记录</h3>
            <p className="text-xs text-slate-400">本班次已联动 {deptWorkloads.length} 个职能部门</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {allDepts.map(d => {
            const isActive = deptWorkloads.some(x => x.dept === d);
            const meta = DEPT_META[d];
            return (
              <div
                key={d}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all ${
                  isActive
                    ? `${meta.color} bg-white/5 border border-white/10 scale-100`
                    : 'bg-slate-800/50 text-slate-600 grayscale'
                }`}
                title={meta.name}
              >
                {meta.emoji}
              </div>
            );
          })}
        </div>
      </div>

      {deptWorkloads.length === 0 ? (
        <div className="py-10 text-center">
          <div className="text-4xl mb-2 opacity-50">🤝</div>
          <p className="text-slate-500 text-sm">本班次未发起跨部门协同</p>
          <p className="text-slate-600 text-xs mt-1">舆情均在公关值班层面闭环处理</p>
        </div>
      ) : (
        <div className="relative pl-2">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-keyword-brand/50 via-slate-700/50 to-transparent" />

          <div className="space-y-5">
            {deptWorkloads.map((item, idx) => {
            const meta = DEPT_META[item.dept];
            const relatedRecords = riskRecords.filter(r =>
              r.contactDepartments.includes(item.dept) || item.points.includes(meta.name.slice(0, 2))
            );
            const hasUrgent = relatedRecords.some(r => r.riskLevel === 'urgent' || r.riskLevel === 'high');

            return (
              <div
                key={item.dept}
                className="relative pl-12 animate-stagger"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`absolute left-0 top-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${meta.color} bg-slate-800/80 border border-slate-700`}>
                  {meta.emoji}
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center text-[8px] text-white ${
                    hasUrgent ? 'bg-risk-urgent animate-pulse' : 'bg-risk-low'
                  }`}>
                    ✓
                  </span>
                </div>

                <div className={`rounded-xl p-4 border transition-all hover:scale-[1.01] ${
                  hasUrgent
                    ? 'bg-risk-urgent/5 border-risk-urgent/20 hover:border-risk-urgent/40'
                    : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-slate-200 font-semibold">{meta.name}</h4>
                        {hasUrgent && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-risk-urgent/20 text-risk-urgent border border-risk-urgent/30">
                            优先响应
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        接口人：<span className="text-slate-300">{item.responsible}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-risk-low" />
                      <span className="text-xs text-risk-low">已确认</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Target className="w-3.5 h-3.5 mt-0.5 text-slate-500 flex-shrink-0" />
                      <p className="text-sm text-slate-300 leading-relaxed">{item.points}</p>
                    </div>
                  </div>

                  {relatedRecords.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/30 flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-slate-500 mr-1">相关风险：</span>
                      {relatedRecords.slice(0, 3).map(r => (
                        <span
                          key={r.id}
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            r.riskLevel === 'urgent' ? 'bg-risk-urgent/15 text-risk-urgent' :
                            r.riskLevel === 'high' ? 'bg-risk-high/15 text-risk-high' :
                            r.riskLevel === 'medium' ? 'bg-risk-medium/15 text-risk-medium' :
                            'bg-risk-low/15 text-risk-low'
                          }`}
                        >
                          #{r.id.slice(2, 7)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}
