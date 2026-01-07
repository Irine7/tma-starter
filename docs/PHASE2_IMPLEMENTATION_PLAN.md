# Phase 2: Database & Auth - Implementation Plan

## Overview
This document outlines the implementation steps for Telegram Native Authentication with Supabase integration.

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │    Backend      │     │   Supabase      │
│   (Next.js)     │────▶│   (Express)     │────▶│   (PostgreSQL)  │
│                 │     │                 │     │                 │
│ TelegramWebApp  │     │ /auth/login     │     │ public.users    │
│ initData        │     │ validateData    │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Task 2: Backend Implementation

### 2.1 Dependencies
```bash
pnpm --filter @tma/api add @supabase/supabase-js
# crypto is built into Node.js, no external package needed
```

### 2.2 Files to Create/Modify

| File | Purpose |
|------|---------|
| `apps/api/src/lib/supabase.ts` | Supabase Admin client initialization |
| `apps/api/src/services/auth.service.ts` | Telegram data validation + user upsert |
| `apps/api/src/routes/auth.ts` | POST /auth/login endpoint |
| `apps/api/src/index.ts` | Register auth routes |
| `.env.example` | Add Supabase env variables |

### 2.3 Telegram Signature Validation Algorithm

```typescript
// 1. Parse initData (URL-encoded string)
const params = new URLSearchParams(initData);

// 2. Extract hash and remove it from params
const hash = params.get('hash');
params.delete('hash');

// 3. Sort remaining params alphabetically
const sortedParams = [...params.entries()]
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([k, v]) => `${k}=${v}`)
  .join('\n');

// 4. Create HMAC-SHA256 with WebAppData secret
const secretKey = crypto
  .createHmac('sha256', 'WebAppData')
  .update(BOT_TOKEN)
  .digest();

// 5. Create signature
const signature = crypto
  .createHmac('sha256', secretKey)
  .update(sortedParams)
  .digest('hex');

// 6. Compare
return signature === hash;
```

---

## Task 3: Frontend Implementation

### 3.1 Files to Create/Modify

| File | Purpose |
|------|---------|
| `apps/web/src/lib/api.ts` | API client with login function |
| `apps/web/src/contexts/AuthContext.tsx` | Global auth state |
| `apps/web/src/hooks/useTelegramUser.ts` | Updated to use real auth |
| `apps/web/src/components/providers/AuthProvider.tsx` | Auth provider wrapper |

### 3.2 Auth Flow

```
1. App mounts
2. Check if user is already authenticated (from context/localStorage)
3. If not:
   a. Get initData from window.Telegram.WebApp.initData
   b. OR use mock data in development
4. Call POST /auth/login with initData
5. Receive user profile
6. Store in AuthContext
7. Render authenticated UI
```

---

## Environment Variables

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Telegram Bot
BOT_TOKEN=your-telegram-bot-token

# API
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Security Considerations

1. **Never expose BOT_TOKEN to frontend** - validation happens on backend only
2. **Use Service Role Key for upserting** - bypasses RLS for admin operations
3. **Validate initData freshness** - check auth_date is not too old (optional, recommended)
4. **HTTPS in production** - required for Telegram WebApp

---

## Execution Order

1. ✅ SQL Migration created
2. ✅ Install backend dependencies
3. ✅ Create Supabase client
4. ✅ Create Auth service
5. ✅ Create Auth routes
6. ✅ Update API index
7. ✅ Create frontend API client (with login method)
8. ✅ Create AuthContext
9. ✅ Update hooks and providers
10. ✅ Update .env.example
11. [ ] Test the flow
