# Start TASTIVO Development Servers

Write-Host "Starting TASTIVO Development Environment..." -ForegroundColor Green

# Start Backend Server in a new window
Write-Host "Starting Backend Server on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm start"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Frontend Server in a new window
Write-Host "Starting Frontend Server on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm start"

Write-Host "`nBoth servers are starting in separate windows..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "`nYou can close this window." -ForegroundColor Gray
