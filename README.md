# TMA Starter

**The Ultimate Telegram Mini App Boilerplate**

A production-ready, high-performance monorepo starter kit for building modern Telegram Mini Apps. Built with **Next.js 16**, **Express**, **Supabase**, and **TON Connect**.

> ✨ **Perfect for:** Developers who want to skip the setup pain and start building features immediately.

---

## ✨ Features

- **� Modern Stack** — Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui.
- **👛 TON Wallet Integration** — Native `@tonconnect/ui-react` support with ready-to-use connect button and format utilities.
- **� Built-in Donation System** — Production-ready donation component handling Testnet/Mainnet automatically.
- **🔌 Backend Ready** — Express API with Supabase integration (Auth, Database, Realtime).
- **�️ Type-Safe Monorepo** — Shared types between Frontend and Backend using pnpm workspaces.
- **⚡ Super Fast Development** — **Mock Environment** lets you build in the browser without deploying to Telegram every time.
- **🌐 Tunneling Made Easy** — One-command tunneling with Cloudflare or Ngrok for real-device testing.

---

## 📁 Project Structure

```
tma-starter/
├── apps/
│   ├── web/          # Next.js 16 frontend (UI, Wallet, Components)
│   └── api/          # Express backend (Auth, Supabase, Validation)
├── packages/
│   └── shared/       # Shared TypeScript interfaces & utilities
├── supabase/         # Migrations & database config
├── .env.example      # Template for environment variables
└── package.json      # Workspace configuration
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 9+
- Git

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/Irine7/tma-starter.git
cd tma-starter

# Install dependencies
pnpm install

# Setup Environment
cp .env.example .env
```

### 2. Configure Environment (`.env`)
Fill in your keys in the created `.env` file:
- `BOT_TOKEN` from @BotFather
- `SUPABASE_URL` & `KEYS` from Supabase

### 3. Start Development

```bash
# Start both frontend and backend
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to see the **Mock Mode** in action.

---

## 📱 Running in Telegram

To test on a real device, you need a secure tunnel (HTTPS).

### Method 1: Cloudflare Tunnel (Recommended 🚀)
Cloudflare allows smooth wallet connection without "Visit Site" blockers.

```bash
pnpm tunnel:cf
```
Copy the URL (e.g., `https://...trycloudflare.com`) and send it to @BotFather as your **Web App URL**.

### Method 2: Ngrok
```bash
pnpm tunnel:web
```
3. Copy the URL ending in `.ngrok-free.app`.

### 3. Connect Web App to Bot

#### Menu Button (Play Button)
This adds a blue "Menu" button to your bot's chat.

1. In BotFather, send `/mybots` -> Select Bot -> **Bot Settings**.
2. Go to **Menu Button** -> **Configure Menu Button**.
3. Send your **Tunnel URL** (e.g., `https://...trycloudflare.com`).
4. Give it a name (e.g., "Play").

---

## 🔧 Mock Environment

The boilerplate includes a `MockTelegramProvider` that enables browser-based development:

### How it works

1. **Automatic Detection** — Checks if `window.Telegram.WebApp` exists
2. **Mock Mode** — When not in Telegram, injects fake user data
3. **Visual Indicator** — Shows a yellow banner in development mode
4. **Seamless Transition** — Same code works in both environments

### Mock User Data

```typescript
{
  id: 123456789,
  first_name: 'Dev',
  last_name: 'User',
  username: 'devuser',
  photo_url: 'https://api.dicebear.com/...',
  language_code: 'en',
  is_premium: false
}
```

---

## 🔐 Telegram Validation

The API includes a placeholder middleware for validating Telegram `initData`:

```
apps/api/src/middleware/validateTelegramData.ts
```

⚠️ **IMPORTANT**: Before going to production, implement proper HMAC-SHA256 validation using your `BOT_TOKEN`. See the [Telegram documentation](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app).

---

## 📦 Shared Package

The `@tma/shared` package contains types used by both frontend and backend:

```typescript
import type { TelegramUser, ApiResponse, HealthResponse } from '@tma/shared';
```

### Available Types

- `TelegramUser` — User data from Telegram
- `TelegramWebAppUser` — Extended user data
- `TelegramChat` — Chat information
- `ApiResponse<T>` — Standardized API response wrapper
- `HealthResponse` — Health check response
- `PaginationParams` — Pagination parameters
- `PaginatedResponse<T>` — Paginated response wrapper

---

## �️ Tech Stack Details

| Package | Version | Description |
|---------|---------|-------------|
| **Next.js** | 16.1 | Frontend Framework |
| **React** | 19 | UI Library |
| **Express** | 4.x | Backend API |
| **Supabase** | Latest | Database & Auth |
| **TON Connect** | 2.x | Wallet Integration |
| **Tailwind** | 4.0 | Styling |
| **Framer Motion**| Latest | Animations |

---

## 📚 Documentation

- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [TON Connect 2.0 Docs](https://docs.ton.org/develop/dapps/ton-connect/overview)
- [Next.js Documentation](https://nextjs.org/docs)

---

## 📄 License

MIT License — Free to use for personal and commercial projects.

---

<div align="center">
  <p>Built with ❤️ for the TON Ecosystem</p>
  <p><i>Looking for premium features? Contact the author!</i></p>
</div>
