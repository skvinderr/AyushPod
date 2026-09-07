import { KioskShell } from '../avatar/KioskShell';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
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
    <html lang="en" className={poppins.variable}>
      <body className="antialiased min-h-screen bg-bg text-ink select-none overflow-hidden touch-none">
        {/* Persistent split frame: Aaya's guide rail + the working area */}
        <KioskShell>{children}</KioskShell>
      </body>
    </html>
  );
}
