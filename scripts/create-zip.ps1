$targetZip = "c:\Users\USER\Desktop\asp\reforge-ai-translator.zip"
$stageDir = "c:\Users\USER\Desktop\asp\reforge-stage"

if (Test-Path $stageDir) {
    Remove-Item -Recurse -Force $stageDir
}
if (Test-Path $targetZip) {
    Remove-Item -Force $targetZip
}

New-Item -ItemType Directory -Path "$stageDir\src\components" -Force | Out-Null
New-Item -ItemType Directory -Path "$stageDir\src\app\reforge" -Force | Out-Null

Copy-Item "c:\Users\USER\Desktop\asp\index.html" -Destination "$stageDir\index.html"
Copy-Item "c:\Users\USER\Desktop\asp\README-REFORGE.md" -Destination "$stageDir\README.md"
Copy-Item "c:\Users\USER\Desktop\asp\src\components\ReforgeTranslator.tsx" -Destination "$stageDir\src\components\ReforgeTranslator.tsx"
Copy-Item "c:\Users\USER\Desktop\asp\src\app\reforge\page.tsx" -Destination "$stageDir\src\app\reforge\page.tsx"

Compress-Archive -Path "$stageDir\*" -DestinationPath $targetZip -Force
Remove-Item -Recurse -Force $stageDir

Write-Host "ZIP created successfully at $targetZip"
Get-Item $targetZip | Select-Object Name, Length, LastWriteTime
