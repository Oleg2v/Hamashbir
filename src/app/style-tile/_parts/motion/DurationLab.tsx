'use client';

import { useCallback, useEffect, useRef, type CSSProperties } from 'react';
import { Num } from '@/components/ui/Num';
import { bezierCss, durations, easings, stagger, type DurationKey } from '@/design/tokens';
import { PlayButton, ReducedNote } from './controls';
import { cancelAll, dirSign, prefersReducedMotion } from './hooks';
import s from './motion.module.css';

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

/** Minor ticks every stagger step (40ms), labels every 200ms. */
const ticks = Array.from({ length: AXIS / stagger.stepMs + 1 }, (_, i) => i * stagger.stepMs);
const LABEL_EVERY = 200;
const labels = ticks.filter((ms) => ms % LABEL_EVERY === 0);

const outQuint = bezierCss(easings['out-quint'].bezier);

/**
 * Six durations on one shared time axis. Press play: a playhead sweeps the
 * axis in real time and every bar fills at the playhead, so each one takes
 * exactly its own duration. Drawn full (the final state) until played.
 */
export function DurationLab() {
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
        anims.current.push(
          bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: ms, easing: 'linear' }),
        );
      }
      if (end) {
        // waits, dimmed, until its moment – then a short ping
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
    const a = head.animate([{ transform: 'none' }, { transform: `translateX(${dirSign(el) * 100}%)` }], {
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
    <div ref={root} className="grid gap-8" style={{ '--ceiling': pct(CEILING) } as CSSProperties}>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <PlayButton onClick={play} context="שישה משכים על ציר אחד" />
        <p className="max-w-[56ch] text-caption text-ink-2">
          כל פס מתמלא בזמן אמת, בדיוק במשך שלו. שנתה קטנה כל <Num>{stagger.stepMs}ms</Num> – צעד ההשהיה בין שורות.{' '}
          <ReducedNote />
        </p>
      </div>

      <div className={s.timeline}>
        <div className="grid grid-cols-4 gap-x-(--gutter) sm:grid-cols-8 lg:grid-cols-12" aria-hidden="true">
          <div className="col-span-4 sm:col-start-5 lg:col-span-8 lg:col-start-5">
            <div className={`${s.zones} text-micro font-semibold text-ink-2`}>
              <span className={s.zone} style={{ inlineSize: pct(CEILING) }}>
                ממשק · עד <Num>{CEILING}ms</Num>
              </span>
              <span className={s.zone}>חשיפה וסיפור</span>
            </div>
            <span className={s.ruler}>
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
                  className={`${s.rulerLabel} text-micro`}
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

        <ol aria-label="שישה משכים על ציר זמן משותף של 1200 אלפיות שנייה">
          {keys.map((k) => {
            const d = durations[k];
            return (
              <li
                key={k}
                className="grid grid-cols-4 items-center gap-x-(--gutter) gap-y-3 border-b border-line py-4 sm:grid-cols-8 lg:grid-cols-12"
              >
                <div className="col-span-3 grid gap-1">
                  <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-body font-bold">{names[k]}</span>
                    <Num className="text-micro text-ink-3">--dur-{k}</Num>
                  </p>
                  <p className="text-caption text-ink-2">{d.use}</p>
                </div>
                <p className="col-span-1 self-start text-end sm:self-center sm:text-start">
                  <Num className="text-body font-medium">{d.ms}ms</Num>
                </p>
                <div className="col-span-4 lg:col-span-8" aria-hidden="true">
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
              <span className={`${s.sweepHead} text-micro font-medium`}>
                <Num>
                  <span ref={clock}>0000ms</span>
                </Num>
              </span>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
