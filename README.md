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

## 🐳 Docker Support

### Build Image

```bash
docker compose build
```

### Run Container

```bash
docker compose up
```

Visit: [http://localhost:4173](http://localhost:4173)

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