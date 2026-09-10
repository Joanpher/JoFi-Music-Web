@echo off
title PlayTube - Detener servidor
taskkill /f /im python.exe >nul 2>&1
echo Servidor detenido.
timeout /t 2 /nobreak >nul