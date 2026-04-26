# AgroGuard 🌱

An end-to-end, locally-hosted edge computing system for smart agricultural monitoring. AgroGuard streams live video from an ESP32-CAM, runs on-device threat detection using YOLOv8, reads multi-point soil/environmental sensor data, and provides an AI agronomist chat powered by Groq's Llama-4-Scout model — all without relying on the cloud.

---

## Architecture Overview
[ESP32-CAM]          → MJPEG stream → [Python FastAPI Backend]
[ESP32 Stationary]   → HTTP /data   →        ↓
[ESP32 Mobile Node]  → HTTP /data   → [SQLite DB + YOLOv8]
↓
[React Dashboard] ← WebSocket alerts
↓
[Telegram Bot]

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Chart.js, Framer Motion, rc-slider |
| **Backend** | Python FastAPI, SQLite, WebSockets, Uvicorn |
| **Computer Vision** | OpenCV, Ultralytics YOLOv8n |
| **AI Agent** | Groq API — `meta-llama/llama-4-scout-17b-16e-instruct` |
| **Hardware** | ESP32-CAM, ESP32 (stationary node), ESP32 (mobile node) |
| **Notifications** | Telegram Bot API |

---

## Features

- **Live Video Feed** — MJPEG stream from ESP32-CAM, proxied through FastAPI
- **Pan/Tilt Camera Control** — Control two servos (horizontal + vertical) from the React dashboard via sliders
- **Intruder Detection** — YOLOv8n runs on every video frame; triggers alerts with anti-spam state machines
- **Fire Detection** — Hardware fire sensor on the stationary node with ISR-based detection
- **Multi-Point Soil Monitoring** — Temperature (DHT22), humidity, soil moisture (4 probes), pH, atmospheric pressure (BMP280)
- **GPS Tracking** — Mobile node carries TinyGPS++ for field location tagging
- **Sensor History** — 24-hour rolling SQLite database with per-feed REST endpoints
- **Telegram Alerts** — Annotated JPEG snapshots pushed instantly on intruder/fire events
- **AI Agronomist** — Chat interface that analyzes the current camera frame + live sensor data using Groq Vision API
- **Relay Control** — Remote irrigation relay toggle from the dashboard
- **WebSocket Alerts** — Real-time push from backend to frontend for intruder and fire events

---

## Hardware Setup

### Network Configuration
All nodes share a static IP local network (SSID: `kumbaya_static`):

| Node | IP Address | Port |
|---|---|---|
| ESP32-CAM | `192.168.1.2` | `80` |
| ESP32 Stationary Node | `192.168.1.3` | `7070` |
| ESP32 Mobile Node | `192.168.1.4` | `7070` |
| Backend (FastAPI) | `192.168.1.10` | `8000` |
| Frontend (React) | `192.168.1.10` | `5173` |

### Stationary Node Pins (ESP32)
| Pin | Function |
|---|---|
| GPIO 4 | DHT22 (Temp/Humidity) |
| GPIO 27 | Fire Sensor (ISR) |
| GPIO 34 | pH Sensor (ADC) |
| GPIO 35 | Soil Moisture (ADC) |
| GPIO 25 | Servo Horizontal |
| GPIO 26 | Servo Vertical |
| GPIO 23 | Relay |
| GPIO 18/19 | Buzzers |
| GPIO 21/22 | I2C (OLED SH1106 + BMP280) |

### Mobile Node Pins (ESP32)
| Pin | Function |
|---|---|
| GPIO 36/34/35/32 | Soil Moisture (M1–M4, ADC) |
| GPIO 21/22 | I2C (BMP280) |
| GPIO 16/17 | GPS UART (TinyGPS++) |
| GPIO 14 | Button (interrupt-triggered snapshot) |

---

## Software Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Arduino IDE with ESP32 board support

### 1. Clone the repository
```bash
git clone https://github.com/your-username/agro-guard.git
cd agro-guard
```

### 2. Backend setup
```bash
python -m venv venv
source venv/bin/activate

pip install fastapi uvicorn opencv-python ultralytics httpx python-dotenv pydantic
```

Create a `.env` file in the project root:
```env
GROQ_API_KEY=your_groq_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

### 4. Flash firmware
- Open each `.ino` file in Arduino IDE
- Install required libraries: `Adafruit BMP280`, `DHT sensor library`, `TinyGPS++`, `ESP32Servo`, `ArduinoJson`, `Adafruit SH110X`
- Update WiFi credentials and static IPs as needed
- Flash to respective ESP32 boards

### 5. Run everything
```bash
# From project root
bash run.sh
```

This starts the FastAPI backend (port 8000) and Vite dev server (port 5173) simultaneously.

Or manually:
```bash
# Terminal 1 — Backend
source venv/bin/activate
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000

# Terminal 2 — Frontend
cd frontend
npm run dev
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/video_feed` | MJPEG video stream |
| `GET` | `/api/sensors/live` | Latest sensor snapshot |
| `GET` | `/api/sensors/history` | 24-hour sensor history (all feeds) |
| `GET` | `/api/sensors/history/{feed_name}` | 24-hour history for a single feed |
| `GET` | `/api/mobile/latest` | Latest mobile node GPS + soil data |
| `POST` | `/api/control/camera` | Pan/tilt servo control `{horizontal, vertical}` |
| `POST` | `/api/control/relay` | Relay toggle `{relay: 0\|1}` |
| `WS` | `/ws/alerts` | WebSocket stream for real-time alerts |

---

## Project Structure
agro-guard/
├── backend/
│   └── main.py               # FastAPI app, YOLOv8, sensor polling, AI chat
├── ep32_cam/
│   ├── esp32_cam.ino         # ESP32-CAM MJPEG streaming firmware
│   ├── board_config.h        # Camera model selection
│   └── camera_pins.h         # GPIO pin definitions
├── esp32_stationary_node/
│   └── esp32_stationary_node.ino  # DHT22, soil, pH, fire, servo, relay, OLED
├── esp32_mobile_node/
│   └── esp32_movile_node.ino      # BMP280, multi-probe soil, GPS, button trigger
├── frontend/
│   └── src/
│       ├── App.jsx           # Main dashboard
│       ├── components/
│       │   ├── alerts/       # Alert stage UI + audio hooks
│       │   └── magic/        # Sensor cards, welcome banner, typewriter
│       └── assets/           # Icons, animations, sounds
├── run.sh                    # One-shot startup script
└── README.md

---

## License

MIT License — free to use, modify, and distribute.
