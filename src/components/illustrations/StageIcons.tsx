import type { ReactNode } from 'react';
import type { StageId } from '@/design/tokens';

/**
 * Stage icons – the five beats of the season spine, drawn in the same
 * language as components/ui/icons.tsx: 24px grid, 1.75 stroke, round caps
 * and joins, currentColor, everything inside the 3–21.5 live area.
 * Optically balanced as a set at 24, 32 and 48px: the open sprout carries
 * a closed seed for weight, the shield and the crate are held a touch
 * inside the 24px keyline so their enclosed areas don't outweigh the rest.
 * None of them is directional, so RTL needs no mirroring.
 *
 * Crop protection is a leaf inside the agronomist-gate shield – never a
 * sprayer, a drum or a skull.
 */

const paths: Record<StageId, ReactNode> = {
  // a seed splitting into a sprout: the seed sits in the parted soil line,
  // its two cotyledons open above it (the brand's sprout mark, in line)
  sow: (
    <>
      <path d="M3.25 19.5h5M15.75 19.5h5" />
      <ellipse cx="12" cy="19.5" rx="2.9" ry="2" />
      <path d="M12 17.5v-6.25" />
      <path d="M12 13.25c0-4-2.6-6.6-6.9-6.6 0 4 2.6 6.6 6.9 6.6z" />
      <path d="M12 11.25c0-4 2.6-6.6 6.9-6.6 0 4-2.6 6.6-6.9 6.6z" />
    </>
  ),
  // a drip line with its inline emitter, a drop leaving it
  irrigate: (
    <>
      <path d="M3 6h5.5M15.5 6H21M3 10.5h5.5M15.5 10.5H21" />
      <rect x="8.5" y="4.25" width="7" height="8" rx="2" />
      <path d="M12 14s2.6 2.8 2.6 4.6a2.6 2.6 0 0 1-5.2 0C9.4 16.8 12 14 12 14z" />
    </>
  ),
  // a leaf held inside the agronomist-gate shield
  protect: (
    <>
      <path d="M12 3.25l6.75 2.7v5.4c0 4.25-2.8 7.45-6.75 9.3-3.95-1.85-6.75-5.05-6.75-9.3v-5.4z" />
      <path d="M8.75 15.6c0-4.1 2.7-6.75 6.75-6.75 0 4.05-2.7 6.75-6.75 6.75z" />
      <path d="M8.75 15.6l3.75-3.75" />
    </>
  ),
  // a tomato on its stem, calyx open
  harvest: (
    <>
      <path d="M12 8.75c-4.5 0-7.5 2.55-7.5 6s3.25 6.25 7.5 6.25 7.5-2.8 7.5-6.25-3-6-7.5-6z" />
      <path d="M12 8.75V5.5c0-.95.55-1.7 1.5-2" />
      <path d="M12 8.75c-1.15-.95-2.7-1.25-4.15-.8M12 8.75c1.15-.95 2.7-1.25 4.15-.8M12 8.75c-.45 1.05-1.3 1.75-2.4 2.05M12 8.75c.45 1.05 1.3 1.75 2.4 2.05" />
    </>
  ),
  // a ventilated produce crate, heaped – square-sided so it never reads as
  // the shopping basket of an online store
  pack: (
    <>
      <path d="M5.75 9.5a2 2 0 0 1 4 0M10 9.5a2 2 0 0 1 4 0M14.25 9.5a2 2 0 0 1 4 0" />
      <rect x="4" y="9.5" width="16" height="10" rx="1.5" />
      <path d="M8.25 12.75v3.5M12 12.75v3.5M15.75 12.75v3.5" />
    </>
  ),
};

type StageIconProps = {
  stage: StageId;
  size?: number;
  className?: string;
  strokeWidth?: number;
  /** Hebrew accessible name; omit when a visible label sits next to the icon. */
  title?: string;
};

export function StageIcon({ stage, size = 24, className, strokeWidth = 1.75, title }: StageIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      data-stage={stage}
    >
      {paths[stage]}
    </svg>
  );
}
