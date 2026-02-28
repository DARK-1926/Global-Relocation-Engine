# Clean restart script for frontend
Write-Host "🧹 Cleaning Vite cache..." -ForegroundColor Yellow

# Remove Vite cache
if (Test-Path "node_modules/.vite") {
    Remove-Item -Recurse -Force "node_modules/.vite"
    Write-Host "✅ Removed node_modules/.vite" -ForegroundColor Green
}

# Remove dist
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Removed dist" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting dev server..." -ForegroundColor Cyan
npm run dev
