import { Article } from "../types";
import { ExternalLink, Clock } from "lucide-react";

interface Props {
  article: Article;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function ArticleCard({ article }: Props) {
  return (
    <article className="article-card">
      {article.imageUrl && (
        <div className="article-image">
          <img src={article.imageUrl} alt={article.title} loading="lazy" />
          <span className="article-category">{article.category}</span>
        </div>
      )}
      <div className="article-body">
        <div className="article-meta">
          <span className="article-source">{article.source}</span>
          <span className="article-time">
            <Clock size={12} />
            {timeAgo(article.publishedAt)}
          </span>
        </div>
        <h2 className="article-title">{article.title}</h2>
        <p className="article-summary">{article.summary}</p>
        <a href={article.url} className="article-link" target="_blank" rel="noopener noreferrer">
          Read full article <ExternalLink size={13} />
        </a>
      </div>
    </article>
  );
}
