import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Clock, 
  Share2, 
  ThumbsUp, 
  MessageSquare,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import { BLOG_POSTS } from "../posts";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

// Generate static params for Next.js static generation optimization
export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0c0c0c] text-zinc-100 px-4 apple-font">
        <title>Article Not Found | GriVA Journal</title>
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-extrabold text-white uppercase tracking-tight">ARTICLE NOT FOUND</h1>
          <p className="mt-4 text-xs text-zinc-400">
            The journal entry you are looking for has been moved or deleted.
          </p>
          <div className="mt-8">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#e05d00] px-6 py-3 text-xs font-bold text-white transition-all hover:shadow-lg hover:shadow-orange-500/10 active:scale-[0.98]"
            >
              <ArrowLeft className="h-4 w-4" />
              BACK TO JOURNAL
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Schema for BlogPosting structured data
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": [post.image],
    "datePublished": "2026-06-25T08:00:00+03:00",
    "dateModified": "2026-06-26T08:00:00+03:00",
    "author": {
      "@type": "Person",
      "name": post.author,
      "jobTitle": post.role
    },
    "publisher": {
      "@type": "Organization",
      "name": "GriVA Qatar",
      "logo": {
        "@type": "ImageObject",
        "url": "https://thegriva.com/images/logo-light.png"
      }
    },
    "description": post.summary
  };

  // Render markdown paragraphs beautifully
  const renderContent = () => {
    return post.content.split("\n\n").map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // Handle Markdown Headings (e.g., #, ##, ###)
      if (trimmed.startsWith("# ")) {
        return (
          <h1 key={idx} className="text-2xl sm:text-3xl font-extrabold text-white mt-8 mb-4 uppercase tracking-tight border-b border-zinc-800 pb-3">
            {trimmed.replace("# ", "")}
          </h1>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h2 key={idx} className="text-xl sm:text-2xl font-extrabold text-white mt-8 mb-4 uppercase tracking-tight">
            {trimmed.replace("## ", "")}
          </h2>
        );
      }
      if (trimmed.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-lg font-bold text-white mt-6 mb-3 uppercase tracking-tight">
            {trimmed.replace("### ", "")}
          </h3>
        );
      }

      // Handle bullet points
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        const items = trimmed.split(/\n[*|-]\s+/);
        return (
          <ul key={idx} className="list-disc pl-5 my-4 space-y-2 text-zinc-300 text-xs sm:text-sm">
            {items.map((item, itemIdx) => (
              <li key={itemIdx}>{item.replace(/^[*|-]\s+/, "")}</li>
            ))}
          </ul>
        );
      }

      // Handle horizontal rule
      if (trimmed === "---") {
        return <hr key={idx} className="my-8 border-zinc-800" />;
      }

      // Handle paragraph with links or strong styling
      return (
        <p key={idx} className="text-zinc-300 text-xs sm:text-sm leading-relaxed mb-4">
          {trimmed.split(/(\[.*?\]\(.*?\))/g).map((part, partIdx) => {
            const match = part.match(/\[(.*?)\]\((.*?)\)/);
            if (match) {
              return (
                <Link key={partIdx} href={match[2]} className="text-[#FF6A00] font-semibold hover:underline">
                  {match[1]}
                </Link>
              );
            }
            // Parse inline bolding **text**
            const boldMatch = part.split(/(\*\*.*?\*\*)/g);
            return boldMatch.map((subPart, subIdx) => {
              if (subPart.startsWith("**") && subPart.endsWith("**")) {
                return <strong key={subIdx} className="text-white font-bold">{subPart.slice(2, -2)}</strong>;
              }
              return subPart;
            });
          })}
        </p>
      );
    });
  };

  // Context-specific related product suggestions
  const getSuggestedCategory = () => {
    if (post.category === "GAMING") return { name: "GAMING ACCESSORIES", href: "/shop?category=gaming-accessories" };
    if (post.category === "APPLE GUIDE") return { name: "APPLE COMPATIBLE ADAPTERS", href: "/shop?search=apple" };
    if (post.category === "TECH TRENDS") return { name: "ELECTRONICS & GADGETS", href: "/shop?category=gadgets-electronics" };
    return { name: "ALL COLLECTIONS", href: "/shop" };
  };

  const suggestion = getSuggestedCategory();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0c0c0c] text-zinc-100 apple-font">
      <title>{`${post.title} | GriVA Journal`}</title>
      <meta name="description" content={post.summary} />
      <link rel="canonical" href={`https://thegriva.com/blog/${post.slug}`} />
      <BreadcrumbSchema items={[
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: post.title, path: `/blog/${post.slug}` }
      ]} />
      
      {/* Inject BlogPosting JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />

      {/* Decorative glows */}
      <div className="pointer-events-none absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-[#FF6A00]/5 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-40 h-[400px] w-[400px] rounded-full bg-[#FF6A00]/5 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-[#FF6A00] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            BACK TO JOURNAL
          </Link>
        </div>

        {/* ──────── Article Meta ──────── */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-[10px] sm:text-xs text-zinc-500 font-semibold">
            <span className="rounded-md border border-[#FF6A00]/30 bg-[#FF6A00]/5 px-2.5 py-1 text-[#FF6A00] font-bold uppercase tracking-wider">
              {post.category}
            </span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{post.readTime}</span>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold leading-[1.15] text-white sm:text-4xl lg:text-5xl uppercase tracking-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 pt-2">
            <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <User className="h-4 w-4 text-zinc-300" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-200">{post.author}</p>
              <p className="text-[10px] text-zinc-500 font-medium">{post.role}</p>
            </div>
          </div>
        </div>

        {/* ──────── Article Banner Image ──────── */}
        <div className="relative h-64 sm:h-[400px] md:h-[480px] w-full overflow-hidden rounded-3xl border border-zinc-800 mb-12 shadow-2xl">
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {/* ──────── Article Body ──────── */}
        <div className="grid gap-12 lg:grid-cols-3">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="article-body">
              {renderContent()}
            </div>

            {/* Social Interactions */}
            <div className="flex items-center gap-6 border-y border-zinc-900 py-6 mt-12">
              <button className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-[#FF6A00] transition-colors cursor-pointer">
                <ThumbsUp className="h-4 w-4" />
                <span>HELPFUL (28)</span>
              </button>
              <button className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-[#FF6A00] transition-colors cursor-pointer">
                <Share2 className="h-4 w-4" />
                <span>SHARE ARTICLE</span>
              </button>
            </div>
          </div>

          {/* Sidebar Info/CTA Column */}
          <div className="space-y-6">
            
            {/* Direct Shop CTA Card */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-lg text-center relative overflow-hidden">
              {/* background design */}
              <div className="absolute top-0 right-0 h-24 w-24 bg-[#FF6A00]/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="h-10 w-10 mx-auto rounded-xl bg-orange-500/10 flex items-center justify-center text-[#FF6A00]">
                <ShoppingBag className="h-5 w-5" />
              </div>

              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                FEATURED GRIVA GEAR
              </h4>
              
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Shop the authentic products mentioned in this article. Receive 2-4 hour shipping in Doha and pay securely on delivery!
              </p>

              <div className="pt-2">
                <Link
                  href={suggestion.href}
                  className="group/cta flex items-center justify-center gap-1.5 w-full rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#e05d00] py-3 text-xs font-bold text-white transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 active:scale-[0.98]"
                >
                  <span>SHOP {suggestion.name}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 space-y-4 text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#FF6A00] block mb-2">
                STAY UPDATED
              </span>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Subscribe to Tech Digest
              </h4>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Get Qatar's top tech reviews and exclusive GriVA coupon codes delivered directly to your inbox.
              </p>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 py-2.5 px-3.5 text-[10px] text-zinc-100 outline-none focus:border-[#FF6A00]/50"
                />
                <button className="w-full rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold py-2.5 border border-zinc-800 transition-colors cursor-pointer uppercase">
                  SUBSCRIBE
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
