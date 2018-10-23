@echo off
echo Building web angular project and copying to services repo...
del /s /q ..\texas-dumpsters-services\static\*
del /s /q dist\*
call ng build
xcopy dist\* ..\texas-dumpsters-services\static /S /I /Y
echo Done!
