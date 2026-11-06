import { Rules } from './type/Rules';
import { Scale } from './type/Scale';
import { Specimens } from './type/Specimens';
import { Code } from './type/bits';
import { Block, Section } from './Section';

/**
 * 03 · טיפוגרפיה – three families with one job each, a fluid nine-step scale
 * measured in the browser (the sun-mode floors live in its rows), and the
 * Hebrew typesetting rules shown as real, rendered right/wrong pairs.
 */
export function TypeSection() {
  return (
    <Section
      id="type"
      intro={
        <p>
          שלוש משפחות, ולכל אחת תפקיד: אחת מכריזה, אחת מסבירה ואחת סופרת. סולם נזיל של תשעה שלבים שנושם עם המסך ועולה
          לרצפות קריאוּת בשמש של צהריים&nbsp;– וכללי סדר שמכבדים את העברית עד הגרש האחרון.
        </p>
      }
    >
      <div className="grid gap-16">
        <Block title="שלוש משפחות" note="תפקיד אחד לכל משפחה · אין רביעית">
          <Specimens />
        </Block>

        <Block
          title="סולם נזיל"
          note={
            <>
              תשעה שלבים · <Code>clamp()</Code> אחד לכל שלב · נמדד בזמן אמת בדפדפן, גם במצב שמש
            </>
          }
        >
          <Scale />
        </Block>

        <Block title="כללי סדר עבריים" note="שמונה כללים · נכון מול שגוי, כפי שהדפדפן מציג אותם">
          <Rules />
        </Block>
      </div>
    </Section>
  );
}
