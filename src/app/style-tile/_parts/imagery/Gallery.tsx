import { Num } from '@/components/ui/Num';
import { aerialPhotos, covered, desertEdge, orchard, type AerialPhoto } from '@/data/imagery';
import { cn } from '@/lib/cn';
import { Credit, Photo } from './photo';

/** Figure numbers follow the section: 02.1, 02.2 … */
export const figureNumber = (p: AerialPhoto) => `02.${aerialPhotos.indexOf(p) + 1}`;

function Caption({ photo, wide = false }: { photo: AerialPhoto; wide?: boolean }) {
  return (
    <figcaption className={cn('grid gap-x-(--gutter) gap-y-3', wide && 'lg:grid-cols-12 lg:items-end')}>
      <div className={cn('grid content-start gap-2', wide && 'lg:col-span-7')}>
        <div className="flex items-baseline gap-3">
          <Num className="text-caption text-ink-3">{figureNumber(photo)}</Num>
          <h4 className="text-lead font-extrabold">{photo.title}</h4>
        </div>
        <p className="max-w-[60ch] text-body text-ink-2">{photo.why}</p>
      </div>
      <p
        className={cn('grid gap-1 text-micro text-ink-2', wide && 'lg:col-span-4 lg:col-start-9 lg:justify-items-end')}
      >
        <span>
          {photo.place ? `${photo.place} · ` : null}צולם מ{photo.view}
        </span>
        <Credit photo={photo} />
      </p>
    </figcaption>
  );
}

function Sources() {
  return (
    <div className="grid gap-3 border-t-(length:--bw) border-line pt-5">
      <p className="max-w-[72ch] text-caption text-ink-2">
        <span className="font-bold text-ink">מקורות ורישיונות. </span>
        דוגמאות זמניות מספריות פתוחות. שני הרישיונות מתירים שימוש מסחרי בלי חובת קרדיט, ונתנו קרדיט בכל זאת; בשלב הבא –
        צילומי לוויין ורחפן של המשקים עצמם.
      </p>
      <ul className="grid gap-x-(--gutter) sm:grid-cols-3">
        {aerialPhotos.map((p) => (
          <li key={p.id} className="grid content-start">
            <a href={p.sourceUrl} className="flex min-h-(--target) items-center gap-2 text-caption">
              <Num>{figureNumber(p)}</Num>
              <span>
                <bdi lang="en" dir="ltr">
                  {p.photographer}
                </bdi>{' '}
                ב־
                <bdi lang="en" dir="ltr">
                  {p.source}
                </bdi>
              </span>
            </a>
            <span className="text-micro text-ink-2">
              <bdi lang="en" dir="ltr">
                {p.licence}
              </bdi>{' '}
              · {p.edit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Block a – three aerial frames: the 21:9 opener (4:3 on phones) and two 4:3 cards. */
export function Gallery() {
  return (
    <div className="grid gap-12 lg:gap-16">
      <figure className="grid gap-5">
        <Photo photo={desertEdge} ratio="21/9" phoneRatio="4/3" slot="full" />
        <Caption photo={desertEdge} wide />
      </figure>
      <div className="grid gap-x-(--gutter) gap-y-12 md:grid-cols-2">
        {[orchard, covered].map((p) => (
          <figure key={p.id} className="grid content-start gap-5">
            <Photo photo={p} ratio="4/3" slot="duo" />
            <Caption photo={p} />
          </figure>
        ))}
      </div>
      <Sources />
    </div>
  );
}
