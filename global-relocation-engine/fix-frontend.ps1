# Quick fix script for frontend
Write-Host "🔧 Fixing Frontend..." -ForegroundColor Cyan
Write-Host ""

cd "frontend"

Write-Host "1. Clearing Vite cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Recurse -Force "node_modules/.vite"
    Write-Host "   ✅ Cache cleared" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No cache to clear" -ForegroundColor Gray
}

Write-Host ""
Write-Host "2. Clearing dist..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "   ✅ Dist cleared" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No dist to clear" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Frontend fixed!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting dev server..." -ForegroundColor Cyan
Write-Host ""

npm run dev
