'use client';

import { Button } from '@/components/ui/Button';
import { Num } from '@/components/ui/Num';
import { useToast } from '@/components/ui/Toast';
import { demoFarm, dripAvailability } from '@/data/demo-farm';
import { NB } from '@/lib/typography';

/** Live triggers: the real toasts through the provider in the root layout. Every action does something. */
export function ToastDemo() {
  const { toast } = useToast();
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="primary"
        onClick={() =>
          toast({
            tone: 'success',
            title: 'שלב 1 הוזמן',
            body: `איסוף מסניף ${demoFarm.branch.name} · יום ג׳, 10:00`,
            action: {
              label: 'ביטול ההזמנה',
              onClick: () => toast({ tone: 'info', title: 'ההזמנה בוטלה', body: 'שלב 1 חזר לתוכנית כטיוטה.' }),
            },
          })
        }
      >
        הזמינו את שלב{NB}
        <Num>1</Num>
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            tone: 'agro',
            title: 'מוצרי הגנת הצומח דורשים אישור אגרונום לפני הזמנה',
            body: 'השורה נשמרה בתוכנית וממתינה לאישור.',
            action: {
              label: 'שלחו לאגרונום לאישור',
              onClick: () => toast({ tone: 'success', title: 'נשלח לאגרונום', body: 'נעדכן אותך כשהשורה תאושר.' }),
            },
          })
        }
      >
        הוסיפו שורת הגנה
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            tone: 'info',
            title: 'המלאי עודכן',
            body: `שלוחת טפטוף 16 מ״מ במלאי ב־${dripAvailability.branchesWithStock}${NB}סניפים`,
          })
        }
      >
        בדקו מלאי
      </Button>
      <Button
        variant="ghost"
        onClick={() =>
          toast({
            tone: 'error',
            title: 'לא הצלחנו לשלוח את ההזמנה',
            body: 'אין חיבור לרשת. התוכנית שמורה במכשיר.',
            action: {
              label: 'נסו שוב',
              onClick: () => toast({ tone: 'success', title: 'ההזמנה נשלחה', body: 'אישור יגיע בהודעה.' }),
            },
          })
        }
      >
        הדגימו שגיאה
      </Button>
    </div>
  );
}
