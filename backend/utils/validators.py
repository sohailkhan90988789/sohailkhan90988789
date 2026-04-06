"""
Data Validation Utilities
Validates incoming behavioral data
"""

from typing import Dict, Any, Tuple
from datetime import datetime
import re


EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def validate_behavioral_data(data: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Validate behavioral data submission
    Returns: (is_valid, error_message)
    """
    
    # Check required fields
    required_fields = ['userId', 'date']
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
    
    # Validate userId
    if not isinstance(data['userId'], str) or len(data['userId']) == 0:
        return False, "Invalid userId"
    
    # Validate date
    try:
        datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
    except (ValueError, AttributeError):
        return False, "Invalid date format. Use ISO format (YYYY-MM-DD)"
    
    # Validate numeric fields (0-10 scale)
    numeric_fields = [
        'sleepHours', 'sleepQuality', 'physicalActivity', 
        'socialInteraction', 'screenTime', 'moodScore', 
        'stressLevel', 'productivityScore'
    ]
    
    for field in numeric_fields:
        if field in data:
            value = data[field]
            
            # Check if numeric
            if not isinstance(value, (int, float)):
                return False, f"{field} must be a number"
            
            # Special case for sleepHours (0-24)
            if field == 'sleepHours':
                if value < 0 or value > 24:
                    return False, f"{field} must be between 0 and 24"
            # Special case for screenTime (0-24)
            elif field == 'screenTime':
                if value < 0 or value > 24:
                    return False, f"{field} must be between 0 and 24"
            # All others (0-10 scale)
            else:
                if value < 0 or value > 10:
                    return False, f"{field} must be between 0 and 10"
    
    return True, ""


def validate_user_id(user_id: str) -> bool:
    """Validate user ID format"""
    if not user_id or not isinstance(user_id, str):
        return False
    
    # Basic validation - alphanumeric and some special chars
    if len(user_id) < 3 or len(user_id) > 100:
        return False
    
    return True


def validate_date_range(start_date: str, end_date: str) -> Tuple[bool, str]:
    """Validate date range"""
    try:
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        if start > end:
            return False, "Start date must be before end date"
        
        # Check range is not too large (max 1 year)
        delta = end - start
        if delta.days > 365:
            return False, "Date range cannot exceed 365 days"
        
        return True, ""
        
    except (ValueError, AttributeError):
        return False, "Invalid date format"


def validate_required_text(
    field_name: str,
    value: str,
    minimum_length: int = 1,
    maximum_length: int = 255,
) -> Tuple[bool, str]:
    """Validate required text fields."""
    if not isinstance(value, str):
        return False, f"{field_name} must be text"

    cleaned_value = value.strip()
    if len(cleaned_value) < minimum_length:
        return False, f"{field_name} must be at least {minimum_length} characters"

    if len(cleaned_value) > maximum_length:
        return False, f"{field_name} must be at most {maximum_length} characters"

    return True, ""


def validate_email_address(email: str) -> Tuple[bool, str]:
    """Validate basic email structure."""
    if not isinstance(email, str) or not EMAIL_REGEX.match(email.strip().lower()):
        return False, "Enter a valid email address"

    return True, ""


def validate_password_strength(password: str) -> Tuple[bool, str]:
    """Validate password length and complexity."""
    if not isinstance(password, str):
        return False, "Password must be a string"

    if len(password) < 8:
        return False, "Password must be at least 8 characters"

    if len(password) > 128:
        return False, "Password must be 128 characters or fewer"

    complexity_checks = [
        any(char.islower() for char in password),
        any(char.isupper() for char in password),
        any(char.isdigit() for char in password),
        any(not char.isalnum() for char in password),
    ]

    if sum(complexity_checks) < 3:
        return False, "Password must include 3 of these: lowercase, uppercase, number, symbol"

    return True, ""
