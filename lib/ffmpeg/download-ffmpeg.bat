@echo off
echo Downloading ffmpeg.wasm core...
powershell -Command "Invoke-WebRequest -Uri 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js' -OutFile 'ffmpeg-core.js'"
powershell -Command "Invoke-WebRequest -Uri 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm' -OutFile 'ffmpeg-core.wasm'"
echo Downloading ffmpeg.wasm main...
powershell -Command "Invoke-WebRequest -Uri 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js' -OutFile 'ffmpeg.js'"
echo Done! ffmpeg.wasm files saved to lib/ffmpeg/
pause
