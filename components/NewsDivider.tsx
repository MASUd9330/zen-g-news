export default function NewsDivider({ label }: { label?: string }) {
  if (label) {
    return (
      <div className="flex items-center gap-3 my-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent" />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">{label}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent" />
      </div>
    );
  }

  // 3-dot Ittefaq-style divider
  return (
    <div className="flex items-center justify-center gap-2 my-8 text-[var(--text-muted)]">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-60" />
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-30" />
    </div>
  );
}
