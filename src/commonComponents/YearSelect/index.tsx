import { twMerge } from "tailwind-merge";

export default function YearSelect({
  label,
  labelCls,
  name,
  value,
  onChange,
  required,
  errorMsg,
  startYear = 1950,
  endYear = new Date().getFullYear(),
  isAgeSelect = false,
  className,
}: any) {
  const years = isAgeSelect
    ? Array.from({ length: 30 }, (_, i) => i + 1)
    : Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i);

  return (
    <div className="space-y-3 ">
      <label className={twMerge("text-sm  font-Gordita-Medium mb-4", labelCls)}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value ?? ""}
        onChange={(e) => onChange(+e.target.value)}
        className={twMerge(
          "w-full border px-3 text-[12px] md:py-2 py-1 rounded-md    overflow-auto",
          errorMsg
            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-[#3586FF] focus:border-[#3586FF]"
        )}
        required={required}
        title="Select a year from the list"
      >
        <option value="" className="text-[12px]!">
          Select Year
        </option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
      {errorMsg && <p className="text-[12px] text-red-500">{errorMsg}</p>}
    </div>
  );
}
