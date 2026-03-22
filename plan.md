# Resource Drop — Enhancement Implementation Plan

## 1. Problem & Expected Outcome

**Problem:** The current Resource Drop app is functional but basic. It lacks discoverability features (search, sorting), engagement mechanics (upvotes), and polish (loading states, visual feedback, keyboard shortcuts) that make the difference between "works" and "delightful to use."

**Expected Outcome:** A polished, production-grade resource sharing app with:
- Fast client-side search and filtering that compose together
- Upvote system with local persistence to prevent double-voting
- Skeleton loading states for perceived performance
- Keyboard shortcuts for power users
- Visual polish: favicons, copy buttons, hover effects, staggered animations
- Mobile-first responsive design down to 375px

---

## 2. Files to Modify/Create

### Modified Files

```
app/globals.css           # New animations, skeleton styles, accent border, scrollbar-hide
app/page.tsx              # Major refactor: search, sort, upvotes, keyboard shortcuts, stats
app/layout.tsx            # Accent top border on body
lib/supabase.ts           # Add upvotes column to Resource type
lib/utils.ts              # Add normalizeUrl(), debounce(), getTagCounts()
components/ResourceCard.tsx   # Upvote button, favicon, copy button, hover effects, highlight
components/ResourceForm.tsx   # Duplicate detection, Cmd+Enter submit
components/TagFilter.tsx      # Count badges, pill styling updates
components/Toast.tsx          # Bottom-center positioning, check icon variant
```

### New Files

```
components/SearchBar.tsx      # Search input with icon, Cmd+K badge, keyboard handling
components/SortToggle.tsx     # Newest/Top toggle
components/StatsBar.tsx       # Stats strip with total, trending tag, last drop
components/SkeletonCard.tsx   # Pulsing placeholder card
hooks/useDebounce.ts          # Debounce hook for search
hooks/useKeyboardShortcuts.ts # Global keyboard shortcut handler
```

**Total: 8 modified files, 5 new files**

---

## 3. Key Technical Decisions

### 3.1 State Architecture

All filtering/sorting happens client-side on the already-fetched data:

```tsx
// In page.tsx
const [resources, setResources] = useState<Resource[]>([]);     // Raw from Supabase
const [searchQuery, setSearchQuery] = useState("");              // Debounced
const [activeTag, setActiveTag] = useState("All");
const [sortMode, setSortMode] = useState<"newest" | "top">("newest");

// Derived state (computed every render, no useMemo needed for <1000 items)
const filteredResources = resources
  .filter(r => activeTag === "All" || r.tag === activeTag)
  .filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.title.toLowerCase().includes(q) || r.submitted_by.toLowerCase().includes(q);
  })
  .sort((a, b) => {
    if (sortMode === "top") {
      if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
```

### 3.2 Upvote Persistence

LocalStorage stores upvoted IDs as JSON array:

```ts
const STORAGE_KEY = "resourcedrop_upvoted";

function getUpvotedIds(): string[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function markAsUpvoted(id: string): void {
  const ids = getUpvotedIds();
  if (!ids.includes(id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, id]));
  }
}
```

### 3.3 Debounce Implementation

Custom hook with cleanup:

```ts
// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

### 3.4 Favicon Strategy

Google's favicon service with fallback:

```tsx
const [faviconError, setFaviconError] = useState(false);
const domain = new URL(url).hostname;
const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

// Render
{faviconError ? (
  <div className="w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold text-white"
       style={{ backgroundColor: tagColor }}>
    {domain[0].toUpperCase()}
  </div>
) : (
  <img src={faviconUrl} alt="" className="w-5 h-5 rounded-sm"
       onError={() => setFaviconError(true)} />
)}
```

### 3.5 URL Normalization for Duplicate Detection

```ts
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove protocol, trailing slash, www prefix
    return parsed.host.replace(/^www\./, "") + parsed.pathname.replace(/\/$/, "") + parsed.search;
  } catch {
    return url.toLowerCase();
  }
}
```

### 3.6 Keyboard Shortcuts

Global event listener with proper cleanup:

```ts
// hooks/useKeyboardShortcuts.ts
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    // Cmd+K / Ctrl+K → focus search
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
  };

  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, []);
