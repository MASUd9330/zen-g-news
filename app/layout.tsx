import type { Metadata } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });

export const metadata: Metadata = {
  title: 'Zen-G News — Your World. Your News. Instantly.',
  description: 'Unbiased, fast, and verified breaking news.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('zg_theme')?.value || 'system';

  const supabase = await createClient();
  const { data: setting } = await supabase.from('site_settings').select('value').eq('key', 'branding').single();
  const accentColor = setting?.value?.accent_color || '#2563EB';

  return (
    <html lang="en" className={theme === 'dark' ? 'dark' : ''}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `:root { --accent: ${accentColor}; }` }} />
      </head>
      <body className={`${inter.variable} ${serif.variable} antialiased min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
