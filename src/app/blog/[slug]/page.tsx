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
      <div className="min-h-screen bg-[#102C26] flex items-center justify-center px-6">
        <div className="text-center">
          <span aria-hidden="true" className="text-[8rem] font-extrabold text-[#0A1C19] leading-none select-none block mb-4">
            404
          </span>
          <h1 className="text-3xl font-extrabold uppercase tracking-tighter text-[#F7E7CE] mb-3">
            Article not found
          </h1>
          <p className="text-[#F7E7CE]/40 text-sm mb-8">The article you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 h-12 px-6 bg-[#F7E7CE] text-[#102C26] font-extrabold uppercase tracking-tighter text-sm hover:bg-[#F7E7CE]/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const relatedPosts = getRelatedPosts(slug, post.category);

  return (
    <div className="min-h-screen bg-[#102C26]">
      {/* Hero Image */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#102C26] via-[#102C26]/40 to-transparent" />

        {/* Back button */}
        <div className="absolute top-24 left-6 md:left-10 z-10">
          <Link href="/blog">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 h-9 px-4 bg-[#0A1C19]/70 backdrop-blur-sm border border-[#F7E7CE]/15 text-[#F7E7CE]/70 text-xs font-bold uppercase tracking-wide hover:text-[#F7E7CE] hover:border-[#F7E7CE]/30 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
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
              <span className="inline-block px-3 py-1 bg-[#F59E0B] text-[#102C26] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                {post.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tighter leading-[0.9] text-[#F7E7CE]">
                {post.title}
              </h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Article Meta & Content */}
      <section className="max-w-4xl mx-auto px-6 md:px-8 bg-[#102C26]">
        {/* Author & Meta Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-between gap-4 py-6 border-b border-[#F7E7CE]/8"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#0A1C19] border border-[#F7E7CE]/12 flex items-center justify-center">
              <span className="text-sm font-bold text-[#F7E7CE]/60">{post.author.avatar}</span>
            </div>
            <div>
              <p className="font-bold text-[#F7E7CE] text-sm uppercase tracking-wide">{post.author.name}</p>
              <p className="text-xs text-[#F7E7CE]/40">{post.author.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs text-[#F7E7CE]/40">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.date)}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </div>
          </div>
        </motion.div>

        {/* Article Body */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="py-10 prose prose-invert prose-lg max-w-none
            prose-headings:font-extrabold prose-headings:uppercase prose-headings:tracking-tighter prose-headings:text-[#F7E7CE]
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-p:text-[#F7E7CE]/55 prose-p:leading-relaxed
            prose-a:text-[#F7E7CE]/70 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
            prose-strong:text-[#F7E7CE]/80
            prose-ul:text-[#F7E7CE]/55
            prose-ol:text-[#F7E7CE]/55
            prose-li:text-[#F7E7CE]/55
            prose-li:marker:text-[#F59E0B]
            prose-blockquote:text-[#F7E7CE]/50 prose-blockquote:border-[#F59E0B]
            prose-code:text-[#F7E7CE]/70 prose-pre:bg-[#0A1C19]
            **:text-[#F7E7CE]/55! [&_h1]:text-[#F7E7CE]! [&_h2]:text-[#F7E7CE]! [&_h3]:text-[#F7E7CE]! [&_h4]:text-[#F7E7CE]! [&_strong]:text-[#F7E7CE]/80! [&_a]:text-[#F7E7CE]/70!"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pb-8 border-b border-[#F7E7CE]/8">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-[#0A1C19] border border-[#F7E7CE]/10 text-[#F7E7CE]/45 text-[10px] font-bold uppercase tracking-[0.15em]"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Share */}
        <div className="flex items-center gap-4 py-8 border-b border-[#F7E7CE]/8">
          <span className="flex items-center gap-2 text-xs font-bold text-[#F7E7CE]/40 uppercase tracking-[0.2em]">
            <Share2 className="w-3.5 h-3.5" />
            Share
          </span>
          <div className="flex gap-2">
            <button className="w-9 h-9 bg-[#0A1C19] border border-[#F7E7CE]/10 hover:bg-[#F7E7CE] flex items-center justify-center text-[#F7E7CE]/50 hover:text-[#102C26] transition-colors">
              <Twitter className="w-3.5 h-3.5" />
            </button>
            <button className="w-9 h-9 bg-[#0A1C19] border border-[#F7E7CE]/10 hover:bg-[#F7E7CE] flex items-center justify-center text-[#F7E7CE]/50 hover:text-[#102C26] transition-colors">
              <Facebook className="w-3.5 h-3.5" />
            </button>
            <button className="w-9 h-9 bg-[#0A1C19] border border-[#F7E7CE]/10 hover:bg-[#F7E7CE] flex items-center justify-center text-[#F7E7CE]/50 hover:text-[#102C26] transition-colors">
              <LinkIcon className="w-3.5 h-3.5" />
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
    <section ref={ref} className="px-6 py-16 bg-[#0A1C19]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-10"
        >
          <div className="w-6 h-px bg-[#F59E0B]" />
          <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tighter text-[#F7E7CE]">
            Related <span className="text-[#F7E7CE]/40">Articles</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-px bg-[#F7E7CE]/8">
          {posts.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 25 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
            >
              <Link href={`/blog/${post.slug}`}>
                <article className="group h-full bg-[#0A1C19] hover:bg-[#F7E7CE] transition-colors duration-300 flex flex-col overflow-hidden">
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-75"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-sm font-extrabold uppercase tracking-tighter text-[#F7E7CE] group-hover:text-[#102C26] mb-2 leading-tight line-clamp-2 transition-colors duration-300">
                      {post.title}
                    </h3>
                    <p className="text-xs text-[#F7E7CE]/40 group-hover:text-[#102C26]/55 line-clamp-2 flex-1 leading-relaxed transition-colors duration-300">{post.excerpt}</p>
                    <div className="flex items-center gap-1 mt-4 text-[#F7E7CE]/40 group-hover:text-[#102C26]/70 font-bold text-xs uppercase tracking-wide transition-colors duration-300">
                      Read more
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
