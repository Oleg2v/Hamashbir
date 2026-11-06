import type { ReactNode, SVGProps } from 'react';

/**
 * UI icon set – 24px grid, 1.75 stroke, round caps, currentColor.
 * Directional icons are drawn for RTL ("forward" points left) and carry
 * `data-dir-icon` so an LTR context can mirror them.
 * Agronomic/stage icons live in components/illustrations.
 */
type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: number; title?: string };

function Svg({ size = 24, title, strokeWidth = 1.75, children, ...rest }: IconProps & { children: ReactNode }) {
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
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/** Forward = toward inline-end = left in RTL. */
export const ArrowForwardIcon = (p: IconProps) => (
  <Svg data-dir-icon="" {...p}>
    <path d="M19 12H5.5" />
    <path d="M11 6l-6 6 6 6" />
  </Svg>
);

export const ArrowBackIcon = (p: IconProps) => (
  <Svg data-dir-icon="" {...p}>
    <path d="M5 12h13.5" />
    <path d="M13 6l6 6-6 6" />
  </Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);

export const InfoIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5" />
    <path d="M12 7.6v.01" />
  </Svg>
);

export const AlertIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.25v6" />
    <path d="M12 16.6v.01" />
  </Svg>
);

export const ShieldIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3l7 2.8v5.6c0 4.4-2.9 7.7-7 9.6-4.1-1.9-7-5.2-7-9.6V5.8z" />
    <path d="M9 12.2l2.1 2.1 3.9-4.1" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
  </Svg>
);

export const PlusIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const MinusIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
);

export const SunIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.75v2M12 19.25v2M2.75 12h2M19.25 12h2M5.46 5.46l1.41 1.41M17.13 17.13l1.41 1.41M5.46 18.54l1.41-1.41M17.13 6.87l1.41-1.41" />
  </Svg>
);

export const PinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s-6.5-6-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 15 12 21 12 21z" />
    <circle cx="12" cy="9.8" r="2.3" />
  </Svg>
);

/** Facing forward (left) in RTL. */
export const TruckIcon = (p: IconProps) => (
  <Svg data-dir-icon="" {...p}>
    <path d="M21 6.5H10v9h11z" />
    <path d="M10 9.5H6l-3 3v3h7" />
    <circle cx="17" cy="17.5" r="1.8" />
    <circle cx="7" cy="17.5" r="1.8" />
  </Svg>
);

export const StoreIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 9.5l1.5-5h13L20 9.5" />
    <path d="M4 9.5h16v.8a2.67 2.67 0 0 1-5.33 0 2.67 2.67 0 0 1-5.34 0A2.67 2.67 0 0 1 4 10.3z" />
    <path d="M5.5 12.6V20h13v-7.4" />
    <path d="M10 20v-4.5h4V20" />
  </Svg>
);

export const DropIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5s6 6.3 6 10.7a6 6 0 0 1-12 0c0-4.4 6-10.7 6-10.7z" />
  </Svg>
);

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.3-4.3" />
  </Svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 9.5l6 6 6-6" />
  </Svg>
);

export const CalendarIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Svg>
);

export const PlayIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 5.5v13l10-6.5z" />
  </Svg>
);
