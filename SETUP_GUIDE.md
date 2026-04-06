# Complete Setup Guide
## Mental Well-Being Behavioral Pattern Analysis System

यह complete guide है frontend aur backend दोनों को setup करने के लिए।

---

## 📋 Prerequisites (पहले ये install करें)

### Required Software:
1. **Node.js** (v18 or higher) - https://nodejs.org/
2. **Python** (v3.8 or higher) - https://python.org/
3. **VS Code** (Recommended) - https://code.visualstudio.com/

### Check Installation:
```bash
node --version    # Should show v18.x.x or higher
python --version  # Should show Python 3.8.x or higher
npm --version     # Should show 9.x.x or higher
```

---

## 🎯 Part 1: Backend Setup (Python Flask)

### Step 1: Backend Installation

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

### Step 2: Start Backend Server

**या manually:**
```bash
python app.py
```

**Backend चलेगा:** `http://localhost:5000`

### Step 3: Test Backend

Open another terminal और test करें:

```bash
# Test health check
curl http://localhost:5000/api/health

# Or run test script
python test_api.py
```

✅ अगर देखे:
```json
{
  "status": "healthy",
  "service": "Mental Well-Being API"
}
```

तो backend successfully चल रहा है! 🎉

---

## 🎨 Part 2: Frontend Setup (React)

### Step 1: Frontend Installation

Open new terminal:

```bash
# Navigate to project root (not backend folder)
cd ..

# Install dependencies
npm install
# Or if using pnpm:
pnpm install
```

### Step 2: Start Frontend

```bash
# Start development server
npm run dev
# Or:
pnpm dev
```

**Frontend चलेगा:** `http://localhost:5173`

### Step 3: Open in Browser

1. Open browser
2. Go to: `http://localhost:5173`
3. आपको dashboard दिखेगा! 🎉

---

## 🔗 Part 3: Connect Frontend to Backend

Dashboard automatically mock data use करता है। Real backend से data लेने के लिए:

### Option 1: Use Backend Data (Coming Soon)
Frontend में API integration already prepared है in `/src/app/services/api.ts`

### Option 2: Continue with Mock Data
Currently app mock data use कर रहा है - demo के लिए perfect है!

---

## 📂 Complete Project Structure

```
your-project/
├── backend/                    # Python Flask Backend
│   ├── app.py                 # Main server
│   ├── requirements.txt       # Python packages
│   ├── services/              # ML & processing
│   │   ├── pattern_detector.py
│   │   ├── data_processor.py
│   │   └── insight_generator.py
│   ├── utils/                 # Utilities
│   │   ├── validators.py
│   │   └── privacy.py
│   ├── test_api.py           # Test script
│   └── README.md             # Backend docs
│
├── src/                       # React Frontend
│   ├── app/
│   │   ├── App.tsx           # Main component
│   │   ├── components/       # All components
│   │   ├── data/             # Mock data
│   │   └── services/         # API service
│   └── styles/               # CSS files
│
├── package.json              # Frontend dependencies
└── README.md                 # Project docs
```

---

## 🚀 Quick Start (दोनों एक साथ)

### Terminal 1 - Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # या Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Terminal 2 - Frontend:
```bash
npm install
npm run dev
```

### Browser:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/health

---

## 🧪 Testing

### Test Backend:
```bash
cd backend
python test_api.py
```

Expected output:
```
✓ PASS Health Check
✓ PASS Submit Data
✓ PASS Get Insights
...
Total: 7/7 tests passed
```

### Test Frontend:
Open http://localhost:5173 और check करें:
- ✅ Dashboard loads
- ✅ Charts visible
- ✅ Tabs work
- ✅ Data shows

---

## 🔧 Common Issues & Solutions

### Issue 1: Backend Port 5000 Already in Use
**Solution:**
```bash
# Change port in .env file
API_PORT=5001

# Then restart backend
python app.py
```

### Issue 2: Python Not Found
**Solution:**
```bash
# Try python3 instead
python3 --version
python3 -m venv venv
python3 app.py
```

### Issue 3: Module Not Found (Python)
**Solution:**
```bash
# Make sure virtual environment is activated
# You should see (venv) in terminal

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue 4: Frontend Not Loading
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue 5: CORS Error
**Solution:**
Backend में CORS already configured है। Check करें:
- Backend चल रहा है `http://localhost:5000`
- Frontend चल रहा है `http://localhost:5173`

---

## 📊 Features Available

### Frontend Features:
- ✅ Dashboard Overview (6 behavioral dimensions)
- ✅ 30-day Timeline Charts
- ✅ AI-Powered Insights
- ✅ Correlation Matrix
- ✅ Weekly Comparison
- ✅ Privacy & Ethics Panel

### Backend Features:
- ✅ RESTful API
- ✅ ML Pattern Detection
- ✅ Trend Analysis
- ✅ Anomaly Detection
- ✅ Correlation Analysis
- ✅ GDPR Compliance (Export/Delete)
- ✅ Privacy-First Design

---

## 🎓 Next Steps

### For Development:
1. Explore API endpoints in backend/README.md
2. Test with `test_api.py`
3. Add more behavioral metrics
4. Customize ML algorithms

### For Production:
1. Add database (PostgreSQL recommended)
2. Implement authentication (JWT)
3. Add HTTPS
4. Deploy backend (Heroku, AWS, etc.)
5. Deploy frontend (Vercel, Netlify)

---

## 📚 Documentation

- **Backend API**: See `/backend/README.md`
- **Frontend Components**: See `/src/app/components/`
- **API Service**: See `/src/app/services/api.ts`

---

## 🆘 Need Help?

### Backend Issues:
```bash
cd backend
python app.py
# Check terminal for errors
```

### Frontend Issues:
```bash
npm run dev
# Check browser console (F12) for errors
```

### Test Everything:
```bash
# Backend
cd backend
python test_api.py

# Frontend
# Open http://localhost:5173 in browser
```

---

## ✅ Verification Checklist

Backend Running:
- [ ] Virtual environment activated
- [ ] Dependencies installed
- [ ] Server running on port 5000
- [ ] Health check returns "healthy"

Frontend Running:
- [ ] Dependencies installed
- [ ] Dev server running on port 5173
- [ ] Dashboard loads in browser
- [ ] All tabs functional
- [ ] Charts rendering

---

## 🎉 Success!

Agar sab kuch chal raha hai:
- Backend: http://localhost:5000 ✅
- Frontend: http://localhost:5173 ✅
- Test API: All tests pass ✅

**Congratulations! Your Mental Well-Being Analysis System is running!** 🚀

---

## 📞 Support

For issues:
1. Check this guide
2. Read error messages carefully
3. Check backend/frontend README files
4. Verify Python & Node versions

---

**Happy Coding! 💻**
