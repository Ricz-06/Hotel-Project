$body = @{ usuario = "admin@test.com"; password = "123456" } | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:3000/login" -Method POST -ContentType "application/json" -Body $body -SessionVariable session
Write-Host "Login status:" $response.StatusCode
Write-Host "Login response:"
$response.Content

$me = Invoke-WebRequest -Uri "http://localhost:3000/me" -WebSession $session
Write-Host "`n/me status:" $me.StatusCode
Write-Host "/me response:"
$me.Content
