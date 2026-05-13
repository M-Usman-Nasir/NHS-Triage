@echo off
setlocal EnableExtensions
REM Maps a spare drive letter to this repo's mobile-app folder so CMake/Ninja paths stay
REM under Windows MAX_PATH while still building all ABIs (incl. armeabi-v7a).
set "DRIVE=R:"
set "ROOT=%~dp0.."
pushd "%ROOT%" || exit /b 1
for %%I in (.) do set "ROOT=%%~fI"
popd
subst %DRIVE% "%ROOT%" >nul 2>&1
if errorlevel 1 (
  subst %DRIVE% "%ROOT%"
  if errorlevel 1 (
    echo Could not map %DRIVE% to "%ROOT%"
    echo If %DRIVE% is in use, run: subst %DRIVE% /d
    echo Then retry, or edit DRIVE= in this script to use another free letter.
    exit /b 1
  )
)
pushd %DRIVE%\android || (subst %DRIVE% /d & exit /b 1)
call gradlew.bat assembleRelease
set "EC=%ERRORLEVEL%"
popd
subst %DRIVE% /d
exit /b %EC%