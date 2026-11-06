/** Site chrome required on every page: skip link and the demo-hygiene badge. */

export function SkipLink({ href = '#main' }: { href?: string }) {
  return (
    <a className="skip-link" href={href}>
      דלג לתוכן הראשי
    </a>
  );
}

export const DEMO_BADGE_TEXT = 'קונספט של Kikkey – לא האתר הרשמי של המשביר לחקלאי';

export function DemoBadge() {
  return (
    <aside className="demo-badge" data-surface="paper" aria-label="הבהרה">
      <span className="demo-badge__dot" aria-hidden="true" />
      <p>{DEMO_BADGE_TEXT}</p>
    </aside>
  );
}
