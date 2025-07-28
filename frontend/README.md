
# 🖼️ ScrapeEase Frontend

This is the frontend of **ScrapeEase**, a web-based tool that allows users to extract tabular data from any website using AI.

Built with:

- ⚡ Vite
- ⚛️ React
- 💨 Tailwind CSS
- 🔗 Axios
- [ ] 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

This runs the app at [http://localhost:5173](http://localhost:5173) by default.

---

## 🌐 Environment Variables

Create a `.env` file in the root of the frontend directory:

```
VITE_API_BASE_URL=http://localhost:8000
```

Update this if your backend is hosted elsewhere.

---

## 🔍 Project Structure

```
src/
│
├── components/     # UI components
├── pages/          # Route-based pages
├── api/            # Axios config & API handlers
├── App.jsx         # Root component
└── main.jsx        # Vite entry point
```

---

## 📦 Build for Production

```bash
npm run build
```

---

## 🛠️ Tools Used

- React Router
- Axios
- TailwindCSS
- Vite

---

## 📸 Feature Overview

- 🌐 URL validation
- 📄 Table preview
- 🤖 AI-based scraping
- 📤 Export options
