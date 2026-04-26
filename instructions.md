You are working on an EXISTING full-stack project. Your FIRST task is to deeply understand the current codebase before making ANY changes.

---

# 🚨 PHASE 1 — CODEBASE ANALYSIS (MANDATORY)

Before writing any code:

1. Scan the entire frontend folder
2. Identify:
    - Where WebSocket is initialized
    - How alerts are stored (state/hooks)
    - Where sensor data is fetched and rendered
3. DO NOT modify anything yet

Then OUTPUT:

- File structure summary
- Where alert logic lives
- Where UI rendering happens
- Safe extension points for UI enhancements

ONLY after this, proceed to implementation.

---

# ⚠️ CRITICAL BACKEND CONTRACT (DO NOT BREAK)

## WebSocket URL:

ws://192.168.1.10:8000/ws/alerts

## Incoming messages (STRING ONLY):

- "FIRE_ALERT"
- "FIRE_SAFE"
- "INTRUDER_ALERT"
- "INTRUDER_SAFE"

## Sensor API (DO NOT CHANGE):

[http://192.168.1.3:7070/data](http://192.168.1.3:7070/data)

## JSON format:

{  
"temp": number,  
"hum": number,  
"soil": number,  
"ph": number,  
"fire": 0 or 1  
}

IMPORTANT:

- "soil" = moisture
- NO "intruder_detected" field exists
- Intruder comes ONLY from WebSocket

---

# 🚫 STRICT RULES

- DO NOT modify backend
- DO NOT rename keys
- DO NOT change WebSocket logic
- DO NOT introduce polling for alerts
- DO NOT break existing UI functionality

You may ONLY:  
✔ Wrap existing components  
✔ Add new UI components  
✔ Add animations  
✔ Add audio handling

---

# 🎯 PHASE 2 — UI TRANSFORMATION

Rename app everywhere:  
"GREENTECH" → "AGRO gaurd"

---

# 🎨 THEME (HARRY POTTER INSPIRED)

## Colors:

- Background: #0e0e0e / #1a1a1a
- Gold: #d4af37
- Deep red: #5c1a1b

## Fonts:

- Magical serif (Harry Potter style fallback)

---

# 🗺️ LOADING SCREEN (MARAUDER'S MAP)

Create:

- Fullscreen overlay on app start
- Animated footsteps
- Text:  
    "I solemnly swear that I am up to no good..."

Then fade into dashboard

---

# 🌿 WELCOME SCREEN

After loading:  
Display animated text:  
"Professor Sprout welcomes you to Herbology Class"

Use:

- Typewriter or ink animation
- Subtle plant motion

---

# 🚨 ALERT VISUAL SYSTEM (HOOK INTO EXISTING STATE)

DO NOT create new alert logic.

Instead:

- Use existing state (isFire, isIntruder, etc.)
- Subscribe to those states

---

## 🔥 FIRE ALERT

When fire state = true:

- Red glow overlay
- Dragon animation
- Screen shake
- Play fire sound

---

## 🚨 INTRUDER ALERT

When intruder state = true:

- Flash effect
- Floating text:  
    "Piertotum Locomotor!"
- Play spell sound

---

## 💧 LOW MOISTURE (FROM SENSOR DATA)

- Read "soil" value from existing data
- Compare with threshold from .env

If below:

- Mandrake scream sound
- Shaking plant animation

---

# 🔊 AUDIO SYSTEM

- Use Howler.js
- Preload sounds
- Prevent overlapping (debounce)

---

# 🎬 ANIMATIONS

Use:

- Framer Motion → transitions
- CSS → glow + background

Must be:

- Smooth (60fps)
- Mobile optimized

---

# 📱 DASHBOARD UI

- Mobile-first layout
- Cards for:
    - Temperature
    - Humidity
    - Soil (moisture)
    - pH

Style:

- Magical parchment cards
- Soft glow borders

---

# 📁 NEW FILE STRUCTURE

Create ONLY:

/components/magic/  
/components/alerts/  
/assets/sounds/  
/assets/animations/

---

# ⚡ PERFORMANCE

- Lazy load animations
- Do not block rendering
- Keep bundle optimized

---

# 📦 OUTPUT FORMAT

1. Show ANALYSIS first
2. Then show CODE CHANGES
3. Clearly mark:
    - NEW FILES
    - MODIFIED FILES
4. DO NOT rewrite entire project unnecessarily

---

# 🧠 DECISION RULE

If unsure:  
→ Choose the option that does NOT break existing functionality

---

# FINAL GOAL

A cinematic, Harry Potter–style UI layered ON TOP of a fully working system, without altering its logic.
