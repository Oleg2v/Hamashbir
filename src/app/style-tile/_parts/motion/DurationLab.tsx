'use client';

import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { Num } from '@/components/ui/Num';
import { bezierCss, durations, easings, stagger, type DurationKey } from '@/design/tokens';
import { cn } from '@/lib/cn';
import { Block } from '../Section';
import { PlayButton } from './controls';
import { cancelAll, prefersReducedMotion } from './hooks';
import s from './motion.module.css';
import { Token } from './Token';

const names: Record<DurationKey, string> = {
  instant: 'מיידי',
  fast: 'מהיר',
  base: 'בסיס',
  slow: 'איטי',
  grow: 'צמיחה',
  season: 'עונה',
};

const keys = Object.keys(durations) as DurationKey[];

/** The longest token is the axis; the UI ceiling is the slowest UI token. */
const AXIS = durations.season.ms;
const CEILING = durations.slow.ms;
const pct = (ms: number) => `${(ms / AXIS) * 100}%`;

/** Minor ticks every stagger step (40ms), a label every fifth tick (200ms). */
const ticks = Array.from({ length: AXIS / stagger.stepMs + 1 }, (_, i) => i * stagger.stepMs);
const LABEL_EVERY = 5 * stagger.stepMs;
const labels = ticks.filter((ms) => ms % LABEL_EVERY === 0);

const outQuint = bezierCss(easings['out-quint'].bezier);

/**
 * Six durations on one shared time axis. Press play: a playhead sweeps the
 * axis in real time and every bar fills at the playhead, so each one takes
 * exactly its own duration. Drawn full (the final state) until played.
 */
export function DurationLab({ title, note }: { title: string; note?: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const sweep = useRef<HTMLSpanElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const anims = useRef<Animation[]>([]);
  const raf = useRef(0);

  const play = useCallback(() => {
    const el = root.current;
    if (!el) return;
    cancelAll(anims.current);
    cancelAnimationFrame(raf.current);
    delete el.dataset.playing;
    if (prefersReducedMotion()) return;

    el.querySelectorAll<HTMLElement>('[data-lane]').forEach((lane) => {
      const ms = Number(lane.dataset.lane);
      const bar = lane.querySelector<HTMLElement>('[data-bar]');
      const end = lane.querySelector<HTMLElement>('[data-end]');
      if (bar) {
        anims.current.push(bar.animate([{ transform: 'scaleX(0)', offset: 0 }], { duration: ms, easing: 'linear' }));
      }
      if (end) {
        // waits, dimmed, until its moment – then a short ping
        anims.current.push(end.animate([{ opacity: 0.25 }, { opacity: 0.25 }], { duration: ms }));
        anims.current.push(
          end.animate([{ scale: '1' }, { scale: '1.6', offset: 0.3 }, { scale: '1' }], {
            duration: durations.slow.ms,
            delay: ms,
            easing: outQuint,
          }),
        );
      }
    });

    const head = sweep.current;
    if (!head) return;
    // --dir-sign: forward is toward inline-end, whatever the page direction
    const a = head.animate([{ transform: 'none' }, { transform: 'translateX(calc(var(--dir-sign) * 100%))' }], {
      duration: AXIS,
      easing: 'linear',
    });
    anims.current.push(a);
    el.dataset.playing = '';
    const tick = () => {
      const t = typeof a.currentTime === 'number' ? Math.min(AXIS, a.currentTime) : 0;
      if (clock.current) clock.current.textContent = `${String(Math.round(t)).padStart(4, '0')}ms`;
      if (a.playState === 'running') raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    a.finished.then(
      () => {
        if (anims.current.includes(a)) delete el.dataset.playing;
      },
      () => {},
    );
  }, []);

  useEffect(() => {
    const list = anims.current;
    return () => {
      cancelAll(list);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <Block title={title} note={note} action={<PlayButton onClick={play} context="שישה משכים על ציר אחד" />}>
      <div ref={root} className={s.timeline} style={{ '--ceiling': pct(CEILING) } as CSSProperties}>
        <div className="grid grid-cols-4 gap-x-(--gutter) sm:grid-cols-8 lg:grid-cols-12" aria-hidden="true">
          <div className="col-span-4 sm:col-start-5 lg:col-span-8 lg:col-start-5">
            <div className={`${s.zones} text-micro font-semibold text-ink-2`}>
              <span className={s.zone} style={{ inlineSize: pct(CEILING) }}>
                ממשק · עד&nbsp;<Num>{CEILING}ms</Num>
              </span>
              <span className={s.zone}>חשיפה וסיפור</span>
            </div>
            {/* a size container in label em: where the labels would meet (200% text) they thin out by the
                ruler's own width – a label every 400ms below 32em, then the ends and the UI ceiling below 15em */}
            <span className={cn(s.ruler, '@container text-micro')}>
              {ticks.map((ms) => (
                <span
                  key={ms}
                  className={s.tick}
                  data-major={ms % LABEL_EVERY === 0 ? '' : undefined}
                  style={{ '--at': pct(ms) } as CSSProperties}
                />
              ))}
              {labels.map((ms, i) => (
                <span
                  key={ms}
                  className={cn(
                    s.rulerLabel,
                    'text-micro leading-none',
                    ms % (LABEL_EVERY * 2) !== 0 && '@max-[32em]:hidden',
                    i > 0 && i < labels.length - 1 && ms !== CEILING && '@max-[15em]:hidden',
                  )}
                  data-edge={i === 0 ? 'start' : i === labels.length - 1 ? 'end' : undefined}
                  data-minor={ms % (LABEL_EVERY * 2) === 0 ? undefined : ''}
                  style={{ '--at': pct(ms) } as CSSProperties}
                >
                  <Num>{i === labels.length - 1 ? `${ms}ms` : ms}</Num>
                </span>
              ))}
            </span>
          </div>
        </div>

        <ol aria-label={`שישה משכים על ציר זמן משותף של ${AXIS} אלפיות שנייה`}>
          {keys.map((k) => {
            const d = durations[k];
            return (
              <li
                key={k}
                // phones: name | value (auto, so "1200ms" never overflows at 200% text) | the lane under both
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-(--gutter) gap-y-3 border-b-(length:--bw) border-line py-4 sm:grid-cols-8 lg:grid-cols-12"
              >
                <div className="col-span-1 grid gap-1 sm:col-span-3">
                  <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-body font-bold">{names[k]}</span>
                    <Token className="text-micro text-ink-3">--dur-{k}</Token>
                  </p>
                  <p className="text-caption text-ink-2">{d.use}</p>
                </div>
                <p className="col-span-1 self-start text-end sm:self-center sm:text-start">
                  <Num className="text-body font-medium">{d.ms}ms</Num>
                </p>
                <div className="col-span-2 sm:col-span-4 lg:col-span-8" aria-hidden="true">
                  <span className={s.lane} data-lane={d.ms} style={{ '--at': pct(d.ms) } as CSSProperties}>
                    <span className={s.laneBar} data-bar="" />
                    <span className={s.laneEnd} data-end="" />
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        <div
          className={`${s.sweepArea} hidden grid-cols-8 gap-x-(--gutter) sm:grid lg:grid-cols-12`}
          aria-hidden="true"
        >
          <span className="relative col-span-4 col-start-5 lg:col-span-8 lg:col-start-5">
            <span ref={sweep} className={s.sweep}>
              <span className={`${s.sweepHead} text-micro font-medium leading-none`}>
                <Num>
                  <span ref={clock}>0000ms</span>
                </Num>
              </span>
            </span>
          </span>
        </div>
      </div>
    </Block>
  );
}
