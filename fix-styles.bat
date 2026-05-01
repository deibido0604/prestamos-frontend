@echo off
cd "C:\Users\Jared\Desktop\Sistema de Control de Prestamos\prestamos-frontend"
del src\admin\modules\clientes\styles.scss
del src\admin\modules\prestamos\styles.scss
del src\admin\modules\administracion\styles.scss
ren src\admin\modules\clientes\styles-new.scss styles.scss
ren src\admin\modules\prestamos\styles-new.scss styles.scss
ren src\admin\modules\administracion\styles-new.scss styles.scss
echo Archivos reemplazados correctamente!
pause
