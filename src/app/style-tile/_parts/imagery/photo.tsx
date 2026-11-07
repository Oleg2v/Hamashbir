import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import type { AerialPhoto } from '@/data/imagery';
import { cn } from '@/lib/cn';
import css from './imagery.module.css';

/**
 * One aerial photo in a frame. Aerial photos stand with square corners
 * (radii.none: „תמונות אוויר”); inside a card the card clips them.
 * next/image serves responsive WebP; it is lazy by default (everything here
 * sits below the fold), and the width/height are the file's real pixels.
 */

export type Ratio = '21/9' | '4/3' | '1/1' | 'native';

/** Frame classes, written out in full so Tailwind generates them. */
const ratioClass: Record<Exclude<Ratio, 'native'>, string> = {
  '21/9': 'aspect-[21/9]',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
};

const ratioValue = (r: Ratio, p: AerialPhoto) =>
  r === 'native' ? p.width / p.height : r === '1/1' ? 1 : r === '4/3' ? 4 / 3 : 21 / 9;

/**
 * How much wider than its frame the photo is drawn under object-fit: cover.
 * A 2:1 photo in a 4:3 frame is drawn 1.5 frames wide, so it needs a
 * candidate 1.5 × the slot – otherwise the crop is an upscale.
 */
export const coverScale = (p: AerialPhoto, r: Ratio) => Math.max(1, p.width / p.height / ratioValue(r, p));

/**
 * Layout slots on the 12-column grid: .wrap margins 16/24/48/64px and
 * gutters 16/24px (tokens.ts › layout), content capped at 1312px.
 */
const slots = {
  /** 12 columns */
  full: [
    [1440, '1312px'],
    [1280, '100vw - 128px'],
    [1024, '100vw - 96px'],
    /* md is where 21:9 frames switch back from their phone ratio */
    [768, '100vw - 48px'],
    [640, '100vw - 48px'],
    [0, '100vw - 32px'],
  ],
  /** 7 columns from lg, full width below */
  wide7: [
    [1440, '755px'],
    [1024, '52vw'],
    [640, '100vw - 48px'],
    [0, '100vw - 32px'],
  ],
  /** 6 columns from lg, two-up from md, full width below */
  duo: [
    [1440, '644px'],
    [1024, '44vw'],
    [768, '50vw - 32px'],
    [640, '100vw - 48px'],
    [0, '100vw - 32px'],
  ],
  /** 4 columns from lg, two-up below */
  pair: [
    [1440, '421px'],
    [1024, '29vw'],
    [640, '50vw - 32px'],
    [0, '50vw - 24px'],
  ],
  /** 4 columns from lg, two-up from md, full width below */
  third: [
    [1440, '421px'],
    [1024, '29vw'],
    [768, '50vw - 32px'],
    [640, '100vw - 48px'],
    [0, '100vw - 32px'],
  ],
} as const satisfies Record<string, ReadonlyArray<readonly [number, string]>>;

export type Slot = keyof typeof slots;

/** `sizes` for a slot, each step scaled by the cover factor of the frame in force there. */
export function sizesFor(slot: Slot, scaleAt: (minWidth: number) => number) {
  return slots[slot]
    .map(([min, len]) => {
      const s = Number(scaleAt(min).toFixed(3));
      const calc = len.includes(' ') ? `(${len})` : len;
      const value = s === 1 ? (len.includes(' ') ? `calc(${len})` : len) : `calc(${calc} * ${s})`;
      return min ? `(min-width: ${min}px) ${value}` : value;
    })
    .join(', ');
}

export type Treatment = 'soil' | 'ndvi';

export function Photo({
  photo,
  ratio,
  phoneRatio,
  slot,
  treatment,
  alt = photo.alt,
  focus = photo.focus,
  className,
  children,
}: {
  photo: AerialPhoto;
  ratio: Ratio;
  /** frame below md (768px), when it differs – e.g. 21:9 becomes 4:3 on phones */
  phoneRatio?: Exclude<Ratio, 'native'>;
  slot: Slot;
  treatment?: Treatment;
  alt?: string;
  focus?: { x: number; y: number };
  className?: string;
  /** overlays drawn over the photo (survey layer, crop frames, tags) */
  children?: ReactNode;
}) {
  const wide = coverScale(photo, ratio);
  const phone = phoneRatio ? coverScale(photo, phoneRatio) : wide;
  const frame = cn(
    css.frame,
    ratio === 'native' ? undefined : phoneRatio ? `${ratioClass[phoneRatio]} ${mdRatio[ratio]}` : ratioClass[ratio],
    className,
  );
  const style: CSSProperties | undefined =
    ratio === 'native' ? { aspectRatio: `${photo.width} / ${photo.height}` } : undefined;
  return (
    <div className={frame} style={style}>
      <Image
        src={photo.src}
        width={photo.width}
        height={photo.height}
        alt={alt}
        sizes={sizesFor(slot, (min) => (min >= 768 ? wide : phone))}
        className={cn(css.img, treatment && css[treatment])}
        style={{ objectPosition: `${focus.x}% ${focus.y}%` }}
      />
      {children}
    </div>
  );
}

/** md: frame classes (only the ones a phone override can switch back to). */
const mdRatio: Record<Exclude<Ratio, 'native'>, string> = {
  '21/9': 'md:aspect-[21/9]',
  '4/3': 'md:aspect-[4/3]',
  '1/1': 'md:aspect-square',
};

/** The visible credit line: „צילום: name · source”, each Latin run isolated so the order holds in RTL. */
export function Credit({ photo, className }: { photo: AerialPhoto; className?: string }) {
  return (
    <span className={className}>
      {'צילום: '}
      <bdi lang="en" dir="ltr">
        {photo.photographer}
      </bdi>
      {' · '}
      <bdi lang="en" dir="ltr">
        {photo.source}
      </bdi>
    </span>
  );
}
