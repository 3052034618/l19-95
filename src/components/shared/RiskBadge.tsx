import type { RiskLevel, RiskType, HandleStatus } from '@/types';
import { RISK_LEVEL_META, RISK_TYPE_META, STATUS_META } from '@/types';

interface LevelProps {
  level: RiskLevel;
  showLabel?: boolean;
}

export function RiskLevelBadge({ level, showLabel = true }: LevelProps) {
  const meta = RISK_LEVEL_META[level];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${meta.bg} ${meta.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.bg} ${level === 'urgent' ? 'animate-pulse-glow' : ''}`} />
      {showLabel && <span>{meta.name}</span>}
    </span>
  );
}

interface TypeProps {
  type: RiskType;
}

export function RiskTypeBadge({ type }: TypeProps) {
  const meta = RISK_TYPE_META[type];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-monitor-border/50 ${meta.color}`}>
      <span>{meta.emoji}</span>
      <span>{meta.name}</span>
    </span>
  );
}

interface StatusProps {
  status: HandleStatus;
}

export function StatusBadge({ status }: StatusProps) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${meta.bg} ${meta.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1 ${meta.color.replace('text-', 'bg-')}`} />
      {meta.name}
    </span>
  );
}
