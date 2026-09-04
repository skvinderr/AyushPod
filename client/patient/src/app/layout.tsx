import { AvatarWrapper } from '../avatar/AvatarWrapper';
import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 select-none overflow-hidden touch-none">
        {/* Global Avatar overlay */}
        <AvatarWrapper />
        
        {/* Main Content Area */}
        <main className="w-full h-screen p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
