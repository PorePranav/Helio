import { z } from 'zod';
import { Role } from '../generated/prisma';

export const signupAdminSchema = z.object({
  name: z.string().min(2, 'Name is required').max(50, 'Name is too long'),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string(),
  role: z.enum([Role.SUPER_ADMIN, Role.OPERATOR]),
});

export const updateAdminDetailsSchema = z.object({
  name: z
    .string()
    .min(2, 'Name is required')
    .max(50, 'Name is too long')
    .optional(),
  email: z.email('Invalid email address').optional(),
});

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string(),
});

export const signupUserSchema = z.object({
  name: z.string().min(2, 'Name is required').max(50, 'Name is too long'),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string(),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits long'),
  role: z.enum([Role.INDIVIDUAL, Role.VENDOR]),
});

export const forgotPasswordSchema = z.object({
  email: z.email('Invalid email address'),
});

export const changePasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string(),
});

export const updateUserEmailSchema = z.object({
  newEmail: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
