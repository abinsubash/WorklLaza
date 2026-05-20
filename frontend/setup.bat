@echo off
REM WorkLaza Frontend Setup Script for Windows

echo.
echo ===================================
echo  WorkLaza Frontend Setup
echo ===================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

echo Node.js version:
node --version
npm --version

echo.
echo [1/2] Installing dependencies...
npm install

echo.
echo [2/2] Setup complete!
echo.
echo ===================================
echo  Setup Complete!
echo ===================================
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo The frontend will be available at:
echo   http://localhost:5173
echo.
pause
