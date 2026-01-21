# 🚀 Quick Fix: Contact Form "An Unexpected Error Occurred"

## The Problem
Your Edge Function is deployed but missing the **environment secrets** it needs to send emails.

---

## The Solution (5 Minutes)

### Step 1: Get Your Resend API Key

1. Go to **https://resend.com**
2. **Sign up** (or log in if you already have an account)
3. Click on **"API Keys"** in the left menu
4. Click **"Create API Key"**
5. **Copy the key** (it starts with `re_` and looks like: `re_abcd1234...`)
6. **Keep this tab open** - you'll need this key in the next step

> 💡 **Tip:** The free tier gives you 100 emails/day - more than enough!

---

### Step 2: Add Secrets to Supabase

1. Go to **https://supabase.com/dashboard**
2. Click on your **Pilates by the Sea project**
3. In the left sidebar, click **"Edge Functions"**
4. Click on **"send-contact-email"** (the function you just deployed)
5. Look for a **"Secrets"** or **"Environment Variables"** tab/section
   - If you don't see it, look for **"Settings"** → **"Secrets"**

6. **Add Secret #1:**
   - Click **"Add Secret"** or **"New Secret"**
   - Name: `RESEND_API_KEY`
   - Value: Paste your Resend API key (from Step 1)
   - Click **"Save"** or **"Add"**

7. **Add Secret #2:**
   - Click **"Add Secret"** again
   - Name: `ADMIN_EMAIL`
   - Value: `pilatesbts@gmail.com`
   - Click **"Save"** or **"Add"**

---

### Step 3: Test It!

1. Go to your website
2. Log in
3. Click **"Send Us a Message"** button
4. Fill out the form
5. Click **"Send Message"**

**Expected Result:** ✅ Green success message + emails sent!

---

## What These Secrets Do

- **`RESEND_API_KEY`**: Allows your function to send emails via Resend
- **`ADMIN_EMAIL`**: Tells the function where to send contact form messages

---

## Still Getting Errors?

### Check Function Logs:
1. In Supabase Dashboard → Edge Functions → send-contact-email
2. Click **"Logs"**
3. Try the contact form again
4. Look for error messages in the logs

### Common Error Messages in Logs:

**"RESEND_API_KEY is not configured"**
→ The secret wasn't set correctly. Go back to Step 2.

**"Invalid API key" or "401 Unauthorized"**
→ Your Resend API key is wrong. Get a new one from https://resend.com/api-keys

**"Cannot connect to Resend"**
→ Check https://status.resend.com to make sure Resend is online

---

## Visual Guide

```
Supabase Dashboard
├── Your Project
│   └── Edge Functions (in sidebar)
│       └── send-contact-email
│           └── Secrets/Environment Variables
│               ├── RESEND_API_KEY = re_abc123...
│               └── ADMIN_EMAIL = pilatesbts@gmail.com
```

---

## Success Checklist

After adding secrets, you should see:

- [ ] ✅ Green success toast in browser
- [ ] ✅ Email received at pilatesbts@gmail.com
- [ ] ✅ Confirmation email sent to user
- [ ] ✅ No errors in function logs

---

## Alternative: Use Supabase CLI

If you prefer command line:

```bash
# Make sure you're logged in and linked to your project
supabase login
supabase link

# Set the secrets
supabase secrets set RESEND_API_KEY=re_your_actual_key_here
supabase secrets set ADMIN_EMAIL=pilatesbts@gmail.com

# Verify they're set
supabase secrets list
```

---

## That's It!

Once you add those two secrets, the contact form will work immediately. No need to redeploy anything!

**Need help?** See the full troubleshooting guide: `CONTACT_FORM_TROUBLESHOOTING.md`
