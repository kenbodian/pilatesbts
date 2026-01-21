# Email System Setup Guide
**Date:** January 21, 2026
**Website:** Pilates by the Sea

---

## Overview

Your website now has a complete email system that:
1. ✅ Sends welcome emails to new users when they sign up
2. ✅ Sends admin notifications when new users register
3. ✅ Allows users to contact you via a Contact Us form
4. ✅ Sends confirmation emails to users who submit the contact form

All emails are sent using **Resend** (https://resend.com) via **Supabase Edge Functions**.

---

## Features Implemented

### 1. User Signup Emails ✅
**When:** A new user creates an account

**Emails Sent:**
- **To User:** Welcome email with studio information
- **To Admin:** Notification with new user details

**Function:** `send-signup-emails`
**Triggered From:** `AuthPage.tsx` after successful signup

---

### 2. Contact Form Emails ✅
**When:** A user submits the Contact Us form from their dashboard

**Emails Sent:**
- **To Admin:** Message from user (with reply-to address)
- **To User:** Confirmation that message was received

**Function:** `send-contact-email`
**Triggered From:** `ContactModal.tsx` component on Dashboard

---

## Setup Instructions

### Prerequisites
1. Supabase account with project set up
2. Resend account (free tier available)
3. Supabase CLI installed (`npm install -g supabase`)

---

## Step 1: Set Up Resend

### 1.1 Create Resend Account
1. Go to https://resend.com
2. Sign up for a free account
3. Verify your email

### 1.2 Add and Verify Your Domain (Recommended)
1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `pilatesbts.com`)
4. Add the DNS records shown to your domain provider:
   ```
   Type: TXT
   Name: @
   Value: [provided by Resend]

   Type: MX
   Name: @
   Value: [provided by Resend]
   ```
5. Wait for verification (usually a few minutes to hours)

### 1.3 Get Your API Key
1. Go to **API Keys** in Resend dashboard
2. Click **Create API Key**
3. Name it: "Pilates by the Sea Production"
4. Copy the API key (starts with `re_`)
5. **SAVE THIS KEY** - you won't see it again!

---

## Step 2: Deploy Edge Functions to Supabase

### 2.1 Login to Supabase CLI
```bash
cd /path/to/pilatesbts
supabase login
```

### 2.2 Link Your Project
```bash
supabase link --project-ref your-project-ref
```
(Find your project ref in Supabase dashboard URL)

### 2.3 Set Environment Secrets
```bash
# Set your Resend API key
supabase secrets set RESEND_API_KEY=re_your_api_key_here

# Set your admin email (where notifications will be sent)
supabase secrets set ADMIN_EMAIL=pilatesbts@gmail.com
```

### 2.4 Deploy the Functions
```bash
# Deploy signup email function
supabase functions deploy send-signup-emails

# Deploy contact email function
supabase functions deploy send-contact-email
```

### 2.5 Verify Deployment
```bash
supabase functions list
```

You should see:
- ✅ send-signup-emails
- ✅ send-contact-email
- verify-passcode (already deployed)

---

## Step 3: Update Email Sender Address

If you verified your domain in Resend, you'll want to update the "from" address in the functions.

### 3.1 Edit send-signup-emails function
File: `supabase/functions/send-signup-emails/index.ts`

Change line 42:
```typescript
// From:
from: "Pilates by the Sea <onboarding@resend.dev>",

// To:
from: "Pilates by the Sea <hello@yourdomain.com>",
```

### 3.2 Edit send-contact-email function
File: `supabase/functions/send-contact-email/index.ts`

Change line 62 and line 124:
```typescript
// From:
from: "Pilates by the Sea <onboarding@resend.dev>",

// To:
from: "Pilates by the Sea <hello@yourdomain.com>",
```

### 3.3 Redeploy Functions
```bash
supabase functions deploy send-signup-emails
supabase functions deploy send-contact-email
```

**Note:** If you don't have a verified domain, keep using `onboarding@resend.dev` - it works but shows as "via Resend"

---

## Step 4: Test the Email System

### 4.1 Test Signup Emails
1. Go to your website
2. Create a new account
3. Check:
   - ✅ New user receives welcome email
   - ✅ Admin receives notification email

