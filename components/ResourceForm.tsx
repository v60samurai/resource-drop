"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { TAGS, isValidUrl, normalizeUrl, type Tag } from "@/lib/utils";

interface DuplicateInfo {
  submittedBy: string;
}

interface ResourceFormProps {
  onSubmit: (data: {
    title: string;
    url: string;
    tag: Tag;
    submitted_by: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  existingUrls: { url: string; submitted_by: string }[];
}

export function ResourceForm({
  onSubmit,
  isSubmitting,
  existingUrls,
}: ResourceFormProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [tag, setTag] = useState<Tag>("General");
  const [name, setName] = useState("");
  const [urlError, setUrlError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Check for duplicate URL
  const duplicateInfo = useMemo((): DuplicateInfo | null => {
    if (!url || url.length < 5) return null;

    const normalizedInput = normalizeUrl(url);
    const match = existingUrls.find(
      (r) => normalizeUrl(r.url) === normalizedInput
    );

    return match ? { submittedBy: match.submitted_by } : null;
  }, [url, existingUrls]);

  // Cmd+Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        const activeElement = document.activeElement;
        const formElements = formRef.current?.elements;

        if (formElements) {
          const isWithinForm = Array.from(formElements).some(
            (el) => el === activeElement
          );

          if (isWithinForm) {
            e.preventDefault();
            formRef.current?.requestSubmit();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidUrl(url)) {
      setUrlError("Please enter a valid URL");
      return;
    }

    setUrlError("");
    await onSubmit({ title, url, tag, submitted_by: name });

    setTitle("");
    setUrl("");
    setTag("General");
    setName("");
  };

  const inputBaseClass =
    "w-full px-0 py-3 text-[16px] bg-transparent border-0 border-b-2 focus:outline-none transition-colors duration-300";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Title - Large editorial input */}
      <div>
        <label
          className="block text-[11px] font-semibold uppercase tracking-wider mb-2"
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-source-sans)",
          }}
        >
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A resource worth sharing"
          required
          className={inputBaseClass}
          style={{
            borderColor: "var(--border)",
            color: "var(--text)",
            fontFamily: "var(--font-playfair)",
            fontSize: "20px",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        />
      </div>

      {/* URL */}
      <div>
        <label
          className="block text-[11px] font-semibold uppercase tracking-wider mb-2"
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-source-sans)",
          }}
        >
          Link
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (urlError) setUrlError("");
          }}
          placeholder="https://..."
          required
          className={inputBaseClass}
          style={{
            borderColor: urlError ? "var(--error)" : "var(--border)",
            color: "var(--text)",
            fontFamily: "var(--font-source-sans)",
          }}
          onFocus={(e) => {
            if (!urlError) {
              e.currentTarget.style.borderColor = "var(--accent)";
            }
          }}
          onBlur={(e) => {
            if (!urlError) {
              e.currentTarget.style.borderColor = "var(--border)";
            }
          }}
        />
        {urlError && (
          <p
            className="mt-2 text-[13px]"
            style={{ color: "var(--error)" }}
          >
            {urlError}
          </p>
        )}
        {duplicateInfo && !urlError && (
          <p
            className="mt-2 text-[13px] px-3 py-2 rounded"
            style={{
              color: "var(--warning)",
              backgroundColor: "var(--warning-bg)",
              fontFamily: "var(--font-source-sans)",
            }}
          >
            This link was already shared by{" "}
            <span className="font-medium">{duplicateInfo.submittedBy}</span>
          </p>
        )}
      </div>

      {/* Tag and Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label
            className="block text-[11px] font-semibold uppercase tracking-wider mb-2"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-source-sans)",
            }}
          >
            Category
          </label>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value as Tag)}
            className={`${inputBaseClass} cursor-pointer appearance-none`}
            style={{
              borderColor: "var(--border)",
              color: "var(--text)",
              fontFamily: "var(--font-source-sans)",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238A847C' d='M3 4.5L6 7.5L9 4.5'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0 center",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            {TAGS.map((t) => (
              <option
                key={t}
                value={t}
                style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
              >
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="block text-[11px] font-semibold uppercase tracking-wider mb-2"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-source-sans)",
            }}
          >
            Your name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Anonymous"
            required
            className={inputBaseClass}
            style={{
              borderColor: "var(--border)",
              color: "var(--text)",
              fontFamily: "var(--font-source-sans)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          />
        </div>
      </div>

      {/* Submit button - editorial style */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative py-3 px-8 text-[14px] font-semibold uppercase tracking-wider transition-all duration-300 overflow-hidden"
          style={{
            backgroundColor: "transparent",
            color: isSubmitting ? "var(--text-muted)" : "var(--accent)",
            border: `2px solid ${isSubmitting ? "var(--border)" : "var(--accent)"}`,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontFamily: "var(--font-source-sans)",
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.backgroundColor = "var(--accent)";
              e.currentTarget.style.color = "#FFFFFF";
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--accent)";
            }
          }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <circle
                    cx="7"
                    cy="7"
                    r="5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="28"
                    strokeDashoffset="10"
                  />
                </svg>
                Publishing...
              </>
            ) : (
              <>
                Publish
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </>
            )}
          </span>
        </button>
        <span
          className="text-[12px] hidden sm:inline"
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-source-sans)",
          }}
        >
          or press <kbd className="px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--surface-alt)" }}>&#8984;Enter</kbd>
        </span>
      </div>
    </form>
  );
}
