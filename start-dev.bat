@echo off
REM WorkLaza Quick Start - All Services in Development Mode

echo.
echo ===================================
echo  WorkLaza Development Services
echo ===================================
echo.
echo This will start all required services for local development.
echo.
echo Prerequisites:
echo   - PostgreSQL running on localhost:5432
echo   - Redis running on localhost:6379
echo   - Backend dependencies installed (run setup.bat first)
echo   - Frontend dependencies installed
echo.
echo Starting services in new windows...
echo.

REM Get the current directory
set BACKEND_DIR=%CD%\backend
set FRONTEND_DIR=%CD%\frontend

REM Activate virtual environment in backend
cd /d "%BACKEND_DIR%"

echo [1/4] Starting Django Development Server (port 8000)...
start "Django Dev Server" cmd /k "venv\Scripts\activate && daphne -b 127.0.0.1 -p 8000 backend.asgi:application"

timeout /t 2

echo [2/4] Starting Celery Worker...
start "Celery Worker" cmd /k "venv\Scripts\activate && celery -A backend worker --loglevel=info"

timeout /t 2

echo [3/4] Starting Celery Beat (Scheduler)...
start "Celery Beat" cmd /k "venv\Scripts\activate && celery -A backend beat --loglevel=info"

timeout /t 2

echo [4/4] Starting Frontend Dev Server (port 5173)...
cd /d "%FRONTEND_DIR%"
start "Frontend Dev Server" cmd /k "npm run dev"

echo.
echo ===================================
echo  All Services Started!
echo ===================================
echo.
echo Available at:
echo   - Backend API: http://localhost:8000
echo   - Admin Panel: http://localhost:8000/admin
echo   - Frontend: http://localhost:5173
echo.
echo Close the command windows to stop services.
echo.
