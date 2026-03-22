"use client";

interface SkeletonCardProps {
  index: number;
}

export function SkeletonCard({ index }: SkeletonCardProps) {
  return (
    <article
      className="animate-fade-in-up"
      style={{
        animationDelay: `${index * 60}ms`,
        animationFillMode: "backwards",
      }}
    >
      {/* Editorial divider line */}
      {index > 0 && (
        <div
          className="mb-6 h-px"
          style={{ backgroundColor: "var(--border)" }}
        />
      )}

      <div className="flex gap-6">
        {/* Left: Issue number placeholder */}
        <div className="hidden sm:flex flex-col items-center pt-1 gap-1">
          <div
            className="w-6 h-3 rounded skeleton-pulse"
            style={{ backgroundColor: "var(--border)" }}
          />
          <div
            className="w-8 h-6 rounded skeleton-pulse"
            style={{ backgroundColor: "var(--border)" }}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Tag skeleton */}
          <div
            className="w-16 h-5 rounded skeleton-pulse"
            style={{ backgroundColor: "var(--border)" }}
          />

          {/* Title skeleton */}
          <div className="mt-3 space-y-2">
            <div
              className="h-7 rounded skeleton-pulse"
              style={{ backgroundColor: "var(--border)", width: "85%" }}
            />
            <div
              className="h-7 rounded skeleton-pulse"
              style={{ backgroundColor: "var(--border)", width: "60%" }}
            />
          </div>

          {/* Meta line skeleton */}
          <div className="mt-4 flex items-center gap-3">
            <div
              className="w-20 h-4 rounded skeleton-pulse"
              style={{ backgroundColor: "var(--border)" }}
            />
            <div
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: "var(--border)" }}
            />
            <div
              className="w-12 h-4 rounded skeleton-pulse"
              style={{ backgroundColor: "var(--border)" }}
            />
          </div>
        </div>

        {/* Right: Arrow placeholder */}
        <div className="hidden sm:flex items-center">
          <div
            className="w-6 h-6 rounded skeleton-pulse"
            style={{ backgroundColor: "var(--border)" }}
          />
        </div>
      </div>
    </article>
  );
}
