import { z } from 'zod';
import { InvoiceType } from '../generated/prisma';

const createClaimSchema = z.object({
  date: z.coerce.date(),
  amount: z.number().min(1),
  invoiceType: z.enum([InvoiceType.FINAL, InvoiceType.PROFORMA]),
  remarks: z.string().max(500).optional(),
  billUrl: z.string().url('Bill URL must be a valid URL.'),
});

export const createFormSchema = z.object({
  claims: z.array(createClaimSchema),
});
