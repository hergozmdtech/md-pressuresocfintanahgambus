ECHO OFF
CLS
setlocal

set FILE=.env

findstr /C:"VITE_USE_LOCAL=false" "%FILE%" >nul
if errorlevel 1 (
    echo ERROR: VITE_USE_LOCAL=false not found in %FILE%
    exit /b 1
)

echo OK: VITE_USE_LOCAL=false found

IF [%1]==[] GOTO NO_ARGUMENT

docker build . -t "fredyongjaya/socfin-tanah-gambus-web:%1" -t "fredyongjaya/socfin-tanah-gambus-web:latest

GOTO END

:NO_ARGUMENT

ECHO supply version as first argument

:END