import { Rules } from './type/Rules';
import { Scale } from './type/Scale';
import { Specimens } from './type/Specimens';
import { SunFloors } from './type/SunFloors';
import { Block, Section } from './Section';

/**
 * 02 · טיפוגרפיה – three families with one job each, a fluid nine-step scale
 * measured live in the browser, sun-mode floors, and the Hebrew typesetting
 * rules shown as real, rendered right/wrong pairs.
 */
export function TypeSection() {
  return (
    <Section
      id="type"
      intro={
        <p>
          שלוש משפחות, ולכל אחת תפקיד: אחת מכריזה, אחת מסבירה ואחת סופרת. סולם נזיל של תשעה שלבים שנושם עם המסך,
          רצפות קריאוּת לשמש של צהריים&nbsp;– וכללי סדר שמכבדים את העברית עד הגרש האחרון.
        </p>
      }
    >
      <div className="grid gap-24 lg:gap-32">
        <Block title="שלוש משפחות" note="תפקיד אחד לכל משפחה · אין רביעית">
          <Specimens />
        </Block>

        <Block
          title="סולם נזיל"
          note={
            <>
              תשעה שלבים · <code dir="ltr" lang="en" className="font-mono">clamp()</code> אחד לכל שלב · נמדד חי
              בדפדפן
            </>
          }
        >
          <Scale />
        </Block>

        <Block
          title="רצפות מצב שמש"
          note={
            <>
              <code dir="ltr" lang="en" className="font-mono">
                html[data-theme=&quot;sun&quot;]
              </code>{' '}
              · ארבעת השלבים הקטנים
            </>
          }
        >
          <SunFloors />
        </Block>

        <Block title="כללי סדר עבריים" note="שמונה כללים · נכון מול שגוי, מוצגים חי">
          <Rules />
        </Block>
      </div>
    </Section>
  );
}
