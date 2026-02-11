'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Facebook,
  Twitter,
  LinkIcon,
  ArrowRight,
} from 'lucide-react';
import {
  getPostBySlug,
  getRelatedPosts,
  formatDate,
  blogPosts,
} from '@/data/blogPosts';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1
            className="text-4xl font-extrabold text-gray-900 mb-4"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            Article not found
          </h1>
          <p className="text-gray-500 mb-8">The article you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white font-semibold rounded-full hover:bg-emerald-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const relatedPosts = getRelatedPosts(slug, post.category);

  const categoryColorMap: Record<string, string> = {
    'Halal Living': 'bg-emerald-100 text-emerald-700',
    Recipes: 'bg-amber-100 text-amber-700',
    Travel: 'bg-sky-100 text-sky-700',
    Community: 'bg-violet-100 text-violet-700',
    'Health & Wellness': 'bg-rose-100 text-rose-700',
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        {/* Back button */}
        <div className="absolute top-24 left-6 md:left-10 z-10">
          <Link href="/blog">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-full text-white text-sm font-semibold hover:bg-white/25 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </motion.div>
          </Link>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span
                className={`inline-block px-3 py-1.5 text-xs font-bold rounded-full mb-4 ${
                  categoryColorMap[post.category] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {post.category}
              </span>
              <h1
                className="text-3xl md:text-5xl font-extrabold text-white leading-tight"
                style={{ fontFamily: 'var(--font-headline)' }}
              >
                {post.title}
              </h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Article Meta & Content */}
      <section className="max-w-4xl mx-auto px-6 md:px-8">
        {/* Author & Meta Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-between gap-4 py-6 border-b border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-white">{post.author.avatar}</span>
            </div>
            <div>
              <p className="font-bold text-gray-900">{post.author.name}</p>
              <p className="text-sm text-gray-500">{post.author.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(post.date)}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </div>
          </div>
        </motion.div>

        {/* Article Body */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="py-10 prose prose-lg max-w-none
            prose-headings:font-extrabold prose-headings:text-gray-900
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-p:text-gray-600 prose-p:leading-relaxed
            prose-a:text-emerald-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-800
            prose-ul:text-gray-600
            prose-li:marker:text-emerald-500"
          style={{ fontFamily: 'var(--font-body)' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pb-8 border-b border-gray-100">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Share */}
        <div className="flex items-center gap-4 py-8 border-b border-gray-100">
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-500">
            <Share2 className="w-4 h-4" />
            Share
          </span>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-full bg-gray-100 hover:bg-emerald-100 flex items-center justify-center text-gray-500 hover:text-emerald-700 transition-colors">
              <Twitter className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-full bg-gray-100 hover:bg-emerald-100 flex items-center justify-center text-gray-500 hover:text-emerald-700 transition-colors">
              <Facebook className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-full bg-gray-100 hover:bg-emerald-100 flex items-center justify-center text-gray-500 hover:text-emerald-700 transition-colors">
              <LinkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <RelatedPostsSection posts={relatedPosts} />
      )}
    </div>
  );
}

function RelatedPostsSection({ posts }: { posts: (typeof blogPosts) }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section ref={ref} className="px-6 py-16 bg-[#FAFBFC]">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-10"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          Related{' '}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Articles
          </span>
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 25 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
            >
              <Link href={`/blog/${post.slug}`}>
                <motion.article
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  className="group h-full bg-white rounded-2xl overflow-hidden shadow-md shadow-gray-100/50 border border-gray-100 hover:shadow-xl hover:shadow-emerald-100/30 hover:border-emerald-200/40 transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3
                      className="text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2"
                      style={{ fontFamily: 'var(--font-headline)' }}
                    >
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 flex-1">{post.excerpt}</p>
                    <div className="flex items-center gap-1 mt-4 text-emerald-600 font-semibold text-sm">
                      Read more
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.article>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
