interface Props {
  categories: string[];
  active: string;
  onSelect: (c: string) => void;
}

export default function CategoryBar({ categories, active, onSelect }: Props) {
  return (
    <nav className="category-bar">
      {categories.map((c) => (
        <button
          key={c}
          className={`category-pill${active === c ? " active" : ""}`}
          onClick={() => onSelect(c)}
        >
          {c}
        </button>
      ))}
    </nav>
  );
}
