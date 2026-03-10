'use client';

import { useRef, useState, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Clock,
  ArrowRight,
  BookOpen,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { blogPosts, categories, formatDate } from '@/data/blogPosts';

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
      const matchesSearch =
        searchQuery === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const featuredPost = blogPosts.find((post) => post.featured);
  const regularPosts = filteredPosts.filter((post) => !post.featured || activeCategory !== 'All');

  return (
    <div className="min-h-screen bg-[#102C26]">
      {/* Hero */}
      <HeroSection />

      {/* Search & Filters */}
      <section className="relative z-10 px-6 py-8 bg-[#0A1C19] border-b border-[#F7E7CE]/8">
        <div className="max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F7E7CE]/30" />
            <input
              type="text"
              placeholder="Search articles, topics, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 h-12 bg-[#102C26] border border-[#F7E7CE]/12 text-[#F7E7CE] placeholder:text-[#F7E7CE]/20 focus:outline-none focus:border-[#F7E7CE]/40 transition-colors text-sm"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-colors duration-200 ${
                  activeCategory === cat
                    ? 'bg-[#F7E7CE] text-[#102C26]'
                    : 'border border-[#F7E7CE]/15 text-[#F7E7CE]/50 hover:border-[#F7E7CE]/30 hover:text-[#F7E7CE]/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {activeCategory === 'All' && searchQuery === '' && featuredPost && (
        <FeaturedPostSection post={featuredPost} />
      )}

      {/* Blog Grid */}
      <BlogGrid posts={regularPosts} />

      {/* Newsletter CTA */}
      <NewsletterSection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pt-32 pb-16 md:pt-40 md:pb-20 bg-[#102C26]">
      {/* Dot texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #F7E7CE 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="mx-auto max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-[#F59E0B]" />
            <span className="text-[#F59E0B] text-[10px] font-bold uppercase tracking-[0.3em]">
              HalalMe Blog
            </span>
            <div className="w-8 h-px bg-[#F59E0B]" />
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]">
            Stories &amp;
            <br />
            <span className="text-[#F7E7CE]/40">Insights</span>
          </h1>
          <p className="mt-5 text-base text-[#F7E7CE]/45 max-w-md leading-relaxed">
            Guides, recipes, travel stories, and perspectives on modern halal living.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturedPostSection({ post }: { post: (typeof blogPosts)[0] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="px-6 pt-12 pb-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-6 h-px bg-[#F59E0B]" />
          <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-[0.25em]">Featured Article</span>
        </motion.div>

        <Link href={`/blog/${post.slug}`}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative grid md:grid-cols-2 gap-px bg-[#F7E7CE]/8 border border-[#F7E7CE]/8 overflow-hidden"
          >
            {/* Image */}
            <div className="relative h-64 md:h-auto md:min-h-[360px] overflow-hidden bg-[#0A1C19]">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-[#F59E0B] text-[#102C26] text-[10px] font-bold uppercase tracking-[0.2em]">
                  {post.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 md:p-10 flex flex-col justify-center bg-[#0A1C19] group-hover:bg-[#F7E7CE] transition-colors duration-300">
              <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tighter text-[#F7E7CE] group-hover:text-[#102C26] mb-4 leading-tight transition-colors duration-300">
                {post.title}
              </h2>
              <p className="text-[#F7E7CE]/50 group-hover:text-[#102C26]/65 leading-relaxed mb-6 line-clamp-3 text-sm transition-colors duration-300">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#F7E7CE]/10 group-hover:bg-[#102C26]/10 border border-[#F7E7CE]/15 group-hover:border-[#102C26]/20 flex items-center justify-center transition-colors duration-300">
                    <span className="text-[10px] font-bold text-[#F7E7CE]/60 group-hover:text-[#102C26]/60 transition-colors duration-300">{post.author.avatar}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#F7E7CE]/70 group-hover:text-[#102C26]/80 uppercase tracking-wide transition-colors duration-300">{post.author.name}</p>
                    <p className="text-[10px] text-[#F7E7CE]/35 group-hover:text-[#102C26]/50 transition-colors duration-300">
                      {formatDate(post.date)} &middot; {post.readTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#F7E7CE]/40 group-hover:text-[#102C26]/70 font-bold text-xs uppercase tracking-wide transition-all duration-300">
                  Read
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>
    </section>
  );
}

function BlogGrid({ posts }: { posts: (typeof blogPosts) }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.05 });

  return (
    <section ref={ref} className="px-6 py-16">
      <div className="max-w-6xl mx-auto">
        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BookOpen className="w-12 h-12 text-[#F7E7CE]/15 mx-auto mb-4" />
            <h3 className="text-lg font-extrabold uppercase tracking-tighter text-[#F7E7CE]/30 mb-2">No articles found</h3>
            <p className="text-[#F7E7CE]/25 text-sm">Try adjusting your search or category filter.</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#F7E7CE]/8">
            {posts.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
              >
                <BlogCard post={post} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function BlogCard({ post }: { post: (typeof blogPosts)[0] }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group h-full bg-[#102C26] hover:bg-[#F7E7CE] transition-colors duration-300 flex flex-col overflow-hidden">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-75 group-hover:opacity-90"
          />
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-[#0A1C19]/80 text-[#F7E7CE]/70 text-[9px] font-bold uppercase tracking-[0.2em]">
              {post.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          {/* Decorative number */}
          <span aria-hidden="true" className="text-[4rem] font-extrabold text-[#0A1C19] group-hover:text-[#102C26]/10 leading-none select-none pointer-events-none absolute -right-2 bottom-2 transition-colors duration-300">
            {String(blogPosts.indexOf(post) + 1).padStart(2, '0')}
          </span>

          <h3 className="text-base font-extrabold uppercase tracking-tighter text-[#F7E7CE] group-hover:text-[#102C26] mb-2 leading-tight line-clamp-2 transition-colors duration-300 relative z-10">
            {post.title}
          </h3>
          <p className="text-xs text-[#F7E7CE]/45 group-hover:text-[#102C26]/60 leading-relaxed mb-4 line-clamp-2 flex-1 transition-colors duration-300 relative z-10">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-[#F7E7CE]/8 group-hover:border-[#102C26]/15 transition-colors duration-300 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#F7E7CE]/10 group-hover:bg-[#102C26]/10 flex items-center justify-center transition-colors duration-300">
                <span className="text-[9px] font-bold text-[#F7E7CE]/50 group-hover:text-[#102C26]/50 transition-colors duration-300">{post.author.avatar}</span>
              </div>
              <span className="text-[10px] font-bold text-[#F7E7CE]/55 group-hover:text-[#102C26]/70 uppercase tracking-wide transition-colors duration-300">{post.author.name}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#F7E7CE]/35 group-hover:text-[#102C26]/50 transition-colors duration-300">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function NewsletterSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="px-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden bg-[#F7E7CE] p-10 md:p-16"
        >
          {/* Dot texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #102C26 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-6 h-px bg-[#102C26]/30" />
              <span className="text-[#102C26]/50 text-[10px] font-bold uppercase tracking-[0.3em]">Newsletter</span>
              <div className="w-6 h-px bg-[#102C26]/30" />
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tighter leading-[0.9] text-[#102C26] mb-4">
              Stay in the
              <br />
              <span className="text-[#102C26]/40">Loop</span>
            </h2>
            <p className="text-[#102C26]/55 text-sm mb-8 leading-relaxed">
              Get the latest articles, recipes, and halal living tips delivered to your inbox every week.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 h-12 px-4 bg-[#102C26]/8 border border-[#102C26]/15 text-[#102C26] placeholder:text-[#102C26]/30 focus:outline-none focus:border-[#102C26]/40 transition-colors text-sm"
              />
              <button className="h-12 px-6 bg-[#102C26] text-[#F7E7CE] font-extrabold uppercase tracking-tighter text-sm hover:bg-[#0A1C19] transition-colors flex items-center justify-center gap-2">
                Subscribe
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
