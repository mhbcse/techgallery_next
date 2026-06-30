import { z } from 'zod'

export const loginSchema = z.object({
  // Accepts an email or a phone number — the API matches either. Sent as `email`.
  email: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  address: z.string().optional(),
})

export const shippingSchema = z.object({
  customer_name: z.string().min(1, 'Full name is required'),
  customer_phone: z.string().min(1, 'Phone number is required'),
  customer_address: z.string().min(1, 'Address is required'),
  // Optional: rides on the order as customer_email.
  customer_email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  // Optional: when set, an account is created (register requires an email).
  customer_password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
}).refine((d) => !d.customer_password || !!(d.customer_email && d.customer_email.length > 0), {
  message: 'Email is required to create a password',
  path: ['customer_email'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type ShippingFormData = z.infer<typeof shippingSchema>
