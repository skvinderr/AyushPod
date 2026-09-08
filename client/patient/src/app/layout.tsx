import { KioskShell } from '../avatar/KioskShell';
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
  title: 'MediKiosk Patient App',
  description: 'Patient Kiosk application for MediKiosk',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${notoDevanagari.variable}`}
    >
      <body className="antialiased min-h-screen bg-bg text-ink select-none overflow-hidden touch-none">
        {/* Persistent split frame: Aaya's guide rail + the working area */}
        <KioskShell>{children}</KioskShell>
      </body>
    </html>
  );
}
