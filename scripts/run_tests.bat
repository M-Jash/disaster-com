@echo off
echo ======================================================================
echo Running DECS Backend Automated Test Suite
echo ======================================================================
cd backend
python -m pytest -v
cd ..
pause
