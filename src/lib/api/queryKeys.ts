/**
 * Central React Query key factory.
 *
 * Every key for an entity begins with that entity's root string, so a single
 * prefix invalidation reaches all of them:
 *
 *   queryClient.invalidateQueries({ queryKey: queryKeys.tours.all })
 *
 * matches the admin list, the public list, every detail page, and the home
 * carousels at once.
 *
 * Three rules keep it that way:
 *
 * 1. Mutations invalidate the entity root (`.all`), never a specific detail
 *    key. Detail pages are keyed by slug on the public side and by id in
 *    admin, and neither caller can cheaply derive the other. Invalidating the
 *    root prefix-matches both, so they never need to agree. Fine-grained
 *    invalidation is what let admin writes silently miss public readers.
 *
 * 2. No call site builds a key literal inline. A key that isn't in this file
 *    is a key no invalidation can reach.
 *
 * 3. Detail keys are split into `detailById` and `detailBySlug`. Admin looks a
 *    record up by id and the public side by slug, against different endpoints
 *    that return different payloads — admin's includes drafts. Blog posts use
 *    serial integer ids and slugs are free-form, so a post titled "2026" gets
 *    the slug "2026" and would share a cache entry with post id 2026, letting
 *    a draft surface on the public page. The discriminator segment makes that
 *    impossible. Both variants still sit under the entity root, so root
 *    invalidation reaches them either way.
 *
 * Where two entities denormalize each other — tour cards carry a destination
 * name, a destination page lists its tours, a blog post carries its category
 * name — a write invalidates BOTH roots at the call site. Those pairings are
 * noted where they occur rather than encoded here, so the reason stays next to
 * the mutation that needs it.
 */

export const queryKeys = {
  tours: {
    all: ["tours"] as const,
    list: (filters?: unknown) => ["tours", "list", filters ?? null] as const,
    detailById: (id: string | number) => ["tours", "detail", "id", String(id)] as const,
    detailBySlug: (slug: string) => ["tours", "detail", "slug", slug] as const,
    featured: () => ["tours", "featured"] as const,
    deals: () => ["tours", "deals"] as const,
    popular: () => ["tours", "popular"] as const,
    top: (metric: string) => ["tours", "top", metric] as const,
  },

  destinations: {
    all: ["destinations"] as const,
    list: (filters?: unknown) => ["destinations", "list", filters ?? null] as const,
    detailById: (id: string | number) => ["destinations", "detail", "id", String(id)] as const,
    detailBySlug: (slug: string) => ["destinations", "detail", "slug", slug] as const,
    featured: () => ["destinations", "featured"] as const,
    tours: (id: string | number) => ["destinations", "detail", "id", String(id), "tours"] as const,
    revenue: () => ["destinations", "stats", "revenue"] as const,
  },

  blog: {
    /**
     * Posts and categories share the "blog" root but split immediately, so a
     * post write invalidates `blog.posts.all` without churning the category
     * list (which every post form reads on mount).
     */
    posts: {
      all: ["blog", "posts"] as const,
      list: (filters?: unknown) => ["blog", "posts", "list", filters ?? null] as const,
      detailById: (id: string | number) => ["blog", "posts", "detail", "id", String(id)] as const,
      detailBySlug: (slug: string) => ["blog", "posts", "detail", "slug", slug] as const,
      recent: () => ["blog", "posts", "recent"] as const,
      related: (categoryId?: number) => ["blog", "posts", "related", categoryId ?? null] as const,
    },
    categories: {
      all: ["blog", "categories"] as const,
      list: () => ["blog", "categories", "list"] as const,
    },
  },

  bookings: {
    all: ["bookings"] as const,
    list: (filters?: unknown) => ["bookings", "list", filters ?? null] as const,
    detail: (id: string | number) => ["bookings", "detail", String(id)] as const,
    mine: (filters?: unknown) => ["bookings", "mine", filters ?? null] as const,
    recent: () => ["bookings", "recent"] as const,
    stats: () => ["bookings", "stats"] as const,
    trends: () => ["bookings", "stats", "trends"] as const,
    revenue: () => ["bookings", "stats", "revenue"] as const,
  },

  users: {
    all: ["users"] as const,
    list: (filters?: unknown) => ["users", "list", filters ?? null] as const,
    stats: () => ["users", "stats"] as const,
  },

  media: {
    all: ["media"] as const,
    list: (filters?: unknown) => ["media", "list", filters ?? null] as const,
  },

  payments: {
    all: ["payments"] as const,
    pendingBankTransfers: () => ["payments", "pending-bank-transfers"] as const,
  },
} as const;
