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
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Hero Section */}
      <HeroSection />

      {/* Search & Filters */}
      <section className="relative z-10 -mt-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-4 md:p-6">
            {/* Search Bar */}
            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles, topics, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[15px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-emerald-700 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
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
    <section className="relative overflow-hidden px-6 pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900">
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[150px]" />
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-[120px]" />
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="mx-auto max-w-7xl relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8"
          >
            <BookOpen className="w-4 h-4 text-emerald-300" />
            <span className="text-emerald-100 text-sm font-medium">HalalMe Blog</span>
          </motion.div>

          <motion.h1
            className="text-5xl font-extrabold tracking-tight text-white md:text-7xl"
            style={{ fontFamily: 'var(--font-headline)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Stories &{' '}
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              Insights
            </span>
          </motion.h1>
          <motion.p
            className="mt-6 text-lg leading-relaxed text-emerald-50/80 md:text-xl max-w-2xl mx-auto"
            style={{ fontFamily: 'var(--font-body)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Explore guides, recipes, travel stories, and thoughtful perspectives on modern halal living.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

function FeaturedPostSection({ post }: { post: (typeof blogPosts)[0] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="px-6 pt-16 pb-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 mb-6"
        >
          <TrendingUp className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Featured Article</span>
        </motion.div>

        <Link href={`/blog/${post.slug}`}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.25 } }}
            className="group relative grid md:grid-cols-2 gap-0 bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:shadow-emerald-100/30 hover:border-emerald-200/50 transition-all duration-300"
          >
            {/* Image */}
            <div className="relative h-64 md:h-auto md:min-h-[380px] overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/5" />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 bg-amber-400 text-emerald-950 text-xs font-bold rounded-full shadow-md">
                  {post.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <h2
                className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight group-hover:text-emerald-800 transition-colors"
                style={{ fontFamily: 'var(--font-headline)' }}
              >
                {post.title}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">{post.excerpt}</p>

              {/* Author & Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-white">{post.author.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{post.author.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(post.date)} &middot; {post.readTime}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-emerald-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Read article
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No articles found</h3>
            <p className="text-gray-400">Try adjusting your search or category filter.</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
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
  const categoryColorMap: Record<string, string> = {
    'Halal Living': 'bg-emerald-100 text-emerald-700',
    Recipes: 'bg-amber-100 text-amber-700',
    Travel: 'bg-sky-100 text-sky-700',
    Community: 'bg-violet-100 text-violet-700',
    'Health & Wellness': 'bg-rose-100 text-rose-700',
  };

  return (
    <Link href={`/blog/${post.slug}`}>
      <motion.article
        whileHover={{ y: -6, transition: { duration: 0.25 } }}
        className="group h-full bg-white rounded-2xl overflow-hidden shadow-md shadow-gray-100/50 border border-gray-100 hover:shadow-xl hover:shadow-emerald-100/30 hover:border-emerald-200/40 transition-all duration-300 flex flex-col"
      >
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute top-3 left-3">
            <span
              className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                categoryColorMap[post.category] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {post.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          <h3
            className="text-lg font-bold text-gray-900 mb-2 leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            {post.title}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2 flex-1">
            {post.excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{post.author.avatar}</span>
              </div>
              <span className="text-xs font-semibold text-gray-700">{post.author.name}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

function NewsletterSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="px-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 px-8 py-14 md:px-16 md:py-18 text-center"
        >
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-[120px]" />
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative z-10">
            <h2
              className="text-3xl md:text-4xl font-extrabold text-white mb-4"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Stay in the{' '}
              <span className="bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">
                Loop
              </span>
            </h2>
            <p className="text-emerald-100/70 mb-8 max-w-md mx-auto">
              Get the latest articles, recipes, and halal living tips delivered to your inbox every week.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-5 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder:text-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40 transition-all text-sm"
              />
              <button className="px-7 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 font-bold text-sm rounded-full shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2">
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
