type Props = {
  className?: string;
  /** Smaller blobs for cards and thumbnails — no page animation */
  compact?: boolean;
};

const bubbleBase =
  "absolute rounded-full will-change-transform";

export function SlipBackground({ className = "", compact = false }: Props) {
  return (
    <div
      className={`pointer-events-none overflow-hidden ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slip-surface-cool via-white to-slip-surface-warm" />
      {compact ? (
        <>
          <div
            className={`${bubbleBase} -top-4 -right-4 h-12 w-12 bg-slip-primary/10`}
          />
          <div
            className={`${bubbleBase} bottom-0 left-0 h-10 w-10 bg-slip-accent-teal/15`}
          />
        </>
      ) : (
        <>
          <div
            className={`${bubbleBase} slip-bubble--1 -top-24 -right-16 h-72 w-72 bg-slip-primary/10`}
          />
          <div
            className={`${bubbleBase} slip-bubble--2 top-[28%] -left-28 h-64 w-64 bg-slip-accent-teal/12`}
          />
          <div
            className={`${bubbleBase} slip-bubble--3 bottom-[18%] right-[12%] h-56 w-56 bg-slip-accent-blue/18`}
          />
          <div
            className={`${bubbleBase} slip-bubble--4 -bottom-32 left-[38%] h-80 w-80 bg-slip-primary/6`}
          />
          <div
            className={`${bubbleBase} slip-bubble--5 top-[8%] right-[30%] h-40 w-40 bg-slip-surface-warm/80`}
          />
        </>
      )}
    </div>
  );
}
