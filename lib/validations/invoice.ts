import { z } from 'zod'

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(['paid', 'unpaid']),
})

export type UpdateInvoiceStatusInput = z.infer<typeof updateInvoiceStatusSchema>
