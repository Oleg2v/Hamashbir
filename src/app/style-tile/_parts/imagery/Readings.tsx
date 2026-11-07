import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import { Num } from '@/components/ui/Num';
import { NumText } from '@/components/ui/NumText';
import { Verdict } from '@/components/ui/Verdict';
import { covered, desertEdge, ndviProxy, orchard } from '@/data/imagery';
import { ndvi, palette } from '@/design/tokens';
import { cn } from '@/lib/cn';
import { NB } from '@/lib/typography';
import { soilGrade } from './filters';
import css from './imagery.module.css';
import { coverScale, Credit, Photo, sizesFor, type Treatment } from './photo';

const bands: ReadonlyArray<{ n: string; name: string; treatment?: Treatment }> = [
  { n: '01', name: 'צילום' },
  { n: '02', name: 'גוון אדמה', treatment: 'soil' },
  { n: '03', name: 'NDVI', treatment: 'ndvi' },
];

const pct = (v: number) => `${Math.round(v * 100)}%`;
const bareSoil = ndvi.stops[0];
const canopy = ndvi.stops[ndvi.stops.length - 1];

function SpecTitle({ n, children }: { n: string; children: ReactNode }) {
  return (
    // the index is the photo tag's, shown for the eye; the heading's name is the treatment alone
    <h4 className="flex items-baseline gap-3 text-lead font-extrabold">
      <Num className="text-caption font-medium text-ink-3" aria-hidden="true">
        {n}
      </Num>
      <span>{children}</span>
    </h4>
  );
}

/** A two-ended key under a bar: start value at inline-start, end value at inline-end. */
function Ends({ start, end }: { start: ReactNode; end: ReactNode }) {
  return (
    <p className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-micro text-ink-2">
      <span>{start}</span>
      <span>{end}</span>
    </p>
  );
}

