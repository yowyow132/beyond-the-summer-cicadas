@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"

title Beyond the Summer Cicadas - Local & LAN/VPN Server

set "PY_CMD="
where python >nul 2>nul && set PY_CMD=python
if not defined PY_CMD (
  where py >nul 2>nul && set PY_CMD=py -3
)
if not defined PY_CMD (
  if exist "C:\StabilityMatrix\StabilityMatrix-win-x64\Data\Packages\Stable Diffusion WebUI Forge - Neo\venv\Scripts\python.exe" (
    set PY_CMD="C:\StabilityMatrix\StabilityMatrix-win-x64\Data\Packages\Stable Diffusion WebUI Forge - Neo\venv\Scripts\python.exe"
  )
)

if not defined PY_CMD (
  echo Python not found. Opening index.html directly...
  start "" "%~dp0index.html"
  goto :eof
)

set "PORT=8000"
for /l %%P in (8000,1,8020) do (
  netstat -ano | findstr /r /c:":%%P .*LISTENING" >nul 2>nul
  if errorlevel 1 (
    set "PORT=%%P"
    goto :found_port
  )
)

:found_port
echo ========================================================
echo   Beyond the Summer Cicadas (v2.0)
echo   PC URL:    http://127.0.0.1:%PORT%/
powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne '127.0.0.1' -and $_.PrefixOrigin -ne 'WellKnown' } | ForEach-Object { Write-Host ('  Phone/VPN: http://' + $_.IPAddress + ':%PORT%/  (' + $_.InterfaceAlias + ')') }"
echo   Note: Allow Python in Windows Firewall popup if asked.
echo   Close this window or press Ctrl+C to stop the server.
echo ========================================================
echo.

start /b "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Milliseconds 800; Start-Process 'http://127.0.0.1:%PORT%/'"
%PY_CMD% -m http.server %PORT% --bind 0.0.0.0
if errorlevel 1 (
  echo.
  echo Server failed to start. Press any key to open index.html...
  pause >nul
  start "" "%~dp0index.html"
)
