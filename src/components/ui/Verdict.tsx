import { cn } from '@/lib/cn';
import { CheckIcon, CloseIcon } from './icons';

/**
 * The one right/wrong marker for documentation: icon in a ring + the word.
 * Colour is never the only signal (✓ נכון / ✕ שגוי).
 */
export function Verdict({ ok, className, label }: { ok: boolean; className?: string; label?: string }) {
  const Icon = ok ? CheckIcon : CloseIcon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-caption font-bold leading-none',
        ok ? 'text-sprout-ink' : 'text-harvest-ink',
        className,
      )}
    >
      <span className="grid size-6 place-items-center rounded-full border-2 border-current" aria-hidden="true">
        <Icon size={14} strokeWidth={3} />
      </span>
      {label ?? (ok ? 'נכון' : 'שגוי')}
    </span>
  );
}
