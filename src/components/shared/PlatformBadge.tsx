import type { Platform } from '@/types';
import { PLATFORM_META } from '@/types';

interface Props {
  platform: Platform;
  size?: 'sm' | 'md';
}

export default function PlatformBadge({ platform, size = 'sm' }: Props) {
  const meta = PLATFORM_META[platform];
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-medium ${sizeClass} text-white`}
      style={{ backgroundColor: meta.color }}
    >
      <span>{meta.icon}</span>
      <span>{meta.name}</span>
    </span>
  );
}
