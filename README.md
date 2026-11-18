# CampusConnect – Campus Events Management System

React + FastAPI project with **4 clear modules** and **real QR code image generation**.

## Modules

1. **Authentication & Registration** – Student / Host / Admin roles  
2. **Event Management & Approval Workflow** – Host creates → Admin approves/rejects → Published  
3. **Attendance & Real QR Check-in** – Unique QR PNG per ticket; Host/Admin scan or paste token  
4. **Certification** – Issue only after attendance; student view; public verify  

**Full step-by-step flows:** see [WORKFLOW.md](./WORKFLOW.md)

## Quick Start

```bash
# Backend (needed for real QR images)
cd backend
pip install -r requirements.txt
python main.py
# http://localhost:8080

# Frontend
cd frontend
npm install
npm run dev
# http://localhost:5173
```

## Demo accounts

| Role    | Email              | Password  |
|---------|--------------------|-----------|
| Admin   | admin@campus.edu   | admin123  |
| Host    | host@campus.edu    | host123   |
| Student | student@campus.edu | student123|

## QR codes

- On registration, backend creates a unique `qr_token`
- Endpoint `GET /api/qr/image/{token}` returns a **real PNG** (Python `qrcode` + Pillow)
- **Tickets & Passes** page displays the image
- **Attendance / QR** page accepts the scanned/pasted token to mark present

## Project structure

```
campus-event-premium/
├── WORKFLOW.md          ← detailed module workflows
├── README.md
├── backend/
│   ├── main.py          ← all 4 modules + QR PNG generation
│   └── requirements.txt
├── frontend/            ← React UI
└── database/            ← SQLite (auto-created on first run)
```
