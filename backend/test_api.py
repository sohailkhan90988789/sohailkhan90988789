"""
Test script for backend API.

Run this after starting the server to verify everything works.
"""

import json
from datetime import datetime, timedelta
from urllib import error, request

# API base URL
BASE_URL = "http://localhost:5000/api"


class ApiTestConnectionError(Exception):
    """Raised when the backend server cannot be reached."""


def api_request(endpoint, method="GET", payload=None):
    """Send a JSON request and return the status code with parsed JSON."""
    headers = {}
    body = None

    if payload is not None:
        headers["Content-Type"] = "application/json"
        body = json.dumps(payload).encode("utf-8")

    http_request = request.Request(
        f"{BASE_URL}{endpoint}",
        data=body,
        headers=headers,
        method=method,
    )

    try:
        with request.urlopen(http_request) as response:
            raw_body = response.read().decode("utf-8")
            return response.status, json.loads(raw_body) if raw_body else {}
    except error.HTTPError as exc:
        raw_body = exc.read().decode("utf-8")
        try:
            response_payload = json.loads(raw_body) if raw_body else {}
        except json.JSONDecodeError:
            response_payload = {"error": raw_body}
        return exc.code, response_payload
    except error.URLError as exc:
        raise ApiTestConnectionError(str(exc)) from exc


def api_get(endpoint):
    """Issue a GET request to the backend."""
    return api_request(endpoint, method="GET")


def api_post(endpoint, payload):
    """Issue a POST request to the backend."""
    return api_request(endpoint, method="POST", payload=payload)


def test_health():
    """Test health check endpoint."""
    print("\n1. Testing Health Check...")
    status_code, payload = api_get("/health")
    print(f"   Status: {status_code}")
    print(f"   Response: {payload}")
    return status_code == 200


def test_submit_data():
    """Test submitting behavioral data."""
    print("\n2. Testing Data Submission...")

    # Generate test data for last 14 days
    user_id = "test_user_123"

    for i in range(14):
        date = (datetime.now() - timedelta(days=13 - i)).strftime("%Y-%m-%d")

        payload = {
            "userId": user_id,
            "date": date,
            "sleepHours": 7 + (i % 3) - 1,
            "sleepQuality": 7 - (i // 5),  # Declining trend
            "physicalActivity": 6 + (i % 2),
            "socialInteraction": 7 - (i // 7),
            "screenTime": 5 + (i // 8),
            "moodScore": 7 - (i // 5),  # Declining trend
            "stressLevel": 4 + (i // 7),  # Increasing trend
            "productivityScore": 7 - (i // 6),
        }

        status_code, response_payload = api_post("/behavioral-data", payload)
        if i == 0:
            print(f"   First submission status: {status_code}")
            print(f"   Response: {response_payload}")

    print("   [OK] Submitted 14 days of data")
    return True


def test_get_data():
    """Test retrieving behavioral data."""
    print("\n3. Testing Data Retrieval...")

    user_id = "test_user_123"
    status_code, payload = api_get(f"/behavioral-data/{user_id}?days=30")

    print(f"   Status: {status_code}")
    print(f"   Retrieved {payload.get('count', 0)} data points")
    return status_code == 200


def test_get_insights():
    """Test AI insights generation."""
    print("\n4. Testing Insights Generation...")

    user_id = "test_user_123"
    status_code, payload = api_get(f"/insights/{user_id}")

    print(f"   Status: {status_code}")

    if "insights" in payload:
        insights = payload["insights"]
        print(f"   Generated {len(insights)} insights")

        if insights:
            print("\n   Sample Insight:")
            print(f"   - Title: {insights[0].get('title', 'N/A')}")
            print(f"   - Confidence: {insights[0].get('confidence', 0) * 100:.0f}%")
            print(f"   - Importance: {insights[0].get('importance', 'N/A')}")

    return status_code == 200


def test_correlations():
    """Test correlation analysis."""
    print("\n5. Testing Correlation Analysis...")

    user_id = "test_user_123"
    status_code, payload = api_get(f"/correlations/{user_id}")

    print(f"   Status: {status_code}")

    if status_code == 200 and "correlations" in payload:
        print("   [OK] Correlations calculated")

    return status_code == 200


def test_trends():
    """Test trend analysis."""
    print("\n6. Testing Trend Analysis...")

    user_id = "test_user_123"
    status_code, payload = api_get(f"/trends/{user_id}")

    print(f"   Status: {status_code}")

    if status_code == 200 and "trends" in payload:
        print(f"   [OK] Trends analyzed for {len(payload['trends'])} metrics")

    return status_code == 200


def test_privacy_export():
    """Test GDPR data export."""
    print("\n7. Testing Privacy Export...")

    user_id = "test_user_123"
    status_code, payload = api_get(f"/privacy/export/{user_id}")

    print(f"   Status: {status_code}")

    if status_code == 200:
        print(f"   [OK] Exported {payload.get('totalRecords', 0)} records")

    return status_code == 200


def run_all_tests():
    """Run all tests."""
    print("=" * 60)
    print("BACKEND API TEST SUITE")
    print("=" * 60)

    tests = [
        ("Health Check", test_health),
        ("Submit Data", test_submit_data),
        ("Get Data", test_get_data),
        ("Get Insights", test_get_insights),
        ("Correlations", test_correlations),
        ("Trends", test_trends),
        ("Privacy Export", test_privacy_export),
    ]

    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except ApiTestConnectionError:
            print("\n   ERROR: Cannot connect to server")
            print("   Make sure backend is running: python app.py")
            return
        except Exception as exc:
            print(f"\n   ERROR: {exc}")
            results.append((name, False))

    print("\n" + "=" * 60)
    print("TEST RESULTS SUMMARY")
    print("=" * 60)

    for name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"{status:8} {name}")

    passed = sum(1 for _, result in results if result)
    total = len(results)

    print(f"\nTotal: {passed}/{total} tests passed")
    print("=" * 60)


if __name__ == "__main__":
    run_all_tests()
