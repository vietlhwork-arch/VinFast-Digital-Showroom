[CmdletBinding()]
param (
    [string]$Car,
    [double]$Scale = 0,
    [int]$Padding = 0,
    [switch]$All,
    [string]$ConfigFile,
    [string]$SourceDir,
    [string]$FrontendDir,
    [switch]$NoBackup,
    [switch]$DryRun
)

$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Definition }
$defaultSourceDirs = @(
    (Join-Path $scriptDir "..\static\uploads\cars"),
    (Join-Path $scriptDir "..\static\uploads\motorbikes")
)

$sourceDirs = @()
if ($SourceDir) {
    $sourceDirs += [System.IO.Path]::GetFullPath($SourceDir)
}
else {
    foreach ($d in $defaultSourceDirs) {
        if (Test-Path $d) { $sourceDirs += [System.IO.Path]::GetFullPath($d) }
    }
}

$ConfigFile = [System.IO.Path]::GetFullPath($ConfigFile)

Add-Type -AssemblyName System.Drawing

# 1. Read config if available
$config = $null
if (Test-Path $ConfigFile) {
    try {
        $jsonContent = Get-Content -Path $ConfigFile -Raw -Encoding UTF8
        $config = $jsonContent | ConvertFrom-Json
        Write-Host "[INFO] Config loaded from: $ConfigFile" -ForegroundColor Cyan
    }
    catch {
        Write-Warning "Could not read config file, using default values."
    }
}

$defaultScale = if ($config -and $config.settings.default_scale) { [double]$config.settings.default_scale } else { 0.85 }
$defaultPadding = if ($config -and $config.settings.default_padding_px) { [int]$config.settings.default_padding_px } else { 50 }
$syncFrontend = if ($config -and $config.settings.sync_to_frontend_public -ne $null) { [bool]$config.settings.sync_to_frontend_public } else { $true }

# 2. Resolve files to process
$filesToProcess = @()
if ($Car) {
    $searchPattern = if ($Car.Contains(".")) { $Car } else { "*$Car*.*" }
    foreach ($dir in $sourceDirs) {
        $found = Get-ChildItem -Path $dir -Filter $searchPattern -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -match "\.jpg|\.png|\.jpeg" }
        if ($found) { $filesToProcess += $found }
    }
    if ($filesToProcess.Count -eq 0) {
        Write-Error "No matching image found for '$Car' in uploads folders"
        return
    }
}
elseif ($All) {
    foreach ($dir in $sourceDirs) {
        $found = Get-ChildItem -Path $dir -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -notmatch "^_" -and $_.Extension -match "\.jpg|\.png|\.jpeg" }
        if ($found) { $filesToProcess += $found }
    }
}
else {
    Write-Host @"
========================================================================
             VINFAST VEHICLE IMAGE SCALING & PADDING TOOL               
========================================================================
Usage Examples:
  1. Scale all cars & motorbikes according to config:
     .\scripts\scale_car_images.ps1 -All

  2. Scale specific model (e.g. VF5, VF2, Amio, Feliz, etc.):
     .\scripts\scale_car_images.ps1 -Car VF5 -Padding 50
     .\scripts\scale_car_images.ps1 -Car VF2 -Scale 0.60
     .\scripts\scale_car_images.ps1 -Car Amio -Padding 45

  3. Restore original images:
     Copy files back from _backup folder in respective uploads directory
========================================================================
"@ -ForegroundColor Yellow
    return
}
========================================================================
"@ -ForegroundColor Yellow
    return
}

