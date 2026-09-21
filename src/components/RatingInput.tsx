export function RatingInput({
  name,
  min,
  max,
  defaultValue,
  labels,
}: {
  name: string;
  min: number;
  max: number;
  defaultValue?: number;
  labels?: { low: string; high: string };
}) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div>
      <div className="flex gap-1.5" role="radiogroup" aria-label={name}>
        {options.map((value) => (
          <label key={value} className="group cursor-pointer">
            <input
              type="radio"
              name={name}
              value={value}
              defaultChecked={defaultValue === value}
              required
              className="peer sr-only"
            />
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border font-tabular text-sm font-semibold text-purple-deep transition peer-checked:border-purple peer-checked:bg-purple peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-purple group-hover:border-purple">
              {value}
            </span>
          </label>
        ))}
      </div>
      {labels ? (
        <div className="mt-1 flex justify-between text-xs text-gray-text">
          <span>{labels.low}</span>
          <span>{labels.high}</span>
        </div>
      ) : null}
    </div>
  );
}
