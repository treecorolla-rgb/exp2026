# PowerShell Cleanup Script - Move Old Files to Archive
# This script safely moves unnecessary files to an _archive folder

Write-Host "Starting Project Cleanup..." -ForegroundColor Cyan
Write-Host ""

# Create archive folder
$archiveFolder = "_archive_old_files"
if (-not (Test-Path $archiveFolder)) {
    New-Item -ItemType Directory -Path $archiveFolder | Out-Null
    Write-Host "Created archive folder: $archiveFolder" -ForegroundColor Green
}

# Files to archive (old/duplicate documentation)
$docsToArchive = @(
    "EMAIL_TEMPLATES_GUIDE.md",
    "EMAIL_TEMPLATES_QUICKSTART.md",
    "EMAIL_TEMPLATES_QUICKSTART_BACKEND.md",
    "EMAIL_TEMPLATES_README.md",
    "EMAIL_TEMPLATES_VISUAL_GUIDE.md",
    "EMAIL_TEMPLATES_PREVIEW.html",
    "EMAIL_SETUP_GUIDE_SECURE.md",
    "EMAIL_SYSTEM_DIAGNOSIS_AND_FIX.md",
    "EMAIL_SYSTEM_ENCRYPTED_GUIDE.md",
    "EMAIL_SYSTEM_FIX_SUMMARY.md",
    "EMAIL_SYSTEM_RESTORE_POINT.md",
    "EMAIL_SYSTEM_SETUP_GUIDE.md",
    "EMAIL_FINAL_STEPS.md",
    "CHANGES_SUMMARY.md",
    "DASHBOARD_ONLY_SETUP.md",
    "replit.md"
)

# SQL files to archive (old/duplicate)
$sqlToArchive = @(
    "EMAIL_TEMPLATES_PROFESSIONAL.sql",
    "FIX_ALL_EMAIL_TRIGGERS.sql",
    "FIX_DISABLE_TRIGGERS.sql",
    "FIX_EMAIL_DUPLICATES.sql",
    "FIX_EMAIL_NUCLEAR.sql",
    "FIX_FORCE_DROP_TRIGGER.sql",
    "FIX_ORDERS_RLS.sql",
    "FIX_ORDERS_RLS_V2.sql",
    "RESTORE_EMAIL_SYSTEM_SAFE.sql",
    "SETUP_EMAIL_PROVIDERS.sql",
    "SETUP_EMAIL_PROVIDERS_ENCRYPTED.sql",
    "SUPABASE_BACKEND_CONFIG.sql",
    "SUPABASE_EMAIL_SYSTEM.sql",
    "SUPABASE_TEMPLATES_ONLY.sql",
    "SUPABASE_WEBHOOK_SETUP.sql",
    "TEST_EMAIL_SYSTEM.sql",
    "UPDATE_EMAIL_DESCRIPTIONS.sql",
    "UPDATE_EMAIL_TRIGGERS.sql",
    "CLEANUP_EMAIL_SYSTEM.sql"
)

# Combine all files to archive
$allFilesToArchive = $docsToArchive + $sqlToArchive

# Move files
$movedCount = 0
$notFoundCount = 0

Write-Host "Moving old files to archive..." -ForegroundColor Yellow
Write-Host ""

foreach ($file in $allFilesToArchive) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination $archiveFolder -Force
        Write-Host "  Moved: $file" -ForegroundColor Gray
        $movedCount++
    }
    else {
        Write-Host "  Not found: $file" -ForegroundColor DarkGray
        $notFoundCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cleanup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Files moved to archive: $movedCount" -ForegroundColor White
Write-Host "  Files not found: $notFoundCount" -ForegroundColor White
Write-Host "  Archive location: ./$archiveFolder" -ForegroundColor White
Write-Host ""
Write-Host "Your project is now cleaner!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Test your app to make sure everything works" -ForegroundColor White
Write-Host "  2. If all is good, you can delete the archive folder" -ForegroundColor White
Write-Host "  3. If something broke, restore files from archive" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
