export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline font-display font-black tracking-tight leading-none select-none ${className}`}
      aria-label="Texon"
    >
      <span className="text-gradient text-[1.6em]">TRY</span>
      <span className="text-foreground text-[1.6em]">NEX</span>
      <span className="ml-1 inline-block h-[0.45em] w-[0.45em] rounded-full bg-brand shadow-[0_0_12px_var(--color-brand)]" />
    </span>
  );
}
