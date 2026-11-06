import type { StageId } from '@/design/tokens';
/** STUB — replaced by the illustration agent. Contract: see docs/agent-brief.md */
export function StageIcon({ size = 24, className }: { stage: StageId; size?: number; className?: string; strokeWidth?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" /></svg>;
}
