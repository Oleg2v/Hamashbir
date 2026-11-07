'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Magnetic } from '@/components/ui/Magnetic';
import { Num } from '@/components/ui/Num';
import { useToast } from '@/components/ui/Toast';
import { magnet } from '@/design/tokens';
import { NB } from '@/lib/typography';
import { FINE_QUERY, REDUCE_QUERY, useMedia } from './hooks';
import s from './motion.module.css';

/** U+2212 minus, so a negative offset reads as one; one decimal, always signed. */
const signed = (v: number) => `${v < -0.05 ? '−' : '+'}${Math.abs(v).toFixed(1)}`;

/**
 * The magnetic CTA on a test bench. The dashed box is the activation zone,
 * drawn with <Magnetic>'s own maths (the button scaled by `reach`); the
 * dashed pill is the rest position; the crop marks are the ±max travel. The
 * readout shows the live offset of the real element – including the
 * spring's overshoot on release, whatever released it (leaving the zone or
 * the window, scrolling). Off for touch, coarse pointers and reduced motion.
 */
export function MagneticDemo() {
  const fine = useMedia(FINE_QUERY);
  const reduce = useMedia(REDUCE_QUERY);
  const { toast } = useToast();
  const stage = useRef<HTMLDivElement>(null);
  const rx = useRef<HTMLSpanElement>(null);
  const ry = useRef<HTMLSpanElement>(null);

  // size the zone and the rest ghost from the real button
  useEffect(() => {
    const st = stage.current;
    const mag = st?.querySelector<HTMLElement>('.magnetic');
    if (!st || !mag) return;
    const ro = new ResizeObserver(() => {
      st.style.setProperty('--w', `${mag.offsetWidth}px`);
      st.style.setProperty('--h', `${mag.offsetHeight}px`);
    });
    ro.observe(mag);
    return () => ro.disconnect();
  }, []);

  // live readout: sample the real transform for as long as its transition runs
  useEffect(() => {
    const mag = stage.current?.querySelector<HTMLElement>('.magnetic');
    if (!mag || !fine || reduce) return;
    let raf = 0;
    const moving = () =>
      mag.getAnimations().some((a) => a instanceof CSSTransition && a.transitionProperty === 'transform');
    const read = () => {
      const t = getComputedStyle(mag).transform;
      const m = t && t !== 'none' ? new DOMMatrixReadOnly(t) : null;
      if (rx.current) rx.current.textContent = signed(m ? m.m41 : 0);
      if (ry.current) ry.current.textContent = signed(m ? m.m42 : 0);
      raf = moving() ? requestAnimationFrame(read) : 0;
    };
    const onRun = (e: TransitionEvent) => {
      if (e.target !== mag || e.propertyName !== 'transform' || raf) return;
      raf = requestAnimationFrame(read);
    };
    mag.addEventListener('transitionrun', onRun);
    return () => {
      mag.removeEventListener('transitionrun', onRun);
      cancelAnimationFrame(raf);
    };
  }, [fine, reduce]);

  const status =
    fine === null || reduce === null ? (
      <Chip tone="neutral">מצביע מדויק בלבד</Chip>
    ) : reduce ? (
      <Chip tone="wheat">כבוי · תנועה מופחתת</Chip>
    ) : !fine ? (
      <Chip tone="neutral">כבוי · מסך מגע</Chip>
    ) : (
      <Chip tone="sprout">פעיל במכשיר הזה</Chip>
    );

  return (
    <div
      ref={stage}
      className={s.stage}
      style={{ '--reach': magnet.reach, '--max': `${magnet.max}px` } as CSSProperties}
    >
      <span className={s.zoneBox} aria-hidden="true">
        <span className={`${s.zoneLabel} text-micro leading-none`}>אזור משיכה</span>
      </span>
      <span className={s.envelope} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <span className={`${s.envelopeLabel} text-micro leading-none`}>
          <Num>±{magnet.max}px</Num>
        </span>
      </span>
      <span className={s.ghost} aria-hidden="true" />
      <span className={s.cross} aria-hidden="true" />
      <span className={s.magnet}>
        <Magnetic strength={magnet.strength} max={magnet.max} reach={magnet.reach}>
          <Button
            size="lg"
            onClick={() =>
              toast({
                tone: 'info',
                title: 'כאן ייפתח מתכנן העונה',
                body: 'בשלב 0 הכפתור מדגים תנועה בלבד.',
              })
            }
          >
            בנו תוכנית עונה
          </Button>
        </Magnetic>
      </span>
      <span className={s.stageStatus}>{status}</span>
      <span className={`${s.readout} text-micro leading-none`} aria-hidden="true">
        <Num>
          {'x '}
          <span ref={rx} className={s.readoutValue}>
            +0.0
          </span>
          {' · '}
          {/* „px” never wraps alone: Chrome breaks beside the inline-block value even at a no-break
              space, so the unit and its value (with its „y”) move to the next line as one group */}
          <span className="whitespace-nowrap">
            {'y '}
            <span ref={ry} className={s.readoutValue}>
              +0.0
            </span>
            {`${NB}px`}
          </span>
        </Num>
      </span>
    </div>
  );
}
