type Props = {
  onClick: () => void;
  className?: string;
};

export function SizeGuideTrigger({ onClick, className = "" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-sm font-semibold text-slip-ink hover:text-slip-primary transition-colors ${className}`}
    >
      Guía de talles
    </button>
  );
}
