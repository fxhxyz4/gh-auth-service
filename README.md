# [GitHub Auth Service 🔐](https://localhost:8000) ◀── click

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

## 🔌 Интеграция с фронтендом

### React пример

```typescript
// authService.ts
const AUTH_SERVICE_URL = 'http://localhost:3000/api';
const CLIENT_ID = 'your_github_client_id';

export const loginWithGitHub = () => {
  window.location.href = `${AUTH_SERVICE_URL}/auth/github?client_id=${CLIENT_ID}`;
};

// Callback page
export const handleAuthCallback = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const user = params.get('user');

  if (token) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', user);
    // Redirect to dashboard
    window.location.href = '/dashboard';
  }
};

// Protected API calls
export const fetchProtectedData = async () => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('https://your-api.com/data', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

### Vue пример

```typescript
// auth.service.ts
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const authService = {
  login() {
    window.location.href = `${API_URL}/auth/github`;
  },

  async validateToken(token: string) {
    const response = await axios.get(`${API_URL}/auth/validate`, {
      params: { token }
    });
    return response.data;
  },

  async getCurrentUser(token: string) {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
```

## 🔐 Множественные клиенты (проекты)

Для нескольких фронтендов используй разделитель `|`:

```env
GITHUB_CLIENTS=client1_id:secret1:http://app1.com/callback|client2_id:secret2:http://app2.com/callback
```

Каждый фронтенд должен передавать свой `client_id`:

```typescript
window.location.href = `${AUTH_URL}/auth/github?client_id=${YOUR_CLIENT_ID}`;
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

### Vercel / Railway / Render / fly.io

1. Добавь environment variables через UI
2. Деплой из GitHub репозитория
3. Обнови callback URLs в GitHub OAuth App

## 📝 Лицензия

MIT
