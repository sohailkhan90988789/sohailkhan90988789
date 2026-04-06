# ⚡ Quick Start Guide

## 30 Seconds Setup

### 1️⃣ Backend (Terminal 1)
```bash
cd backend
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
✅ Backend running on: **http://localhost:5000**

### 2️⃣ Frontend (Terminal 2)
```bash
npm install
npm run dev
```
✅ Frontend running on: **http://localhost:5173**

### 3️⃣ Test
```bash
# Terminal 3
cd backend
python test_api.py
```

---

## 🎯 Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/behavioral-data` | Submit data |
| GET | `/api/insights/{userId}` | Get AI insights |
| GET | `/api/correlations/{userId}` | Get correlations |
| GET | `/api/trends/{userId}` | Get trends |

---

## 📝 Example API Call

```bash
# Submit behavioral data
curl -X POST http://localhost:5000/api/behavioral-data \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "date": "2026-02-02",
    "sleepQuality": 8,
    "moodScore": 7,
    "stressLevel": 4,
    "socialInteraction": 6,
    "physicalActivity": 7,
    "productivityScore": 8
  }'

# Get insights
curl http://localhost:5000/api/insights/user123
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5000 busy | Change `API_PORT=5001` in `.env` |
| Python not found | Use `python3` instead |
| CORS error | Check both servers running |
| Module error | Re-run `pip install -r requirements.txt` |

---

## 📁 Key Files

```
backend/
├── app.py              # Main server
├── test_api.py         # Test script
└── requirements.txt    # Dependencies

src/
├── app/App.tsx        # Main app
└── services/api.ts    # API service
```

---

## ✅ Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 18+ installed
- [ ] Backend running (port 5000)
- [ ] Frontend running (port 5173)
- [ ] Test API passes

---

**Full guide:** See `SETUP_GUIDE.md`
