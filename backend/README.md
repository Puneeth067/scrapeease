
# 🧠 ScrapeEase Backend

This is the backend for **ScrapeEase**, powered by **FastAPI**, designed to extract and serve tabular data from any public website using AI and web scraping strategies.

## 🚀 Getting Started

### 1. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

The backend will run at [http://localhost:8000](http://localhost:8000)

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory with:

```
ALLOWED_HOSTS=http://localhost:5173,http://127.0.0.1:5173
```

These values are used to configure CORS.

---

## 📁 Project Structure

```
backend/
│
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── files.py
│   │   │   └── scraping.py
│   │   └── __init__.py
│   ├── core/
│   │   └── config.py
│   ├── utils/
│   │   └── scraping_utils.py
│   ├── main.py
│   └── models/ (optional)
├── requirements.txt
└── .env
```

---

## 🧩 Key Features

- ✅ URL validation
- 🔍 Intelligent table detection
- 📁 File export API
- 🌍 CORS-configured for frontend communication

---

## 📦 Dependencies

- FastAPI
- Uvicorn
- BeautifulSoup4
- python-dotenv
- pandas
- aiohttp

---

## 🔒 CORS Configuration

In `main.py`, we use CORS middleware to allow frontend requests from allowed hosts:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## ✨ Author

Built with ❤️ by Puneeth Kumar
