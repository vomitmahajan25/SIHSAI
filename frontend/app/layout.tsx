import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GramVikas AI — Hyper-Local Business Advisory & Financial Structuring',
  description: 'AI-Driven Hyper-Local Business Advisory and Financial Structuring Assistant for Rural Micro-Entrepreneurs (SIH 2026 PS 10091)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-ink-primary antialiased">
        {children}
      </body>
    </html>
  );
}
