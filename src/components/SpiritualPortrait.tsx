export function SpiritualPortrait({
  label,
  subtitle,
  src,
  className,
}: {
  label: string;
  subtitle?: string;
  src: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center text-center ${className ?? ""}`}>
      <img
        src={src}
        alt={label}
        width={96}
        height={96}
        loading="lazy"
        decoding="async"
        className="h-24 w-24 rounded-full border-2 border-gold/50 object-cover object-top shadow-inner"
      />
      <p className="mt-2 font-gujarati text-sm font-semibold text-maroon">{label}</p>
      {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}
