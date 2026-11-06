'use client';

import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

/** Live triggers: fire the real toasts through the provider in the root layout. */
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
            body: 'איסוף מסניף עין תמר · יום ג׳, 10:00',
            action: { label: 'ביטול ההזמנה' },
          })
        }
      >
        הזמינו את שלב 1
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            tone: 'agro',
            title: 'מוצרי הגנת הצומח דורשים אישור אגרונום לפני הזמנה',
            body: 'השורה נשמרה בתוכנית ותישלח לאגרונום שלכם.',
            action: { label: 'שלחו לאגרונום לאישור' },
          })
        }
      >
        הוספת שורת הגנה
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({ tone: 'info', title: 'המלאי עודכן', body: 'טפטוף 16 מ״מ זמין ב־14 סניפים', duration: 5000 })
        }
      >
        בדיקת מלאי
      </Button>
      <Button
        variant="ghost"
        onClick={() =>
          toast({
            tone: 'error',
            title: 'לא הצלחנו לשלוח את ההזמנה',
            body: 'אין חיבור לרשת. התוכנית שמורה במכשיר.',
            action: { label: 'נסו שוב' },
          })
        }
      >
        הדמיית שגיאה
      </Button>
    </div>
  );
}
