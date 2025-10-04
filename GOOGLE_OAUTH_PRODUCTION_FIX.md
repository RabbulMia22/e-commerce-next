# 🔧 Google OAuth "Access Denied" - Production Troubleshooting

## 🚨 Still Getting Access Denied After Publishing?

Even after publishing your Google OAuth app to production, you might still get "Access denied" for these reasons:

---

## 🔍 **Common Causes & Solutions:**

### **1. App Still Under Review**
**Problem**: Google is still reviewing your published app (can take 1-7 days)
**Solution**: 
```bash
# Check your app status in Google Console:
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Look for "Publishing status" 
3. If it says "In review" - wait for approval
4. If it says "Needs verification" - complete verification process
```

### **2. Sensitive Scopes Requiring Verification**
**Problem**: Your app uses sensitive scopes that need Google verification
**Solution**:
```bash
# Check your scopes:
1. Go to OAuth consent screen → Scopes
2. Remove any sensitive scopes you don't need
3. Keep only: email, profile, openid
4. Save and republish
```

### **3. Domain Verification Issues**
**Problem**: Your production domain isn't properly verified
**Solution**:
```bash
# Verify your domains:
1. Google Console → OAuth consent screen → Authorized domains
2. Add: e-commerce-next-wine.vercel.app
3. Verify domain ownership if required
4. Update authorized origins and redirect URIs
```

### **4. Incorrect Redirect URIs**
**Problem**: Your production URLs don't match configured redirect URIs
**Solution**:
```bash
# Update OAuth client settings:
1. Go to: APIs & Services → Credentials → Your OAuth Client
2. Authorized JavaScript origins:
   - https://e-commerce-next-wine.vercel.app
   - http://localhost:3000 (for development)
   
3. Authorized redirect URIs:
   - https://e-commerce-next-wine.vercel.app/api/auth/callback/google
   - http://localhost:3000/api/auth/callback/google
```

---

## 🚀 **Immediate Fix Options:**

### **Option 1: Temporary Test User Solution**
While waiting for Google approval, add specific users:
```bash
1. Google Console → OAuth consent screen → Test users
2. Click "+ ADD USERS"
3. Add emails that need access immediately
4. These users can login right away (max 100 users)
```

### **Option 2: Create New OAuth App (Quick Fix)**
If your current app is stuck in review:
```bash
1. Google Console → APIs & Services → Credentials
2. Click "Create Credentials" → OAuth client ID
3. Application type: Web application
4. Add your domains and redirect URIs
5. Use the new Client ID and Secret
```

### **Option 3: Use Internal User Type**
If you have a Google Workspace domain:
```bash
1. OAuth consent screen → User Type → Internal
2. This bypasses public app review
3. All users in your organization can access
```

---

## 🔧 **Step-by-Step Production Setup:**

### **1. Verify Current App Status**
```bash
# Check these in Google Console:
□ App is published (not in testing mode)
□ Publishing status shows "In production" 
□ No "Verification required" warnings
□ Domain is added to authorized domains
□ Correct redirect URIs are configured
```

### **2. Update Your Environment Variables**
Make sure your production environment has:
```bash
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret  
NEXTAUTH_URL=https://e-commerce-next-wine.vercel.app
```

### **3. Test Different Scenarios**
```bash
# Try logging in with:
□ Gmail accounts (@gmail.com)
□ Google Workspace accounts (@company.com)
□ Accounts that were test users
□ Completely new accounts
```

---

## 🐛 **Advanced Debugging:**

### **Check OAuth Flow Logs**
Add this debugging to your NextAuth config:
```javascript
// In your route.ts
debug: true, // Enable in production temporarily

// Check browser network tab for:
- OAuth authorization URL
- Callback URL responses  
- Error parameters in URLs
```

### **Common Error Messages:**
```bash
"access_denied" = User denied access OR app not approved
"invalid_client" = Wrong client ID or secret
"redirect_uri_mismatch" = Redirect URL doesn't match settings
"unauthorized_client" = App not properly configured
```

---

## ⚡ **Quick Test:**

### **1. Check App Status Right Now:**
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Look at "Publishing status"
3. If it says anything other than "In production" - that's your issue

### **2. Verify Scopes:**
Your app should only request:
- `openid`
- `email` 
- `profile`

If you have other scopes, remove them.

### **3. Check Domain Settings:**
- Authorized domains: `e-commerce-next-wine.vercel.app`
- JavaScript origins: `https://e-commerce-next-wine.vercel.app`
- Redirect URIs: `https://e-commerce-next-wine.vercel.app/api/auth/callback/google`

---

## 🎯 **Most Likely Solutions:**

### **If App is Still "In Review":**
- Add test users for immediate access
- Wait for Google approval (1-7 days)

### **If App Shows "Verification Required":**
- Complete domain verification
- Submit app for verification with required documentation

### **If Everything Looks Correct:**
- Try creating a new OAuth app
- Double-check all URLs match exactly
- Test with incognito/private browsing

---

## 📞 **Need Immediate Fix?**

**Fastest solution right now:**
1. Add your email as test user
2. Test with that email
3. If it works - the app is fine, just waiting for approval
4. If it doesn't work - check redirect URIs and domains

**The key is identifying whether it's a configuration issue or just waiting for Google approval!**