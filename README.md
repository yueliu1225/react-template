# React Vite Template

---

## 🚀 Tech Stack

- Vite + React 18 + TypeScript
- React Router v6
- Redux Toolkit + RTK Query
- MSW (Mock Service Worker)
- ESLint + Prettier
- Docker
- SCSS (no Tailwind CSS)

---

## 📂 Project Structure (Simplified)

```
src/
├── App.tsx                # Route configuration
├── main.tsx               # App entry, includes Redux, Router, MSW
├── store/                 # Redux setup
├── mocks/                 # MSW mock handlers
├── pages/
│   ├── Home.tsx
│   └── author/Profile.tsx
├── styles/
│   └── index.scss         # Global styles
```

---

## 📦 Getting Started

### Clone Project

```bash
git clone https://github.com/yueliu1225/react-template.git my-app
cd my-app
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Visit: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Mock API Support (MSW)

- Define mock endpoints in `src/mocks/handlers.ts`
- MSW is automatically enabled in development mode

Example:

```ts
http.get('/api/profile', () => HttpResponse.json({ nickname: 'Yue', summary: 'Test user' }))
```

---

## 🔧 Environment Variables

Supports `.env.development` and `.env.production`

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Use it in code via `import.meta.env.VITE_API_BASE_URL`.

---

## 🐳 Docker Setup & Usage

### 🔧 Development Mode (with Hot Reload)

1. Use `Dockerfile.dev` and `docker-compose.dev.yml`:

```bash
npm run docker:dev
```

This runs the Vite dev server inside a container, accessible via:

```
http://localhost:5173
```

2. To stop the development container:

```bash
docker compose -f docker-compose.dev.yml down
```

---

### 🚀 Production Mode (Build & Serve)

1. Use `Dockerfile.prod` and `docker-compose.prod.yml`:

```bash
npm run docker:prod
```

This builds the app and serves it with `vite preview` on:

```
http://localhost:4173
```

2. To stop the production container:

```bash
docker compose -f docker-compose.prod.yml down
```

---

## 📐 Code Quality

### ESLint + Prettier

The project is preconfigured with ESLint and Prettier:

```bash
npm run lint
npm run format
```

---

## ✅ Features Implemented

- ✅ Setup React Router v6
- ✅ Added Redux Toolkit + RTK Query
- ✅ Integrated MSW Mock API
- ✅ Environment variable support (dev/prod)
- ✅ Dockerfile + docker-compose support
- ✅ Example pages: Home & author/Profile

---

## 🔧 Possible Extensions

- 🔒 Authentication (JWT + route guards)
- 🌐 Connect to real backend
- 📥 File upload / Form validation
- 🧪 Unit testing (Vitest + React Testing Library)

---

## 📄 License

MIT