import { z } from 'zod';

export const AccountTypeEnum = z.enum(['SAVINGS', 'CURRENT']);

export const createKycSchema = z
  .object({
    bankAccountName: z
      .string()
      .min(2, 'Bank account name must be at least 2 characters long.'),
    bankName: z
      .string()
      .min(2, 'Bank name must be at least 2 characters long.'),
    accountType: AccountTypeEnum,
    accountNumber: z
      .string()
      .min(5, 'Account number seems too short.')
      .max(20, 'Account number seems too long.'),
    ifscCode: z
      .string()
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format.'),
    panNumber: z
      .string()
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format.'),
    gstRegistered: z.boolean().default(false),
    gstNumber: z
      .string()
      .regex(
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        'Invalid GST number format.'
      )
      .optional()
      .nullable(),
    bankDetailsUrl: z.url('Bank details URL must be a valid URL.'),
    panCardUrl: z.url('PAN card URL must be a valid URL.'),
    gstCertificateUrl: z
      .url('GST certificate URL must be a valid URL.')
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.gstRegistered || data.gstNumber) return !!data.gstNumber;
      return true;
    },
    {
      message: 'GST number is required when GST is registered.',
      path: ['gstNumber'],
    }
  )
  .refine(
    (data) => {
      if (data.gstRegistered) return !!data.gstCertificateUrl;

      return true;
    },
    {
      message: 'GST certificate URL is required when GST is registered.',
      path: ['gstCertificateUrl'],
    }
  );

export const updateKycSchema = createKycSchema.partial();

export type CreateKycInput = z.infer<typeof createKycSchema>;
export type UpdateKycInput = z.infer<typeof updateKycSchema>;
