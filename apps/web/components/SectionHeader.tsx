interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  summary?: string;
}

export function SectionHeader({ eyebrow, summary, title }: SectionHeaderProps) {
  return (
    <div>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pine">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-xl font-semibold tracking-normal text-ink">{title}</h2>
      {summary ? <p className="mt-2 text-sm leading-6 text-ink/68">{summary}</p> : null}
    </div>
  );
}