```

### 3.7 Card Animation Strategy

CSS keyframes with staggered delays via inline style:

```css
@keyframes cardEnter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-enter {
  animation: cardEnter 300ms ease-out forwards;
}

.card-highlight {
  animation: cardHighlight 1.5s ease-out forwards;
}

@keyframes cardHighlight {
  0% { box-shadow: 0 0 0 4px var(--accent-subtle); }
  100% { box-shadow: 0 0 0 0px transparent; }
}
```

### 3.8 Database Schema Update

Add `upvotes` column to resources table:

```sql
ALTER TABLE resources ADD COLUMN upvotes integer DEFAULT 0;
```

Update TypeScript types:

```ts
export interface Resource {
  id: string;
  title: string;
  url: string;
  tag: string;
  submitted_by: string;
  created_at: string;
  upvotes: number;  // NEW
}
```

---

## 4. Edge Cases & Failure Modes

| Edge Case | Handling |
|-----------|----------|
| Search with special regex chars | Escape regex special chars or use simple `includes()` |
| Empty search after typing | Show all resources for active tag |
| Search + tag filter = 0 results | "No resources match" with "Clear filters" button |
| Upvote fails (network) | Rollback optimistic update, show error toast |
| Upvote on temp resource (optimistic insert) | Disable upvote button for temp IDs |
| Favicon 404 | onError triggers fallback letter circle |
| Clipboard API unavailable | Fallback to textarea + execCommand, or show "Copy not supported" |
| localStorage unavailable (incognito) | Wrap in try/catch, degrade gracefully (allow re-upvoting) |
| Very long search query | Truncate display, no functional limit |
| Rapid tag switching | No issue, state updates are synchronous |
| Mobile keyboard covers search | Use `visualViewport` or rely on browser handling |
| Page refresh during upvote | Supabase update is fire-and-forget, may be lost |
| Duplicate URL with different protocols | Normalize strips protocol for comparison |
| 0 resources in feed | Show empty state (already handled) |
| 1000+ resources | Consider virtualization in future; for now, CSS animations may stutter |

---

## 5. Testing Strategy

### Manual Testing Checklist

**Search:**
- [ ] Type query → feed filters in real-time (200ms debounce)
- [ ] Cmd+K focuses search input
- [ ] Escape clears and blurs search
- [ ] Search persists across tag changes
- [ ] Search + tag = 0 results → "No resources match" + Clear button
- [ ] Clear button resets both search and tag

**Tag Filter:**
- [ ] Click tag → feed filters
- [ ] Count badges show correct totals
- [ ] Active pill has accent background
- [ ] Horizontal scroll on mobile with no visible scrollbar

**Sort:**
- [ ] Newest sorts by created_at desc
- [ ] Top sorts by upvotes desc, then created_at desc
- [ ] Sort composes with search + tag filter

**Upvotes:**
- [ ] Click upvote → count increments immediately
- [ ] Upvoted state persists in localStorage
- [ ] Already upvoted → button disabled, accent color
- [ ] Refresh page → upvote state restored
- [ ] Upvote on new submission (temp ID) → disabled

**Favicons:**
- [ ] Valid domain → favicon loads
- [ ] Invalid/missing favicon → fallback letter circle
- [ ] Fallback uses tag color

**Copy:**
- [ ] Click copy → "Copied!" feedback for 1.5s
- [ ] URL in clipboard matches resource URL
- [ ] Desktop: visible on hover only
- [ ] Mobile: always visible

**Duplicate Detection:**
- [ ] Paste existing URL → warning appears
- [ ] Warning shows original submitter name
- [ ] Submission not blocked
- [ ] Change URL → warning clears

**Loading:**
- [ ] Initial load shows 5 skeleton cards
- [ ] Skeletons match real card dimensions
- [ ] No layout shift when real cards appear

**Stats Bar:**
- [ ] Total count correct
- [ ] Trending tag is most common
- [ ] Last drop time is relative and accurate
- [ ] Updates when new resource added

**Keyboard:**
- [ ] Cmd+K / Ctrl+K focuses search (doesn't open browser search)
- [ ] Cmd+Enter in form submits
- [ ] Escape in search clears and blurs

**Mobile (375px):**
- [ ] No horizontal scroll
- [ ] Form inputs stack vertically
- [ ] Tag filter scrolls horizontally
- [ ] Touch targets ≥ 44px
- [ ] Search is full-width

**Visual Polish:**
- [ ] Accent border at top of page
- [ ] Header has subtle glow
- [ ] Cards lift on hover (desktop)
- [ ] Cards stagger-animate on load
- [ ] New card has highlight glow
- [ ] Submit button brightens on hover

---

## 6. Implementation Order

### Phase 1: Foundation (No visible changes yet)

1. **Update database schema** — Add `upvotes` column to Supabase
2. **Update lib/supabase.ts** — Add `upvotes` to Resource type
3. **Create hooks/useDebounce.ts** — Reusable debounce hook
4. **Update lib/utils.ts** — Add `normalizeUrl()`, `getTagCounts()`
5. **Update globals.css** — Add new animations, scrollbar-hide, skeleton pulse

### Phase 2: Components (Build in isolation)

6. **Create components/SearchBar.tsx** — Search input with all keyboard handling
7. **Create components/SortToggle.tsx** — Newest/Top toggle
8. **Create components/StatsBar.tsx** — Stats strip
9. **Create components/SkeletonCard.tsx** — Loading placeholder
10. **Update components/TagFilter.tsx** — Add count badges, horizontal scroll

### Phase 3: Card Enhancements

11. **Update components/ResourceCard.tsx**:
    - Add favicon with fallback
    - Add upvote button with localStorage persistence
    - Add copy button with feedback
    - Add hover lift effect
    - Add highlight animation for new cards

### Phase 4: Form Enhancements

12. **Update components/ResourceForm.tsx**:
    - Add duplicate URL detection
    - Add Cmd+Enter submit
    - Pass existing URLs as prop for comparison

### Phase 5: Page Integration

13. **Major update to app/page.tsx**:
    - Add search state + debounce
    - Add sort state
    - Compose all filters
    - Integrate SearchBar, SortToggle, StatsBar
    - Add global keyboard shortcut handler
    - Show skeletons during load
    - Pass highlight flag to new cards

### Phase 6: Visual Polish

14. **Update app/layout.tsx** — Add accent top border
15. **Update globals.css** — Header glow, card hover transitions
16. **Final pass on all components** — Mobile responsive check at 375px

### Dependency Graph

```
Phase 1 (foundation)
    ↓
Phase 2 (components) ← can be parallelized
    ↓
Phase 3 (card) ← depends on Phase 1 for upvotes type
    ↓
Phase 4 (form) ← independent of Phase 3
    ↓
Phase 5 (integration) ← depends on Phases 2, 3, 4
    ↓
Phase 6 (polish) ← final pass
```

---

## 7. Database Migration

Run this SQL in Supabase SQL editor before starting implementation:

```sql
-- Add upvotes column with default 0
ALTER TABLE resources ADD COLUMN IF NOT EXISTS upvotes integer DEFAULT 0;

-- Update RLS policy to allow updating upvotes
CREATE POLICY "Public update upvotes" ON resources
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

---

## 8. Not Doing (Explicit Scope Boundaries)

- No server-side search (client-side is fast enough for hundreds of resources)
- No infinite scroll / pagination (load all, filter client-side)
- No undo upvote (one-way only)
- No analytics tracking
- No URL preview/unfurling (just favicon)
- No user accounts or authentication
- No comments or replies
- No resource editing or deletion
- No import/export

---

## Approval Checkpoint

Ready to implement. Awaiting your approval before writing any code.
