import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  weight: ['400', '700'],
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  weight: ['400', '700'],
  subsets: ['latin'],
});

export const metadata = {
  title: 'Language Learner Karaoke',
  description: 'Learn a language by singing along with synchronized lyrics and MP3 playback',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}