@echo off
REM Mental Well-Being Backend Start Script for Windows

echo ==========================================
echo Mental Well-Being Backend API
echo ==========================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

echo Python found

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo Please update .env with your configuration
)

REM Start server
echo.
echo ==========================================
echo Starting Flask server...
echo ==========================================
python app.py

pause
