"use client";

export default function NewsletterSection() {
  return (
    <section className="w-full  md:py-10 px-4 sm:px-6 lg:px-0">
      <div className="mx-auto max-w-7xl rounded-[8px] p-4 bg-[#8990f1] sm:p-6 lg:p-8">
        <div className="flex flex-col items-center gap-3 text-center lg:flex-row lg:justify-between lg:text-left">

          {/* Left Content */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
              Newsletter
            </p>
            <h2 className="mt-1 text-3xl font-black text-white">
              Sign Up & Get 20% Off
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Join thousands of subscribers. No spam, ever.
            </p>
          </div>

          {/* Right Form */}
          <div className="flex w-full max-w-lg overflow-hidden rounded-md shadow-lg lg:w-auto">
            <input
              type="email"
              placeholder="Enter your email address..."
              className="flex-1 bg-white px-6 py-4 text-sm text-black outline-none placeholder:text-gray-400 min-w-0"
            />
            <button
              type="submit"
              className="bg-black px-7 py-4 text-xs font-black uppercase tracking-widest text-white transition duration-300 hover:bg-gray-800 whitespace-nowrap"
            >
              Subscribe
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}