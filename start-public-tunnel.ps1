Write-Host "Starting Mini D-Mart Persistent Tunnel..." -ForegroundColor Green
while ($true) {
    Write-Host "Connecting tunnel to localhost:8082..." -ForegroundColor Yellow
    ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -R 80:localhost:8082 nokey@localhost.run
    Write-Host "Tunnel disconnected. Reconnecting in 3 seconds..." -ForegroundColor Red
    Start-Sleep -Seconds 3
}
