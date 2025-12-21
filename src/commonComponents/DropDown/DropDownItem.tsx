type DropdownItemProps = {
  children: React.ReactNode;
  onClick?: () => void;
};

export default function DropdownItem({ children, onClick }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-2 text-sm text-slate-700
                 hover:bg-slate-100 transition"
    >
      {children}
    </button>
  );
}
