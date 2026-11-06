'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { durations, toastLifetime } from '@/design/tokens';
import { AlertIcon, CheckIcon, CloseIcon, InfoIcon, ShieldIcon } from './icons';
import { NumText } from './NumText';

export type ToastTone = 'success' | 'info' | 'agro' | 'error';

export type ToastInput = {
  tone: ToastTone;
  title: ReactNode;
  body?: ReactNode;
  /** Screen-reader text; required when title/body are not plain strings. */
  announce?: string;
  /** The action closes the toast after running. */
  action?: { label: string; onClick?: () => void };
  /**
   * Lifetime in ms. Defaults: `toastLifetime` (6000) for plain success/info; sticky (null) for
   * errors and for any toast that carries an action — nobody should have to
   * race a timer to press "undo" (WCAG 2.2.1).
   */
  duration?: number | null;
};

type ToastItem = ToastInput & { id: number; state: 'open' | 'closing'; returnFocus: HTMLElement | null };

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
  onAction,
  state = 'open',
  progress,
  timerRef,
  onHoverChange,
  onFocusChange,
  isStatic = false,
  toastId,
}: ToastInput & {
  /** the live toast's id, so a toast opened from inside it can inherit its return focus */
  toastId?: number;
  onClose?: () => void;
  onAction?: () => void;
  state?: 'open' | 'closing';
  progress?: number;
  timerRef?: React.Ref<HTMLSpanElement>;
  onHoverChange?: (hovering: boolean) => void;
  onFocusChange?: (focused: boolean) => void;
  isStatic?: boolean;
}) {
  return (
    <div
      className="toast"
      data-surface="soil"
      data-tone={tone}
      data-state={isStatic ? undefined : state}
      data-static={isStatic ? '' : undefined}
      data-toast-id={toastId}
      onPointerEnter={() => onHoverChange?.(true)}
      onPointerLeave={() => onHoverChange?.(false)}
      onFocus={() => onFocusChange?.(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onFocusChange?.(false);
      }}
    >
      <span className="toast__icon" aria-hidden="true">
        {icons[tone]}
      </span>
      <div>
        <p className="toast__title">{typeof title === 'string' ? <NumText>{title}</NumText> : title}</p>
        {body ? <p className="toast__body">{typeof body === 'string' ? <NumText>{body}</NumText> : body}</p> : null}
        {action ? (
          <div className="toast__actions">
            <button type="button" className="toast__action" onClick={onAction}>
              {action.label}
            </button>
          </div>
        ) : null}
      </div>
      <button type="button" className="toast__close" aria-label="סגירת ההודעה" onClick={onClose}>
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

type Ctx = { toast: (t: ToastInput) => number; dismiss: (id: number, restoreFocus?: boolean) => void };
const ToastContext = createContext<Ctx | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const plain = (n: ReactNode) => (typeof n === 'string' ? n : '');
/** a sentence without its closing mark, so joined parts never read „..” */
const clause = (s: string) => s.trim().replace(/[.!?…]+$/u, '');

/**
 * Toasts announce through two persistent live regions (polite / assertive),
 * so the announcement never depends on a freshly inserted node being picked
 * up. Every timer pauses while the pointer is over any toast or focus is in
 * the stack, so nothing expires (and shifts the stack) under the pointer.
 * Escape closes the toast that has focus, else the newest one. Closing
 * returns focus to where the user was when the first toast of a chain opened.
 * The stack's height is published as --toast-stack-h for scroll padding, so a
 * focused control is never scrolled behind it.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [polite, setPolite] = useState('');
  const [assertive, setAssertive] = useState('');
  const seq = useRef(0);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const viewportRef = useRef<HTMLDivElement>(null);
  const hovered = useRef(false);
  const focused = useRef(false);
  const paused = useCallback(() => hovered.current || focused.current, []);

  const dismiss = useCallback((id: number, restoreFocus = false) => {
    const item = itemsRef.current.find((t) => t.id === id);
    setItems((list) => list.map((t) => (t.id === id ? { ...t, state: 'closing' } : t)));
    window.setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), durations.fast.ms);
    if (restoreFocus) {
      const target = item?.returnFocus;
      if (target && document.contains(target)) target.focus();
      else document.getElementById('main')?.focus();
    }
  }, []);

  const toast = useCallback((t: ToastInput) => {
    const id = ++seq.current;
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // opened from a toast's own action: that button is about to go, so return
    // to wherever the parent toast would have returned
    const host = active?.closest<HTMLElement>('[data-toast-id]');
    const parent = host ? itemsRef.current.find((x) => String(x.id) === host.dataset.toastId) : undefined;
    const returnFocus = parent ? parent.returnFocus : active;
    setItems((list) => [...list.slice(-2), { ...t, id, state: 'open', returnFocus }]);
    const parts = t.announce ? [t.announce] : [plain(t.title), plain(t.body)];
    if (t.action) parts.push(`פעולה זמינה: ${t.action.label}`);
    const text = `${parts.filter(Boolean).map(clause).join('. ')}.`;
    const set = t.tone === 'error' ? setAssertive : setPolite;
    set('');
    window.setTimeout(() => set(text), durations.instant.ms);
    return id;
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  // Escape: the toast that holds focus (focus returns), else the newest one
  // (focus stays where it is)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      const open = itemsRef.current.filter((t) => t.state === 'open');
      if (!open.length) return;
      const host = (document.activeElement as HTMLElement | null)?.closest<HTMLElement>('[data-toast-id]');
      const own = host ? open.find((t) => String(t.id) === host.dataset.toastId) : undefined;
      dismiss((own ?? open[open.length - 1]).id, own != null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dismiss]);

  // the stack's footprint from the bottom edge, for scroll-padding-block-end
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const root = document.documentElement;
    const ro = new ResizeObserver(() => {
      const h = vp.offsetHeight;
      if (!h) return root.style.removeProperty('--toast-stack-h');
      const fromBottom = window.innerHeight - vp.getBoundingClientRect().bottom;
      root.style.setProperty('--toast-stack-h', `${Math.ceil(h + fromBottom)}px`);
    });
    ro.observe(vp);
    return () => {
      ro.disconnect();
      root.style.removeProperty('--toast-stack-h');
    };
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        ref={viewportRef}
        className="toast-viewport"
        onPointerEnter={() => (hovered.current = true)}
        onPointerLeave={() => (hovered.current = false)}
        onFocus={() => (focused.current = true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) focused.current = false;
        }}
      >
        {items.map((t) => (
          <LiveToast key={t.id} item={t} paused={paused} onDismiss={(restore) => dismiss(t.id, restore)} />
        ))}
      </div>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {polite}
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {assertive}
      </div>
    </ToastContext.Provider>
  );
}

function LiveToast({
  item,
  paused,
  onDismiss,
}: {
  item: ToastItem;
  paused: () => boolean;
  onDismiss: (restoreFocus: boolean) => void;
}) {
  const sticky = item.tone === 'error' || item.action != null;
  const duration = item.duration === undefined ? (sticky ? null : toastLifetime) : item.duration;
  const timer = useRef<HTMLSpanElement>(null);
  const elapsed = useRef(0);
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    if (duration == null) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (!paused()) elapsed.current += now - last;
      last = now;
      const p = Math.max(0, 1 - elapsed.current / duration);
      timer.current?.style.setProperty('--progress', String(p));
      if (p <= 0) {
        dismissRef.current(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, paused]);

  return (
    <ToastCard
      {...item}
      toastId={item.id}
      onClose={() => onDismiss(true)}
      onAction={() => {
        item.action?.onClick?.();
        onDismiss(true);
      }}
      timerRef={duration == null ? undefined : timer}
    />
  );
}
