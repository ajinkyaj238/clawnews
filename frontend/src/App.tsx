import { useState, useMemo } from "react";
import Header from "./components/Header";
import CategoryBar from "./components/CategoryBar";
import ArticleCard from "./components/ArticleCard";
import { MOCK_ARTICLES, CATEGORIES } from "./mockData";
import "./App.css";

export default function App() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const articles = useMemo(() => {
    return MOCK_ARTICLES.filter((a) => {
      const matchCat = category === "All" || a.category === category;
      const q = query.toLowerCase();
      const matchQ =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [category, query]);

  return (
    <div className="app">
      <Header query={query} onQueryChange={setQuery} />
      <main className="main">
        <CategoryBar categories={CATEGORIES} active={category} onSelect={setCategory} />
        {articles.length === 0 ? (
          <div className="empty-state">No articles match your search.</div>
        ) : (
          <div className="article-grid">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
