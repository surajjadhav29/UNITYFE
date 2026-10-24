export function CheckboxRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="ld-filter-check" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}
