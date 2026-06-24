@echo off
title Sarina Shoe Center - Local Development Runner
echo ===================================================
echo   Starting Sarina Shoe Center local environment...
echo ===================================================
echo.

:: Check if node_modules exists, run npm install with legacy-peer-deps if missing
if not exist node_modules (
    echo [0/2] node_modules folder is missing. Installing dependencies with legacy-peer-deps...
    call npm install --legacy-peer-deps
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] npm install failed. Please ensure Node.js is installed on your system.
        pause
        exit /b %ERRORLEVEL%
    )
    echo Dependencies installed successfully.
    echo.
)

echo [1/2] Applying local Cloudflare D1 database migrations...
call npx wrangler d1 migrations apply sarina --local
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [WARNING] D1 Migrations could not be applied automatically.
    echo Make sure you have wrangler installed and D1 database configured.
    echo Continuing to start dev server anyway...
)
echo.

echo [2/2] Starting Next.js local development server...
echo.
call npm run dev

pause
