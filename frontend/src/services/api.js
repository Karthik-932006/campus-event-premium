const API_BASE = 'http://localhost:8000/api'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.detail || data.error || data.message || 'Something went wrong')
  }
  return data
}

export const api = {
  // Module 1 – Auth
  register: (body) => request('/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/login', { method: 'POST', body: JSON.stringify(body) }),
  getUser: (id) => request(`/users/${id}`),

  // Module 2 – Events & Approval
  getEvents: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/events${q ? '?' + q : ''}`)
  },
  getAllEvents: () => request('/events/all'),
  getPendingEvents: () => request('/events/pending'),
  getEvent: (id) => request(`/events/${id}`),
  createEvent: (body) => request('/events', { method: 'POST', body: JSON.stringify(body) }),
  updateEvent: (id, body) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  approveEvent: (body) => request('/events/approve', { method: 'POST', body: JSON.stringify(body) }),
  getMyEvents: (hostId) => request(`/my-events/${hostId}`),
  getParticipants: (eventId) => request(`/events/${eventId}/participants`),

  // Registration
  registerForEvent: (body) => request('/register-event', { method: 'POST', body: JSON.stringify(body) }),
  getMyRegistrations: (studentId) => request(`/my-registrations/${studentId}`),
  getQRInfo: (regId) => request(`/registration/qr/${regId}`),

  // Module 3 – Attendance & QR
  checkinQR: (body) => request('/attendance/checkin-qr', { method: 'POST', body: JSON.stringify(body) }),
  checkinManual: (body) => request('/attendance/checkin-manual', { method: 'POST', body: JSON.stringify(body) }),
  getAttendance: (eventId) => request(`/attendance/event/${eventId}`),

  // Module 4 – Certificates
  issueCertificate: (body) => request('/certificates/issue', { method: 'POST', body: JSON.stringify(body) }),
  issueBulkCertificates: (eventId, issuedBy) =>
    request(`/certificates/issue-bulk/${eventId}?issued_by=${issuedBy}`, { method: 'POST' }),
  getStudentCertificates: (studentId) => request(`/certificates/student/${studentId}`),
  verifyCertificate: (code) => request(`/certificates/verify/${code}`),

  // Marks
  giveMarks: (body) => request('/marks', { method: 'POST', body: JSON.stringify(body) }),
  getEventMarks: (eventId) => request(`/event-marks/${eventId}`),
}
