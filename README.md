# [GitHub Auth Service 🔐](https://gh-auth-service.fly.dev/api/auth/health) ◀── click

Переиспользуемый микросервис для аутентификации через GitHub OAuth 2.0 на NestJS + TypeScript.

## 🏗️ Архитектура

```
┌─────────────┐      ┌──────────────────┐      ┌─────────┐
│  Frontend   │─────▶│  Auth Service    │─────▶│ GitHub  │
│  (React)    │◀─────│  (NestJS)        │◀─────│  OAuth  │
└─────────────┘      └──────────────────┘      └─────────┘
      │                       │
      │      JWT Token        │
      └───────────────────────┘
```

## 🚀 Быстрый старт

### 1. Клонировать и установить

```bash
git clone https://github.com/fxhxyz4/github-auth-service
cd github-auth-service

npm install -g yarn
yarn
```

### 2. Настроить GitHub OAuth App

1. Перейди на https://github.com/settings/developers
2. Создай новый OAuth App
3. Заполни:
   - **Application name**: Твоё название
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
4. Получи **Client ID** и **Client Secret**

### 3. Настроить окружение

```bash
cp .env.example .env
```

Отредактируй `.env`:

```env
PORT=3000
NODE_ENV=development

JWT_SECRET=
JWT_EXPIRES_IN=7d

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:4200

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

GITHUB_SCOPES=user:email,read:user
```

### 4. Запустить

```bash
# Install yarn
npm i -g yarn@latest

# Development mode
yarn start:dev

# Production build
yarn build
yarn production

# Docker
docker-compose up -d
```

## 📡 API Endpoints

### 1. Начать OAuth flow
```http
GET /api/auth/github?client_id=YOUR_CLIENT_ID
```

Перенаправляет пользователя на GitHub для авторизации.

### 2. Callback (автоматический)
```http
GET /api/auth/github/callback
```

GitHub перенаправляет сюда после авторизации. Возвращает JWT токен.

### 3. Проверить токен
```http
GET /api/auth/validate?token=YOUR_JWT_TOKEN
```

Ответ:
```json
{
  "valid": true,
  "user": {
    "userId": "12345",
    "username": "octocat",
    "email": "octocat@github.com"
  }
}
```

### 4. Получить текущего пользователя
```http
GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

Ответ:
```json
{
  "userId": "12345",
  "username": "octocat",
  "email": "octocat@github.com"
}
```

### 5. Health check
```http
GET /api/auth/health
```

## 🚢 Деплой

### Docker

```bash
docker build -t github-auth-service .
docker run -p 3000:3000 --env-file .env github-auth-service
```

### Docker Compose

```bash
docker-compose up -d
```

## 📝 Лицензия

MIT
