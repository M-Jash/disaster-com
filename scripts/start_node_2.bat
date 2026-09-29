@echo off
echo ======================================================================
echo Starting DECS - Node 2 (Civilian / Relay Node)
echo ======================================================================
set DECS_NODE_ID=NODE-BRAVO
set DECS_NODE_NAME=Civilian Station Beta
set DECS_ROLE=CIVILIAN
set DECS_UDP_PORT=50005
set DECS_BROADCAST_IP=255.255.255.255
set DECS_API_PORT=8001
set DECS_DB_PATH=decs_node2.db

echo Starting Backend API on http://127.0.0.1:8001 (UDP Port 50005)...
start "DECS Node 2 Backend" cmd /k "cd backend && python main.py"

echo.
echo Node 2 Backend launched on port 8001!
echo To run a second frontend for Node 2 on another port:
echo run: cd frontend ^&^& npx vite --port 5174
