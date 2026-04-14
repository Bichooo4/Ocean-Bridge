// Server Component
// Stats band — social proof numbers shown below the hero.
// Static data — update manually as business grows.

const STATS = [
  { value: '500+', label: 'Active Shipments'  },
  { value: '50+',  label: 'Global Routes'     },
  { value: '200+', label: 'Companies Onboard' },
  { value: '99%',  label: 'On-Time Delivery'  },
]

export function StatsSection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-2 text-center"
            >
              {/* Blue accent line */}
              <span className="mb-1 block h-1 w-8 rounded-full bg-[#4A90D9]" />

              <p className="text-4xl font-extrabold text-[#1B2E5E] md:text-5xl">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-[#6B7280]">{stat.label}</p>

              {/* Vertical divider (visible between stats on desktop, not after last) */}
              {i < STATS.length - 1 && (
                <div className="absolute hidden md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
