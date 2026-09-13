import { AvatarWrapper } from '../avatar/AvatarWrapper';
import { TranslationProvider } from '../lib/i18n/TranslationContext';
import type { Metadata } from 'next';
import { Poppins, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

// Poppins carries no Devanagari glyphs, so Hindi would fall back to an ugly
// system face. Noto Sans Devanagari renders हिंदी legibly; the body font stack
// lists Poppins first (Latin) and falls through to Noto for Indic scripts.
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-devanagari',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AyushPod Patient App',
  description: 'Patient Kiosk application for AyushPod',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 select-none overflow-hidden touch-none">
        <TranslationProvider>
          {/* Global Avatar overlay */}
          <AvatarWrapper />
          
          {/* Main Content Area */}
          <main className="w-full h-screen p-8 max-w-7xl mx-auto">
            {children}
          </main>
        </TranslationProvider>
      </body>
    </html>
  );
}
