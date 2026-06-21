import logoAsset from "@/assets/trynex-logo.png.asset.json";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="TRYNEX"
      className={`inline-block w-auto select-none ${className}`}
      draggable={false}
    />
  );
}