function Process-CarImage {
    param (
        [System.IO.FileInfo]$file,
        [double]$customScale,
        [int]$customPadding
    )

    $fileName = $file.Name
    $filePath = $file.FullName
    $ext = $file.Extension.ToLower()

    $finalScale = $defaultScale
    $finalPadding = $defaultPadding

    $carCfg = $null
    if ($config -and $config.cars) {
        if ($config.cars.PSObject.Properties[$fileName]) {
            $carCfg = $config.cars.PSObject.Properties[$fileName].Value
        } else {
            # Check if key matches without extension or with prefixes
            foreach ($prop in $config.cars.PSObject.Properties) {
                $keyName = $prop.Name
                $baseKey = $keyName -replace '\.jpg$|\.png$|\.jpeg$', ''
                if ($fileName -eq $keyName -or $fileName -eq "$baseKey.jpg" -or $fileName -like "$baseKey * ") {
                    $carCfg = $prop.Value
                    break
                }
            }
        }
    }

    if ($carCfg) {
        if ($carCfg.scale -ne $null) { $finalScale = [double]$carCfg.scale }
        if ($carCfg.padding -ne $null) { $finalPadding = [int]$carCfg.padding }
    }

    if ($customScale -gt 0) { $finalScale = $customScale }
    if ($customPadding -gt 0) { $finalPadding = $customPadding }

    if ($finalScale -eq 1.0 -and $finalPadding -eq 0 -and -not $Car) {
        Write-Host "  - > [SKIP] $fileName (Already standard scale 1.0)" -ForegroundColor DarkGray
        return
    }

    Write-Host "  - > [PROCESS] $fileName | Scale: $([math]::Round($finalScale, 2)) | Padding: ${finalPadding}px" -ForegroundColor Green

    if ($DryRun) {
        return
    }

    # Backup original
    $backupDir = Join-Path $file.DirectoryName "_backup"
    if (-not $NoBackup) {
        if (-not (Test-Path $backupDir)) {
            New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        }
        $bakFile = Join-Path $backupDir $fileName
        if (-not (Test-Path $bakFile)) {
            Copy-Item -Path $filePath -Destination $bakFile -Force
        }
    }

    # Load image without locking file
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    $ms = New-Object System.IO.MemoryStream($bytes, 0, $bytes.Length)
    $srcBmp = [System.Drawing.Bitmap]::FromStream($ms)
    $w = $srcBmp.Width
    $h = $srcBmp.Height
    $isPng = ($ext -eq ".png")

    # Find car bounding box
    $minX = $w; $maxX = 0; $minY = $h; $maxY = 0
    for ($y = 0; $y -lt $h; $y += 2) {
        for ($x = 0; $x -lt $w; $x += 2) {
            $c = $srcBmp.GetPixel($x, $y)
            $isContent = $false
            if ($isPng) {
                $isContent = ($c.A -gt 25)
            } else {
                $diff = (255 - $c.R) + (255 - $c.G) + (255 - $c.B)
                $isContent = ($diff -gt 15)
            }

            if ($isContent) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }

    if ($minX -ge $maxX -or $minY -ge $maxY) {
        $minX = 0; $maxX = $w; $minY = 0; $maxY = $h
    } else {
        $minX = [math]::Max(0, $minX - 4)
        $maxX = [math]::Min($w, $maxX + 4)
        $minY = [math]::Max(0, $minY - 4)
        $maxY = [math]::Min($h, $maxY + 4)
    }

    $cropW = $maxX - $minX
    $cropH = $maxY - $minY

    # Compute target scaled size
    $availW = [math]::Max(50, $w - ($finalPadding * 2))
    $availH = [math]::Max(50, $h - ($finalPadding * 2))

    $scaleX = ($availW * $finalScale) / $cropW
    $scaleY = ($availH * $finalScale) / $cropH
    $scaleFactor = [math]::Min($scaleX, $scaleY)

    $newW = [int][math]::Round($cropW * $scaleFactor)
    $newH = [int][math]::Round($cropH * $scaleFactor)

    $destX = [int][math]::Round(($w - $newW) / 2)
    $destY = [int][math]::Round(($h - $newH) / 2)

    # Render on new canvas
    $pixelFormat = if ($isPng) { [System.Drawing.Imaging.PixelFormat]::Format32bppArgb } else { [System.Drawing.Imaging.PixelFormat]::Format24bppRgb }
    $outBmp = New-Object System.Drawing.Bitmap($w, $h, $pixelFormat)
    $g = [System.Drawing.Graphics]::FromImage($outBmp)
    if ($isPng) {
        $g.Clear([System.Drawing.Color]::Transparent)
    } else {
        $g.Clear([System.Drawing.Color]::White)
    }

    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $destRect = New-Object System.Drawing.Rectangle($destX, $destY, $newW, $newH)
    $srcRect = New-Object System.Drawing.Rectangle($minX, $minY, $cropW, $cropH)

    $g.DrawImage($srcBmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $srcBmp.Dispose()
    $ms.Dispose()

    # Save
    if ($isPng) {
        $outBmp.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Png)
    } else {
        $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]98)
        $outBmp.Save($filePath, $jpegCodec, $encoderParams)
    }
    $outBmp.Dispose()

    # Sync to frontend public
    if ($syncFrontend -and (Test-Path $FrontendDir)) {
        $frontendDest = Join-Path $FrontendDir $fileName
        Copy-Item -Path $filePath -Destination $frontendDest -Force
    }
}

Write-Host "`n[START PROCESSING VEHICLE IMAGES]" -ForegroundColor Cyan
Write-Host "Total selected files: $($filesToProcess.Count)" -ForegroundColor White

foreach ($f in $filesToProcess) {
    if ($syncFrontend) {
        $parentFolder = Split-Path -Leaf $file.DirectoryName
        $targetFolder = Join-Path $scriptDir "..\frontend\public\static\uploads\$parentFolder"
        if (-not (Test-Path $targetFolder)) {
            New-Item -ItemType Directory -Path $targetFolder -Force | Out-Null
        }
        $frontendDest = Join-Path $targetFolder $fileName

Write-Host "`n[COMPLETED] Vehicle images scaled and synchronized successfully!`n" -ForegroundColor Green
}

Write-Host "`n[START PROCESSING VEHICLE IMAGES]" -ForegroundColor Cyan
Write-Host "Total selected files: $($filesToProcess.Count)" -ForegroundColor White

foreach ($f in $filesToProcess) {
    Process-CarImage -file $f -customScale $Scale -customPadding $Padding
}

Write-Host "`n[COMPLETED] Vehicle images scaled and synchronized successfully!`n" -ForegroundColor Green
