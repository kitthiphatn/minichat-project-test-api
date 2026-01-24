@echo off
echo ========================================
echo แก้ไข Cloudflare Tunnel Config
echo ========================================
echo.

echo [1/4] สร้าง backup...
if exist "C:\Users\Marke\.cloudflared\config.yml" (
    copy "C:\Users\Marke\.cloudflared\config.yml" "C:\Users\Marke\.cloudflared\config.yml.backup" >nul
    echo ✓ Backup สำเร็จ: config.yml.backup
) else (
    echo ! ไม่พบ config.yml เดิม
)

echo.
echo [2/4] คัดลอก config ใหม่...
copy "cloudflared-config.yml" "C:\Users\Marke\.cloudflared\config.yml" /Y >nul
echo ✓ อัพเดท config.yml สำเร็จ

echo.
echo [3/4] ตรวจสอบ config...
cloudflared tunnel ingress validate

echo.
echo [4/4] ตั้งค่า DNS route สำหรับ api.clubfivem.com...
echo กำลังเพิ่ม DNS route...
cloudflared tunnel route dns minichat api.clubfivem.com

echo.
echo ========================================
echo ✓ เสร็จสิ้น!
echo ========================================
echo.
echo ขั้นตอนต่อไป:
echo 1. ปิด Cloudflare Tunnel ที่กำลังรันอยู่ (กด Ctrl+C)
echo 2. รัน: start.bat
echo.
echo หรือรัน Tunnel ใหม่ทันที:
echo    cloudflared tunnel run minichat
echo.
pause
