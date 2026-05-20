@echo off
REM WorkLaza Backend Setup Script for Windows

echo.
echo ===================================
echo  WorkLaza Backend Setup
echo ===================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.13+ from https://www.python.org
    pause
    exit /b 1
)

echo [1/5] Creating virtual environment...
if not exist venv (
    python -m venv venv
    echo Virtual environment created
) else (
    echo Virtual environment already exists
)

echo [2/5] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/5] Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt

echo [4/5] Setting up environment file...
if not exist .env (
    echo Creating .env file from template...
    (
        echo # Django Settings
        echo SECRET_KEY=django-insecure-change-me-in-production
        echo JWT_SECRET_KEY=jwt-secret-key-change-me
        echo DEBUG=True
        echo DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
        echo.
        echo # Database Configuration
        echo DATABASE_ENGINE=postgresql
        echo DATABASES_NAME=worklaza_db
        echo DATABASES_USER=worklaza_user
        echo DATABASES_PASSWORD=your_secure_password
        echo DATABASE_HOST=localhost
        echo DATABASES_PORT=5432
        echo.
        echo # Email Configuration
        echo EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
        echo EMAIL_HOST_USER=your-email@gmail.com
        echo EMAIL_HOST_PASSWORD=your-app-password
        echo.
        echo # Google OAuth
        echo GOOGLE_AUTH_CLIENT_ID=your-client-id
        echo GOOGLE_AUTH_CLIENT_SECRET=your-client-secret
        echo.
        echo # Stripe Keys
        echo STRIPE_SECRET_KEY=your-stripe-secret-key
        echo STRIPE_PUBLIC_KEY=your-stripe-public-key
        echo STRIPE_WEBHOOK_SECRET=your-webhook-secret
        echo.
        echo # Celery Configuration
        echo CELERY_BROKER_URL=redis://localhost:6379/0
        echo CELERY_RESULT_BACKEND=redis://localhost:6379/0
    ) > .env
    echo .env file created. Please update it with your configuration.
) else (
    echo .env file already exists
)

echo [5/5] Running migrations...
python manage.py makemigrations
python manage.py migrate

echo.
echo ===================================
echo  Setup Complete!
echo ===================================
echo.
echo Next steps:
echo 1. Update .env file with your database credentials
echo 2. Create a superuser: python manage.py createsuperuser
echo 3. Start the development server:
echo    - Run: daphne -b 127.0.0.1 -p 8000 backend.asgi:application
echo.
echo In separate terminals, run:
echo - Celery Worker: celery -A backend worker --loglevel=info
echo - Celery Beat: celery -A backend beat --loglevel=info
echo.
pause
