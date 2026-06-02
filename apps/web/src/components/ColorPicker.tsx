type Props = {
  colors: string[];
  selected: string;
  onChange: (color: string) => void;
};

export function ColorPicker({ colors, selected, onChange }: Props) {
  if (colors.length === 0) return null;

  return (
    <section className="mt-6 rounded-xl border border-slip-accent-blue/25 bg-white/75 backdrop-blur-sm p-4 sm:p-5 shadow-sm">
      <h3 className="text-base font-bold text-slip-ink mb-3">Elegí tu color</h3>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              selected === color
                ? "bg-slip-primary text-white"
                : "bg-white text-slip-ink hover:bg-slip-surface-warm border border-slip-accent-blue/20"
            }`}
          >
            {color}
          </button>
        ))}
      </div>
    </section>
  );
}
