@echo off
echo 🌿 EcoSnap AI - Setting up your sustainable shopping assistant...

:: Check if Node.js is installed
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node -v

:: Clean previous installations
echo 🧹 Cleaning previous installations...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist yarn.lock del yarn.lock
if exist bun.lockb del bun.lockb

:: Install dependencies
echo 📦 Installing dependencies...
npm install --legacy-peer-deps

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    echo 💡 Try running 'npm install --force' manually
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully!
echo.
echo 🚀 You can now run:
echo    npm run dev     - Start development server
echo    npm run build   - Build for production  
echo    npm run preview - Preview production build
echo.
echo 🌿 Happy sustainable shopping with EcoSnap AI!
pause
