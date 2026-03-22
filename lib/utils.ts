export const TAGS = ["Design", "Product", "Tech", "Career", "General"] as const;
export type Tag = (typeof TAGS)[number];

export const TAG_COLORS: Record<Tag, { bg: string; text: string }> = {
  Design: { bg: "var(--tag-design-bg)", text: "var(--tag-design-text)" },
  Product: { bg: "var(--tag-product-bg)", text: "var(--tag-product-text)" },
  Tech: { bg: "var(--tag-tech-bg)", text: "var(--tag-tech-text)" },
  Career: { bg: "var(--tag-career-bg)", text: "var(--tag-career-text)" },
  General: { bg: "var(--tag-general-bg)", text: "var(--tag-general-text)" },
};

export function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function relativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const currentYear = now.getFullYear();

  if (year === currentYear) {
    return `${month} ${day}`;
  }
  return `${month} ${day}, ${year}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove protocol, trailing slash, www prefix
    return (
      parsed.host.replace(/^www\./, "") +
      parsed.pathname.replace(/\/$/, "") +
      parsed.search
    );
  } catch {
    return url.toLowerCase();
  }
}

export function getTagCounts(
  resources: { tag: Tag }[]
): Record<Tag | "All", number> {
  const counts: Record<Tag | "All", number> = {
    All: resources.length,
    Design: 0,
    Product: 0,
    Tech: 0,
    Career: 0,
    General: 0,
  };

  for (const resource of resources) {
    if (resource.tag in counts) {
      counts[resource.tag]++;
    }
  }

  return counts;
}

export function getTrendingTag(resources: { tag: Tag }[]): Tag | null {
  if (resources.length === 0) return null;

  const counts: Record<Tag, number> = {
    Design: 0,
    Product: 0,
    Tech: 0,
    Career: 0,
    General: 0,
  };

  for (const resource of resources) {
    counts[resource.tag]++;
  }

  let maxCount = 0;
  let trendingTag: Tag | null = null;

  // Sort alphabetically first to handle ties consistently
  const sortedTags = [...TAGS].sort();
  for (const tag of sortedTags) {
    if (counts[tag] > maxCount) {
      maxCount = counts[tag];
      trendingTag = tag;
    }
  }

  // Only show trending if tag has 3+ resources
  if (maxCount < 3) return null;

  return trendingTag;
}

// Upvote persistence helpers
const UPVOTE_STORAGE_KEY = "resourcedrop_upvoted";

export function getUpvotedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(UPVOTE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function markAsUpvoted(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const ids = getUpvotedIds();
    if (!ids.includes(id)) {
      localStorage.setItem(UPVOTE_STORAGE_KEY, JSON.stringify([...ids, id]));
    }
  } catch {
    // localStorage not available
  }
}

export function isUpvoted(id: string): boolean {
  return getUpvotedIds().includes(id);
}

export function resetUpvotes(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(UPVOTE_STORAGE_KEY);
  } catch {
    // localStorage not available
  }
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}
