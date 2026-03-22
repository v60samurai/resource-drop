"use client";

import { TAGS, type Tag } from "@/lib/utils";

interface TagFilterProps {
  activeTag: string;
  onTagChange: (tag: string) => void;
  counts: Record<Tag | "All", number>;
}

export function TagFilter({ activeTag, onTagChange, counts }: TagFilterProps) {
  const allTags = ["All", ...TAGS] as const;

  return (
    <nav
      className="relative flex items-center gap-1 overflow-x-auto pb-2 -mb-2 scrollbar-hide"
      style={{ fontFamily: "var(--font-source-sans)" }}
    >
      {allTags.map((tag, index) => {
        const isActive = tag === activeTag;
        const count = counts[tag] ?? 0;
        return (
          <div key={tag} className="flex items-center">
            {index > 0 && (
              <span
                className="mx-2 text-[14px]"
                style={{ color: "var(--text-muted)" }}
              >
                /
              </span>
            )}
            <button
              onClick={() => onTagChange(tag)}
              className="relative px-1 py-1 text-[13px] font-medium transition-colors duration-300 whitespace-nowrap"
              style={{
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "var(--text)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              {tag}
              <span
                className="ml-1 text-[11px]"
                style={{ color: "var(--text-muted)" }}
              >
                ({count})
              </span>
              {/* Active underline */}
              <span
                className="absolute bottom-0 left-0 h-[2px] transition-all duration-300"
                style={{
                  width: isActive ? "100%" : "0%",
                  backgroundColor: "var(--accent)",
                }}
              />
            </button>
          </div>
        );
      })}
    </nav>
  );
}
