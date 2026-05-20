#!/bin/bash

# WorkLaza Quick Start - All Services in Development Mode

echo ""
echo "==================================="
echo " WorkLaza Development Services"
echo "==================================="
echo ""
echo "This will start all required services for local development."
echo ""
echo "Prerequisites:"
echo "   - PostgreSQL running on localhost:5432"
echo "   - Redis running on localhost:6379"
echo "   - Backend dependencies installed (run setup.sh first)"
echo "   - Frontend dependencies installed"
echo ""

# Get the current directory
BACKEND_DIR="$PWD/backend"
FRONTEND_DIR="$PWD/frontend"

echo "Starting services..."
echo ""

# Start Django Development Server
echo "[1/4] Starting Django Development Server (port 8000)..."
cd "$BACKEND_DIR"
source venv/bin/activate
daphne -b 127.0.0.1 -p 8000 backend.asgi:application &
DJANGO_PID=$!

sleep 2

# Start Celery Worker
echo "[2/4] Starting Celery Worker..."
celery -A backend worker --loglevel=info &
CELERY_PID=$!

sleep 2

# Start Celery Beat
echo "[3/4] Starting Celery Beat (Scheduler)..."
celery -A backend beat --loglevel=info &
BEAT_PID=$!

sleep 2

# Start Frontend Dev Server
echo "[4/4] Starting Frontend Dev Server (port 5173)..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "==================================="
echo " All Services Started!"
echo "==================================="
echo ""
echo "Available at:"
echo "   - Backend API: http://localhost:8000"
echo "   - Admin Panel: http://localhost:8000/admin"
echo "   - Frontend: http://localhost:5173"
echo ""
echo "PIDs:"
echo "   - Django: $DJANGO_PID"
echo "   - Celery: $CELERY_PID"
echo "   - Beat: $BEAT_PID"
echo "   - Frontend: $FRONTEND_PID"
echo ""
echo "To stop all services, run: kill $DJANGO_PID $CELERY_PID $BEAT_PID $FRONTEND_PID"
echo ""

# Wait for all processes
wait
