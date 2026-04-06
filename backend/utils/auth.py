"""
Authentication utilities for the demo backend.
"""

from typing import Any, Dict
import random
import secrets
import string


def normalize_email(email: str) -> str:
    """Normalize user email for storage and comparisons."""
    return (email or "").strip().lower()


def create_user_id() -> str:
    """Create a readable demo user identifier."""
    return f"user_{secrets.token_hex(6)}"


def create_session_token(bytes_length: int = 32) -> str:
    """Create a secure session token."""
    return secrets.token_urlsafe(bytes_length)


def generate_secure_password(length: int = 14) -> str:
    """Generate a strong password with mixed character classes."""
    minimum_length = max(length, 12)
    rng = random.SystemRandom()

    required_characters = [
        rng.choice(string.ascii_uppercase),
        rng.choice(string.ascii_lowercase),
        rng.choice(string.digits),
        rng.choice("!@#$%*?-_=+"),
    ]

    alphabet = string.ascii_letters + string.digits + "!@#$%*?-_=+"
    while len(required_characters) < minimum_length:
        required_characters.append(rng.choice(alphabet))

    rng.shuffle(required_characters)
    return "".join(required_characters)


def sanitize_user_record(user_record: Dict[str, Any]) -> Dict[str, Any]:
    """Return the safe subset of a user record for API responses."""
    return {
        "id": user_record["id"],
        "name": user_record["name"],
        "email": user_record["email"],
        "consent": user_record.get("consent", False),
        "createdAt": user_record.get("createdAt"),
        "lastLoginAt": user_record.get("lastLoginAt"),
        "passwordUpdatedAt": user_record.get("passwordUpdatedAt"),
    }
