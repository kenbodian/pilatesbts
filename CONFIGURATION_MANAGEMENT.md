# Configuration Management Guide

## Overview

This document explains how business information is managed in the Pilates by the Sea application. All business-related data (contact info, addresses, links, pricing) is centralized in a single configuration file for easy updates and maintenance.

## Configuration File Location

**`src/config/business.ts`**

This file contains all business information used throughout the application.

## What's Centralized

### Business Information

```typescript
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
```

### Helper Functions

The configuration file also provides helper functions for common operations:

#### `getPhoneLink(phone: string): string`
Converts a phone number to a `tel:` link format.

```typescript
// Example usage:
<a href={getPhoneLink(BUSINESS_INFO.phone)}>Call us</a>
// Renders: <a href="tel:3863871738">Call us</a>
```

#### `getEmailLink(email: string, subject?: string): string`
Converts an email to a `mailto:` link with optional subject.

```typescript
// Example usage:
<a href={getEmailLink(BUSINESS_INFO.email)}>Email us</a>
// Renders: <a href="mailto:pilatesbts@gmail.com">Email us</a>

<a href={getEmailLink(BUSINESS_INFO.email, 'Question about pricing')}>Ask about pricing</a>
// Renders: <a href="mailto:pilatesbts@gmail.com?subject=Question%20about%20pricing">Ask about pricing</a>
```

#### `getFormattedAddress(): string`
Returns the complete formatted address.

```typescript
// Example usage:
const address = getFormattedAddress();
// Returns: "140 Via Madrid Drive, Ormond Beach, FL 32176"
```

#### `getGoogleMapsUrl(address: string): string`
Generates a Google Maps search URL for any address.

```typescript
// Example usage:
const mapsUrl = getGoogleMapsUrl(getFormattedAddress());
// Returns: "https://www.google.com/maps/search/?api=1&query=140+Via+Madrid+Drive,+Ormond+Beach,+FL+32176"
```

## How to Update Business Information

### Changing Contact Information

1. Open `src/config/business.ts`
2. Update the relevant fields in `BUSINESS_INFO`
3. Save the file
4. Changes will automatically appear throughout the entire application

**Example: Updating Phone Number**

```typescript
// Before
phone: '(386) 387-1738',

// After
phone: '(386) 555-0123',
```

### Changing Address

```typescript
// Update all address fields
address: {
  street: '123 New Street',
  city: 'New City',
  state: 'FL',
  zip: '12345',
  full: '123 New Street, New City, FL 12345'
}
```

Don't forget to update the Google Maps link if the address changes:

```typescript
links: {
  calendar: 'https://calendar.app.google/5R2natLo42evouFj6',
  googleMaps: 'https://www.google.com/maps/search/?api=1&query=123+New+Street,+New+City,+FL+12345'
}
```

### Changing Pricing

```typescript
pricing: {
  privateLesson: {
    price: 75,        // New price
    duration: 60,     // New duration
    unit: 'minute'
  }
}
```

### Changing Calendar Link

```typescript
links: {
  calendar: 'https://your-new-calendar-link.com',
  googleMaps: '...'
}
```

## Where Configuration is Used

The configuration is imported and used in the following components:

### Dashboard.tsx
- Business name in header
- Phone number and email in Contact card (with clickable links)
- Address in Location card
- Google Maps link in Location card
- Calendar link in Booking card
- Pricing information in Class Policies section

### ErrorBoundary.tsx
- Email address in error message footer (with mailto link)

## Benefits of Centralized Configuration

### ✅ Easy Maintenance
Update business information in one place instead of hunting through multiple files.

### ✅ Consistency
Ensures all parts of the application display the same information.

### ✅ Type Safety
TypeScript interfaces ensure you use the configuration correctly.

### ✅ No Code Changes Needed
Update business information without touching component code.

### ✅ Helper Functions
Pre-built utilities for common operations (phone links, email links, etc.).

## Before & After Comparison

### Before (Hardcoded)
```typescript
// Dashboard.tsx (line 232)
<a href="https://calendar.app.google/5R2natLo42evouFj6">

// Dashboard.tsx (line 276)
<p>Phone: (386) 387-1738</p>

// Dashboard.tsx (line 251-253)
<p>
  140 Via Madrid Drive<br />
  Ormond Beach, FL 32176
</p>

// ErrorBoundary.tsx (line 129)
<a href="mailto:pilatesbts@gmail.com">
```

