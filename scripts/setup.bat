@echo off
REM Batch script to initialize the project

echo.
echo 🚀 Initializing Plateforme Correspondance Commerciale...
echo.

REM Run Python script to organize files
echo Running file organization...
python organize.py

if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to organize files
    exit /b 1
)

echo.
echo 📦 Installing dependencies...
call npm install

if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo.
echo 🗄️ Setting up database...
call npm run db:migrate

if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to setup database
    exit /b 1
)

echo.
echo ✅ Setup completed successfully!
echo.
echo To start development server:
echo npm run dev
echo.
pause
