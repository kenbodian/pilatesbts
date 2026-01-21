/**
 * Centralized error handling utilities for Pilates by the Sea
 */

import { AuthError, PostgrestError } from '@supabase/supabase-js';

export interface AppError {
  message: string;
  userMessage: string;
  code?: string;
  technical?: string;
}

/**
 * Convert various error types into user-friendly messages
 */
export function handleError(error: unknown): AppError {
  // Handle Supabase Auth errors
  if (isAuthError(error)) {
    return handleAuthError(error);
  }

  // Handle Supabase Database errors
  if (isPostgrestError(error)) {
    return handleDatabaseError(error);
  }

  // Handle fetch/network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: 'Network error',
      userMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
      code: 'NETWORK_ERROR',
    };
  }

  // Handle generic Error objects
  if (error instanceof Error) {
    return {
      message: error.message,
      userMessage: 'An unexpected error occurred. Please try again.',
      technical: error.stack,
    };
  }

  // Handle unknown errors
  return {
    message: 'Unknown error',
    userMessage: 'Something went wrong. Please try again later.',
  };
}

/**
 * Handle Supabase authentication errors
 */
function handleAuthError(error: AuthError): AppError {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'The email or password you entered is incorrect. Please try again.',
    'Email not confirmed': 'Please check your email and confirm your account before signing in.',
    'User already registered': 'An account with this email already exists. Please sign in instead.',
    'Password should be at least 6 characters': 'Your password must be at least 6 characters long.',
    'Signup requires a valid password': 'Please enter a valid password (at least 6 characters).',
    'Unable to validate email address': 'Please enter a valid email address.',
    'Email rate limit exceeded': 'Too many attempts. Please wait a few minutes before trying again.',
    'Invalid email or password': 'The email or password you entered is incorrect.',
  };

  const userMessage = errorMap[error.message] || 'Authentication failed. Please try again.';

  return {
    message: error.message,
    userMessage,
    code: error.code,
    technical: error.stack,
  };
}

/**
 * Handle Supabase database errors
 */
function handleDatabaseError(error: PostgrestError): AppError {
  const errorMap: Record<string, string> = {
    '23505': 'This record already exists in the database.',
    '23503': 'Cannot complete this action due to related data.',
    '23502': 'Required information is missing. Please fill in all required fields.',
    '42501': 'You do not have permission to perform this action.',
  };

  const userMessage = error.code && errorMap[error.code]
    ? errorMap[error.code]
    : 'A database error occurred. Please try again.';

  return {
    message: error.message,
    userMessage,
    code: error.code,
    technical: error.hint || error.details,
  };
}

/**
 * Type guard for AuthError
 */
function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    '__isAuthError' in error
  );
}

/**
 * Type guard for PostgrestError
 */
function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'details' in error &&
    'hint' in error
  );
}

/**
 * Log errors to console in development, send to monitoring service in production
 */
export function logError(error: AppError, context?: string): void {
  if (import.meta.env.DEV) {
    console.group(`❌ Error${context ? ` in ${context}` : ''}`);
    console.error('User Message:', error.userMessage);
    console.error('Technical Message:', error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.technical) console.error('Details:', error.technical);
    console.groupEnd();
  } else {
    // In production, you would send this to a service like Sentry
    console.error('Error:', error.message);
    // Example: Sentry.captureException(error);
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (US format)
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  // Check if it's 10 or 11 digits (with or without country code)
  return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * Format phone number to (XXX) XXX-XXXX
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

/**
 * Validate password strength
 */
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
