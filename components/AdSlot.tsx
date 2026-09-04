'use client';
import { useEffect, useRef, useState } from 'react';

export default function AdSlot({ placement }: { placement?: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    setConsent(!document.cookie.includes('zg_ad_consent=false'));
  }, []);

  useEffect(() => {
    if (!consent || !placement?.is_active || !placement?.js_code || !ref.current) return;
    const script = document.createElement('script');
    script.text = placement.js_code;
    script.async = true;
    ref.current.appendChild(script);
    return () => { script.remove(); };
  }, [consent, placement]);

  if (!placement || !placement.is_active) return null;

  return (
    <aside className="w-full flex justify-center items-center my-6 overflow-hidden">
      <div ref={ref} className="w-full flex flex-col items-center justify-center p-2 rounded border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 min-h-[100px] relative">
        <span className="absolute top-1 right-2 text-[9px] text-neutral-400">Advertisement</span>
        {placement.css_code && <style dangerouslySetInnerHTML={{ __html: placement.css_code }} />}
        {consent && placement.html_code ? (
          <div dangerouslySetInnerHTML={{ __html: placement.html_code }} />
        ) : (
          <span className="text-neutral-400 text-xs select-none">Sponsored Space</span>
        )}
      </div>
    </aside>
  );
}
