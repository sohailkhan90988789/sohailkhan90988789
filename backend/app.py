"""
Mental Well-Being Backend API
Flask server with behavioral pattern analysis and lightweight auth flows.
"""

from datetime import datetime, timedelta
import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash

from services.data_processor import DataProcessor
from services.email_service import EmailService
from services.insight_generator import InsightGenerator
from services.pattern_detector import PatternDetector
from utils.auth import (
    create_session_token,
    create_user_id,
    generate_secure_password,
    normalize_email,
    sanitize_user_record,
)
from utils.privacy import anonymize_data, check_consent
from utils.validators import (
    validate_behavioral_data,
    validate_email_address,
    validate_password_strength,
    validate_required_text,
)

load_dotenv()

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    },
)

pattern_detector = PatternDetector()
data_processor = DataProcessor()
insight_generator = InsightGenerator()
email_service = EmailService()

# In-memory demo storage
user_data_store = {}
insights_cache = {}
users_store = {}
user_lookup = {}
active_sessions = {}


def current_timestamp() -> str:
    """Return a stable UTC timestamp string."""
    return f"{datetime.utcnow().replace(microsecond=0).isoformat()}Z"


def get_user_by_id(user_id: str):
    """Fetch a user record using the readable user id."""
    email = user_lookup.get(user_id)
    return users_store.get(email) if email else None


def has_user_consent(user_id: str) -> bool:
    """Respect stored consent when the user exists, otherwise keep demo fallback."""
    user_record = get_user_by_id(user_id)
    if user_record is not None:
        return bool(user_record.get("consent", False))

    return check_consent(user_id)


def create_session(user_record: dict) -> str:
    """Create and store a session token for a user."""
    token = create_session_token()
    timestamp = current_timestamp()
    active_sessions[token] = {
        "userId": user_record["id"],
        "email": user_record["email"],
        "createdAt": timestamp,
        "lastSeenAt": timestamp,
    }
    return token


def revoke_user_sessions(user_id: str) -> None:
    """Invalidate all active sessions for a user."""
    for token, session in list(active_sessions.items()):
        if session.get("userId") == user_id:
            del active_sessions[token]


def get_authenticated_user():
    """Resolve the current user from a Bearer token."""
    authorization_header = request.headers.get("Authorization", "")
    if not authorization_header.lower().startswith("bearer "):
        return None, None

    token = authorization_header.split(" ", 1)[1].strip()
    session = active_sessions.get(token)
    if session is None:
        return token, None

    user_record = users_store.get(session["email"])
    if user_record is None:
        active_sessions.pop(token, None)
        return token, None

    session["lastSeenAt"] = current_timestamp()
    return token, user_record


def authentication_error():
    """Standard auth error response."""
    return jsonify({"error": "Authentication required"}), 401


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify(
        {
            "status": "healthy",
            "service": "Mental Well-Being API",
            "version": "1.1.0",
            "timestamp": current_timestamp(),
            "authEnabled": True,
            "emailMode": "smtp" if email_service.is_configured() else "simulated",
        }
    ), 200