/** The photo, three times over, cut into bands that read as one frame. */
function Bands() {
  const p = desertEdge;
  const sizes = sizesFor('full', (min) => coverScale(p, min >= 768 ? '21/9' : '4/3'));
  return (
    <div
      role="img"
      aria-label={`${p.title} באותו צילום, בשלוש רצועות: מימין הצילום כמו שהוא; באמצע גוון אדמה – מחום כהה עד שמנת; משמאל NDVI – המדבר באדום, החלקות המושקות בירוק ובצהוב.`}
      className={cn(css.frame, css.bands, 'aspect-[4/3] md:aspect-[21/9]')}
    >
      {bands.map((b, i) => (
        // a size container in micro-text em: a band narrower than its tag at large text (a phone at 200%)
        // tucks the tag closer to the corner, so the tag wraps inside its band instead of being cut
        <div key={b.n} className={cn(css.band, '@container text-micro')} style={{ '--band': i } as CSSProperties}>
          <Image
            src={p.src}
            width={p.width}
            height={p.height}
            alt=""
            sizes={sizes}
            className={cn(css.bandImg, b.treatment && css[b.treatment])}
            style={{ objectPosition: `${p.focus.x}% ${p.focus.y}%` }}
          />
          {/* the tag wraps inside its band at large text instead of being cut at the band edge */}
          <span
            className={cn(
              css.tag,
              css.tagStart,
              'max-w-[calc(100%-1.5rem)] flex-wrap whitespace-normal text-micro font-bold',
              '@max-[5.5em]:start-1 @max-[5.5em]:top-1 @max-[5.5em]:max-w-[calc(100%-0.5rem)] @max-[5.5em]:gap-1 @max-[5.5em]:px-1',
            )}
          >
            <Num className={css.tagMuted}>{b.n}</Num>
            <span>{b.name}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function Specs() {
  return (
    <div className="grid gap-x-(--gutter) gap-y-10 md:grid-cols-3">
      <div className="grid content-start gap-3 border-t-(length:--bw) border-line pt-4">
        <SpecTitle n="01">צילום</SpecTitle>
        <p className="text-body text-ink-2">
          בלי פילטר: הצבע והאור כמו שצולמו. למסך הפתיחה, לכרטיסים ולכל מקום שבו השדה עצמו הוא המידע.
        </p>
      </div>
      <div className="grid content-start gap-3 border-t-(length:--bw) border-line pt-4">
        <SpecTitle n="02">גוון אדמה</SpecTitle>
        <p className="text-body text-ink-2">
          בהירות בלבד: הצללים נופלים לאדמה והאורות לנייר. לרקע מאחורי טקסט ולמשטחי אדמה{NB}– הצילום נשאר, בצבעי המותג.
        </p>
        <div className="grid gap-2">
          <div className={css.gradeBar} aria-hidden="true" />
          <Ends
            start={
              <>
                צללים · <Num>{palette.soil.hex}</Num>
              </>
            }
            end={
              <>
                אורות · <Num>{palette.paper.hex}</Num>
              </>
            }
          />
        </div>
        <p className="text-micro text-ink-2">
          <NumText>{`רמות: מתחת ל־${pct(soilGrade.black)} בהירות הכול אדמה, מעל ${pct(soilGrade.white)} הכול נייר.`}</NumText>
        </p>
      </div>
      <div className="grid content-start gap-3 border-t-(length:--bw) border-line pt-4">
        <SpecTitle n="03">NDVI</SpecTitle>
        <p className="text-body text-ink-2">
          מדד הצמחייה דרך הרמפה: קטיף, חיטה, נבט, שדה. לנתונים בלבד, ותמיד עם מקרא.
        </p>
        <div className="grid gap-2">
          <div className={css.rampBar} aria-hidden="true" />
          <Ends
            start={
              <>
                {bareSoil.label} · <Num>{bareSoil.at}</Num>
              </>
            }
            end={
              <>
                {canopy.label} · <Num>{canopy.at}</Num>
              </>
            }
          />
        </div>
        <p className="text-micro text-ink-2">
          {'לצילום רגיל אין ערוץ אינפרא־אדום, ולכן כאן המדד מחושב מהפיקסלים: '}
          {/* inline-block: the formula moves to the next line whole; it wraps inside only at 200% text.
              Its comma sits inside the box (Chrome breaks beside an inline-block even at a word joiner),
              so the comma never opens a line */}
          <span className="inline-block">
            <Num>
              {ndviProxy.k} × (2G − R − B) + {ndviProxy.c}
            </Num>
            ,
          </span>
          {' מכויל כך שאדמה חשופה יושבת סביב '}
          <Num>{bareSoil.at}</Num>
          {`${NB}וחופה צפופה סביב${NB}`}
          <Num>{canopy.at}</Num>
          {'. במוצר: NDVI אמיתי מלוויין '}
          <bdi lang="en" dir="ltr">
            Sentinel-2
          </bdi>
          .
        </p>
      </div>
    </div>
  );
}

/** Rendered right/wrong pair: NDVI over open ground vs. over a cover. */
function NdviPair() {
  const cases = [
    {
      photo: orchard,
      ok: true,
      head: 'מטע פתוח',
      body: 'המדד קורא את החופה: השדה החרוש באדום, צמרות העצים בירוק.',
      alt: 'המטע בטיפול NDVI: השדה החרוש בכתום־אדום, צמרות העצים בירוק כהה ובין השורות צהוב.',
    },
    {
      photo: covered,
      ok: false,
      head: 'גידול מכוסה',
      body: 'המדד קורא את היריעה: המנהרות נראות כמו צמחייה דלילה, והשדה הפתוח לידן ירוק.',
      alt: 'המנהרות בטיפול NDVI: היריעות בכתום ובצהוב, כמו צמחייה דלילה; השדה הפתוח מימין להן בירוק.',
    },
  ] as const;
  return (
    <div className="grid gap-x-(--gutter) gap-y-8 lg:grid-cols-12 lg:items-start">
      <div className="grid content-start gap-3 lg:col-span-4">
        <h4 className="text-lead font-extrabold">NDVI לא מעל ניילון</h4>
        <p className="text-body text-ink-2">
          מעל מנהרה או חממה הלוויין קורא את היריעה, לא את הגידול שמתחתיה{'\u00a0'}– שם המדד לא מוצג, והשטח מסומן כמכוסה.
          רשת נגד חרקים עבירה לאור: מתחתיה המדד מוצג, תמיד עם התווית „מתחת לרשת · מכויל”.
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-x-(--gutter) gap-y-8 lg:col-span-6 lg:col-start-7">
        {cases.map((c) => (
          <li key={c.head}>
            <figure className="grid content-start gap-3">
              <Photo photo={c.photo} ratio="1/1" slot="pair" treatment="ndvi" alt={c.alt} />
              <figcaption className="grid gap-2">
                <Verdict ok={c.ok} />
                <p className="text-caption">
                  <span className="font-bold">{c.head}. </span>
                  <span className="text-ink-2">{c.body}</span>
                </p>
                <Credit photo={c.photo} className="text-micro text-ink-2" />
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Readings() {
  return (
    <div className="grid gap-16 lg:gap-24">
      <div className="grid gap-6">
        <div className="grid max-w-[62ch] gap-2">
          <h4 className="text-lead font-extrabold">אותו שדה, שלוש קריאות</h4>
          <p className="text-body text-ink-2">
            צילום אחד בשלוש רצועות, בסדר הקריאה. כל רצועה היא טיפול שלם; כאן הן יושבות זו לצד זו כדי שאפשר יהיה להשוות.
          </p>
        </div>
        <figure className="grid gap-8">
          <Bands />
          <figcaption className="grid gap-8">
            <Specs />
            <Credit photo={desertEdge} className="text-micro text-ink-2" />
          </figcaption>
        </figure>
      </div>
      <NdviPair />
    </div>
  );
}
