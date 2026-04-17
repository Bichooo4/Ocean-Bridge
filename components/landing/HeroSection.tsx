import Link from 'next/link'

function ShipIllustration() {
  return (
    <svg
      viewBox="0 0 480 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-float h-full w-full"
      aria-hidden="true"
    >
      {}
      {[
        [40, 30], [90, 55], [140, 20], [300, 40], [380, 25],
        [420, 70], [460, 35], [200, 15], [250, 50],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={2} fill="white" opacity={0.4 + (i % 3) * 0.2} />
      ))}

      {}
      <circle cx="430" cy="50" r="22" fill="white" opacity="0.12" />
      <circle cx="440" cy="44" r="18" fill="#1B2E5E" opacity="0.8" />

      {}
      <ellipse cx="240" cy="310" rx="220" ry="28" fill="#4A90D9" opacity="0.25" />
      <ellipse cx="240" cy="322" rx="220" ry="22" fill="#4A90D9" opacity="0.35" />
      <ellipse cx="240" cy="334" rx="220" ry="18" fill="#4A90D9" opacity="0.5" />

      {}
      <path d="M20 305 Q80 295 140 305 Q200 315 260 305 Q320 295 380 305 Q430 312 460 305"
        stroke="white" strokeWidth="1.5" strokeOpacity="0.3" fill="none" />
      <path d="M10 318 Q70 308 130 318 Q190 328 250 318 Q310 308 370 318 Q430 325 470 318"
        stroke="white" strokeWidth="1.5" strokeOpacity="0.2" fill="none" />

      {}
      <path d="M80 270 L100 230 L380 230 L400 270 Q390 290 240 295 Q90 290 80 270Z"
        fill="#1a3a6e" stroke="#4A90D9" strokeWidth="1.5" />

      {}
      <path d="M100 260 L380 260" stroke="#4A90D9" strokeWidth="1" strokeOpacity="0.4" />

      {}
      <rect x="120" y="200" width="240" height="32" rx="4" fill="#1e4080" stroke="#4A90D9" strokeWidth="1" />

      {}
      {}
      <rect x="130" y="170" width="44" height="32" rx="3" fill="#4A90D9" opacity="0.9" />
      <rect x="180" y="170" width="44" height="32" rx="3" fill="#2563a8" opacity="0.9" />
      <rect x="230" y="170" width="44" height="32" rx="3" fill="#4A90D9" opacity="0.9" />
      <rect x="280" y="170" width="44" height="32" rx="3" fill="#2563a8" opacity="0.9" />

      {}
      <line x1="152" y1="170" x2="152" y2="202" stroke="white" strokeWidth="0.8" strokeOpacity="0.4" />
      <line x1="202" y1="170" x2="202" y2="202" stroke="white" strokeWidth="0.8" strokeOpacity="0.4" />
      <line x1="252" y1="170" x2="252" y2="202" stroke="white" strokeWidth="0.8" strokeOpacity="0.4" />
      <line x1="302" y1="170" x2="302" y2="202" stroke="white" strokeWidth="0.8" strokeOpacity="0.4" />

      {}
      <rect x="155" y="142" width="44" height="30" rx="3" fill="#3478c0" opacity="0.9" />
      <rect x="205" y="142" width="44" height="30" rx="3" fill="#4A90D9" opacity="0.9" />
      <rect x="255" y="142" width="44" height="30" rx="3" fill="#3478c0" opacity="0.9" />

      <line x1="177" y1="142" x2="177" y2="172" stroke="white" strokeWidth="0.8" strokeOpacity="0.4" />
      <line x1="227" y1="142" x2="227" y2="172" stroke="white" strokeWidth="0.8" strokeOpacity="0.4" />
      <line x1="277" y1="142" x2="277" y2="172" stroke="white" strokeWidth="0.8" strokeOpacity="0.4" />

      {}
      <rect x="300" y="130" width="60" height="72" rx="4" fill="#162d5a" stroke="#4A90D9" strokeWidth="1" />
      {}
      <rect x="308" y="140" width="14" height="10" rx="2" fill="#4A90D9" opacity="0.7" />
      <rect x="328" y="140" width="14" height="10" rx="2" fill="#4A90D9" opacity="0.7" />
      <rect x="348" y="140" width="6" height="10" rx="2" fill="#4A90D9" opacity="0.7" />
      {}
      <rect x="308" y="158" width="44" height="8" rx="2" fill="#4A90D9" opacity="0.3" />

      {}
      <rect x="316" y="108" width="14" height="26" rx="3" fill="#1e4080" stroke="#4A90D9" strokeWidth="1" />
      {}
      <circle cx="323" cy="96" r="8" fill="white" opacity="0.12" />
      <circle cx="330" cy="80" r="10" fill="white" opacity="0.08" />
      <circle cx="320" cy="68" r="7" fill="white" opacity="0.06" />

      {}
      <line x1="240" y1="130" x2="240" y2="200" stroke="#4A90D9" strokeWidth="2" strokeOpacity="0.6" />
      <line x1="200" y1="150" x2="280" y2="150" stroke="#4A90D9" strokeWidth="1.5" strokeOpacity="0.4" />

      {}
      <text x="175" y="268" fontSize="16" fill="white" opacity="0.15" fontFamily="serif">⚓</text>

      {}
      <rect x="120" y="295" width="240" height="6" rx="3" fill="#4A90D9" opacity="0.15" />
      <rect x="150" y="305" width="180" height="4" rx="2" fill="#4A90D9" opacity="0.1" />

      {}
      <circle cx="60" cy="200" r="3" fill="#4A90D9" opacity="0.3" />
      <circle cx="440" cy="180" r="4" fill="#4A90D9" opacity="0.25" />
      <circle cx="420" cy="240" r="2.5" fill="white" opacity="0.2" />
      <circle cx="55" cy="260" r="2" fill="white" opacity="0.2" />
    </svg>
  )
}

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#1B2E5E]">
      {}
      <div className="hero-grid-bg absolute inset-0" />

      {}
      <div
        className="absolute right-0 top-1/2 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/4 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #4A90D9 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-12 px-6 md:flex-row md:gap-8">
        {}
        <div className="flex flex-1 flex-col items-start gap-8">
          {}
          <span className="animate-fade-in-up-1 inline-flex items-center gap-2 rounded-full border border-[#4A90D9]/30 bg-[#4A90D9]/10 px-4 py-1.5 text-sm font-medium text-[#4A90D9]">
            🚢 Trusted Logistics Platform
          </span>

          {}
          <div className="flex flex-col gap-1">
            <h1 className="animate-fade-in-up-2 text-5xl font-extrabold leading-tight tracking-tight text-white md:text-7xl">
              Move Cargo.
            </h1>
            <h1 className="animate-fade-in-up-3 text-5xl font-extrabold leading-tight tracking-tight text-white md:text-7xl">
              Ship Smart.
            </h1>
            <h1 className="animate-fade-in-up-4 text-5xl font-extrabold leading-tight tracking-tight text-[#4A90D9] md:text-7xl">
              Deliver Strong.
            </h1>
          </div>

          {}
          <p className="animate-fade-in-up-4 max-w-lg text-lg leading-relaxed text-white/70">
            Ocean Bridge connects companies with freight routes across sea, land, and air.
            Book, track, and manage your shipments — all in one place.
          </p>

          {}
          <div className="animate-fade-in-up-4 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-xl bg-[#4A90D9] px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-[#4A90D9]/30 transition-all hover:bg-[#3a7bc8] hover:shadow-xl"
            >
              Start Shipping
            </Link>
            <Link
              href="/login"
              className="rounded-xl border-2 border-white/30 px-7 py-3.5 text-base font-bold text-white transition-all hover:border-white/60 hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>

          {}
          <p className="text-sm text-white/40">
            Join 200+ companies shipping smarter
          </p>
        </div>

        {}
        <div className="hidden w-full max-w-md md:block lg:max-w-lg">
          <ShipIllustration />
        </div>
      </div>

      {}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F8F9FB] to-transparent" />
    </section>
  )
}
