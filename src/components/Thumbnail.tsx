import { Film } from "lucide-react";

type Props = {
  src?: string | null;
  alt?: string;
  className?: string;
};

export function Thumbnail({ src, alt = "", className = "" }: Props) {
  if (src) {
    return <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />;
  }
  return (
    <div className={`grid place-items-center bg-surface-2 text-muted-foreground ${className}`}>
      <Film className="h-6 w-6" />
    </div>
  );
}
