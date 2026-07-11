export function BAPSLogo({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <img
      src="/Baps_logo.svg.webp"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
      alt="BAPS Swaminarayan logo"
      decoding="async"
      fetchPriority="high"
    />
  );
}
