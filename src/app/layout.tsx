import type { Metadata, Viewport } from 'next';
import { Assistant, IBM_Plex_Mono, Suez_One } from 'next/font/google';
import { DemoBadge, SkipLink } from '@/components/ui/chrome';
import { ToastProvider } from '@/components/ui/Toast';
import { headScript, THEME_COLOR } from '@/lib/sun-mode';
import './globals.css';

const suez = Suez_One({
  weight: '400',
  subsets: ['hebrew', 'latin'],
  variable: '--font-suez',
  display: 'swap',
});

const assistant = Assistant({
  subsets: ['hebrew', 'latin'],
  variable: '--font-assistant',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'העונה שלך · המשביר לחקלאי – קונספט',
    template: '%s · העונה שלך – קונספט Kikkey',
  },
  description:
    'קונספט של Kikkey לפורטל החקלאי של המשביר לחקלאי: תוכנית עונה, מלאי בסניף הקרוב, הזמנה ואיסוף. לא האתר הרשמי. נתוני דמו ומחירי דמו בלבד.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  referrer: 'no-referrer',
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR.default,
  colorScheme: 'light',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${suez.variable} ${assistant.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
      </head>
      <body>
        <SkipLink />
        <ToastProvider>{children}</ToastProvider>
        <DemoBadge />
      </body>
    </html>
  );
}
