# Mental Well-Being Backend API

Python Flask backend with Machine Learning for behavioral pattern analysis.

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment (recommended)
python -m venv venv

# 3. Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Copy environment file
cp .env.example .env

# 6. Run the server
python app.py
```

Server will start at: **http://localhost:5000**

## 📁 Project Structure

```
backend/
├── app.py                      # Main Flask application
├── requirements.txt            # Python dependencies
├── .env.example               # Environment variables template
├── services/
│   ├── pattern_detector.py   # ML pattern detection
│   ├── data_processor.py     # Data processing & statistics
│   └── insight_generator.py  # Insight generation
└── utils/
    ├── validators.py          # Input validation
    └── privacy.py             # Privacy & security utilities
```

## 🔌 API Endpoints

### Health Check
```bash
GET /api/health
```

### Submit Behavioral Data
```bash
POST /api/behavioral-data
Content-Type: application/json

{
  "userId": "user123",
  "date": "2026-02-02",
  "sleepHours": 7.5,
  "sleepQuality": 8,
  "physicalActivity": 6,
  "socialInteraction": 7,
  "screenTime": 5,
  "moodScore": 8,
  "stressLevel": 4,
  "productivityScore": 7
}
```

### Get Behavioral Data
```bash
GET /api/behavioral-data/{userId}?days=30
```

### Get AI Insights
```bash
GET /api/insights/{userId}
```

### Get Correlations
```bash
GET /api/correlations/{userId}
```

### Get Trends
```bash
GET /api/trends/{userId}
```

### Export User Data (GDPR)
```bash
GET /api/privacy/export/{userId}
```

### Delete User Data (GDPR)
```bash
DELETE /api/privacy/delete/{userId}
```

## 🧠 Machine Learning Features

### Pattern Detection
- **Trend Analysis**: Detects upward/downward trends using linear regression
- **Anomaly Detection**: Identifies unusual patterns using Z-score analysis
- **Correlation Analysis**: Finds relationships between behavioral dimensions
- **Recurring Patterns**: Detects weekly/cyclical patterns

### Explainable AI
- All insights include confidence scores
- Contributing factors are clearly listed
- Transparent reasoning for all detections
- Evidence-based recommendations

## 🔒 Privacy & Security

### Features
- ✅ End-to-end encryption ready
- ✅ GDPR compliant (export, delete)
- ✅ Data anonymization
- ✅ Consent management
- ✅ Audit logging
- ✅ 90-day data retention

### Privacy Compliance
```python
# Check GDPR compliance
GET /api/privacy/export/{userId}    # Right to access
DELETE /api/privacy/delete/{userId} # Right to be forgotten
```

## 🧪 Testing

### Test with cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Submit data
curl -X POST http://localhost:5000/api/behavioral-data \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "date": "2026-02-02",
    "sleepQuality": 8,
    "moodScore": 7,
    "stressLevel": 4,
    "socialInteraction": 6,
    "physicalActivity": 7,
    "productivityScore": 8
  }'

# Get insights
curl http://localhost:5000/api/insights/test_user
```

### Test with Python
```python
import requests

# Submit data
response = requests.post('http://localhost:5000/api/behavioral-data', json={
    'userId': 'test_user',
    'date': '2026-02-02',
    'sleepQuality': 8,
    'moodScore': 7,
    'stressLevel': 4
})

print(response.json())
```

## 🔧 Configuration

Edit `.env` file:

```env
FLASK_ENV=development
API_PORT=5000
CORS_ORIGINS=http://localhost:5173
ML_CONFIDENCE_THRESHOLD=0.70
DATA_RETENTION_DAYS=90
```

## 📊 ML Algorithms Used

1. **Linear Regression** - Trend detection
2. **Z-Score Analysis** - Anomaly detection
3. **Pearson Correlation** - Relationship analysis
4. **Statistical Analysis** - Pattern significance

## 🌐 Connecting to Frontend

Frontend runs on: `http://localhost:5173`
Backend runs on: `http://localhost:5000`

CORS is configured automatically. Frontend can call APIs:

```typescript
// Example frontend API call
const response = await fetch('http://localhost:5000/api/insights/user123');
const insights = await response.json();
```

## 📝 Production Deployment

### Requirements for Production
1. Use PostgreSQL/MongoDB instead of in-memory storage
2. Enable proper encryption (not hashing)
3. Add authentication (JWT tokens)
4. Use HTTPS
5. Add rate limiting
6. Implement proper logging
7. Add monitoring (Sentry, DataDog)
8. Use environment-specific configs

### Recommended Stack
- **Database**: PostgreSQL with encryption
- **Cache**: Redis
- **Authentication**: JWT or OAuth2
- **Deployment**: Docker + Kubernetes or Heroku
- **Monitoring**: Prometheus + Grafana

## ⚠️ Important Notes

- **Not for Diagnosis**: This is a research tool, not for medical diagnosis
- **Demo Data**: Currently uses in-memory storage
- **Privacy First**: Designed with privacy by default
- **Research Grade**: Built for academic/research purposes

## 🤝 Support

For issues or questions:
1. Check API documentation above
2. Review error messages in terminal
3. Check CORS configuration
4. Verify Python version (3.8+)

## 📄 License

Research Project - Educational Purpose
Not for clinical use or medical diagnosis
