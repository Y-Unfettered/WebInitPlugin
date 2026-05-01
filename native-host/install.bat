@echo off
echo Installing Browser Recorder Native Host...
echo.

set "EXTENSION_ID=fbolclmlfaembkbdmcoolodndpejbbkn"
set "CONFIG_PATH=%~dp0com.browserrecorder.nativehost.json"
set "ABS_CONFIG_PATH=%CONFIG_PATH:\=\\%"
set "HOST_PATH=%~dp0native-host-launcher.bat"
set "ABS_HOST_PATH=%HOST_PATH:\=\\%"

:: Create a temporary JSON config with absolute path
echo { > "%TEMP%\com.browserrecorder.nativehost.json"
echo   "name": "com.browserrecorder.nativehost", >> "%TEMP%\com.browserrecorder.nativehost.json"
echo   "description": "Native host for Browser Operation Recorder", >> "%TEMP%\com.browserrecorder.nativehost.json"
echo   "path": "%ABS_HOST_PATH%", >> "%TEMP%\com.browserrecorder.nativehost.json"
echo   "type": "stdio", >> "%TEMP%\com.browserrecorder.nativehost.json"
echo   "allowed_origins": [ >> "%TEMP%\com.browserrecorder.nativehost.json"
echo     "chrome-extension://%EXTENSION_ID%/" >> "%TEMP%\com.browserrecorder.nativehost.json"
echo   ] >> "%TEMP%\com.browserrecorder.nativehost.json"
echo } >> "%TEMP%\com.browserrecorder.nativehost.json"

:: Install for current user
set "REG_KEY=HKCU\Software\Google\Chrome\NativeMessagingHosts\com.browserrecorder.nativehost"
reg add "%REG_KEY%" /ve /t REG_SZ /d "%TEMP%\com.browserrecorder.nativehost.json" /f >nul

:: Also install for Edge
set "REG_KEY_EDGE=HKCU\Software\Microsoft\Edge\NativeMessagingHosts\com.browserrecorder.nativehost"
reg add "%REG_KEY_EDGE%" /ve /t REG_SZ /d "%TEMP%\com.browserrecorder.nativehost.json" /f >nul

echo Installed Native Messaging host configuration.
echo.
echo Native host now uses Windows PowerShell + SendInput.
echo No Node.js dependency installation is required.
echo.
echo Installation complete!
echo.
pause
