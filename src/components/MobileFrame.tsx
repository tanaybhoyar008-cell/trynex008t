import type { ReactNode } from "react";

/**
 * Mobile-first container. Full-bleed on phones; framed phone preview on desktop.
 */
export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto min-h-screen w-full max-w-[480px] bg-background">
        {children}
      </div>
    </div>
  );
}
