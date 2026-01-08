# Настройка для Тестирования в Telegram

## Обзор

Проект теперь автоматически определяет правильный API URL в зависимости от окружения:
- **В браузере (Mock Mode)**: используется `http://localhost:3001`
- **В Telegram Mini App**: используется ngrok URL из `NEXT_PUBLIC_API_URL`

## Переменные Окружения

### 1. `.env` (корневой файл)

Используется для настройки API сервера:

```env
# API Configuration
NODE_ENV=development
API_PORT=3001
BOT_TOKEN=your_telegram_bot_token_here

# CORS - в режиме разработки можно оставить пустым
# Система автоматически пропустит localhost и ngrok
ALLOWED_ORIGINS=

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. `apps/web/.env.local`

Используется ТОЛЬКО для тестирования в Telegram с ngrok:

```env
# API URL для Telegram Mini App (ngrok)
NEXT_PUBLIC_API_URL=https://your-api-ngrok-url.ngrok-free.app
```

> ⚠️ **Важно**: 
> - Этот файл используется только когда приложение запущено в Telegram
> - В браузере (mock mode) всегда используется `localhost:3001`
> - Можно **удалить** этот файл для локальной разработки в браузере

## Шаги для Тестирования

### Режим 1: Разработка в Браузере (Mock Mode)

```bash
# 1. Удалите .env.local если он существует (опционально)
rm apps/web/.env.local

# 2. Запустите dev сервер
pnpm dev

# 3. Откройте в браузере
# → http://localhost:3000
```

В этом режиме:
- ✅ Используются моковые данные пользователя
- ✅ API запросы идут на `localhost:3001`
- ✅ Не нужен ngrok
- ✅ Не нужен Telegram

---

### Режим 2: Тестирование в Telegram

```bash
# 1. Запустите dev сервер
pnpm dev

# 2. В отдельном терминале запустите ngrok
pnpm tunnel

# 3. Скопируйте ngrok URLs из вывода:
# Пример:
# Web: https://abc123.ngrok-free.app
# API: https://xyz789.ngrok-free.app

# 4. Создайте apps/web/.env.local с API URL
echo 'NEXT_PUBLIC_API_URL=https://xyz789.ngrok-free.app' > apps/web/.env.local

# 5. Перезапустите dev сервер (ВАЖНО!)
# Ctrl+C в терминале с pnpm dev, затем:
pnpm dev

# 6. Настройте Mini App в BotFather
# /newapp
# Введите Web URL: https://abc123.ngrok-free.app

# 7. Откройте Mini App в Telegram
```

В этом режиме:
- ✅ Используются реальные данные Telegram пользователя
- ✅ API запросы идут на ngrok URL
- ✅ CORS автоматически настроен
- ✅ Валидация `initData` работает

---

## Проверка Текущей Конфигурации

### Проверить API URL в браузере

Откройте консоль браузера (F12) и выполните:

```javascript
// Проверить текущий API URL
console.log(window.Telegram?.WebApp?.initData ? 'Telegram Mode' : 'Browser Mode');

// Проверить переменную окружения
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
```

### Проверить что API работает

```bash
# Проверить локальный API
curl http://localhost:3001/health

# Проверить ngrok API
curl https://xyz789.ngrok-free.app/health
```

---

## Частые Проблемы

### "Failed to connect to server" в браузере

**Решение**: Удалите `apps/web/.env.local` и перезапустите dev сервер:
```bash
rm apps/web/.env.local
pnpm dev
```

### "Failed to connect to server" в Telegram

**Причины**:
1. Не перезапустили dev сервер после создания `.env.local`
2. Неправильный ngrok URL в `.env.local`
3. Ngrok не запущен

**Решение**:
```bash
# 1. Убедитесь что ngrok запущен
pnpm tunnel

# 2. Получите правильный API URL
curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | grep '3001'

# 3. Обновите .env.local с правильным URL
echo 'NEXT_PUBLIC_API_URL=<полученный_url>' > apps/web/.env.local

# 4. ОБЯЗАТЕЛЬНО перезапустите dev сервер
pnpm dev
```

### Ngrok URL меняется при каждом запуске

**Решение**: Получите платный аккаунт ngrok для постоянных URL, или используйте локальный домен с SSL.

---

## Архитектура Решения

### Динамическое Определение API URL

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

### CORS Настройка

```typescript
// apps/api/src/middleware/cors.ts

// В режиме разработки автоматически разрешает:
// - localhost:*
// - *.ngrok-free.app
// - *.ngrok.io
```

---

## Резюме

| Режим | API URL | Нужен .env.local? | Нужен ngrok? |
|-------|---------|-------------------|--------------|
| **Браузер (Mock)** | `localhost:3001` | ❌ Нет | ❌ Нет |
| **Telegram** | ngrok URL | ✅ Да | ✅ Да |

**Главное правило**: 
- Для локальной разработки в браузере - **не создавайте** `.env.local`
- Для тестирования в Telegram - **создайте** `.env.local` с ngrok URL
