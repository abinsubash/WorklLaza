#!/bin/bash

# WorkLaza Backend Setup Script for macOS/Linux

echo ""
echo "==================================="
echo " WorkLaza Backend Setup"
echo "==================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.13+ from https://www.python.org"
    exit 1
fi

echo "[1/5] Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "Virtual environment created"
else
    echo "Virtual environment already exists"
fi

echo "[2/5] Activating virtual environment..."
source venv/bin/activate

echo "[3/5] Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "[4/5] Setting up environment file..."
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cat > .env << EOF
# Django Settings
SECRET_KEY=django-insecure-change-me-in-production
JWT_SECRET_KEY=jwt-secret-key-change-me
DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DATABASE_ENGINE=postgresql
DATABASES_NAME=worklaza_db
DATABASES_USER=worklaza_user
DATABASES_PASSWORD=your_secure_password
DATABASE_HOST=localhost
DATABASES_PORT=5432

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Google OAuth
GOOGLE_AUTH_CLIENT_ID=your-client-id
GOOGLE_AUTH_CLIENT_SECRET=your-client-secret

# Stripe Keys
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLIC_KEY=your-stripe-public-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
EOF
    echo ".env file created. Please update it with your configuration."
else
    echo ".env file already exists"
fi

echo "[5/5] Running migrations..."
python manage.py makemigrations
python manage.py migrate

echo ""
echo "==================================="
echo " Setup Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Update .env file with your database credentials"
echo "2. Create a superuser: python manage.py createsuperuser"
echo "3. Start the development server:"
echo "   - Run: daphne -b 127.0.0.1 -p 8000 backend.asgi:application"
echo ""
echo "In separate terminals, run:"
echo "- Celery Worker: celery -A backend worker --loglevel=info"
echo "- Celery Beat: celery -A backend beat --loglevel=info"
echo ""
