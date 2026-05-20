#!/bin/bash

# WorkLaza Frontend Setup Script for macOS/Linux

echo ""
echo "==================================="
echo " WorkLaza Frontend Setup"
echo "==================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo "Node.js version:"
node --version
npm --version

echo ""
echo "[1/2] Installing dependencies..."
npm install

echo ""
echo "[2/2] Setup complete!"
echo ""
echo "==================================="
echo " Setup Complete!"
echo "==================================="
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "The frontend will be available at:"
echo "  http://localhost:5173"
echo ""
