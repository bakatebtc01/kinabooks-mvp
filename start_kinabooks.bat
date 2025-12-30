@echo off
TITLE KinaBooks Web Server
CLS

ECHO ----------------------------------------------------------------
ECHO                        KINABOOKS
ECHO           Web MVP - Soft Launch Edition
ECHO ----------------------------------------------------------------
ECHO.
ECHO [INFO] Checking environment...

REM Check Node.js
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO [ERROR] Node.js is not installed!
    ECHO Please install Node.js from https://nodejs.org/
    PAUSE
    EXIT
)

REM Check Dependencies
IF NOT EXIST "node_modules\" (
    ECHO [INFO] Installing Dependencies (First Run)...
    call npm install
)

ECHO.
ECHO [INFO] Starting Server in new window...
start "KinaBooks Server" cmd /k npm start

ECHO [INFO] Waiting for server to initialize...
timeout /t 5 /nobreak

ECHO [INFO] Launching Application...
start http://localhost:8080

PAUSE
