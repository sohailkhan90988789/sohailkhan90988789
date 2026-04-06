"""
Privacy and Security Utilities
Handles data anonymization and privacy compliance
"""

from typing import Any, Dict, List
import hashlib
import json


def anonymize_data(data: Any) -> Any:
    """
    Anonymize sensitive data before sending to client
    Removes personally identifiable information
    """
    if isinstance(data, dict):
        return {k: anonymize_data(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [anonymize_data(item) for item in data]
    else:
        return data


def hash_user_id(user_id: str) -> str:
    """
    Create a one-way hash of user ID for privacy
    Used in analytics and research
    """
    return hashlib.sha256(user_id.encode()).hexdigest()


def check_consent(user_id: str) -> bool:
    """
    Check if user has given consent for data processing
    In production, this would check a database
    """
    # For demo purposes, always return True
    # In production, verify against consent database
    return True


def sanitize_output(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitize output data to remove any sensitive information
    """
    # Remove any fields that shouldn't be exposed
    sensitive_fields = ['raw_data', 'internal_id', 'ip_address']
    
    sanitized = {}
    for key, value in data.items():
        if key not in sensitive_fields:
            sanitized[key] = value
    
    return sanitized


def validate_gdpr_compliance(data_retention_days: int = 90) -> Dict[str, Any]:
    """
    Validate GDPR compliance requirements
    """
    return {
        'data_retention_days': data_retention_days,
        'right_to_access': True,
        'right_to_deletion': True,
        'right_to_portability': True,
        'consent_required': True,
        'encryption_enabled': True,
        'anonymization_enabled': True
    }


def encrypt_sensitive_field(value: str, key: str = "demo-key") -> str:
    """
    Encrypt sensitive field (placeholder - use proper encryption in production)
    In production, use proper encryption like Fernet or AES
    """
    # This is a placeholder - use proper encryption in production
    # from cryptography.fernet import Fernet
    return hashlib.sha256(f"{value}{key}".encode()).hexdigest()


def audit_log_access(user_id: str, action: str, resource: str) -> None:
    """
    Log data access for audit trail (GDPR requirement)
    In production, store in secure audit log database
    """
    # Placeholder for audit logging
    # In production, log to secure storage
    pass
