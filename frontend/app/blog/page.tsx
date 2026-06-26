"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Search, 
  Calendar, 
  User, 
  Clock, 
  ArrowRight, 
  BookOpen,
  X
} from "lucide-react";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { BLOG_POSTS } from "./posts";

const CATEGORIES = ["ALL TRENDS", "TECH TRENDS", "DELIVERY & COD", "APPLE GUIDE", "GAMING"];

export default function BlogListingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL TRENDS");

  // Filter posts based on category and search query
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      // Exclude featured post from the grid ONLY if we are rendering it as the featured hero layout
      const isDisplayingAsFeaturedHero = searchQuery === "" && selectedCategory === "ALL TRENDS";
      if (isDisplayingAsFeaturedHero && post.featured) {
        return false;
      }

      const matchesCategory =
        selectedCategory === "ALL TRENDS" || post.category === selectedCategory;
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Separate featured post (only from the unfiltered list to maintain highlight)
  const featuredPost = useMemo(() => {
    return BLOG_POSTS.find((post) => post.featured);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0c0c0c] text-zinc-100 apple-font">
      <title>GriVA Journal — Qatar Tech Trends, Guides & E-Commerce Blog</title>
      <meta name="description" content="Explore Qatar's premium tech blog. Discover 2026 gadget trends, apple integration guides, mobile gaming tutorials, and Doha shipping logistics insights." />
      <link rel="canonical" href="https://thegriva.com/blog" />
      <BreadcrumbSchema items={[
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" }
      ]} />

      {/* Decorative glows */}
      <div className="pointer-events-none absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-[#FF6A00]/5 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-40 h-[400px] w-[400px] rounded-full bg-[#FF6A00]/5 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        
        {/* ──────── Header Section ──────── */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#FF6A00] block mb-2">
            GRIVA INSIGHTS
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl uppercase">
            THE GRIVA JOURNAL
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Your definitive source for premium gadget trends, hardware compatibility guides, and localized e-commerce updates in Qatar. Written by industry experts.
          </p>
        </div>

        {/* ──────── Search & Filter Bar ──────── */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-zinc-800 pb-8">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 order-2 md:order-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-[#FF6A00] to-[#e05d00] text-white shadow-md"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80 order-1 md:order-2">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search articles & tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-3 pl-10 pr-10 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-300 focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* Search Results Summary */}
        {(searchQuery !== "" || selectedCategory !== "ALL TRENDS") && (
          <div className="mb-12 flex items-center justify-between text-xs text-zinc-400 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4">
            <div>
              SHOWING <span className="text-[#FF6A00] font-extrabold">{filteredPosts.length}</span> {filteredPosts.length === 1 ? "ARTICLE" : "ARTICLES"} 
              {selectedCategory !== "ALL TRENDS" && <> IN <span className="text-white font-extrabold">{selectedCategory}</span></>}
              {searchQuery !== "" && <> MATCHING <span className="text-white font-extrabold">"{searchQuery.toUpperCase()}"</span></>}
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL TRENDS");
              }}
              className="text-xs font-bold text-[#FF6A00] hover:text-[#ff8432] transition-colors uppercase tracking-wider cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* ──────── Featured Post (Only show if no search/filter is active) ──────── */}
        {featuredPost && searchQuery === "" && selectedCategory === "ALL TRENDS" && (
          <div className="mb-16">
            <div className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 transition-all duration-500 hover:border-zinc-700/60 shadow-xl">
              <div className="grid gap-8 md:grid-cols-2 items-center">
                <div className="relative h-64 sm:h-80 md:h-[400px] overflow-hidden rounded-2xl">
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    sizes="(max-w-768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute top-4 left-4 rounded-xl bg-[#FF6A00] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Featured
                  </div>
                </div>

                <div className="flex flex-col justify-center space-y-4">
                  <div className="flex items-center gap-4 text-[10px] sm:text-xs text-zinc-500 font-semibold">
                    <span className="rounded-md border border-[#FF6A00]/30 bg-[#FF6A00]/5 px-2.5 py-1 text-[#FF6A00] font-bold uppercase">
                      {featuredPost.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{featuredPost.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl leading-tight group-hover:text-[#FF6A00] transition-colors duration-300 uppercase">
                    <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                  </h2>

                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {featuredPost.summary}
                  </p>

                  {/* Clickable Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {featuredPost.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={(e) => {
                          e.preventDefault();
                          setSearchQuery(tag);
                        }}
                        className="rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 px-2 py-1 text-[9px] font-semibold text-zinc-400 hover:text-white transition-all cursor-pointer"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                      <User className="h-4 w-4 text-zinc-300" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-200">{featuredPost.author}</p>
                      <p className="text-[10px] text-zinc-500 font-medium">{featuredPost.role}</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="group/btn inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-6 py-3 text-xs font-bold text-white transition-all duration-300 hover:bg-zinc-800 hover:border-zinc-700 active:scale-[0.98]"
                    >
                      Read Full Article
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────── Articles Grid ──────── */}
        {filteredPosts.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/60 shadow-md"
              >
                <div className="relative h-48 sm:h-52 w-full overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-w-768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 rounded-lg bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-zinc-300 border border-zinc-800">
                    {post.category}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5 space-y-3">
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-semibold">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug group-hover:text-[#FF6A00] transition-colors duration-300 line-clamp-2 uppercase">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed flex-1">
                    {post.summary}
                  </p>

                  {/* Clickable Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={(e) => {
                          e.preventDefault();
                          setSearchQuery(tag);
                        }}
                        className="rounded-md bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-900/80 hover:border-zinc-800 px-2 py-0.5 text-[9px] font-semibold text-zinc-400 hover:text-white transition-all cursor-pointer"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-900 pt-4 mt-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                        <User className="h-3.5 w-3.5 text-zinc-400" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-300">{post.author}</span>
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FF6A00] transition-all hover:text-[#ff8432] group/link"
                    >
                      Read Post
                      <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-zinc-800 rounded-3xl bg-zinc-950/20">
            <BookOpen className="mx-auto h-10 w-10 text-zinc-600 mb-4" />
            <h3 className="text-base font-bold text-zinc-300 uppercase">No Articles Found</h3>
            <p className="text-xs text-zinc-500 mt-2">
              Try adjusting your filters or search keywords.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
