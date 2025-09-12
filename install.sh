#!/bin/bash

# EcoSnap AI - Installation Script
echo "🌿 EcoSnap AI - Setting up your sustainable shopping assistant..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Clean previous installations
echo "🧹 Cleaning previous installations..."
rm -rf node_modules package-lock.json yarn.lock bun.lockb

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🚀 You can now run:"
    echo "   npm run dev     - Start development server"
    echo "   npm run build   - Build for production"
    echo "   npm run preview - Preview production build"
    echo ""
    echo "🌿 Happy sustainable shopping with EcoSnap AI!"
else
    echo "❌ Failed to install dependencies"
    echo "💡 Try running 'npm install --force' manually"
    exit 1
fi
