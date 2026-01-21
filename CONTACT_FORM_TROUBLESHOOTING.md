# Contact Form Troubleshooting Guide

## Error: "An unexpected error occurred"

This means the Edge Function is deployed but failing to execute. Here's how to fix it:

---

## Step 1: Check Environment Secrets

The function needs two secrets to work. Let's verify they're set:

### Via Supabase Dashboard:

1. Go to https://supabase.com/dashboard
2. Open your project
3. Click **"Edge Functions"** in the left sidebar
4. Click on **"send-contact-email"** function
5. Look for **"Settings"** or **"Secrets"** or **"Environment Variables"**
6. Make sure these are set:
   - `RESEND_API_KEY`
   - `ADMIN_EMAIL`

### How to Add Secrets in Dashboard:

If they're missing:

1. Click **"Add Secret"** or **"Add Variable"**
2. Add each one:

**Secret 1:**
- Name: `RESEND_API_KEY`
- Value: Your Resend API key (starts with `re_`)

**Secret 2:**
- Name: `ADMIN_EMAIL`
- Value: `pilatesbts@gmail.com`

3. Click **"Save"** or **"Add"**

---

## Step 2: Get Your Resend API Key

If you don't have it yet:

1. Go to https://resend.com
2. Sign up or log in
3. Go to **"API Keys"** section
4. Click **"Create API Key"**
5. Copy the key (starts with `re_`)
6. Add it to Supabase secrets (see Step 1)

**Important:** The free tier gives you 100 emails/day - perfect for your needs!

---

## Step 3: Check Function Logs

After adding the secrets, check what's happening:

1. In Supabase Dashboard → Edge Functions → send-contact-email
2. Click on **"Logs"** tab
3. Try submitting the contact form again
4. Refresh the logs

**Look for these common errors:**

### Error: "RESEND_API_KEY is not configured"
**Fix:** Add the `RESEND_API_KEY` secret (see Step 1)

### Error: "Invalid API key" or "Unauthorized"
**Fix:** Your Resend API key is wrong
- Go to https://resend.com/api-keys
- Create a new API key
- Update it in Supabase secrets

### Error: "Failed to send email"
**Fix:** Check your Resend account
- Make sure you're not over the free tier limit (100/day)
- Verify your Resend account is active

---

## Step 4: Test the Contact Form

After adding secrets:

1. Go to your website
2. Log in to your dashboard
3. Click **"Send Us a Message"**
4. Fill out the form:
   - Subject: "Test Message"
   - Message: "Testing the contact form"
5. Click **"Send Message"**

**Expected Result:**
- ✅ Green success toast appears
- ✅ Modal closes
- ✅ You receive an email at pilatesbts@gmail.com
- ✅ User receives a confirmation email

---

## Step 5: Verify Resend Domain (Optional but Recommended)

For professional "from" addresses:

1. Go to https://resend.com/domains
2. Click **"Add Domain"**
3. Add your domain (e.g., `pilatesbts.com`)
4. Add the DNS records shown to your domain registrar
5. Wait for verification

Then update the function code to use:
```typescript
from: "Pilates by the Sea <hello@pilatesbts.com>"
```

---

## Common Issues & Solutions

### Issue: "Configuration error. Please try again later."
**Cause:** Environment variables not loaded in browser
**Fix:** Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: Form submits but no emails received
**Cause:** Check Resend dashboard for delivery status
**Fix:**
1. Go to https://resend.com/emails
2. See if emails were sent
3. Check spam folder

### Issue: "Failed to send message"
**Cause:** Function code error
**Fix:** Check function logs in Supabase dashboard

---

## Checklist

Use this to verify everything is set up:

- [ ] Edge function `send-contact-email` is deployed
- [ ] `RESEND_API_KEY` secret is set in Supabase
- [ ] `ADMIN_EMAIL` secret is set in Supabase
- [ ] Resend account is created and verified
- [ ] Resend API key is valid and active
- [ ] Function logs show no errors
- [ ] Test email was received

---

## Quick Test Commands

If you have Supabase CLI:

```bash
# View function logs
supabase functions logs send-contact-email

# Test function locally
supabase functions serve send-contact-email

# List secrets (won't show values, just names)
supabase secrets list
```

---

## Still Not Working?

### Check Function Code in Dashboard

Make sure the function code matches exactly. It should start with:

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  ...
```

If it looks different, copy the correct code from:
`supabase/functions/send-contact-email/index.ts`

### Redeploy the Function

In Supabase Dashboard:
1. Go to Edge Functions → send-contact-email
2. Click **"Deploy"** again
3. Wait for deployment to complete
4. Test again

---

## Success Indicators

When everything works:

1. **In Browser:**
   - Green success toast appears
   - Message says "Message sent successfully!"
   - Modal closes automatically

2. **In Your Email (pilatesbts@gmail.com):**
   - Subject: "Contact Form: [user's subject]"
   - Contains user's message
   - Reply-to is set to user's email

3. **In User's Email:**
   - Subject: "We received your message - Pilates by the Sea"
   - Professional confirmation email
   - Mentions 24-hour response time

4. **In Resend Dashboard:**
   - Shows 2 emails sent
   - Both show "Delivered" status

---

## Need More Help?

1. **Check Supabase Status:** https://status.supabase.com
2. **Check Resend Status:** https://status.resend.com
3. **Supabase Docs:** https://supabase.com/docs/guides/functions
4. **Resend Docs:** https://resend.com/docs

---

**Most Common Fix:** Adding the `RESEND_API_KEY` secret in Supabase Dashboard solves 90% of issues!
