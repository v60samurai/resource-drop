"use client";

import { useState } from "react";
import {
  TAG_COLORS,
  relativeTime,
  formatDate,
  getDomain,
  type Tag,
} from "@/lib/utils";

interface ResourceCardProps {
  id: string;
  title: string;
  url: string;
  tag: Tag;
  submitted_by: string;
  created_at: string;
  index: number;
  isNew?: boolean;
}

export function ResourceCard({
  id,
  title,
  url,
  tag,
  submitted_by,
  created_at,
  index,
  isNew = false,
}: ResourceCardProps) {
  const colors = TAG_COLORS[tag];
  const truncatedName =
    submitted_by.length > 20 ? `${submitted_by.slice(0, 20)}...` : submitted_by;
  const domain = getDomain(url);

  const [faviconError, setFaviconError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      console.error("Failed to copy");
    }
  };

  const faviconUrl = domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    : null;

  return (
    <article
      className={`group card-hover ${isNew ? "card-highlight" : ""}`}
      style={{
        animationDelay: `${index * 40}ms`,
        animationFillMode: "backwards",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Editorial divider line */}
      {index > 0 && (
        <div
          className="mb-6 h-px"
          style={{ backgroundColor: "var(--border)" }}
        />
      )}

      <div className="flex gap-4">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Tag - small, uppercase */}
          <span
            className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded"
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
            }}
          >
            {tag}
          </span>

          {/* Title with favicon */}
          <h2 className="mt-3 flex items-start gap-2">
            {/* Favicon */}
            {faviconUrl && !faviconError ? (
              <img
                src={faviconUrl}
                alt=""
                className="w-5 h-5 rounded-sm mt-1 flex-shrink-0"
                onError={() => setFaviconError(true)}
              />
            ) : domain ? (
              <div
                className="w-5 h-5 rounded-sm mt-1 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: colors.text }}
              >
                {domain[0].toUpperCase()}
              </div>
            ) : null}

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[20px] sm:text-[24px] leading-tight font-medium line-clamp-3 transition-colors duration-300"
              style={{
                fontFamily: "var(--font-playfair)",
                color: "var(--text)",
                letterSpacing: "-0.02em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text)";
              }}
            >
              {title}
            </a>
          </h2>

          {/* Meta line */}
          <div
            className="mt-3 flex items-center gap-3 text-[13px]"
            style={{
              color: "var(--text-secondary)",
              fontFamily: "var(--font-source-sans)",
            }}
          >
            <span className="font-medium">{truncatedName}</span>
            <span
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: "var(--text-muted)" }}
            />
            <time
              title={formatDate(created_at)}
              className="italic"
              style={{ color: "var(--text-muted)" }}
            >
              {relativeTime(created_at)}
            </time>
          </div>
        </div>

        {/* Right: Copy button */}
        <div className="flex items-start pt-1">
          <button
            onClick={handleCopy}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100"
            style={{
              color: copied ? "var(--success)" : "var(--text-muted)",
            }}
            onMouseEnter={(e) => {
              if (!copied) {
                e.currentTarget.style.color = "var(--text)";
              }
            }}
            onMouseLeave={(e) => {
              if (!copied) {
                e.currentTarget.style.color = "var(--text-muted)";
              }
            }}
            aria-label={copied ? "Copied!" : "Copy link"}
          >
            {copied ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
