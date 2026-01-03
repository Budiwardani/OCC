@echo off
echo Creating OCC Database...
psql -U postgres -c "DROP DATABASE IF EXISTS occ;"
psql -U postgres -c "CREATE DATABASE occ;"
echo.
echo Importing schema...
psql -U postgres -d occ -f schema.sql
echo.
echo Setting up admin user...
node setup-db.js
echo.
echo Database setup complete!
pause
