import { Fragment, type ReactNode } from 'react';
import { Num } from './Num';

/**
 * Sets running Hebrew text with the number rules applied automatically:
 * every numeric run goes into <Num> (a mono <bdi>), and the space after a
 * number becomes a no-break space when a Hebrew word (its unit or counted
 * noun) follows — so "40 דונם" never splits at a line end.
 *
 *   <NumText>{'Suez One ב־144 פיקסלים מול 40 דונם'}</NumText>
 *
 * A numeric run starts and ends with a digit (so a sentence's full stop stays
 * outside), may contain , . : × / and an en-dash range, and may carry an
 * attached Latin unit (%, px, ms, rem, vw, em) or a degree sign.
 */
const NUMERIC = /(−?\d(?:[\d,.:×/–]*\d)?(?:%|px|ms|rem|vw|em|°[NSEW]?)?)/g;
const HEBREW_START = /^ (?=[֐-׿])/;

export function NumText({ children, mono = true }: { children: string; mono?: boolean }) {
  const parts = children.split(NUMERIC);
  const out: ReactNode[] = [];
  parts.forEach((part, i) => {
    if (i % 2 === 1) {
      out.push(
        <Num key={i} mono={mono}>
          {part}
        </Num>,
      );
    } else if (part) {
      // a number followed by " עברית" → no-break space
      const text = i > 0 ? part.replace(HEBREW_START, ' ') : part;
      out.push(<Fragment key={i}>{text}</Fragment>);
    }
  });
  return <>{out}</>;
}