**Problems:**
- Information scattered across multiple files
- Need to update in 4+ different locations
- Easy to miss updates
- No type safety
- Manual URL encoding for links

### After (Centralized)
```typescript
// All components import from one place
import { BUSINESS_INFO, getEmailLink, getPhoneLink } from '../config/business';

// Dashboard.tsx
<a href={BUSINESS_INFO.links.calendar}>

// Dashboard.tsx
<a href={getPhoneLink(BUSINESS_INFO.phone)}>{BUSINESS_INFO.phone}</a>

// Dashboard.tsx
<p>
  {BUSINESS_INFO.address.street}<br />
  {BUSINESS_INFO.address.city}, {BUSINESS_INFO.address.state} {BUSINESS_INFO.address.zip}
</p>

// ErrorBoundary.tsx
<a href={getEmailLink(BUSINESS_INFO.email)}>
```

**Benefits:**
- Update once in `business.ts`, changes everywhere
- Type-safe with autocomplete
- Helper functions handle URL encoding
- Self-documenting code
- Easier to test

## Adding New Configuration

If you need to add new business information (e.g., social media links, business hours):

1. Open `src/config/business.ts`
2. Add the new information to `BUSINESS_INFO`:

```typescript
export const BUSINESS_INFO = {
  name: 'Pilates by the Sea',
  // ... existing fields ...

  // New fields
  socialMedia: {
    instagram: 'https://instagram.com/pilatesbts',
    facebook: 'https://facebook.com/pilatesbts'
  },
  businessHours: {
    monday: '9am - 6pm',
    tuesday: '9am - 6pm',
    wednesday: '9am - 6pm',
    thursday: '9am - 6pm',
    friday: '9am - 6pm',
    saturday: 'By appointment',
    sunday: 'Closed'
  }
} as const;
```

3. Use the new fields in your components:

```typescript
import { BUSINESS_INFO } from '../config/business';

function Footer() {
  return (
    <div>
      <p>Hours: {BUSINESS_INFO.businessHours.monday}</p>
      <a href={BUSINESS_INFO.socialMedia.instagram}>Follow us on Instagram</a>
    </div>
  );
}
```

## TypeScript Benefits

The configuration uses `as const` to provide:

1. **Autocomplete**: Your IDE will suggest available properties
2. **Type Safety**: Typos in property names will be caught immediately
3. **Immutability**: Configuration values cannot be accidentally modified at runtime

## Best Practices

### ✅ DO:
- Update configuration values in `src/config/business.ts`
- Use helper functions when available (`getPhoneLink`, `getEmailLink`)
- Import only what you need: `import { BUSINESS_INFO } from '../config/business'`
- Add new business information to the config file

### ❌ DON'T:
- Hardcode business information directly in components
- Modify `BUSINESS_INFO` at runtime (it's immutable)
- Create duplicate configuration files
- Bypass helper functions (e.g., manually creating `mailto:` links)

## Deployment

When deploying to Vercel or any other platform, you don't need any special configuration. The business configuration is part of your source code and will be included in the build automatically.

**Note:** This is different from environment variables (`.env` file). The business configuration is public information that's safe to include in your client-side bundle. Sensitive data (API keys, etc.) should still go in environment variables.

## Testing Configuration Changes

After updating the configuration:

1. Run the development server: `npm run dev`
2. Check these pages for updated information:
   - Dashboard (main page after login)
   - Error page (to test ErrorBoundary updates)
3. Verify all links work correctly
4. Test on mobile to ensure text wraps properly

## Summary

The centralized configuration system provides:

- ✅ **Single source of truth** for all business information
- ✅ **Type-safe** access with TypeScript
- ✅ **Easy updates** - change once, update everywhere
- ✅ **Helper functions** for common operations
- ✅ **Better maintainability** - clear separation of data and presentation
- ✅ **Scalability** - easy to add new configuration as business grows

For questions or issues, refer to this guide or check the comments in `src/config/business.ts`.
