import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@uhs/ui/styles.css';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Unified Healthcare Platform',
  description: 'Staff, patient and platform workspaces.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-full font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
