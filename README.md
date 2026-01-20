# TMA Starter

**Production-ready Telegram Mini App Boilerplate**

A modern, type-safe monorepo starter template for building Telegram Mini Apps with Next.js 16 and Express.

---

## ✨ Features

- **🚀 Next.js 16** — Latest App Router with Turbopack
- **⚡ Express API** — TypeScript backend with middleware
- **📦 pnpm Workspaces** — Efficient monorepo management
- **🎨 Tailwind CSS + shadcn/ui** — Beautiful, accessible components
- **🔒 Type Safety** — Shared types between frontend and backend
- **🔧 Mock Environment** — Develop in browser without deploying to Telegram
- **📱 Telegram WebApp API** — Full TypeScript definitions included

---

## 📁 Project Structure

```
tma-starter/
├── apps/
│   ├── web/          # Next.js 16 frontend
│   └── api/          # Express backend
├── packages/
│   └── shared/       # Shared types & utilities
└── package.json      # Root workspace config
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/Irine7/tma-starter.git
cd tma-starter

# Install dependencies
pnpm install

# Copy environment files
cp apps/api/.env.example apps/api/.env
```

### Development

```bash
# Start both frontend and backend
pnpm dev

# Or start individually
pnpm dev:web   # Next.js on http://localhost:3000
pnpm dev:api   # Express on http://localhost:3001
```

### Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000). You'll see the app running in **Mock Mode** with fake Telegram user data.

---

## 🤖 Telegram Bot Configuration

Follow these steps to set up your bot and enable the "Menu" button (or "Play" button) to launch your Mini App directly from the chat.

### 1. Create a Bot with BotFather
1. Open [BotFather](https://t.me/BotFather) in Telegram.
2. Send `/newbot` and follow the prompts.
3. Copy the **API Token** and paste it into `apps/api/.env` as `BOT_TOKEN`.

### 2. Set up Tunneling (Choose One)

#### Option 1: Cloudflare Tunnel (Recommended 🚀)
Cloudflare Tunnel is preferred because it avoids the "Visit Site" interstitial page that often breaks the **Telegram Wallet**.

1. **Install Cloudflare**:
   ```bash
   brew install cloudflared  # macOS
   # For Windows/Linux, see Cloudflare docs
   ```
2. **Run Tunnel**:
   ```bash
   pnpm tunnel:cf
   ```
3. Copy the URL ending in `.trycloudflare.com`.

#### Option 2: Ngrok (Standard)
> [!WARNING]
> Ngrok's free plan shows a "Visit Site" warning page. This breaks the **Telegram Wallet** connection because the wallet cannot verify your manifest file. Use this only if you don't need wallet features or have a paid Ngrok plan.

1. **Install Ngrok** from [ngrok.com](https://ngrok.com).
2. **Run Tunnel**:
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

## 🎨 UI Components

The frontend uses [shadcn/ui](https://ui.shadcn.com/) with the New York style:

```bash
# Add more components
cd apps/web
pnpm dlx shadcn@latest add [component-name]
```

Available components are configured in `apps/web/components.json`.

---

## 📡 API Endpoints

### Health Check

```
GET /health
GET /health/ready
GET /health/live
```

### Adding New Routes

1. Create a route file in `apps/api/src/routes/`
2. Import and use in `apps/api/src/index.ts`
3. Add Telegram validation middleware as needed

---

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm dev:web` | Start only the frontend |
| `pnpm dev:api` | Start only the backend |
| `pnpm build` | Build all apps for production |
| `pnpm lint` | Run linting across all apps |
| `pnpm clean` | Remove all node_modules |

---

## 🌍 Environment Variables

### API (`apps/api/.env`)

```env
PORT=3001
BOT_TOKEN=your_telegram_bot_token_here
ALLOWED_ORIGINS=http://localhost:3000
```

### Web (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 📚 Resources

- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 📄 License

MIT License — Feel free to use this boilerplate for your projects!

---

Built with ❤️ for the Telegram Mini App ecosystem
