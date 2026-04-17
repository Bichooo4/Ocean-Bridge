import Link from 'next/link'

export function CTASection() {
  return (
    <section id="contact" className="relative overflow-hidden bg-[#1B2E5E] py-24">
      {}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#4A90D9" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {}
      <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#4A90D9] opacity-10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#4A90D9] opacity-10 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-4xl font-extrabold text-white md:text-5xl">
          Ready to ship smarter?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70">
          Join Ocean Bridge today and take control of your logistics.
          Fast setup, zero hassle.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-xl bg-[#4A90D9] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#4A90D9]/30 transition-all hover:bg-[#3a7bc8] hover:shadow-xl"
          >
            Create Free Account
          </Link>
          <Link
            href="/login"
            className="rounded-xl border-2 border-white/30 px-8 py-4 text-base font-bold text-white transition-all hover:border-white/60 hover:bg-white/10"
          >
            Sign In
          </Link>
        </div>

        <p className="mt-6 text-sm text-white/40">
          No credit card required · Setup in 2 minutes
        </p>
      </div>
    </section>
  )
}
