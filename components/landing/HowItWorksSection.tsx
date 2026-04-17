import { UserPlus, Search, Package, Truck } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Your Account',
    description: 'Register your company in minutes. No paperwork, no waiting.',
  },
  {
    number: '02',
    icon: Search,
    title: 'Browse Trips',
    description: 'Find available trips by route, date, and transport type.',
  },
  {
    number: '03',
    icon: Package,
    title: 'Book Containers',
    description: 'Select your containers, enter weight, and confirm your booking instantly.',
  },
  {
    number: '04',
    icon: Truck,
    title: 'Track & Receive',
    description: 'Follow your shipment status and receive your invoice automatically.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        {}
        <div className="mb-16 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#4A90D9]">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-[#1B2E5E] md:text-4xl">
            From signup to delivery in 4 steps
          </h2>
        </div>

        {}
        <div className="relative grid gap-10 md:grid-cols-4 md:gap-6">
          {}
          <div className="absolute left-0 right-0 top-10 hidden h-px border-t-2 border-dashed border-[#E5E7EB] md:block"
            style={{ left: '12.5%', right: '12.5%' }}
          />

          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {}
                <div className="relative z-10 flex h-20 w-20 flex-col items-center justify-center rounded-full bg-[#1B2E5E] shadow-lg">
                  <span className="text-xs font-bold text-white/60">{step.number}</span>
                  <Icon className="h-6 w-6 text-white" />
                </div>

                {}
                <h3 className="mt-5 text-base font-bold text-[#1B2E5E]">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
