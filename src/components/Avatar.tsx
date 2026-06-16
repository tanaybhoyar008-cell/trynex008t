type Props = {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
};

export function Avatar({ src, name, size = 40, className = "" }: Props) {
  const initial = (name ?? "U").trim().charAt(0).toUpperCase() || "U";
  const style = { width: size, height: size, fontSize: size * 0.4 };
  if (src) {
    return (
      <img
        src={src}
        alt={name ?? "avatar"}
        style={style}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      style={{ ...style, background: "linear-gradient(135deg, var(--color-brand), var(--color-brand-2))" }}
      className={`grid place-items-center rounded-full font-display font-bold text-white ${className}`}
    >
      {initial}
    </div>
  );
}
