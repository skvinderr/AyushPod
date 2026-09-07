import { AvatarWrapper } from '../avatar/AvatarWrapper';
import { TopBar } from '../components/TopBar';
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
      <body className="ambient antialiased min-h-screen bg-bg text-ink select-none overflow-hidden touch-none">
        {/* Global avatar guide — anchored top-left on every screen */}
        <AvatarWrapper />

        {/* Global top bar (clock, logo, language) */}
        <TopBar />

        {/* Main content area — sits above the ambient glow layer */}
        <main className="relative z-10 w-full h-[calc(100vh-100px)] px-8 pb-8 max-w-7xl mx-auto flex flex-col items-center">
          {children}
        </main>
      </body>
    </html>
  );
}
