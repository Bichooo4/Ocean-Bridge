// Server Component
// Features section — highlights the 3 core platform capabilities.
// Static content — icons from lucide-react.

import { Ship, Package, FileText } from 'lucide-react'

const FEATURES = [
  {
    icon: Ship,
    color: 'bg-blue-50 text-[#4A90D9]',
    title: 'Book Any Route',
    description:
      'Browse available trips across sea, truck, and air freight. Book containers in seconds with instant pricing.',
  },
  {
    icon: Package,
    color: 'bg-indigo-50 text-indigo-500',
    title: 'Track Every Shipment',
    description:
      'Follow your cargo through every status — from warehouse to final delivery. Always know where your goods are.',
  },
  {
    icon: FileText,
    color: 'bg-sky-50 text-sky-500',
    title: 'Instant Invoices',
    description:
      'Auto-generated invoices for every booking. View, download, and manage payments in one clean dashboard.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="bg-[#F8F9FB] py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mb-16 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#4A90D9]">
            Platform Features
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-[#1B2E5E] md:text-4xl">
            Everything you need to ship at scale
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#6B7280]">
            One platform to book, track, and manage all your freight — no matter the route or transport type.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-[#E5E7EB] bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                {/* Icon circle */}
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mb-2 text-lg font-bold text-[#1B2E5E]">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-[#6B7280]">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
