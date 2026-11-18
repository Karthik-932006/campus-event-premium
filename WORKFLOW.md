# CampusConnect – Complete Module Workflows

This document explains **exactly what each module does** and the step-by-step flow to use the system.

---

## Demo accounts

| Role    | Email              | Password  | What they can do                                      |
|---------|--------------------|-----------|-------------------------------------------------------|
| Admin   | admin@campus.edu   | admin123  | Approve events, attendance, issue certificates        |
| Host    | host@campus.edu    | host123   | Create events, attendance, issue certificates         |
| Student | student@campus.edu | student123| Register, view tickets with QR, get certificates      |

---

## MODULE 1 — Authentication & Registration

**Purpose:** Secure login and role-based access (Student / Host / Admin).

### Student / Host registration
1. Open the app → **Register**
2. Enter name, email, password
3. Choose role: **Student** or **Host**
4. (Optional) Student ID, department, year
5. Submit → account created → you are logged in

### Login
1. Open **Login**
2. Use one of the demo accounts above (or your registered account)
3. After login, sidebar shows options based on your role

### Roles
- **Student** – discover events, register, tickets with QR, certificates
- **Host** – create events, my events, attendance QR check-in, issue certificates
- **Admin** – everything Host can do + **Event Approvals** (approve/reject)

---

## MODULE 2 — Event Management & Approval Workflow

**Purpose:** Hosts propose events; Admin must approve before students can see/register.

### Status flow
```
draft  →  pending_approval  →  published   (students can register)
                           ↘  rejected    (with reason)
```

### Host: Create event
1. Login as **Host**
2. Sidebar → **Create Event**
3. Fill title, description, category, date, time, venue, capacity, price
4. Click **Publish Event**
5. Event is saved as `pending_approval` (not visible to students yet)

### Admin: Approve or reject
1. Login as **Admin**
2. Sidebar → **Event Approvals**
3. See list of pending events
4. **Approve** → status becomes `published` (students can discover & register)
5. **Reject** → optionally enter reason → status becomes `rejected`

### Host: Track own events
- Sidebar → **My Events** – see status (pending / published / rejected) and registration counts

---

## MODULE 3 — Attendance & Real QR Code Check-in

**Purpose:** Each registration gets a unique QR code image. Host/Admin scans it (or pastes token) to mark attendance.

### How the QR is generated
1. Student registers for a **published** event
2. Backend creates a unique `qr_token` and stores it with the registration
3. Backend endpoint `/api/qr/image/{token}` generates a **real PNG QR code image** (using Python `qrcode` + Pillow)
4. Frontend **Tickets & Passes** page displays that image

### Student: Get ticket with QR
1. Login as **Student**
2. Open a published event → **Register Now** → confirm form
3. Go to **Tickets & Passes** (or My Registrations → View Ticket)
4. You see a **real QR code image** on the pass
5. You can also **Copy QR token** if needed

### Host / Admin: Mark attendance
1. Login as **Host** or **Admin**
2. Sidebar → **Attendance / QR**
3. **Option A – QR token:** paste the token from the student’s ticket → **Mark Attendance**
4. **Option B – Manual:** select the event → participant list → **Mark Present**
5. Screen shows success (or “Already checked in”)
6. Counts update: Checked In / Registered

**Important:** Attendance is required before a certificate can be issued (Module 4).

---

## MODULE 4 — Certification

**Purpose:** Issue certificates only to students who attended; students view them; anyone can verify a code.

### Host / Admin: Issue certificates
1. Login as Host or Admin
2. Sidebar → **Issue Certificates**
3. Select an event
4. See list of attendees
5. **Issue Cert** for one student, or **Issue All** for every attendee without a cert yet
6. System generates a unique code like `CERT-A1B2C3D4`

### Student: View certificates
1. Login as Student
2. Sidebar → **My Certificates**
3. See all issued certificates with code and event details

### Anyone: Verify a certificate
1. Open **Certificates** page (no login required for verify)
2. Enter certificate code → **Verify**
3. If valid: shows student name, event, date

---

## End-to-end happy path (recommended test)

1. **Admin** login → (optional) check Event Approvals  
2. **Host** login → Create Event → submit  
3. **Admin** login → Event Approvals → **Approve** the event  
4. **Student** login → Explore Events → open the event → **Register**  
5. **Student** → Tickets & Passes → see **QR code image** → Copy token (optional)  
6. **Host** (or Admin) → Attendance / QR → paste token → **Mark Attendance**  
7. **Host** → Issue Certificates → select event → **Issue All**  
8. **Student** → My Certificates → see certificate  
9. On Certificates page → paste code → **Verify** → Valid  

---

## Running the project

```bash
# Terminal 1 – Backend (required for real QR images)
cd campus-event-premium/backend
pip install -r requirements.txt
python main.py
# → http://localhost:8080
# → API docs: http://localhost:8080/docs

# Terminal 2 – Frontend
cd campus-event-premium/frontend
npm install
npm run dev
# → http://localhost:5173
```

**Note:** Real QR PNG images are generated by the backend. Keep `python main.py` running while using Tickets / Attendance.

---

## API endpoints (summary)

| Module | Method | Path | Description |
|--------|--------|------|-------------|
| Auth | POST | /api/register | Register user |
| Auth | POST | /api/login | Login |
| Events | GET | /api/events | Published events |
| Events | POST | /api/events | Create (pending approval) |
| Events | GET | /api/events/pending | Admin pending list |
| Events | POST | /api/events/approve | Approve or reject |
| Register | POST | /api/register-event | Student registers → gets qr_token |
| QR | GET | /api/qr/image/{token} | **Real PNG QR image** |
| Attendance | POST | /api/attendance/checkin-qr | Check-in by QR token |
| Attendance | POST | /api/attendance/checkin-manual | Manual check-in |
| Certs | POST | /api/certificates/issue | Issue one certificate |
| Certs | POST | /api/certificates/issue-bulk/{id} | Issue all for attendees |
| Certs | GET | /api/certificates/verify/{code} | Verify certificate |

