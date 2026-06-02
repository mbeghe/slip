type Props = {
  src?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
};

export function ProductImage({
  src,
  alt,
  className = "",
  imgClassName = "",
}: Props) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover ${imgClassName}`}
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-slip-surface-cool/50 to-slip-surface-warm/40"
          aria-hidden
        />
      )}
    </div>
  );
}
