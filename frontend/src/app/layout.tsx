import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Q-SHIELD — Quantum-Classical Cyber Anomaly Detection Platform',
  description:
    'Pixel-perfect 3D orbital cyber globe, pastel authentication, and executive security operations center dashboard for quantum-assisted anomaly detection.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased overflow-hidden select-none bg-[#EAE4D0]">
        {children}
      </body>
    </html>
  );
}
