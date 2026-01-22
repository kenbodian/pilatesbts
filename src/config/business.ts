/**
 * Business Information Configuration
 *
 * This file contains all business-related information used throughout the application.
 * Update these values to change business information across the entire site.
 */

export const BUSINESS_INFO = {
  name: 'Pilates by the Sea',
  phone: '(386) 387-1738',
  email: 'pilatesbts@gmail.com',
  address: {
    street: '140 Via Madrid Drive',
    city: 'Ormond Beach',
    state: 'FL',
    zip: '32176',
    full: '140 Via Madrid Drive, Ormond Beach, FL 32176'
  },
  links: {
    calendar: 'https://calendar.app.google/5R2natLo42evouFj6',
    googleMaps: 'https://www.google.com/maps/search/?api=1&query=140+Via+Madrid+Drive,+Ormond+Beach,+FL+32176'
  },
  pricing: {
    privateLesson: {
      price: 65,
      duration: 50,
      unit: 'minute'
    }
  }
} as const;

/**
 * Helper function to format phone number for tel: links
 */
export function getPhoneLink(phone: string): string {
  return `tel:${phone.replace(/\D/g, '')}`;
}

/**
 * Helper function to format email for mailto: links
 */
export function getEmailLink(email: string, subject?: string): string {
  const mailtoUrl = `mailto:${email}`;
  return subject ? `${mailtoUrl}?subject=${encodeURIComponent(subject)}` : mailtoUrl;
}

/**
 * Helper function to get formatted address
 */
export function getFormattedAddress(): string {
  const { street, city, state, zip } = BUSINESS_INFO.address;
  return `${street}, ${city}, ${state} ${zip}`;
}

/**
 * Helper function to get Google Maps search URL
 */
export function getGoogleMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
