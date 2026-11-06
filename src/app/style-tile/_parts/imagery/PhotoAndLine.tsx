import type { CSSProperties } from 'react';
import { Ashushit } from '@/components/illustrations/Ashushit';
import { StageIcon } from '@/components/illustrations/StageIcons';
import { Num } from '@/components/ui/Num';
import { NumText } from '@/components/ui/NumText';
import { desertEdge } from '@/data/imagery';
import { stages } from '@/design/tokens';
import { cn } from '@/lib/cn';
import { NB } from '@/lib/typography';
import css from './imagery.module.css';
import { Credit, Photo } from './photo';

const irrigate = stages.findIndex((s) => s.id === 'irrigate');

/** Block c – the photo system meets the line system: field in photo, product in line, the stage icon between. */
export function PhotoAndLine() {
  return (
    <div className="grid gap-x-(--gutter) gap-y-12 md:grid-cols-2 lg:grid-cols-12 lg:items-start">
      <div className="grid content-start gap-5 md:col-span-2 lg:col-span-4">
        <h4 className="font-display text-title">
          שדה{NB}– בצילום. מוצר{NB}– בקו.
        </h4>
        <p className="max-w-[46ch] text-body text-ink-2">
          הצילום מראה איפה ומתי; השרטוט מראה ממה ואיך מרכיבים. אייקון השלב מחבר בין השניים: הוא יושב על הצילום בלוחית
          אדמה, באותו קו של השרטוט.
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-4" aria-label="אייקוני חמשת שלבי העונה">
          {stages.map((s) => (
            <li key={s.id} className="grid justify-items-center gap-2 text-micro text-ink-2">
              <StageIcon stage={s.id} size={28} className="text-ink" />
              {s.he}
            </li>
          ))}
        </ul>
        <p className="text-micro text-ink-2">
          <NumText>
            {'קו של 1.75px על רשת של 24px באייקון, 1.5px בשרטוט · בצבע הדיו · מים הם הצבע היחיד · בלי מילוי צבעוני'}
          </NumText>
        </p>
      </div>

      <figure className="grid content-start gap-3 lg:col-span-4">
        <Photo
          photo={desertEdge}
          ratio="1/1"
          slot="third"
          focus={{ x: 60, y: 50 }}
          alt="פרט משולי המדבר: הקו שבין הקרקע החשופה לחלקות המושקות, ועליו לוחית שלב ההשקיה."
        >
          <span className={cn(css.tag, css.tagStart, 'items-center gap-3 py-2')}>
            <span className={css.stageDisc} style={{ '--stage': 'var(--color-water)' } as CSSProperties}>
              <StageIcon stage="irrigate" size={24} />
            </span>
            <span className="grid gap-1 pe-1">
              <span className={cn(css.tagMuted, 'text-micro font-medium')}>
                שלב{NB}
                <Num>{String(irrigate + 1).padStart(2, '0')}</Num>
              </span>
              <span className="text-caption font-bold">{stages[irrigate].he}</span>
            </span>
          </span>
        </Photo>
        <figcaption className="grid gap-1 text-caption text-ink-2">
          <span>על הצילום: אייקון השלב בלוחית אדמה. מים הם צבע ההשקיה, ורק ההשקיה.</span>
          <Credit photo={desertEdge} className="text-micro" />
        </figcaption>
      </figure>

      <div className="card lg:col-span-4">
        <div className="card__media dot-grid">
          <Ashushit labels={false} />
        </div>
        <div className="card__body">
          <h4 className="text-lead font-extrabold">עשושית</h4>
          <p className="text-caption text-ink-2">
            מוצר משורטט בקו, לא מצולם: אותו שרטוט משמש את הכרטיס, את הוראות ההרכבה ואת התלת־ממד.
          </p>
        </div>
      </div>
    </div>
  );
}
