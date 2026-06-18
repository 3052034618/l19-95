import { NavLink } from 'react-router-dom';
import { Search, AlertTriangle, Handshake, Radio, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { path: '/inspection', label: '巡检清单', icon: Search, key: '1' },
  { path: '/risk', label: '风险处置', icon: AlertTriangle, key: '2' },
  { path: '/handover', label: '交接班', icon: Handshake, key: '3' },
];

export default function Sidebar() {
  const riskRecords = useAppStore(s => s.riskRecords);
  const pendingCount = riskRecords.filter(r => r.status !== 'resolved').length;
  const urgentCount = riskRecords.filter(r => r.riskLevel === 'urgent' && r.status !== 'resolved').length;

  return (
    <aside className="w-60 h-full bg-monitor-card border-r border-monitor-border flex flex-col">
      {/* Logo */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-monitor-border shrink-0">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-blue to-purple-500 flex items-center justify-center shadow-lg shadow-brand-blue/30">
          <Radio size={18} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-mono font-bold text-sm text-white tracking-wide">舆情哨兵</span>
          <span className="text-[10px] text-monitor-muted font-mono">SENTINEL v1.0</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            className={({ isActive }) => cn(
              'relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group',
              isActive
                ? 'bg-brand-blue/15 text-brand-blue shadow-inner'
                : 'text-slate-400 hover:bg-monitor-border/40 hover:text-slate-200'
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-blue rounded-r" />
                )}
                <item.icon size={18} className={cn(
                  'transition-transform duration-200',
                  isActive && 'scale-110'
                )} />
                <span>{item.label}</span>
                {item.key === '2' && pendingCount > 0 && (
                  <span className={cn(
                    'ml-auto min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[11px] font-bold font-mono',
                    urgentCount > 0
                      ? 'bg-risk-urgent text-white animate-pulse-glow'
                      : 'bg-risk-medium/80 text-white'
                  )}>
                    {pendingCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer - 当前值班 */}
      <div className="p-4 border-t border-monitor-border shrink-0">
        <div className="p-3 rounded-lg bg-gradient-to-br from-monitor-bg to-monitor-card border border-monitor-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs">
                PR
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-risk-low border-2 border-monitor-card" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-slate-200 truncate">张伟 - 值班中</span>
              <span className="text-[10px] text-monitor-muted font-mono">PR-20260619-M</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-monitor-muted">
            <Shield size={11} className="text-risk-low" />
            <span>早班 · 08:00 - 18:00</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
