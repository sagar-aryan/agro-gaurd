# Green Tech: Edge-Computed Crop Monitoring

An end-to-end, local edge-computed agricultural monitoring system. This project captures real-time video from an ESP32-CAM, processes it locally using YOLOv8 for threat detection, and features an AI agronomist powered by the Groq Llama-4-Scout model.

## Tech Stack
* **Frontend:** React.js, WebSockets, rc-slider
* **Backend:** Python FastAPI, SQLite, WebSockets
* **Computer Vision:** OpenCV, Ultralytics YOLOv8n
* **AI Agent:** Groq Vision API (Llama-4-Scout-17B)
* **Hardware:** ESP32 local server

## Features
* **Real-Time Pan/Tilt:** Control camera servos directly from the React dashboard.
* **Intruder & Fire Detection:** YOLOv8 and hardware sensors trigger strict Anti-Spam state machines.
* **Telegram Integration:** Instant push notifications with annotated image captures of intruders.
* **AI Agronomist:** Chat interface to analyze current crop frames and sensor data.

## Setup Instructions
**(Add instructions here later on how to install requirements.txt, npm install, and how to start the FastAPI and Vite servers!)**
