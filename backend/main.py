"""
CampusConnect API – 4 Core Modules
1. Authentication & Registration
2. Event Management & Approval Workflow
3. Attendance & QR Check-in
4. Certification
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel, Field
from typing import Optional, List
import sqlite3
import secrets
import io
from pathlib import Path
from contextlib import contextmanager
from datetime import datetime

try:
    import qrcode
    from qrcode.constants import ERROR_CORRECT_M
    HAS_QR = True
except ImportError:
    HAS_QR = False

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "campus_events.db"

def get_connection():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def row_to_dict(row):
    return dict(row) if row else None

def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('student', 'host', 'admin')),
                student_id TEXT,
                department TEXT,
                year TEXT,
                phone TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                category TEXT DEFAULT 'technology',
                date TEXT NOT NULL,
                start_time TEXT DEFAULT '10:00',
                end_time TEXT DEFAULT '17:00',
                location TEXT,
                venue TEXT,
                max_participants INTEGER DEFAULT 100,
                price REAL DEFAULT 0,
                status TEXT DEFAULT 'pending_approval'
                    CHECK(status IN ('draft','pending_approval','approved','rejected','published','completed','cancelled')),
                rejection_reason TEXT,
                approved_by INTEGER,
                approved_at DATETIME,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(created_by) REFERENCES users(id),
                FOREIGN KEY(approved_by) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS registrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id INTEGER NOT NULL,
                student_id INTEGER NOT NULL,
                status TEXT DEFAULT 'confirmed'
                    CHECK(status IN ('confirmed','cancelled','waitlisted')),
                qr_token TEXT UNIQUE,
                registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(event_id, student_id),
                FOREIGN KEY(event_id) REFERENCES events(id),
                FOREIGN KEY(student_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                registration_id INTEGER NOT NULL UNIQUE,
                event_id INTEGER NOT NULL,
                student_id INTEGER NOT NULL,
                checked_in_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                checked_in_by INTEGER,
                method TEXT DEFAULT 'qr' CHECK(method IN ('qr','manual')),
                FOREIGN KEY(registration_id) REFERENCES registrations(id),
                FOREIGN KEY(event_id) REFERENCES events(id),
                FOREIGN KEY(student_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS certificates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id INTEGER NOT NULL,
                student_id INTEGER NOT NULL,
                certificate_code TEXT UNIQUE NOT NULL,
                issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                issued_by INTEGER,
                UNIQUE(event_id, student_id),
                FOREIGN KEY(event_id) REFERENCES events(id),
                FOREIGN KEY(student_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS marks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id INTEGER,
                student_id INTEGER,
                marks INTEGER CHECK(marks >= 1 AND marks <= 10),
                feedback TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(event_id, student_id),
                FOREIGN KEY(event_id) REFERENCES events(id),
                FOREIGN KEY(student_id) REFERENCES users(id)
            );
        """)

        # Seed only if empty
        if conn.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 0:
            conn.executescript("""
                INSERT INTO users (name, email, password, role, student_id, department, year) VALUES
                ('Campus Admin', 'admin@campus.edu', 'admin123', 'admin', NULL, 'Administration', NULL),
                ('Campus Host', 'host@campus.edu', 'host123', 'host', NULL, 'Event Cell', NULL),
                ('Demo Student', 'student@campus.edu', 'student123', 'student', 'STU2026001', 'Computer Science', '3rd Year'),
                ('Priya Sharma', 'priya@campus.edu', 'student123', 'student', 'STU2026002', 'Electronics', '2nd Year');

                INSERT INTO events (title, description, category, date, start_time, end_time, location, venue, max_participants, price, status, created_by, approved_by, approved_at) VALUES
                ('TechFest 2026 – Code the Future', 'Inter-college technical festival with hackathons and AI workshops.', 'technology', '2026-11-22', '09:00', '18:00', 'North Campus', 'Main Auditorium', 250, 0, 'published', 2, 1, datetime('now')),
                ('Rhythms – Cultural Night', 'Music, dance and drama performances by student clubs.', 'cultural', '2026-11-25', '17:00', '22:00', 'Central Lawn', 'Open Air Theatre', 500, 0, 'published', 2, 1, datetime('now')),
                ('AI & ML Bootcamp', 'Hands-on workshop on neural networks and generative AI.', 'workshop', '2026-11-28', '10:00', '17:00', 'Tech Block B', 'CS Lab Complex', 60, 299, 'pending_approval', 2, NULL, NULL),
                ('Inter-Department Sports Meet', 'Football, cricket, athletics and more.', 'sports', '2026-12-05', '08:00', '18:00', 'South Campus', 'Sports Complex', 300, 0, 'approved', 2, 1, datetime('now'));
            """)
            # Sample registration with QR for student
            token = secrets.token_urlsafe(16)
            conn.execute(
                "INSERT INTO registrations (event_id, student_id, qr_token, status) VALUES (1, 3, ?, 'confirmed')",
                (token,)
            )
            print("Database seeded with admin, host, students and sample events.")

