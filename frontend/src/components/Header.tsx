import { Search, Newspaper } from "lucide-react";

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
}

export default function Header({ query, onQueryChange }: Props) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <Newspaper size={28} />
          <span className="header-title">ClawNews</span>
        </div>
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search articles…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
      </div>
    </header>
  );
}
