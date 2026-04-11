import { z } from 'zod'

export const createPricingPlanSchema = z.object({
  from_location: z.string().min(2).max(100),
  to_location: z.string().min(2).max(100),
  transport_type: z.enum(['ship', 'truck', 'airplane']),
  base_price: z.number().min(0),
  per_kg_rate: z.number().min(0),
}).refine(data => data.from_location !== data.to_location, {
  message: 'from_location and to_location must be different',
  path: ['to_location'],
})

export type CreatePricingPlanInput = z.infer<typeof createPricingPlanSchema>
