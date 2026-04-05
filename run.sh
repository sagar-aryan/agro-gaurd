#!/bin/bash

# Stop script if any command fails
set -e

echo "Starting backend..."

# Go to backend folder
cd backend

# Activate virtual environment (IMPORTANT)
source ../venv/bin/activate

# Start FastAPI in background
uvicorn main:app --reload &

BACKEND_PID=$!

echo "Backend started with PID $BACKEND_PID"

# Go back to root
cd ..

echo "Starting frontend..."

# Go to frontend folder
cd frontend

# Start frontend in background
npm run dev &

FRONTEND_PID=$!

echo "Frontend started with PID $FRONTEND_PID"

# Go back to root
cd ..

# Handle Ctrl + C (VERY IMPORTANT)
trap "echo 'Stopping both...'; kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT

# Wait for both processes
wait