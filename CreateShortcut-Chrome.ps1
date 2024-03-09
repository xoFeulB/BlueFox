$chrome_path = (
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "C:\Program Files\Google\Chrome\Application\chrome.exe"
)
$chrome = $Args[0]

foreach ($path in $chrome_path) {
    if (Test-Path -Path $path) {
        $chrome = $path
        Write-Host ( -join ( "Chrome found in ", $chrome ))
    }
}

$root = Convert-Path .
$Desktop = [System.Environment]::GetFolderPath("Desktop")
$AppData = $env:APPDATA
$LocalAppData = $env:LOCALAPPDATA
$StartMenu = -join ( $AppData, "\Microsoft\Windows\Start Menu\Programs" )
$UserDataDir = -join ( $LocalAppData, "\BlueFoxEnterprise\Chrome")

if (Test-Path -Path $UserDataDir) {
    Write-Host "Folder already exists."
}
else {
    Write-Host "Folder does not exist."
    New-Item -Path $UserDataDir -ItemType Directory
}
Write-Host ( -join ( "UserData is in ", $UserDataDir ))

$shell = New-Object -ComObject WScript.Shell

$lnk = $shell.CreateShortcut( -join ( $StartMenu, "\Chrome-BlueFox.lnk" ) )
$lnk.TargetPath = $chrome
$lnk.Arguments = -join ( "https://ooo.bluefox.ooo/BlueFox/info/index.json", " --user-data-dir=", $UserDataDir , " --load-extension=", $root)
$lnk.IconLocation = -join ( $root, "\media\icons\icon.ico" )
$lnk.Save()
Write-Host ( -join ( "CreateShortcut in ", $StartMenu ))

$lnk = $shell.CreateShortcut( ".\Chrome-BlueFox.lnk"  )
$lnk.TargetPath = $chrome
$lnk.Arguments = -join ( "https://ooo.bluefox.ooo/BlueFox/info/index.json", " --user-data-dir=", $UserDataDir , " --load-extension=", $root)
$lnk.IconLocation = -join ( $root, "\media\icons\icon.ico" )
$lnk.Save()
Write-Host "CreateShortcut in current"
