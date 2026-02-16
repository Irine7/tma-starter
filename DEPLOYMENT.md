# Руководство по деплою (Vercel)

Этот репозиторий представляет собой монорепозиторий, содержащий два приложения:
1. **Web App**: `apps/web` (Next.js)
2. **API Server**: `apps/api` (Express)

Чтобы развернуть этот стек на Vercel, вам нужно создать **два отдельных проекта Vercel**, связанных с одним и тем же Git-репозиторием.

## 1. Деплой API (`apps/api`)

Сначала мы разворачиваем бэкенд, чтобы получить его URL.

1. Перейдите в [Vercel Dashboard](https://vercel.com/dashboard) и нажмите **"Add New..."** -> **"Project"**.
2. Импортируйте ваш репозиторий (`tma-starter`).
3. **Настройка проекта**:
   - **Project Name**: `tma-starter-api` (или похожее)
   - **Framework Preset**: `Other` (или `Express`, если определится автоматически, но `Other` тоже подойдет с нашим `vercel.json` и `api/index.ts`)
   - **Root Directory**: Нажмите "Edit" и выберите `apps/api`.
4. **Переменные окружения (Environment Variables)**:
   Добавьте переменные из вашего файла `.env`, которые нужны для API (например, `SUPABASE_URL`, `SUPABASE_KEY`, `BOT_TOKEN` и т.д.).
   
   > **Важно про CORS (`ALLOWED_ORIGINS`)**:
   > Так как у вас еще нет URL фронтенда, на первом этапе:
   > 1. Либо пропустите `ALLOWED_ORIGINS` (API может не отвечать на запросы с неизвестных источников, но сам деплой пройдет).
   > 2. Либо временно укажите `*` (разрешить всем), чтобы проверить работоспособность.
   > 
   > **После деплоя фронтенда (шаг 2)**, вы вернетесь сюда и обновите `ALLOWED_ORIGINS` на реальный URL вашего Web App.
   
   *Примечание: `PORT` на Vercel указывать не нужно.*
5. Нажмите **Deploy**.
6. После деплоя скопируйте **Deployment Domain** (например, `https://tma-starter-api.vercel.app`).

## 2. Деплой Web App (`apps/web`)

Теперь разворачиваем фронтенд, указывая ему ссылку на новый API.

1. Перейдите в [Vercel Dashboard](https://vercel.com/dashboard) и нажмите **"Add New..."** -> **"Project"**.
2. Импортируйте тот же самый репозиторий (`tma-starter`).
3. **Настройка проекта**:
   - **Project Name**: `tma-starter-web`
   - **Framework Preset**: `Next.js` (должен определиться автоматически)
   - **Root Directory**: Нажмите "Edit" и выберите `apps/web`.
4. **Переменные окружения (Environment Variables)**:
   - `NEXT_PUBLIC_API_URL`: Установите значение URL вашего API из шага 1 (например, `https://tma-starter-api.vercel.app`).
   - Добавьте другие переменные из `.env` (например, `NEXT_PUBLIC_TON_CONNECT_URL`).
5. Нажмите **Deploy**.

## 3. Подключение Telegram бота

1. Перейдите в [BotFather](https://t.me/BotFather) в Telegram.
2. Выберите вашего бота.
3. Перейдите в **Bot Settings** -> **Menu Button** -> **Configure Menu Button**.
4. Отправьте URL вашего **Web App** (например, `https://tma-starter-web.vercel.app`).

## 4. Устранение неполадок (Troubleshooting)

- **Проблемы с CORS**: Если фронтенд не может обратиться к API, убедитесь, что настройки CORS вашего API разрешают домен фронтенда.
  - Проверьте `apps/api/src/middleware/cors.ts`.
  - В продакшене вы можете указать конкретный origin или разрешить все (`*`), если это публичный API.
- **"Cannot GET /" на API**: Корневой путь `/` API возвращает JSON объект с информацией. Если вы видите его, значит всё работает.
- **Логи**: Проверяйте логи функций Vercel (Functions logs) на наличие ошибок времени выполнения.

### Ошибка `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND` при деплое клиента (`apps/web`)

Если при деплое фронтенда вы получаете ошибку о том, что пакет `@tma/shared` не найден, это значит, что Vercel неправильно определил корень монорепозитория.

**Решение (PNPM Workspaces):**
1. Зайдите в **Settings** -> **General** вашего проекта `tma-starter-web` на Vercel.
2. В разделе **Root Directory**:
   - Верните значение: `apps/web`.
3. В разделе **Build & Development Settings**:
   - **Install Command**: Включите **Override** и вставьте: `cd ../.. && pnpm install`
   - **Build Command**: Можно выключить Override (или оставить `next build`).
   - **Output Directory**: Можно выключить Override (по умолчанию `.next`).
4. Сохраните и попробуйте сделать **Redeploy**.

*Пояснение: Команда `cd ../.. && pnpm install` заставляет Vercel устанавливать зависимости из корня всего репозитория, чтобы он увидел workspace-пакеты.*
