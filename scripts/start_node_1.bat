@echo off
echo ======================================================================
echo Starting DECS - Node 1 (Primary Rescue Node)
echo ======================================================================
set DECS_NODE_ID=NODE-ALPHA
set DECS_NODE_NAME=Rescue Command Unit 1
set DECS_ROLE=RESPONDER
set DECS_UDP_PORT=50005
set DECS_BROADCAST_IP=255.255.255.255
set DECS_API_PORT=8000
set DECS_DB_PATH=decs_node1.db

echo Starting Backend API on http://127.0.0.1:8000 (UDP Port 50005)...
start "DECS Node 1 Backend" cmd /k "cd backend && python main.py"

echo Starting Frontend UI on http://localhost:5173...
start "DECS Node 1 Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Node 1 launched successfully!
echo Open http://localhost:5173 in your browser.
