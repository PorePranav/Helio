import { z } from 'zod';

export const createCostCenterSchema = z.object({
  costCenter: z.string().min(2).max(100).trim(),
});

export const createGstStateSchema = z.object({
  gstState: z.string().min(2).max(100).trim(),
});

export const createAccountHeadSchema = z.object({
  accountHead: z.string().min(2).max(100).trim(),
});
