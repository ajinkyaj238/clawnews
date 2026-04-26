export function formatDateTime(value?: string, options?: Intl.DateTimeFormatOptions) {
  if (!value) {
    return "Time not supplied";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    ...options
  }).format(date);
}

export function formatDate(value?: string) {
  if (!value) {
    return "Date not supplied";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
  }).format(date);
}

export function formatCount(value: number, singular: string, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`;
}

export function formatPercent(value?: number) {
  if (value === undefined) {
    return "not scored";
  }

  return `${Math.round(value * 100)}%`;
}

export function confidenceLabel(value?: number) {
  if (value === undefined) {
    return "unknown confidence";
  }

  if (value >= 0.75) {
    return "high confidence";
  }

  if (value >= 0.5) {
    return "medium confidence";
  }

  return "low confidence";
}
