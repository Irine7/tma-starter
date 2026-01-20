# Telegram Testing Setup

## Overview

The project automatically detects the correct API URL depending on the environment:
- **In Browser (Mock Mode)**: uses `http://localhost:3001`
- **In Telegram Mini App**: uses ngrok URL from `NEXT_PUBLIC_API_URL`

## Environment Variables

### 1. `.env` (root file)

Used for configuring the API server:

```env
# API Configuration
NODE_ENV=development
API_PORT=3001
BOT_TOKEN=your_telegram_bot_token_here

# CORS - can be left empty in development
# System automatically allows localhost and ngrok
ALLOWED_ORIGINS=

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. `apps/web/.env.local`

Used ONLY for testing in Telegram with ngrok:

```env
# API URL for Telegram Mini App (ngrok)
NEXT_PUBLIC_API_URL=https://your-api-ngrok-url.ngrok-free.app
```

> ⚠️ **Important**: 
> - This file is used only when the app is running in Telegram
> - In browser (mock mode) `localhost:3001` is always used
> - You can **delete** this file for local development in the browser

## Testing Steps

### Mode 1: Browser Development (Mock Mode)

```bash
# 1. Delete .env.local if it exists (optional)
rm apps/web/.env.local

# 2. Start dev server
pnpm dev

# 3. Open in browser
# → http://localhost:3000
```

In this mode:
- ✅ User mock data is used
- ✅ API requests go to `localhost:3001`
- ✅ No ngrok needed
- ✅ No Telegram needed

---

### Mode 2: Telegram Testing

```bash
# 1. Start dev server
pnpm dev

# 2. In a separate terminal run ngrok
pnpm tunnel

# 3. Copy ngrok URLs from output:
# Example:
# Web: https://abc123.ngrok-free.app
# API: https://xyz789.ngrok-free.app

# 4. Create apps/web/.env.local with API URL
echo 'NEXT_PUBLIC_API_URL=https://xyz789.ngrok-free.app' > apps/web/.env.local

# 5. Restart dev server (IMPORTANT!)
# Ctrl+C in terminal with pnpm dev, then:
pnpm dev

# 6. Configure Mini App in BotFather
# /newapp
# Enter Web URL: https://abc123.ngrok-free.app

# 7. Open Mini App in Telegram
```

In this mode:
- ✅ Real Telegram user data is used
- ✅ API requests go to ngrok URL
- ✅ CORS is automatically configured
- ✅ `initData` validation works

---

## Verifying Current Configuration

### Check API URL in Browser

Open browser console (F12) and run:

```javascript
// Check current API URL
console.log(window.Telegram?.WebApp?.initData ? 'Telegram Mode' : 'Browser Mode');

// Check environment variable
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
```

### Check if API works

```bash
# Check local API
curl http://localhost:3001/health

# Check ngrok API
curl https://xyz789.ngrok-free.app/health
```

---

## Common Issues

### "Failed to connect to server" in Browser

**Solution**: Delete `apps/web/.env.local` and restart dev server:
```bash
rm apps/web/.env.local
pnpm dev
```

### "Failed to connect to server" in Telegram

**Causes**:
1. Forgot to restart dev server after creating `.env.local`
2. Incorrect ngrok URL in `.env.local`
3. Ngrok is not running

**Solution**:
```bash
# 1. Ensure ngrok is running
pnpm tunnel

# 2. Get correct API URL
curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | grep '3001'

# 3. Update .env.local with correct URL
echo 'NEXT_PUBLIC_API_URL=<obtained_url>' > apps/web/.env.local

# 4. DEFINITELY restart dev server
pnpm dev
```

### Ngrok URL changes on every restart

**Solution**: Get a paid ngrok account for persistent URLs, or use a local domain with SSL.

---

## Solution Architecture

### Dynamic API URL Detection

```typescript
// apps/web/src/lib/api.ts

function getApiBaseUrl(): string {
  // Check if we're in Telegram Mini App
  if (typeof window !== 'undefined') {
    const webApp = window.Telegram?.WebApp;
    if (webApp?.initData) {
      // Real Telegram environment - use ngrok URL
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    }
  }
  
  // Browser/mock mode - always use localhost
  return 'http://localhost:3001';
}
```

### CORS Configuration

```typescript
// apps/api/src/middleware/cors.ts

// In development mode automatically allows:
// - localhost:*
// - *.ngrok-free.app
// - *.ngrok.io
```

---

## Summary

| Mode | API URL | Needs .env.local? | Needs ngrok? |
|-------|---------|-------------------|--------------|
| **Browser (Mock)** | `localhost:3001` | ❌ No | ❌ No |
| **Telegram** | ngrok URL | ✅ Yes | ✅ Yes |

**Main Rule**: 
- For local browser development - **do not create** `.env.local`
- For Telegram testing - **create** `.env.local` with ngrok URL
