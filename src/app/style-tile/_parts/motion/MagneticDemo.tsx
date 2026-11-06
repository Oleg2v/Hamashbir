'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Magnetic } from '@/components/ui/Magnetic';
import { Num } from '@/components/ui/Num';
import { useToast } from '@/components/ui/Toast';
import { spring } from '@/design/tokens';
import { FINE_QUERY, REDUCE_QUERY, useMedia } from './hooks';
import s from './motion.module.css';
import { MAGNET } from './spec';

const signed = (v: number) => `${v < 0 ? '−' : '+'}${Math.abs(v).toFixed(1)}`;

/**
 * The magnetic CTA on a test bench: the dashed box is the activation zone
 * (the same maths Magnetic uses), the dashed pill is the rest position, and
 * the readout shows the live offset – including the spring's overshoot on
 * release. Off for touch, coarse pointers and reduced motion.
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

  // live readout of the actual (transitioning) offset while the pointer is near
  useEffect(() => {
    const st = stage.current;
    const mag = st?.querySelector<HTMLElement>('.magnetic');
    if (!st || !mag || !fine || reduce) return;
    let raf = 0;
    let until = 0;
    const read = () => {
      const t = getComputedStyle(mag).transform;
      const m = t && t !== 'none' ? new DOMMatrixReadOnly(t) : null;
      if (rx.current) rx.current.textContent = signed(m ? m.m41 : 0);
      if (ry.current) ry.current.textContent = signed(m ? m.m42 : 0);
      if (performance.now() < until) raf = requestAnimationFrame(read);
    };
    const wake = (ms: number) => {
      const was = performance.now() < until;
      until = Math.max(until, performance.now() + ms);
      if (!was) raf = requestAnimationFrame(read);
    };
    const onMove = () => wake(400);
    const onLeave = () => wake(spring.durationMs + 200);
    st.addEventListener('pointermove', onMove);
    st.addEventListener('pointerleave', onLeave);
    return () => {
      st.removeEventListener('pointermove', onMove);
      st.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [fine, reduce]);

  const status =
    fine === null || reduce === null ? (
      <Chip tone="neutral">מצביע עדין בלבד</Chip>
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
      style={{ '--reach': MAGNET.reach, '--max': `${MAGNET.max}px` } as CSSProperties}
    >
      <span className={s.zoneBox} aria-hidden="true">
        <span className={`${s.zoneLabel} text-micro`}>אזור משיכה</span>
      </span>
      <span className={s.envelope} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <span className={`${s.envelopeLabel} text-micro`}>
          <Num>±{MAGNET.max}px</Num>
        </span>
      </span>
      <span className={s.ghost} aria-hidden="true" />
      <span className={s.cross} aria-hidden="true" />
      <span className={s.magnet}>
        <Magnetic strength={MAGNET.strength} max={MAGNET.max} reach={MAGNET.reach}>
          <Button
            size="lg"
            onClick={() =>
              toast({
                tone: 'info',
                title: 'כאן ייפתח מתכנן העונה',
                body: 'בשלב 0 הכפתור מדגים תנועה בלבד.',
                duration: 4000,
              })
            }
          >
            בנו תוכנית עונה
          </Button>
        </Magnetic>
      </span>
      <span className={s.stageStatus}>{status}</span>
      <span className={`${s.readout} text-micro`} aria-hidden="true">
        <Num>
          x <span ref={rx} className={s.readoutValue}>+0.0</span> · y{' '}
          <span ref={ry} className={s.readoutValue}>
            +0.0
          </span>{' '}
          px
        </Num>
      </span>
    </div>
  );
}
