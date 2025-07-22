
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation schemas
export const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  phone: z.string().optional(),
  location: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms and conditions')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const dogListingSchema = z.object({
  dog_name: z.string().min(2, 'Dog name must be at least 2 characters'),
  breed: z.string().min(2, 'Breed must be at least 2 characters'),
  age: z.number().min(0, 'Age must be a positive number').max(20, 'Age must be realistic'),
  price: z.number().min(0, 'Price must be a positive number'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(2, 'Location is required'),
  image_url: z.string().url('Please provide a valid image URL').optional()
});

export const profileUpdateSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  website_url: z.string().url('Please enter a valid URL').optional().or(z.literal(''))
});

export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message must be less than 1000 characters')
});

// Custom validation hooks
export const useValidatedForm = <T extends z.ZodType<any, any>>(schema: T) => {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onChange'
  });
};

// Field validation helpers
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim().length === 0) return `${fieldName} is required`;
  return null;
};

export const validatePhoneNumber = (phone: string): string | null => {
  if (!phone) return null; // Optional field
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  if (!phoneRegex.test(phone)) return 'Please enter a valid phone number';
  return null;
};

export const validateUrl = (url: string): string | null => {
  if (!url) return null; // Optional field
  try {
    new URL(url);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
};

// Export types for form data
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type DogListingFormData = z.infer<typeof dogListingSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
