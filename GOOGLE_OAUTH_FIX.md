# Google OAuth Configuration Fix

## Issue: Mobile Google Login "Access Denied" Error

Your mobile Google login is failing because the Google OAuth app needs to be configured with the correct redirect URIs for your production domain.

## Step 1: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Credentials** > **Credentials**
3. Find your OAuth 2.0 Client ID: `740472634347-7u2m75cbg972mjm6bbc6mmbajn38nh56.apps.googleusercontent.com`
4. Click **Edit** on your OAuth client

## Step 2: Add Correct Redirect URIs

In the **Authorized redirect URIs** section, make sure you have these exact URIs:

```
https://e-commerce-next-wine.vercel.app/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
http://localhost:3001/api/auth/callback/google
```

**Important Notes:**
- The production URL MUST be exactly: `https://e-commerce-next-wine.vercel.app/api/auth/callback/google`
- No trailing slashes
- Must use HTTPS for production
- Keep localhost URLs for development

## Step 3: Verify Domain Settings

1. In **Authorized JavaScript origins**, add:
```
https://e-commerce-next-wine.vercel.app
http://localhost:3000
http://localhost:3001
```

## Step 4: Save Changes

1. Click **Save** in Google Console
2. Wait 5-10 minutes for changes to propagate

## Step 5: Test the Fix

1. Try Google login on mobile device
2. Should now work without "Access Denied" error

## Additional Troubleshooting

If you still get "Access Denied":

1. **Check domain spelling**: Make sure `e-commerce-next-wine.vercel.app` is exactly correct
2. **Clear browser cache** on mobile device
3. **Try incognito mode** first
4. **Wait longer**: OAuth changes can take up to 1 hour to fully propagate

## Logout Issue Fix

The logout functionality has been improved with:
- Better error handling
- Fallback redirect mechanisms  
- Async/await pattern for reliability

After deployment, the logout should work properly on both desktop and mobile.