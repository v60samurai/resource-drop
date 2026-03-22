"use client";

import { relativeTime, getTrendingTag, type Tag } from "@/lib/utils";
import { type Resource } from "@/lib/supabase";

interface StatsBarProps {
  resources: Resource[];
}

export function StatsBar({ resources }: StatsBarProps) {
  const total = resources.length;
  const trendingTag = getTrendingTag(resources);
  const lastDrop = resources.length > 0 ? resources[0].created_at : null;

  if (total === 0) return null;

  return (
    <p
      className="text-[13px]"
      style={{
        color: "var(--text-muted)",
        fontFamily: "var(--font-source-sans)",
      }}
    >
      <span>{total} resource{total !== 1 ? "s" : ""}</span>
      {trendingTag && (
        <>
          <span className="mx-2">-</span>
          <span>
            <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
              {trendingTag}
            </span>{" "}
            is trending
          </span>
        </>
      )}
      {lastDrop && (
        <>
          <span className="mx-2">-</span>
          <span>Last drop {relativeTime(lastDrop)}</span>
        </>
      )}
    </p>
  );
}
