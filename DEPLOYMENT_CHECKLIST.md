# Deployment Checklist for Contact Form Feature

## ⚠️ Important: The Contact Form Won't Work Until You Complete These Steps

The contact form is calling a Supabase Edge Function that **needs to be deployed separately**.

---

## Step-by-Step Deployment

### 1. Install Supabase CLI (if not already installed)
```bash
npm install -g supabase
```

### 2. Login to Supabase
```bash
supabase login
```
This will open your browser for authentication.

### 3. Link Your Project
```bash
cd /path/to/pilatesbts
supabase link --project-ref YOUR_PROJECT_REF
```

**How to find your project ref:**
- Go to https://supabase.com/dashboard
- Open your project
- Look at the URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
- Copy the part after `/project/`

### 4. Set Up Resend Email Service

#### 4.1 Create Resend Account
1. Go to https://resend.com
2. Sign up (free tier is fine)
3. Verify your email

#### 4.2 Get API Key
1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it: "Pilates by the Sea"
4. Copy the key (starts with `re_`)
5. Save it somewhere safe!

### 5. Set Environment Secrets in Supabase
```bash
# Set your Resend API key
supabase secrets set RESEND_API_KEY=re_YOUR_ACTUAL_KEY_HERE

# Set your admin email (where contact forms will be sent)
supabase secrets set ADMIN_EMAIL=pilatesbts@gmail.com
```

### 6. Deploy the Edge Function
```bash
# Deploy the contact email function
supabase functions deploy send-contact-email
```

You should see:
```
✓ Deployed Function send-contact-email
```

### 7. Verify Deployment
```bash
supabase functions list
```

You should see `send-contact-email` in the list.

---

## Testing

### Test the Contact Form:
1. Go to your website
2. Log in with your account
3. Go to Dashboard
4. Click "Send Us a Message" button
5. Fill out the form
6. Submit

**Expected Result:**
- ✅ Success toast appears
- ✅ You receive an email at pilatesbts@gmail.com
- ✅ User receives a confirmation email

---

## Troubleshooting

### Error: "Unable to connect to server"
**Cause:** Edge function not deployed yet
**Solution:** Follow steps 1-6 above

### Error: "RESEND_API_KEY is not configured"
**Cause:** Secret not set in Supabase
**Solution:** Run step 5 again

### Emails not sending
**Cause:** Invalid Resend API key
**Solution:**
1. Check your Resend API key is correct
2. Make sure it's active in Resend dashboard
3. Re-run: `supabase secrets set RESEND_API_KEY=your_correct_key`

### Check Function Logs
```bash
supabase functions logs send-contact-email
```

---

## What About the Signup Emails?

The signup email function (`send-signup-emails`) should already be deployed. But if it's not working:

```bash
# Deploy signup emails function
supabase functions deploy send-signup-emails
```

---

## Cost

- **Resend Free Tier:** 100 emails/day (3,000/month) - **$0**
- **Supabase Free Tier:** 500,000 function calls/month - **$0**

You won't pay anything unless you exceed these limits!

---

## After Deployment

Once deployed, the contact form will work immediately. No need to redeploy your React app!

---

## Quick Reference

**Deploy function:**
```bash
supabase functions deploy send-contact-email
```

**View logs:**
```bash
supabase functions logs send-contact-email
```

**List all functions:**
```bash
supabase functions list
```

**Update secrets:**
```bash
supabase secrets set RESEND_API_KEY=new_key
supabase secrets set ADMIN_EMAIL=new_email@example.com
```

---

## Files That Need to Be Deployed

These Edge Function files in your repo need to be deployed to Supabase:
- ✅ `supabase/functions/send-contact-email/index.ts` (NEW)
- ✅ `supabase/functions/send-signup-emails/index.ts` (Should already be deployed)

---

## Need Help?

- **Supabase Docs:** https://supabase.com/docs/guides/functions
- **Resend Docs:** https://resend.com/docs
- **Issue?** Check the function logs first!

---

**That's it!** Once you complete these steps, your contact form will work perfectly. 🎉