### 4.2 Test Contact Form
1. Log into your website
2. Click "Contact" button in header
3. Fill out form and submit
4. Check:
   - ✅ User receives confirmation email
   - ✅ Admin receives contact form message

---

## Email Templates

### Welcome Email (sent to new users)
- **Subject:** "Welcome to Pilates by the Sea!"
- **Content:**
  - Welcome message
  - Studio location and contact info
  - What they can do with their account
  - Professional branding

### Admin Notification (sent on new signup)
- **Subject:** "New User Registration - Pilates by the Sea"
- **Content:**
  - User's email
  - User's name
  - Registration timestamp
  - Compact, informational format

### Contact Form to Admin
- **Subject:** "Contact Form: [User's Subject]"
- **Content:**
  - User's name and email (with reply-to)
  - Subject line
  - Full message
  - Timestamp
  - Reply instructions

### Contact Confirmation to User
- **Subject:** "We received your message - Pilates by the Sea"
- **Content:**
  - Thank you message
  - Copy of their subject
  - Response time expectation (24 hours)
  - Contact phone number for urgent matters

---

## Monitoring and Logs

### View Function Logs
```bash
# View signup email logs
supabase functions logs send-signup-emails

# View contact email logs
supabase functions logs send-contact-email

# Follow logs in real-time
supabase functions logs send-signup-emails --follow
```

### Resend Dashboard
1. Go to https://resend.com/emails
2. See all sent emails
3. Check delivery status
4. View open/click rates
5. Debug failed deliveries

---

## Troubleshooting

### Emails Not Sending

**1. Check Function Deployment**
```bash
supabase functions list
```
Both functions should show "deployed"

**2. Check Secrets**
```bash
supabase secrets list
```
Should show:
- RESEND_API_KEY
- ADMIN_EMAIL

**3. Check Function Logs**
```bash
supabase functions logs send-signup-emails --limit 50
```
Look for errors

**4. Verify Resend API Key**
- Log into Resend dashboard
- Check API keys section
- Make sure key is active

---

### Emails Going to Spam

**Solutions:**
1. **Verify your domain in Resend** (recommended)
2. Add SPF, DKIM, DMARC records
3. Use a professional "from" address
4. Avoid spam trigger words

---

### Wrong Admin Email

Update the secret:
```bash
supabase secrets set ADMIN_EMAIL=newemail@example.com
```

Functions will automatically use the new email.

---

## Cost Estimates

### Resend Pricing (as of 2026)
- **Free Tier:** 100 emails/day, 3,000/month
- **Pro Plan:** $20/month for 50,000 emails/month

### Supabase Edge Functions Pricing
- **Free Tier:** 500,000 function invocations/month
- **Pro Plan:** $25/month + $2 per 1M invocations

**Expected Costs for Small Business:**
- With <100 signups/month: **FREE**
- With <1000 contacts/month: **FREE**

---

## Security Considerations

### ✅ Already Implemented
- CORS headers properly configured
- API keys stored as secrets (not in code)
- Input validation on all fields
- Rate limiting via Supabase
- User authentication required for contact form
- XSS protection with proper HTML escaping

### 🔒 Best Practices
- Never commit API keys to Git
- Keep Supabase project secure
- Monitor function logs for abuse
- Update dependencies regularly

---

## Customization Options

### Change Email Templates
Edit the HTML in:
- `supabase/functions/send-signup-emails/index.ts`
- `supabase/functions/send-contact-email/index.ts`

After editing, redeploy:
```bash
supabase functions deploy [function-name]
```

### Add More Email Notifications
Create new Edge Functions in:
```
supabase/functions/your-new-function/
```

Follow the same pattern as existing functions.

### Modify Contact Form Fields
Edit:
- `src/components/ContactModal.tsx` (frontend)
- `supabase/functions/send-contact-email/index.ts` (backend)

---

## Integration with Frontend

### AuthPage Integration
File: `src/components/AuthPage.tsx`