@app.route("/api/auth/register", methods=["POST"])
def register():
    """Create a user account, issue a session, and send a welcome email."""
    try:
        data = request.get_json(silent=True) or {}
        name = (data.get("name") or "").strip()
        email = normalize_email(data.get("email"))
        password = data.get("password") or ""
        consent = bool(data.get("consent"))

        is_valid, error_message = validate_required_text(
            "name",
            name,
            minimum_length=2,
            maximum_length=80,
        )
        if not is_valid:
            return jsonify({"error": error_message}), 400

        is_valid, error_message = validate_email_address(email)
        if not is_valid:
            return jsonify({"error": error_message}), 400

        is_valid, error_message = validate_password_strength(password)
        if not is_valid:
            return jsonify({"error": error_message}), 400

        if not consent:
            return jsonify({"error": "Consent is required to create an account"}), 400

        if email in users_store:
            return jsonify({"error": "An account with this email already exists"}), 409

        timestamp = current_timestamp()
        user_record = {
            "id": create_user_id(),
            "name": name,
            "email": email,
            "passwordHash": generate_password_hash(password),
            "consent": True,
            "createdAt": timestamp,
            "lastLoginAt": timestamp,
            "passwordUpdatedAt": timestamp,
        }

        users_store[email] = user_record
        user_lookup[user_record["id"]] = email
        user_data_store.setdefault(user_record["id"], [])

        token = create_session(user_record)
        email_delivery = email_service.send_welcome_email(name, email)

        return jsonify(
            {
                "success": True,
                "token": token,
                "user": sanitize_user_record(user_record),
                "emailDelivery": email_delivery,
            }
        ), 201
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/auth/login", methods=["POST"])
def login():
    """Sign a user in and create a new session token."""
    try:
        data = request.get_json(silent=True) or {}
        email = normalize_email(data.get("email"))
        password = data.get("password") or ""

        is_valid, error_message = validate_email_address(email)
        if not is_valid:
            return jsonify({"error": error_message}), 400

        user_record = users_store.get(email)
        if user_record is None or not check_password_hash(user_record["passwordHash"], password):
            return jsonify({"error": "Invalid email or password"}), 401

        user_record["lastLoginAt"] = current_timestamp()
        token = create_session(user_record)

        return jsonify(
            {
                "success": True,
                "token": token,
                "user": sanitize_user_record(user_record),
            }
        ), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    """Invalidate the current session."""
    try:
        token, _ = get_authenticated_user()
        if token:
            active_sessions.pop(token, None)

        return jsonify({"success": True, "message": "Signed out successfully"}), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/auth/me", methods=["GET"])
def get_current_user():
    """Return the signed-in user from the current session token."""
    try:
        _, user_record = get_authenticated_user()
        if user_record is None:
            return authentication_error()

        return jsonify({"success": True, "user": sanitize_user_record(user_record)}), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/auth/forgot-password", methods=["POST"])
def forgot_password():
    """Generate a temporary password and send it to the user email."""
    try:
        data = request.get_json(silent=True) or {}
        email = normalize_email(data.get("email"))

        is_valid, error_message = validate_email_address(email)
        if not is_valid:
            return jsonify({"error": error_message}), 400

        generic_message = {
            "success": True,
            "message": "If an account exists for this email, a temporary password has been prepared.",
        }

        user_record = users_store.get(email)
        if user_record is None:
            return jsonify(generic_message), 200

        temporary_password = generate_secure_password()
        user_record["passwordHash"] = generate_password_hash(temporary_password)
        user_record["passwordUpdatedAt"] = current_timestamp()
        revoke_user_sessions(user_record["id"])

        email_delivery = email_service.send_temporary_password_email(
            user_record["name"],
            email,
            temporary_password,
        )

        return jsonify({**generic_message, "emailDelivery": email_delivery}), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/behavioral-data", methods=["POST"])
def submit_behavioral_data():
    """Submit behavioral data for a user."""
    try:
        data = request.get_json(silent=True) or {}

        is_valid, error_message = validate_behavioral_data(data)
        if not is_valid:
            return jsonify({"error": error_message}), 400

        user_id = data.get("userId")
        if not has_user_consent(user_id):
            return jsonify({"error": "User consent required"}), 403

        if user_id not in user_data_store:
            user_data_store[user_id] = []

        data["timestamp"] = current_timestamp()
        user_data_store[user_id].append(data)
        insights_cache.pop(user_id, None)

        return jsonify(
            {
                "success": True,
                "message": "Behavioral data stored successfully",
                "dataPoints": len(user_data_store[user_id]),
            }
        ), 201
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/behavioral-data/<user_id>", methods=["GET"])
def get_behavioral_data(user_id):
    """Get behavioral data for a user."""
    try:
        if not has_user_consent(user_id):
            return jsonify({"error": "User consent required"}), 403

        days = int(request.args.get("days", 30))
        if user_id not in user_data_store:
            return jsonify({"data": []}), 200

        cutoff_date = datetime.now() - timedelta(days=days)
        filtered_data = [
            entry
            for entry in user_data_store[user_id]
            if datetime.fromisoformat(entry["date"]) >= cutoff_date
        ]
        filtered_data.sort(key=lambda item: item["date"])

        return jsonify(
            {
                "userId": user_id,
                "data": filtered_data,
                "count": len(filtered_data),
            }
        ), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/insights/<user_id>", methods=["GET"])
