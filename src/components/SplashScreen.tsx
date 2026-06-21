import { useEffect, useState } from "react";
import logoAsset from "@/assets/trynex-logo.png.asset.json";

const KEY = "trynex_splash_shown";

export function SplashScreen() {
  const [show, setShow] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(KEY)) return;
    sessionStorage.setItem(KEY, "1");
    setShow(true);
    const f = setTimeout(() => setFade(true), 1800);
    const h = setTimeout(() => setShow(false), 2400);
    return () => { clearTimeout(f); clearTimeout(h); };
  }, []);

  if (!show) return null;
  return (
    <div
      className={`fixed inset-0 z-[9999] grid place-items-center bg-background transition-opacity duration-500 ${fade ? "opacity-0" : "opacity-100"}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.18),transparent_60%)]" />
      <div className="relative flex flex-col items-center">
        <img
          src={logoAsset.url}
          alt="TRYNEX"
          className="splash-logo w-[78vw] max-w-[420px] drop-shadow-[0_0_40px_rgba(56,189,248,0.45)]"
          draggable={false}
        />
        <div className="splash-bar mt-6 h-[3px] w-40 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 splash-bar-inner" />
        </div>
      </div>
      <style>{`
        @keyframes splashIn {
          0% { opacity: 0; transform: scale(0.7); filter: blur(12px); }
          60% { opacity: 1; transform: scale(1.04); filter: blur(0); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes splashShine {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
        .splash-logo { animation: splashIn 1.1s cubic-bezier(.2,.8,.2,1) both; }
        .splash-bar-inner { animation: splashShine 1.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
