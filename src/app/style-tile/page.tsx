import type { Metadata } from 'next';
import { ComponentsSection } from './_parts/ComponentsSection';
import { Hero } from './_parts/Hero';
import { MotionSection } from './_parts/MotionSection';
import { PaletteSection } from './_parts/PaletteSection';
import { ShapeSection } from './_parts/ShapeSection';
import { SpaceSection } from './_parts/SpaceSection';
import { StanceSection } from './_parts/StanceSection';
import { TileFooter } from './_parts/TileFooter';
import { TileHeader } from './_parts/TileHeader';
import { TypeSection } from './_parts/TypeSection';

export const metadata: Metadata = {
  title: 'סטייל טייל',
  description: 'שלב 0 – כיוון אמנותי לפורטל החקלאי "העונה שלך": צבע, טיפוגרפיה, מרווח, צורה, תנועה ורכיבים.',
};

export default function StyleTilePage() {
  return (
    <>
      <TileHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <PaletteSection />
        <TypeSection />
        <SpaceSection />
        <ShapeSection />
        <MotionSection />
        <ComponentsSection />
        <StanceSection />
      </main>
      <TileFooter />
    </>
  );
}