def get_insights(user_id):
    """Generate explainable insights for user behavioral patterns."""
    try:
        if not has_user_consent(user_id):
            return jsonify({"error": "User consent required"}), 403

        if user_id in insights_cache:
            cache_time = insights_cache[user_id]["timestamp"]
            if datetime.now() - cache_time < timedelta(hours=1):
                return jsonify(insights_cache[user_id]["data"]), 200

        if user_id not in user_data_store or len(user_data_store[user_id]) < 7:
            return jsonify(
                {
                    "insights": [],
                    "message": "Insufficient data for pattern analysis. Need at least 7 days of data.",
                }
            ), 200

        processed_data = data_processor.process(user_data_store[user_id])
        patterns = pattern_detector.detect_patterns(processed_data)
        insights = insight_generator.generate_insights(patterns, processed_data)
        anonymized_insights = anonymize_data(insights)

        insights_cache[user_id] = {
            "timestamp": datetime.now(),
            "data": {
                "insights": anonymized_insights,
                "generatedAt": current_timestamp(),
                "dataPoints": len(user_data_store[user_id]),
            },
        }

        return jsonify(insights_cache[user_id]["data"]), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/correlations/<user_id>", methods=["GET"])
def get_correlations(user_id):
    """Calculate correlations between behavioral dimensions."""
    try:
        if not has_user_consent(user_id):
            return jsonify({"error": "User consent required"}), 403

        if user_id not in user_data_store or len(user_data_store[user_id]) < 7:
            return jsonify({"error": "Insufficient data"}), 400

        correlations = data_processor.calculate_correlations(user_data_store[user_id])
        return jsonify(
            {
                "userId": user_id,
                "correlations": correlations,
                "generatedAt": current_timestamp(),
            }
        ), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/trends/<user_id>", methods=["GET"])
def get_trends(user_id):
    """Get trend analysis for behavioral metrics."""
    try:
        if not has_user_consent(user_id):
            return jsonify({"error": "User consent required"}), 403

        if user_id not in user_data_store:
            return jsonify({"error": "No data found"}), 404

        trends = data_processor.analyze_trends(user_data_store[user_id])
        return jsonify(
            {
                "userId": user_id,
                "trends": trends,
                "generatedAt": current_timestamp(),
            }
        ), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/privacy/export/<user_id>", methods=["GET"])
def export_user_data(user_id):
    """Export all user data for GDPR access requests."""
    try:
        if not has_user_consent(user_id):
            return jsonify({"error": "User consent required"}), 403

        if user_id not in user_data_store:
            return jsonify({"data": []}), 200

        return jsonify(
            {
                "userId": user_id,
                "exportDate": current_timestamp(),
                "data": user_data_store[user_id],
                "totalRecords": len(user_data_store[user_id]),
            }
        ), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/privacy/delete/<user_id>", methods=["DELETE"])
def delete_user_data(user_id):
    """Delete all user data for GDPR deletion requests."""
    try:
        user_data_store.pop(user_id, None)
        insights_cache.pop(user_id, None)
        revoke_user_sessions(user_id)

        user_record = get_user_by_id(user_id)
        if user_record is not None:
            users_store.pop(user_record["email"], None)
            user_lookup.pop(user_id, None)

        return jsonify(
            {
                "success": True,
                "message": "All user data deleted successfully",
                "userId": user_id,
            }
        ), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/analytics/summary", methods=["GET"])
def get_analytics_summary():
    """Get anonymized, aggregated analytics for research views."""
    try:
        total_users = len(user_data_store)
        total_data_points = sum(len(entries) for entries in user_data_store.values())

        return jsonify(
            {
                "totalUsers": total_users,
                "totalDataPoints": total_data_points,
                "averageDataPointsPerUser": (
                    total_data_points / total_users if total_users > 0 else 0
                ),
                "timestamp": current_timestamp(),
                "note": "All data is anonymized and aggregated for research purposes",
            }
        ), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.errorhandler(404)
def not_found(_error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(_error):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    port = int(os.getenv("API_PORT", 5000))
    debug = os.getenv("FLASK_ENV") == "development"

    print("=" * 68)
    print("Mental Well-Being Backend API")
    print(f"Running on: http://localhost:{port}")
    print(f"Environment: {os.getenv('FLASK_ENV', 'development')}")
    print(
        "Email delivery mode: "
        + ("SMTP" if email_service.is_configured() else "Simulated preview")
    )
    print("=" * 68)

    app.run(host="0.0.0.0", port=port, debug=debug)
