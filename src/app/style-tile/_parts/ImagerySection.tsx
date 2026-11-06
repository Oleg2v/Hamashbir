import { Crops } from './imagery/Crops';
import { DoDont } from './imagery/DoDont';
import { ImageFilters } from './imagery/filters';
import { Gallery } from './imagery/Gallery';
import { PhotoAndLine } from './imagery/PhotoAndLine';
import { Readings } from './imagery/Readings';
import { Survey } from './imagery/Survey';
import { Block, Section } from './Section';

/**
 * 02 · תמונה – the imagery direction: aerial photography (credited
 * placeholders), the three treatments drawn from tokens, crops and the
 * selection rules, and the meeting point with the line illustrations.
 * Server-rendered throughout; the only client code is the Ashushit's jet.
 */
export function ImagerySection() {
  return (
    <Section
      id="imagery"
      className="relative"
      intro={
        <p>
          צילומי אוויר ולוויין במקום סטוק: השדה מלמעלה, באור יום, כמו שהוא נראה במפה של המשק. כל צילום עובר אחד משלושה
          טיפולים, ונפגש עם איור הקו של המוצר.
        </p>
      }
    >
      <ImageFilters />
      <div className="grid gap-20 lg:gap-28">
        <Block title="צילום אוויר" note="שלוש דוגמאות, נבחרו לפי דפוס השדה: שורות, יריעות וגבול המים.">
          <Gallery />
        </Block>

        <Block
          title="טיפול"
          note="צילום להקשר, דרגת אדמה לרקע, NDVI לנתונים, ומעל כולם שכבת מדידה. הצבעים, הרמפה והקו באים מהטוקנים."
        >
          <div className="grid gap-16 lg:gap-24">
            <Readings />
            <Survey />
            <Crops />
            <DoDont />
          </div>
        </Block>

        <Block title="איור" note="השדה מצולם, המוצר משורטט, ואייקון השלב מחבר ביניהם.">
          <PhotoAndLine />
        </Block>
      </div>
    </Section>
  );
}
