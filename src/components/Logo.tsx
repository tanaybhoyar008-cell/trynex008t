export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-black tracking-tight ${className}`}>
      TRY<span className="text-gradient">NEX</span>
    </span>
  );
}
