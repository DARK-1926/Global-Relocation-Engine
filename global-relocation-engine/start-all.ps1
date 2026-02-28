# Global Relocation Engine - Start Script
Write-Host "🚀 Starting Global Relocation Intelligence Engine..." -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "📡 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\TRAVEL HACK\global-relocation-engine\backend'; Write-Host '🔧 Backend Server' -ForegroundColor Green; npm start"

Start-Sleep -Seconds 2

# Start Frontend
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\TRAVEL HACK\global-relocation-engine\frontend'; Write-Host '🎨 Frontend Server' -ForegroundColor Blue; npm run dev"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "📍 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Wait 5-10 seconds, then open: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to open browser..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "http://localhost:5173"
