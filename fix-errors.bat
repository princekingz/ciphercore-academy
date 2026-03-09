@echo off
echo Fixing all TypeScript errors...

:: Fix contact page
powershell -Command "(Get-Content 'frontend\src\app\contact\page.tsx') -replace '<Navbar dark />', '<Navbar />' | Set-Content 'frontend\src\app\contact\page.tsx'"

:: Fix courses page
powershell -Command "(Get-Content 'frontend\src\app\courses\page.tsx') -replace '<Navbar dark />', '<Navbar />' | Set-Content 'frontend\src\app\courses\page.tsx'"

:: Fix pricing page
powershell -Command "(Get-Content 'frontend\src\app\pricing\page.tsx') -replace '<Navbar dark />', '<Navbar />' | Set-Content 'frontend\src\app\pricing\page.tsx'"

:: Fix dashboard page
powershell -Command "(Get-Content 'frontend\src\app\dashboard\page.tsx') -replace '<Navbar dark />', '<Navbar />' | Set-Content 'frontend\src\app\dashboard\page.tsx'"

:: Fix about page
powershell -Command "(Get-Content 'frontend\src\app\about\page.tsx') -replace '<Navbar dark />', '<Navbar />' | Set-Content 'frontend\src\app\about\page.tsx'"

echo Done! All fixed.
