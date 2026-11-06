import { notFound } from 'next/navigation';
import { Ashushit } from '@/components/illustrations/Ashushit';
import { SeasonParcels } from '@/components/illustrations/SeasonParcels';
import { StageIcon } from '@/components/illustrations/StageIcons';
import { stages } from '@/design/tokens';
import { MotionSection } from '../../style-tile/_parts/MotionSection';
import { TypeSection } from '../../style-tile/_parts/TypeSection';

/**
 * Dev-only isolation bench: /lab/<part> renders one piece of the style tile
 * on its own so it can be screenshotted without the rest of the page.
 * Returns 404 in production builds.
 */
const parts: Record<string, () => React.ReactNode> = {
  parcels: () => (
    <div data-surface="soil" className="min-h-dvh py-16">
      <div className="wrap">
        <SeasonParcels animate showLabels className="w-full" />
      </div>
    </div>
  ),
  ashushit: () => (
    <div className="wrap grid gap-10 py-16 md:grid-cols-2">
      <div className="card p-6">
        <Ashushit variant="assembled" labels className="w-full" />
      </div>
      <div className="card p-6">
        <Ashushit variant="exploded" labels className="w-full" />
      </div>
    </div>
  ),
  icons: () => (
    <div className="wrap grid gap-10 py-16">
      {[24, 32, 48].map((size) => (
        <div key={size} className="flex flex-wrap gap-8">
          {stages.map((s) => (
            <figure key={s.id} className="grid justify-items-center gap-2">
              <StageIcon stage={s.id} size={size} />
              <figcaption className="text-caption">{s.he}</figcaption>
            </figure>
          ))}
        </div>
      ))}
      <div data-surface="soil" className="flex flex-wrap gap-8 rounded-lg p-8">
        {stages.map((s) => (
          <StageIcon key={s.id} stage={s.id} size={48} />
        ))}
      </div>
    </div>
  ),
  motion: () => <MotionSection />,
  type: () => <TypeSection />,
};

export default async function LabPage({ params }: { params: Promise<{ part: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound();
  const { part } = await params;
  const render = parts[part];
  if (!render) notFound();
  return <main id="main">{render()}</main>;
}