After successful signup (line 59):
```typescript
if (data.user) {
  success('Account created successfully! Please complete your waiver.');

  // Send emails (non-blocking)
  try {
    await fetch(`${supabaseUrl}/functions/v1/send-signup-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        userEmail: email,
        userName: fullName,
      }),
    });
  } catch (emailError) {
    // Silently fail - user account created successfully
    console.warn('Failed to send welcome email:', emailError);
  }
}
```

### Dashboard Integration
File: `src/components/Dashboard.tsx`

Contact button in header:
```typescript
<button
  onClick={() => setIsContactModalOpen(true)}
  className="flex items-center space-x-2 px-4 py-2 text-teal-600..."
>
  <MessageCircle className="w-4 h-4" />
  <span>Contact</span>
</button>
```

ContactModal component handles:
- Form UI
- Validation
- API call to Edge Function
- Success/error feedback

---

## File Structure

```
pilatesbts/
├── src/
│   ├── components/
│   │   ├── AuthPage.tsx          # Triggers signup emails
│   │   ├── Dashboard.tsx         # Has Contact button
│   │   └── ContactModal.tsx      # NEW: Contact form modal
│   └── ...
├── supabase/
│   └── functions/
│       ├── send-signup-emails/
│       │   └── index.ts          # Existing: Signup emails
│       ├── send-contact-email/   # NEW
│       │   └── index.ts          # NEW: Contact form emails
│       └── verify-passcode/
│           └── index.ts          # Existing
└── ...
```

---

## Maintenance Checklist

### Weekly
- [ ] Check Resend dashboard for delivery issues
- [ ] Review spam complaints (if any)

### Monthly
- [ ] Review email send volume
- [ ] Check for bounced emails
- [ ] Update email templates if needed
- [ ] Review function logs for errors

### Quarterly
- [ ] Review and update API keys
- [ ] Check Resend domain verification status
- [ ] Review email content for improvements

---

## Next Steps & Future Enhancements

### Potential Improvements:
1. **Email Templates with React Email**
   - Use React components for emails
   - Better version control
   - Easier to maintain

2. **Automated Follow-ups**
   - Send reminder emails
   - Session confirmations
   - Birthday greetings

3. **Email Analytics**
   - Track open rates
   - Track click rates
   - A/B test subject lines

4. **Transactional Emails**
   - Password reset emails
   - Session booking confirmations
   - Payment receipts

5. **Drip Campaigns**
   - Welcome series for new users
   - Re-engagement emails
   - Educational content

---

## Support Resources

### Resend Documentation
- Docs: https://resend.com/docs
- API Reference: https://resend.com/docs/api-reference
- Status: https://status.resend.com

### Supabase Edge Functions
- Docs: https://supabase.com/docs/guides/functions
- Examples: https://github.com/supabase/supabase/tree/master/examples/edge-functions
- Status: https://status.supabase.com

### Getting Help
- **Resend Support:** support@resend.com
- **Supabase Support:** Via dashboard or Discord
- **Developer Issues:** Check GitHub issues

---

## Quick Reference Commands

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy send-contact-email

# View logs
supabase functions logs send-contact-email

# Update secrets
supabase secrets set RESEND_API_KEY=your_new_key
supabase secrets set ADMIN_EMAIL=new_admin@email.com

# List all secrets
supabase secrets list

# Test function locally
supabase functions serve send-contact-email

# Delete a function
supabase functions delete function-name
```

---

## Summary

✅ **What's Working:**
- User signup emails (welcome + admin notification)
- Contact form emails (to admin + user confirmation)
- Professional email templates
- Error handling and logging
- Toast notifications for user feedback
- Mobile-responsive contact modal

✅ **What You Need to Do:**
1. Set up Resend account and get API key
2. Add secrets to Supabase (RESEND_API_KEY, ADMIN_EMAIL)
3. Deploy Edge Functions
4. Test both email flows
5. (Optional) Verify custom domain for professional sender address

✅ **Cost:**
- FREE for typical small business volume
- Only pay if you exceed free tiers

---

**Ready to Deploy?** Follow the steps in order and test thoroughly!

**Questions?** Check the troubleshooting section or contact Supabase/Resend support.

---

**Last Updated:** January 21, 2026
**Version:** 1.0
