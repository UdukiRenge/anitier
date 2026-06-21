type Option = {
  value: string;
  label: string;
};

type LabeledSelectProps = {
  label?: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
};

export const LabeledSelect: React.FC<LabeledSelectProps> = ({
  label = "",
  value,
  options,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-3">
      {label && (
        <label className="w-13 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-1/5
          min-w-40
          border border-gray-300
          rounded-md
          px-3 py-2
          bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-400
        "
      >
        <option value="">選択してください</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LabeledSelect;