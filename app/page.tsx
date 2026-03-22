"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase, type Resource, type ResourceInsert } from "@/lib/supabase";
import { type Tag, getTagCounts } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { ResourceForm } from "@/components/ResourceForm";
import { ResourceCard } from "@/components/ResourceCard";
import { TagFilter } from "@/components/TagFilter";
import { SearchBar } from "@/components/SearchBar";
import { StatsBar } from "@/components/StatsBar";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Toast } from "@/components/Toast";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeTag, setActiveTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newResourceId, setNewResourceId] = useState<string | null>(null);

  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 200);

  // Tag counts (from full dataset)
  const tagCounts = useMemo(() => getTagCounts(resources), [resources]);

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    let result = resources;

    // Filter by tag
    if (activeTag !== "All") {
      result = result.filter((r) => r.tag === activeTag);
    }

    // Filter by search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.submitted_by.toLowerCase().includes(query)
      );
    }

    // Sort by newest
    return [...result].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [resources, activeTag, debouncedSearch]);

  // Existing URLs for duplicate detection
  const existingUrls = useMemo(
    () => resources.map((r) => ({ url: r.url, submitted_by: r.submitted_by })),
    [resources]
  );

  const fetchResources = useCallback(async () => {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Failed to load resources. Check your Supabase configuration.");
      setIsLoading(false);
      return;
    }

    // Ensure upvotes defaults to 0 if not present
    const resourcesWithUpvotes = (data || []).map((r) => ({
      ...r,
      upvotes: r.upvotes ?? 0,
    }));

    setResources(resourcesWithUpvotes);
    setError(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Clear new resource highlight after animation
  useEffect(() => {
    if (newResourceId) {
      const timer = setTimeout(() => setNewResourceId(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [newResourceId]);

  const handleSubmit = async (data: {
    title: string;
    url: string;
    tag: Tag;
    submitted_by: string;
  }) => {
    setIsSubmitting(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticResource: Resource = {
      id: tempId,
      ...data,
      created_at: new Date().toISOString(),
      upvotes: 0,
    };

    setResources((prev) => [optimisticResource, ...prev]);
    setNewResourceId(tempId);

    const insertData: ResourceInsert = {
      title: data.title,
      url: data.url,
      tag: data.tag,
      submitted_by: data.submitted_by,
    };

    const { data: inserted, error } = await supabase
      .from("resources")
      .insert(insertData)
      .select()
      .single();

    setIsSubmitting(false);

    if (error) {
      setResources((prev) => prev.filter((r) => r.id !== tempId));
      setNewResourceId(null);
      setToast({
        message: error.message || "Failed to submit resource",
        type: "error",
      });
      return;
    }

    // Replace temp with real resource
    const insertedWithUpvotes = { ...inserted, upvotes: inserted.upvotes ?? 0 };
    setResources((prev) =>
      prev.map((r) => (r.id === tempId ? insertedWithUpvotes : r))
    );
    setNewResourceId(insertedWithUpvotes.id);
    setToast({ message: "Resource dropped!", type: "success" });
    setShowForm(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActiveTag("All");
  };

  const noResults =
    !isLoading && !error && filteredResources.length === 0 && resources.length > 0;

  return (
    <div className="min-h-screen accent-top-border" style={{ backgroundColor: "var(--bg)" }}>
      {/* Editorial Header */}
      <header className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-[900px] mx-auto px-6 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            {/* Masthead with subtle glow */}
            <div className="relative">
              {/* Subtle accent glow behind heading */}
              <div
                className="absolute -inset-12 pointer-events-none"
                style={{
                  background: "radial-gradient(circle at center, var(--accent-subtle) 0%, transparent 70%)",
                  opacity: 0.6,
                }}
              />
              <p
                className="relative text-[11px] font-semibold uppercase tracking-[0.2em] mb-3"
                style={{
                  color: "var(--accent)",
                  fontFamily: "var(--font-source-sans)",
                }}
              >
                A Curated Collection
              </p>
              <h1
                className="relative text-[42px] md:text-[56px] font-medium leading-none tracking-tight"
                style={{
                  fontFamily: "var(--font-playfair)",
                  color: "var(--text)",
                  letterSpacing: "-0.03em",
                }}
              >
                Resource Drop
              </h1>
              <p
                className="relative mt-3 text-[16px] max-w-[400px]"
                style={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-source-sans)",
                }}
              >
                Links worth sharing, curated by the community.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setShowForm(!showForm)}
                className="group flex items-center gap-2 px-6 py-3 text-[13px] font-semibold uppercase tracking-wider transition-all duration-300"
                style={{
                  backgroundColor: showForm ? "var(--accent)" : "transparent",
                  color: showForm ? "#FFFFFF" : "var(--accent)",
                  border: "2px solid var(--accent)",
                  fontFamily: "var(--font-source-sans)",
                }}
                onMouseEnter={(e) => {
                  if (!showForm) {
                    e.currentTarget.style.backgroundColor = "var(--accent)";
                    e.currentTarget.style.color = "#FFFFFF";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showForm) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--accent)";
                  }
                }}
              >
                {showForm ? (
                  <>
                    Close
                    <span className="text-[18px]">×</span>
                  </>
                ) : (
                  <>
                    Contribute
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      +
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Collapsible Form Section */}
      {showForm && (
        <section
          className="border-b animate-fade-in"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <div className="max-w-[600px] mx-auto px-6 py-10">
            <h2
              className="text-[13px] font-semibold uppercase tracking-wider mb-8"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-source-sans)",
              }}
            >
              Share a Resource
            </h2>
            <ResourceForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              existingUrls={existingUrls}
            />
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="max-w-[900px] mx-auto px-6 py-10 md:py-16">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Filter Row */}
        <div className="mb-6">
          <TagFilter
            activeTag={activeTag}
            onTagChange={setActiveTag}
            counts={tagCounts}
          />
        </div>

        {/* Stats Bar */}
        <div className="mb-8">
          <StatsBar resources={resources} />
        </div>

        {/* Resource Feed */}
        <section className="space-y-8">
          {isLoading ? (
            // Skeleton loading
            <>
              {[0, 1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} index={i} />
              ))}
            </>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-[15px] mb-6" style={{ color: "var(--error)" }}>
                {error}
              </p>
              <button
                onClick={() => {
                  setIsLoading(true);
                  fetchResources();
                }}
                className="px-6 py-2 text-[13px] font-semibold uppercase tracking-wider transition-colors duration-300"
                style={{
                  border: "2px solid var(--border)",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-source-sans)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                Retry
              </button>
            </div>
          ) : noResults ? (
            <div className="text-center py-20">
              <p
                className="text-[28px] mb-2"
                style={{
                  fontFamily: "var(--font-playfair)",
                  color: "var(--text-muted)",
                }}
              >
                ◇
              </p>
              <p
                className="text-[15px] italic mb-4"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-source-sans)",
                }}
              >
                No resources match your search
              </p>
              <button
                onClick={clearFilters}
                className="text-[13px] font-medium transition-colors duration-200"
                style={{
                  color: "var(--accent)",
                  fontFamily: "var(--font-source-sans)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = "underline";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = "none";
                }}
              >
                Clear filters
              </button>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-20">
              <p
                className="text-[28px] mb-2"
                style={{
                  fontFamily: "var(--font-playfair)",
                  color: "var(--text-muted)",
                }}
              >
                ◇
              </p>
              <p
                className="text-[15px] italic"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-source-sans)",
                }}
              >
                No resources yet. Be the first to contribute.
              </p>
            </div>
          ) : (
            filteredResources.map((resource, index) => (
              <ResourceCard
                key={resource.id}
                id={resource.id}
                title={resource.title}
                url={resource.url}
                tag={resource.tag as Tag}
                submitted_by={resource.submitted_by}
                created_at={resource.created_at}
                index={index}
                isNew={resource.id === newResourceId}
              />
            ))
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-10" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-[900px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p
            className="text-[12px] uppercase tracking-wider"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-source-sans)",
            }}
          >
            Resource Drop
          </p>
          <p
            className="text-[12px]"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-source-sans)",
            }}
          >
            Built with intention
          </p>
        </div>
      </footer>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
