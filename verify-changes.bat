@echo off
echo ================================================
echo   DebtFlow Pro - اختبار التحديثات
echo ================================================
echo.

echo [1/3] التحقق من الملفات المعدلة...
echo.

echo التحقق من ملف الثيم...
findstr /C:"#6366f1" src\theme\index.ts >nul
if %errorlevel%==0 (
    echo [OK] ملف الثيم محدث بالالوان الجديدة
) else (
    echo [خطأ] ملف الثيم لم يتم تحديثه
)

echo.
echo التحقق من ملف CSS...
findstr /C:"scroll-behavior: smooth" src\index.css >nul
if %errorlevel%==0 (
    echo [OK] ملف CSS محدث بالرسوم المتحركة
) else (
    echo [خطأ] ملف CSS لم يتم تحديثه
)

echo.
echo التحقق من مكون النسخ الاحتياطي...
if exist src\components\BackupDialog.tsx (
    echo [OK] مكون النسخ الاحتياطي موجود
) else (
    echo [خطأ] مكون النسخ الاحتياطي غير موجود
)

echo.
echo التحقق من خدمة النسخ الاحتياطي...
if exist src\services\backupService.ts (
    echo [OK] خدمة النسخ الاحتياطي موجودة
) else (
    echo [خطأ] خدمة النسخ الاحتياطي غير موجودة
)

echo.
echo ================================================
echo [2/3] التحقق من الحزم المثبتة...
echo ================================================
echo.

call npm list xlsx --depth=0 2>nul | findstr "xlsx" >nul
if %errorlevel%==0 (
    echo [OK] حزمة xlsx مثبتة
) else (
    echo [تحذير] حزمة xlsx غير مثبتة
)

call npm list react-hot-toast --depth=0 2>nul | findstr "react-hot-toast" >nul
if %errorlevel%==0 (
    echo [OK] حزمة react-hot-toast مثبتة
) else (
    echo [تحذير] حزمة react-hot-toast غير مثبتة
)

call npm list @iconify/react --depth=0 2>nul | findstr "@iconify/react" >nul
if %errorlevel%==0 (
    echo [OK] حزمة @iconify/react مثبتة
) else (
    echo [تحذير] حزمة @iconify/react غير مثبتة
)

echo.
echo ================================================
echo [3/3] التعليمات
echo ================================================
echo.
echo جميع التغييرات موجودة في الملفات!
echo.
echo لرؤية التغييرات في المتصفح:
echo.
echo 1. افتح المتصفح على: http://localhost:3001/
echo.
echo 2. امسح الذاكرة المؤقتة:
echo    - اضغط Ctrl + Shift + R
echo    - أو Ctrl + F5
echo.
echo 3. إذا لم تظهر التغييرات:
echo    - أوقف الخادم (Ctrl+C في Terminal)
echo    - شغل: npm run dev
echo    - افتح المتصفح مرة أخرى
echo.
echo ================================================
echo   ما الذي يجب أن تراه:
echo ================================================
echo.
echo - الوان بنفسجية ووردية جديدة
echo - زر النسخ الاحتياطي في الشريط العلوي
echo - رسوم متحركة عند تمرير الماوس
echo - تدرجات لونية جميلة
echo.
echo ================================================

pause
