'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertIcon, CheckIcon, CloseIcon, InfoIcon, ShieldIcon } from './icons';

export type ToastTone = 'success' | 'info' | 'agro' | 'error';

export type ToastInput = {
  tone: ToastTone;
  title: ReactNode;
  body?: ReactNode;
  /** Screen-reader text; required when title/body are not plain strings. */
  announce?: string;
  action?: { label: string; onClick?: () => void };
  /** ms; errors default to sticky (null). */
  duration?: number | null;
};

type ToastItem = ToastInput & { id: number; state: 'open' | 'closing' };

const icons: Record<ToastTone, ReactNode> = {
  success: <CheckIcon size={18} strokeWidth={2.25} />,
  info: <InfoIcon size={18} strokeWidth={2} />,
  agro: <ShieldIcon size={18} strokeWidth={2} />,
  error: <AlertIcon size={18} strokeWidth={2} />,
};

/** Presentational toast — used live by the provider and statically on the style tile. */
export function ToastCard({
  tone,
  title,
  body,
  action,
  onClose,
  state = 'open',
  progress,
  timerRef,
  onPause,
  onResume,
  isStatic = false,
}: ToastInput & {
  onClose?: () => void;
  state?: 'open' | 'closing';
  progress?: number;
  timerRef?: React.Ref<HTMLSpanElement>;
  onPause?: () => void;
  onResume?: () => void;
  isStatic?: boolean;
}) {
  return (
    <div
      className="toast"
      data-surface="soil"
      data-tone={tone}
      data-state={isStatic ? undefined : state}
      onPointerEnter={onPause}
      onPointerLeave={onResume}
      onFocus={onPause}
      onBlur={onResume}
    >
      <span className="toast__icon" aria-hidden="true">
        {icons[tone]}
      </span>
      <div>
        <p className="toast__title">{title}</p>
        {body ? <p className="toast__body">{body}</p> : null}
        {action ? (
          <div className="toast__actions">
            <button
              type="button"
              className="toast__action"
              onClick={action.onClick}
              tabIndex={isStatic ? -1 : undefined}
            >
              {action.label}
            </button>
          </div>
        ) : null}
      </div>
      <button
        type="button"
        className="toast__close"
        aria-label="סגירת ההודעה"
        onClick={onClose}
        tabIndex={isStatic ? -1 : undefined}
      >
        <CloseIcon size={18} strokeWidth={2} />
      </button>
      {progress != null || timerRef ? (
        <span
          className="toast__timer"
          aria-hidden="true"
          ref={timerRef}
          style={progress != null ? ({ '--progress': progress } as React.CSSProperties) : undefined}
        />
      ) : null}
    </div>
  );
}

type Ctx = { toast: (t: ToastInput) => number; dismiss: (id: number) => void };
const ToastContext = createContext<Ctx | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

/**
 * Toasts announce through two persistent live regions (polite / assertive),
 * so the announcement never depends on a freshly-inserted node being picked
 * up by the screen reader. Timers pause on hover and focus; errors are sticky.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [polite, setPolite] = useState('');
  const [assertive, setAssertive] = useState('');
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.map((t) => (t.id === id ? { ...t, state: 'closing' } : t)));
    window.setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 180);
  }, []);

  const toast = useCallback((t: ToastInput) => {
    const id = ++seq.current;
    setItems((list) => [...list.slice(-2), { ...t, id, state: 'open' }]);
    const text =
      t.announce ?? [t.title, t.body].filter((x): x is string => typeof x === 'string').join('. ');
    if (t.tone === 'error') {
      setAssertive('');
      window.setTimeout(() => setAssertive(text), 30);
    } else {
      setPolite('');
      window.setTimeout(() => setPolite(text), 30);
    }
    return id;
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <section className="toast-viewport" aria-label="הודעות">
        {items.map((t) => (
          <LiveToast key={t.id} item={t} onClose={() => dismiss(t.id)} />
        ))}
      </section>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {polite}
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {assertive}
      </div>
    </ToastContext.Provider>
  );
}

function LiveToast({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const duration = item.duration === undefined ? (item.tone === 'error' ? null : 6000) : item.duration;
  const timer = useRef<HTMLSpanElement>(null);
  const paused = useRef(false);
  const elapsed = useRef(0);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (duration == null) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (!paused.current) elapsed.current += now - last;
      last = now;
      const p = Math.max(0, 1 - elapsed.current / duration);
      timer.current?.style.setProperty('--progress', String(p));
      if (p <= 0) {
        closeRef.current();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  return (
    <ToastCard
      {...item}
      onClose={onClose}
      timerRef={duration == null ? undefined : timer}
      onPause={() => (paused.current = true)}
      onResume={() => (paused.current = false)}
    />
  );
}
