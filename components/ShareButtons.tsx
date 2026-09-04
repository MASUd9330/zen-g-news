'use client';
import { useState } from 'react';
import { Facebook, Send, MessageCircle, Twitter, Link as LinkIcon, Check } from 'lucide-react';

export default function ShareButtons({
  url,
  title,
  description,
}: {
  url: string;
  title: string;
  description?: string;
}) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const fullUrl = url.startsWith('http') ? url : `https://zen-g-news.netlify.app${url}`;
  const text = description || title;

  const fb = `https://www.facebook.com/sharer/sharer.php?u=${enc(fullUrl)}`;
  const tg = `https://t.me/share/url?url=${enc(fullUrl)}&text=${enc(`📰 ${title}\n\n${text}\n\nRead more: ${fullUrl}\n\n#ZenGNews`)}`;
  const wa = `https://wa.me/?text=${enc(`${title}\n\n${fullUrl}`)}`;
  const tw = `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(fullUrl)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy link:', fullUrl);
    }
  };

  const Btn = ({ href, label, icon, className }: { href?: string; label: string; icon: React.ReactNode; className?: string }) => {
    const inner = (
      <span className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium border border-[var(--border-color)] rounded hover:bg-[var(--bg-secondary)] transition-colors">
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </span>
    );
    return href ? (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${label}`}>
        {inner}
      </a>
    ) : (
      <button onClick={copy} aria-label="Copy link">{inner}</button>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mr-1">Share:</span>
      <Btn href={fb} label="Facebook" icon={<Facebook className="w-4 h-4" />} />
      <Btn href={tg} label="Telegram" icon={<Send className="w-4 h-4" />} />
      <Btn href={wa} label="WhatsApp" icon={<MessageCircle className="w-4 h-4" />} />
      <Btn href={tw} label="X" icon={<Twitter className="w-4 h-4" />} />
      <button
        onClick={copy}
        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium border border-[var(--border-color)] rounded hover:bg-[var(--bg-secondary)] transition-colors"
        aria-label="Copy link"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <LinkIcon className="w-4 h-4" />}
        <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
      </button>
    </div>
  );
}
