import { supabase } from "./supabase";
import type { BlogPost, PaginatedResult } from "@/types";

export const blogService = {
  async getPosts(filters?: {
    category?: string;
    featured?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResult<BlogPost>> {
    const { page = 1, pageSize = 12, ...rest } = filters ?? {};
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("blog_posts")
      .select("*, profiles(username, full_name, avatar_url)", { count: "exact" })
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .range(from, to);

    if (rest.category) query = query.eq("category", rest.category);
    if (rest.featured) query = query.eq("is_featured", true);
    if (rest.search) query = query.textSearch("title", rest.search, { type: "websearch" });

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return {
      data: data ?? [],
      count: count ?? 0,
      page,
      pageSize,
      hasMore: (count ?? 0) > page * pageSize,
    };
  },

  async getPostBySlug(slug: string): Promise<BlogPost> {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, profiles(username, full_name, avatar_url)")
      .eq("slug", slug)
      .single();
    if (error) throw new Error(error.message);

    // Increment view count (fire-and-forget)
    supabase
      .from("blog_posts")
      .update({ view_count: data.view_count + 1 })
      .eq("id", data.id)
      .then(() => {});

    return data;
  },

  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("category")
      .eq("is_published", true);
    if (error) throw new Error(error.message);
    return [...new Set((data ?? []).map((p) => p.category))].sort();
  },
};
