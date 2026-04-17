import { z } from 'zod'

const containerInputSchema = z.object({
  weight_kg: z.number().positive(),
  description: z.string().max(200).optional(),
})

export const createBookingSchema = z.object({
  trip_id: z.string().uuid(),
  notes: z.string().max(500).optional(),
  containers: z.array(containerInputSchema).min(1),
})

export const updateBookingSchema = z.object({
  notes: z.string().max(500).optional(),
  containers: z.array(containerInputSchema).min(1),
})

export const cancelBookingSchema = z.object({
  cancel_reason: z.string().max(300).optional(),
})

export const approveBookingSchema = z.object({
  booking_id: z.string().uuid(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>
export type ApproveBookingInput = z.infer<typeof approveBookingSchema>