# --------------------------------------------------------
# Pydantic models
# --------------------------------------------------------
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "student"
    student_id: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    category: str = "technology"
    date: str
    start_time: str = "10:00"
    end_time: str = "17:00"
    location: Optional[str] = ""
    venue: Optional[str] = ""
    max_participants: int = 100
    price: float = 0
    created_by: int
    submit_for_approval: bool = True

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None
    venue: Optional[str] = None
    max_participants: Optional[int] = None
    price: Optional[float] = None
    status: Optional[str] = None

class ApprovalRequest(BaseModel):
    event_id: int
    admin_id: int
    action: str  # approve | reject
    reason: Optional[str] = None

class RegisterEventRequest(BaseModel):
    event_id: int
    student_id: int

class AttendanceQRRequest(BaseModel):
    qr_token: str
    checked_in_by: Optional[int] = None

class AttendanceManualRequest(BaseModel):
    event_id: int
    student_id: int
    checked_in_by: int

class CertificateIssueRequest(BaseModel):
    event_id: int
    student_id: int
    issued_by: int

class MarksRequest(BaseModel):
    event_id: int
    student_id: int
    marks: int = Field(..., ge=1, le=10)
    feedback: Optional[str] = ""

# --------------------------------------------------------
# App
# --------------------------------------------------------
app = FastAPI(
    title="CampusConnect API",
    description="Modules: Auth, Event Approval Workflow, Attendance & QR, Certification",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()
    print("=" * 50)
    print("  CampusConnect API v2.0")
    print("  Modules: Auth | Event Approval | Attendance+QR | Certificates")
    print("  http://localhost:8080")
    print("=" * 50)

# ============================================================
# MODULE 1: Authentication & Registration
# ============================================================
@app.post("/api/register")
def register(data: RegisterRequest):
    if data.role not in ("student", "host", "admin"):
        raise HTTPException(400, "Invalid role")
    with get_db() as conn:
        try:
            cur = conn.execute(
                """INSERT INTO users (name, email, password, role, student_id, department, year, phone)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (data.name, data.email, data.password, data.role,
                 data.student_id, data.department, data.year, data.phone)
            )
            user_id = cur.lastrowid
        except sqlite3.IntegrityError:
            raise HTTPException(400, "Email already registered")
    return {
        "message": "Registration successful",
        "user": {
            "id": user_id,
            "name": data.name,
            "email": data.email,
            "role": data.role,
            "student_id": data.student_id,
            "department": data.department,
            "year": data.year
        }
    }

@app.post("/api/login")
def login(data: LoginRequest):
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, name, email, role, student_id, department, year, phone FROM users WHERE email=? AND password=?",
            (data.email, data.password)
        ).fetchone()
    if not row:
        raise HTTPException(401, "Invalid email or password")
    return {"message": "Login successful", "user": dict(row)}

@app.get("/api/users/{user_id}")
def get_user(user_id: int):
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, name, email, role, student_id, department, year, phone, created_at FROM users WHERE id=?",
            (user_id,)
        ).fetchone()
    if not row:
        raise HTTPException(404, "User not found")
    return dict(row)

# ============================================================
# MODULE 2: Event Management & Approval Workflow
# ============================================================
@app.get("/api/events")
def list_events(status: Optional[str] = None, category: Optional[str] = None):
    """Public list – only published (and optionally filtered)."""
    query = "SELECT e.*, u.name as organizer_name FROM events e LEFT JOIN users u ON e.created_by = u.id WHERE 1=1"
    params = []
    if status:
        query += " AND e.status = ?"
        params.append(status)
    else:
        # default: only published for public discovery
        query += " AND e.status IN ('published', 'approved', 'completed')"
    if category:
        query += " AND e.category = ?"
        params.append(category)
    query += " ORDER BY e.date ASC"
    with get_db() as conn:
        rows = conn.execute(query, params).fetchall()
    return [dict(r) for r in rows]

@app.get("/api/events/all")
def list_all_events():
    """Admin/host: all events regardless of status."""
    with get_db() as conn:
        rows = conn.execute("""
            SELECT e.*, u.name as organizer_name
            FROM events e LEFT JOIN users u ON e.created_by = u.id
            ORDER BY e.created_at DESC
        """).fetchall()
    return [dict(r) for r in rows]

@app.get("/api/events/pending")
def pending_approvals():
    """Admin: events waiting for approval."""
    with get_db() as conn:
        rows = conn.execute("""
            SELECT e.*, u.name as organizer_name
            FROM events e LEFT JOIN users u ON e.created_by = u.id
            WHERE e.status = 'pending_approval'
            ORDER BY e.created_at ASC
        """).fetchall()
    return [dict(r) for r in rows]

@app.get("/api/events/{event_id}")
def get_event(event_id: int):
    with get_db() as conn:
        row = conn.execute("""
            SELECT e.*, u.name as organizer_name
            FROM events e LEFT JOIN users u ON e.created_by = u.id
            WHERE e.id = ?
        """, (event_id,)).fetchone()
    if not row:
        raise HTTPException(404, "Event not found")
    return dict(row)

@app.post("/api/events")
def create_event(data: EventCreate):
    status = "pending_approval" if data.submit_for_approval else "draft"
    with get_db() as conn:
        cur = conn.execute("""
            INSERT INTO events (title, description, category, date, start_time, end_time,
                                location, venue, max_participants, price, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.title, data.description, data.category, data.date,
            data.start_time, data.end_time, data.location, data.venue,
            data.max_participants, data.price, status, data.created_by
        ))
        event_id = cur.lastrowid
    return {
        "message": "Event created" + (" and submitted for approval" if status == "pending_approval" else " as draft"),
        "event_id": event_id,
        "status": status
    }

@app.put("/api/events/{event_id}")
def update_event(event_id: int, data: EventUpdate):
    fields = []
    values = []
    for k, v in data.dict(exclude_unset=True).items():
        if v is not None:
            fields.append(f"{k}=?")
            values.append(v)
    if not fields:
        raise HTTPException(400, "No fields to update")
    values.append(event_id)
    with get_db() as conn:
        conn.execute(f"UPDATE events SET {', '.join(fields)} WHERE id=?", values)
    return {"message": "Event updated"}

@app.post("/api/events/approve")
def approve_or_reject(data: ApprovalRequest):
    """Admin approves or rejects an event."""
    if data.action not in ("approve", "reject"):
        raise HTTPException(400, "action must be 'approve' or 'reject'")
    with get_db() as conn:
        event = conn.execute("SELECT * FROM events WHERE id=?", (data.event_id,)).fetchone()
        if not event:
            raise HTTPException(404, "Event not found")
        if event["status"] not in ("pending_approval", "draft"):
            raise HTTPException(400, f"Cannot {data.action} event in status '{event['status']}'")

        if data.action == "approve":
            # approve → published (visible to students)
            conn.execute("""
                UPDATE events SET status='published', approved_by=?, approved_at=datetime('now'), rejection_reason=NULL
                WHERE id=?
            """, (data.admin_id, data.event_id))
            return {"message": "Event approved and published", "status": "published"}
        else:
            conn.execute("""
                UPDATE events SET status='rejected', approved_by=?, approved_at=datetime('now'), rejection_reason=?
                WHERE id=?
            """, (data.admin_id, data.reason or "No reason provided", data.event_id))
            return {"message": "Event rejected", "status": "rejected", "reason": data.reason}

@app.get("/api/my-events/{host_id}")
def my_events(host_id: int):
    with get_db() as conn:
        rows = conn.execute("""
            SELECT e.*, 
                   (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status='confirmed') as registration_count
            FROM events e WHERE e.created_by = ?
            ORDER BY e.created_at DESC
        """, (host_id,)).fetchall()
    return [dict(r) for r in rows]

# ============================================================
# Registration (part of Auth + Event flow)
# ============================================================
@app.post("/api/register-event")
def register_for_event(data: RegisterEventRequest):
    with get_db() as conn:
        event = conn.execute("SELECT * FROM events WHERE id=?", (data.event_id,)).fetchone()
        if not event:
            raise HTTPException(404, "Event not found")
        if event["status"] not in ("published", "approved"):
            raise HTTPException(400, "Event is not open for registration")

        count = conn.execute(
            "SELECT COUNT(*) FROM registrations WHERE event_id=? AND status='confirmed'",
            (data.event_id,)
        ).fetchone()[0]
        if count >= event["max_participants"]:
            raise HTTPException(400, "Event is full")

        qr_token = secrets.token_urlsafe(24)
        try:
            cur = conn.execute(
                "INSERT INTO registrations (event_id, student_id, qr_token, status) VALUES (?, ?, ?, 'confirmed')",
                (data.event_id, data.student_id, qr_token)
            )
            reg_id = cur.lastrowid
        except sqlite3.IntegrityError:
            raise HTTPException(400, "Already registered for this event")

    return {
        "message": "Successfully registered",
        "registration_id": reg_id,
        "qr_token": qr_token
    }

@app.get("/api/my-registrations/{student_id}")
def my_registrations(student_id: int):
    with get_db() as conn:
        rows = conn.execute("""
            SELECT r.id as registration_id, r.status, r.qr_token, r.registered_at,
                   e.id as event_id, e.title, e.date, e.start_time, e.end_time,
                   e.location, e.venue, e.category, e.status as event_status,
                   CASE WHEN a.id IS NOT NULL THEN 1 ELSE 0 END as attended,
                   CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END as has_certificate,
                   c.certificate_code
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            LEFT JOIN attendance a ON a.registration_id = r.id
            LEFT JOIN certificates c ON c.event_id = e.id AND c.student_id = r.student_id
            WHERE r.student_id = ?
            ORDER BY e.date ASC
        """, (student_id,)).fetchall()
    return [dict(r) for r in rows]

@app.get("/api/events/{event_id}/participants")
def event_participants(event_id: int):
    with get_db() as conn:
        rows = conn.execute("""
            SELECT r.id as registration_id, r.status, r.qr_token, r.registered_at,
                   u.id as student_id, u.name, u.email, u.student_id as college_id,
                   u.department, u.year,
                   CASE WHEN a.id IS NOT NULL THEN 1 ELSE 0 END as attended,
                   a.checked_in_at
            FROM registrations r
            JOIN users u ON r.student_id = u.id
            LEFT JOIN attendance a ON a.registration_id = r.id
            WHERE r.event_id = ?
            ORDER BY r.registered_at ASC
        """, (event_id,)).fetchall()
    return [dict(r) for r in rows]

# ============================================================
# MODULE 3: Attendance & QR Check-in
# ============================================================
@app.post("/api/attendance/checkin-qr")
def checkin_by_qr(data: AttendanceQRRequest):
    """Scan QR token → mark attendance."""
    with get_db() as conn:
        reg = conn.execute(
            "SELECT * FROM registrations WHERE qr_token=? AND status='confirmed'",
            (data.qr_token,)
        ).fetchone()
        if not reg:
            raise HTTPException(404, "Invalid or expired QR token")

        existing = conn.execute(
            "SELECT id FROM attendance WHERE registration_id=?", (reg["id"],)
        ).fetchone()
        if existing:
            return {"message": "Already checked in", "already": True, "registration_id": reg["id"]}

        conn.execute("""
            INSERT INTO attendance (registration_id, event_id, student_id, checked_in_by, method)
            VALUES (?, ?, ?, ?, 'qr')
        """, (reg["id"], reg["event_id"], reg["student_id"], data.checked_in_by))

        student = conn.execute("SELECT name, email FROM users WHERE id=?", (reg["student_id"],)).fetchone()
        event = conn.execute("SELECT title FROM events WHERE id=?", (reg["event_id"],)).fetchone()

    return {
        "message": "Attendance marked successfully",
        "already": False,
        "student_name": student["name"] if student else None,
        "event_title": event["title"] if event else None,
        "registration_id": reg["id"]
    }

@app.post("/api/attendance/checkin-manual")
def checkin_manual(data: AttendanceManualRequest):
    with get_db() as conn:
        reg = conn.execute(
            "SELECT * FROM registrations WHERE event_id=? AND student_id=? AND status='confirmed'",
            (data.event_id, data.student_id)
        ).fetchone()
        if not reg:
            raise HTTPException(404, "Registration not found")

        existing = conn.execute(
            "SELECT id FROM attendance WHERE registration_id=?", (reg["id"],)
        ).fetchone()
        if existing:
            return {"message": "Already checked in", "already": True}

        conn.execute("""
            INSERT INTO attendance (registration_id, event_id, student_id, checked_in_by, method)
            VALUES (?, ?, ?, ?, 'manual')
        """, (reg["id"], data.event_id, data.student_id, data.checked_in_by))

    return {"message": "Attendance marked (manual)", "already": False}

@app.get("/api/attendance/event/{event_id}")
def attendance_list(event_id: int):
    with get_db() as conn:
        rows = conn.execute("""
            SELECT a.id, a.checked_in_at, a.method,
                   u.name as student_name, u.email, u.student_id as college_id, u.department
            FROM attendance a
            JOIN users u ON a.student_id = u.id
            WHERE a.event_id = ?
            ORDER BY a.checked_in_at DESC
        """, (event_id,)).fetchall()
        total_reg = conn.execute(
            "SELECT COUNT(*) FROM registrations WHERE event_id=? AND status='confirmed'",
            (event_id,)
        ).fetchone()[0]
    return {
        "attendance": [dict(r) for r in rows],
        "checked_in": len(rows),
        "total_registered": total_reg
    }


def generate_qr_png(data: str, box_size: int = 8, border: int = 2) -> bytes:
    """Generate a real QR code PNG image for the given data string."""
    if not HAS_QR:
        raise HTTPException(500, "qrcode library not installed. Run: pip install qrcode[pil] Pillow")
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_M,
        box_size=box_size,
        border=border,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf.getvalue()

@app.get("/api/registration/qr/{registration_id}")
def get_qr_info(registration_id: int):
    """Return QR payload for a registration (for ticket display)."""
    with get_db() as conn:
        row = conn.execute("""
            SELECT r.id as registration_id, r.qr_token, r.status, e.title, e.date, e.start_time, e.venue,
                   u.name as student_name, u.id as student_id
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            JOIN users u ON r.student_id = u.id
            WHERE r.id = ?
        """, (registration_id,)).fetchone()
    if not row:
        raise HTTPException(404, "Registration not found")
    d = dict(row)
    d["qr_image_url"] = f"/api/qr/image/{d['qr_token']}"
    return d

@app.get("/api/qr/image/{token}")
def qr_image(token: str):
    """Return a real PNG QR code image for a registration token.
    Scan this QR at the venue to mark attendance.
    The QR encodes the token string used by /api/attendance/checkin-qr
    """
    with get_db() as conn:
        reg = conn.execute(
            "SELECT id, status FROM registrations WHERE qr_token=?", (token,)
        ).fetchone()
    if not reg:
        raise HTTPException(404, "Invalid QR token")
    if reg["status"] != "confirmed":
        raise HTTPException(400, "Registration is not active")

    # Payload is the token itself so scanners / paste field work the same
    png = generate_qr_png(token)
    return Response(content=png, media_type="image/png", headers={
        "Cache-Control": "no-cache",
        "Content-Disposition": f'inline; filename="ticket-{token[:8]}.png"'
    })

@app.get("/api/qr/image-by-reg/{registration_id}")
def qr_image_by_reg(registration_id: int):
    """Generate QR image by registration id (convenience for frontend)."""
    with get_db() as conn:
        row = conn.execute(
            "SELECT qr_token, status FROM registrations WHERE id=?", (registration_id,)
        ).fetchone()
    if not row:
        raise HTTPException(404, "Registration not found")
    if row["status"] != "confirmed":
        raise HTTPException(400, "Registration is not active")
    png = generate_qr_png(row["qr_token"])
    return Response(content=png, media_type="image/png")


# ============================================================
# MODULE 4: Certification
# ============================================================
@app.post("/api/certificates/issue")
def issue_certificate(data: CertificateIssueRequest):
    """Issue certificate only if student attended."""
    with get_db() as conn:
        att = conn.execute(
            "SELECT id FROM attendance WHERE event_id=? AND student_id=?",
            (data.event_id, data.student_id)
        ).fetchone()
        if not att:
            raise HTTPException(400, "Student has not attended this event – cannot issue certificate")

        existing = conn.execute(
            "SELECT certificate_code FROM certificates WHERE event_id=? AND student_id=?",
            (data.event_id, data.student_id)
        ).fetchone()
        if existing:
            return {"message": "Certificate already issued", "certificate_code": existing["certificate_code"]}

        code = "CERT-" + secrets.token_hex(6).upper()
        conn.execute("""
            INSERT INTO certificates (event_id, student_id, certificate_code, issued_by)
            VALUES (?, ?, ?, ?)
        """, (data.event_id, data.student_id, code, data.issued_by))

    return {"message": "Certificate issued", "certificate_code": code}

@app.post("/api/certificates/issue-bulk/{event_id}")
def issue_bulk(event_id: int, issued_by: int = Query(...)):
    """Issue certificates to all attendees who don't have one yet."""
    with get_db() as conn:
        attendees = conn.execute("""
            SELECT a.student_id FROM attendance a
            WHERE a.event_id = ?
            AND NOT EXISTS (
                SELECT 1 FROM certificates c
                WHERE c.event_id = a.event_id AND c.student_id = a.student_id
            )
        """, (event_id,)).fetchall()

        codes = []
        for a in attendees:
            code = "CERT-" + secrets.token_hex(6).upper()
            conn.execute("""
                INSERT INTO certificates (event_id, student_id, certificate_code, issued_by)
                VALUES (?, ?, ?, ?)
            """, (event_id, a["student_id"], code, issued_by))
            codes.append({"student_id": a["student_id"], "certificate_code": code})

    return {"message": f"Issued {len(codes)} certificates", "certificates": codes}

@app.get("/api/certificates/student/{student_id}")
def student_certificates(student_id: int):
    with get_db() as conn:
        rows = conn.execute("""
            SELECT c.certificate_code, c.issued_at,
                   e.id as event_id, e.title, e.date, e.category, e.venue
            FROM certificates c
            JOIN events e ON c.event_id = e.id
            WHERE c.student_id = ?
            ORDER BY c.issued_at DESC
        """, (student_id,)).fetchall()
    return [dict(r) for r in rows]

@app.get("/api/certificates/verify/{code}")
def verify_certificate(code: str):
    with get_db() as conn:
        row = conn.execute("""
            SELECT c.certificate_code, c.issued_at,
                   u.name as student_name, u.email,
                   e.title as event_title, e.date, e.venue
            FROM certificates c
            JOIN users u ON c.student_id = u.id
            JOIN events e ON c.event_id = e.id
            WHERE c.certificate_code = ?
        """, (code,)).fetchone()
    if not row:
        raise HTTPException(404, "Certificate not found or invalid")
    return {"valid": True, **dict(row)}

# Marks (optional evaluation)
@app.post("/api/marks")
def give_marks(data: MarksRequest):
    with get_db() as conn:
        conn.execute("""
            INSERT INTO marks (event_id, student_id, marks, feedback)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(event_id, student_id) DO UPDATE SET
                marks = excluded.marks, feedback = excluded.feedback
        """, (data.event_id, data.student_id, data.marks, data.feedback))
    return {"message": "Marks submitted"}

@app.get("/api/event-marks/{event_id}")
def event_marks(event_id: int):
    with get_db() as conn:
        ratings = conn.execute("""
            SELECT m.marks, m.feedback, m.created_at, u.name as student_name
            FROM marks m JOIN users u ON m.student_id = u.id
            WHERE m.event_id = ? ORDER BY m.created_at DESC
        """, (event_id,)).fetchall()
        summary = conn.execute(
            "SELECT ROUND(AVG(marks),2) as average_marks, COUNT(*) as total_ratings FROM marks WHERE event_id=?",
            (event_id,)
        ).fetchone()
    return {
        "ratings": [dict(r) for r in ratings],
        "summary": dict(summary) if summary else {"average_marks": None, "total_ratings": 0}
    }

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "CampusConnect API",
        "modules": [
            "1. Authentication & Registration",
            "2. Event Management & Approval Workflow",
            "3. Attendance & QR Check-in",
            "4. Certification"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
