import { z } from 'zod'

export const createTripSchema = z
  .object({
    pricing_plan_id: z.string().uuid('Invalid pricing plan'),
    departure_date:  z.string().date('Invalid departure date'),
    arrival_date:    z.string().date('Invalid arrival date'),
    max_containers:  z.number().int().min(1, 'Must have at least 1 container slot'),
  })
  .refine(
    (data) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return new Date(data.departure_date) > today
    },
    {
      message: 'Departure date must be in the future',
      path: ['departure_date'],
    },
  )
  .refine(
    (data) => data.arrival_date > data.departure_date,
    {
      message: 'Arrival date must be after departure date',
      path: ['arrival_date'],
    },
  )

export type CreateTripInput = z.infer<typeof createTripSchema>
