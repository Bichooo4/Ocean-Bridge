import { z } from 'zod'

export const createCompanySchema = z.object({
  company_name: z.string().min(2).max(100),
  contact_name: z.string().min(2).max(100),
  phone: z.string().max(20).optional(),
  password: z.string().min(8),
  email: z.string().email(),
})

export type CreateCompanyInput = z.infer<typeof createCompanySchema>
