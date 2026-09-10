@echo off
title PlayTube - Musica completa (YouTube Music + PWA)
cd /d "%~dp0"

echo ============================================================
echo  PlayTube v2  -  musica COMPLETA + letras + PWA
echo  Preparando dependencias (la primera vez tarda unos segundos)
echo ============================================================

where python >nul 2>nul || (echo  [!] Necesitas Python 3.12 y npm instalados. && pause && exit /b 1)

python -m pip install --quiet ytmusicapi yt-dlp requests 2>nul

cd app
if not exist node_modules (
  echo Instalando dependencias del reproductor...
  call npm install --no-audit --no-fund >nul 2>nul
)
if not exist dist (
  echo Compilando la PWA...
  call npm run build >nul 2>nul
)
cd ..

echo Arrancando servidor...
start "PlayTubeServer" /min python server.py
timeout /t 3 /nobreak >nul
start "" http://localhost:8000
echo.
echo  Listo: http://localhost:8000
echo  En el telefono (misma red): entra a http://IP-de-este-PC:8000
echo  (la IP aparece en la ventana del servidor)
echo.
echo  Deja esta ventana abierta.
pause