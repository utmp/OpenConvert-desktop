!include "MUI.nsh"
!include "WinMessages.nsh"
!include "LogicLib.nsh"
!define Name "OpenConvert"
!define VERSION "0.1.0"
!define MUI_ICON "..\..\icons\logo.ico"
InstallDir "$PROGRAMFILES\OpenConvert"
OutFile "openconvert-web-installer.exe"
RequestExecutionLevel admin

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "../../LICENSE"
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_LANGUAGE "English"

Section "Main program" main
    CreateDirectory "$INSTDIR\bin"
    AddSize 315392
    SetOutPath $INSTDIR
    WriteUninstaller "$INSTDIR\Uninstall.exe"
    inetc::get /caption "Main programm" /popup "" "https-link" "$INSTDIR\win.7z" /end ;edit https-link to file url
    Nsis7z::ExtractWithDetails "$INSTDIR\win.7z" "Extracking archives %s..."
    Delete "$INSTDIR\win.7z"
    Pop $0 
    MessageBox MB_OK "status: $0"
    nsExec::ExecToStack 'setx PATH "$INSTDIR\bin"'
SectionEnd

Section "Desktop Shortcut" DeskShort
    CreateShortCut "$DESKTOP\${Name}.lnk" "$INSTDIR\my-app.exe"
SectionEnd

SectionGroup "Converters" converters
    Section "Audio and video" ffmpeg
        AddSize 128165
        SetOutPath "$INSTDIR\bin"
        inetc::get /caption "ffmpeg" /popup "" "https://objects.githubusercontent.com/github-production-release-asset-2e65be/893131123/acb91b0d-77eb-4b97-b297-7c506f5437be?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=releaseassetproduction%2F20241123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241123T162233Z&X-Amz-Expires=300&X-Amz-Signature=60fdc48624bf78ab71423184a935eafc2f19e6bfbe1814d61c76f29e1f9ddb5c&X-Amz-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%3Dffmpeg.7z&response-content-type=application%2Foctet-stream" "$INSTDIR\ffmpeg.7z" /end ;edit https-link to file url
        Nsis7z::ExtractWithDetails "$INSTDIR\ffmpeg.7z" "Extracking archives %s..."
        Delete "$INSTDIR\ffmpeg.7z"
        Pop $1 
        MessageBox MB_OK "status: $1"
        
    SectionEnd
    Section "Image" libvips
        AddSize 417792
        SetOutPath "$INSTDIR\bin"
        inetc::get /caption "libvips" /popup "" "https://objects.githubusercontent.com/github-production-release-asset-2e65be/893131123/18591c0a-1206-4a51-b282-1089f89b6ed1?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=releaseassetproduction%2F20241123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241123T162239Z&X-Amz-Expires=300&X-Amz-Signature=579696f53bcff9083e95402304748d47e6fc7018c1659083d8e50c13098f77ec&X-Amz-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%3Dlibvips.7z&response-content-type=application%2Foctet-stream" "$INSTDIR\libvips.7z" /end ;edit https-link to file url
        Nsis7z::ExtractWithDetails "$INSTDIR\libvips.7z" "Extracking archives %s..."
        Delete "$INSTDIR\libvips.7z"
        Pop $2 
        MessageBox MB_OK "status: $2"
    SectionEnd 
SectionGroupEnd

Function .onInit
    ; Force the selection of the "main" section and make it read-only
    SectionGetFlags ${main} $0
    IntOp $0 $0 | ${SF_SELECTED}
    IntOp $0 $0 | ${SF_RO}
    SectionSetFlags ${main} $0
FunctionEnd

Section "Uninstall"
    ; Remove registry entries
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${Name}"
    ; Remove installed files
    
    RMDir /r "$INSTDIR"
    ; Remove desktop shortcut
    Delete "$DESKTOP\${Name}.lnk"
SectionEnd

Function un.onInit
    MessageBox MB_ICONQUESTION|MB_YESNO|MB_DEFBUTTON2 "Are you sure you want to uninstall ${Name}?" IDYES +2
    Abort
FunctionEnd