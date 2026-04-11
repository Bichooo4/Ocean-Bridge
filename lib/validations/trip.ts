import { z } from 'zod'

export const createTripSchema = z.object({
  pricing_plan_id: z.string().uuid(),
  departure_date: z.string().date(),
  arrival_date: z.string().date(),
  max_containers: z.number().int().min(1),
}).refine(data => data.arrival_date > data.departure_date, {
  message: 'arrival_date must be after departure_date',
  path: ['arrival_date'],
})

export type CreateTripInput = z.infer<typeof createTripSchema>
