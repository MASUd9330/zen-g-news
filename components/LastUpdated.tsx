import { Clock } from 'lucide-react';

export default function LastUpdated({ iso, lang = 'en' }: { iso?: string | null; lang?: 'en' | 'bn' }) {
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en);
  const date = iso ? new Date(iso) : new Date();
  const formatted = date.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
  return (
    <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
      <Clock className="w-3 h-3" />
      <span>{t('Last updated', 'সর্বশেষ আপডেট')}: {formatted}</span>
    </div>
  );
}
