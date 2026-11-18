import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { CheckCircle, Search } from '../components/Icons'

export default function Certificates({ user }) {
  const [certs, setCerts] = useState([])
  const [verifyCode, setVerifyCode] = useState('')
  const [verifyResult, setVerifyResult] = useState(null)
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [attendance, setAttendance] = useState(null)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    if (user?.role === 'student') {
      api.getStudentCertificates(user.id).then(setCerts).catch(() => setCerts([]))
    }
    if (user?.role === 'host' || user?.role === 'admin') {
      api.getAllEvents().then(setEvents).catch(() =>
        api.getEvents().then(setEvents).catch(() => setEvents([]))
      )
    }
  }, [user])

  const handleVerify = async (e) => {
    e.preventDefault()
    setVerifyResult(null)
    try {
      const res = await api.verifyCertificate(verifyCode.trim())
      setVerifyResult({ ok: true, ...res })
    } catch (err) {
      setVerifyResult({ ok: false, message: err.message })
    }
  }

  const loadAttendance = async (eventId) => {
    setSelectedEvent(eventId)
    try {
      const att = await api.getAttendance(eventId)
      setAttendance(att)
    } catch {
      setAttendance(null)
    }
  }

  const issueOne = async (studentId) => {
    try {
      const res = await api.issueCertificate({
        event_id: selectedEvent,
        student_id: studentId,
        issued_by: user.id
      })
      setMsg(res.message + (res.certificate_code ? `: ${res.certificate_code}` : ''))
      loadAttendance(selectedEvent)
    } catch (err) {
      setMsg(err.message)
    }
  }

  const issueBulk = async () => {
    try {
      const res = await api.issueBulkCertificates(selectedEvent, user.id)
      setMsg(res.message)
      loadAttendance(selectedEvent)
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
        <p className="text-gray-500 mt-1">Issue, view and verify event certificates</p>
      </div>

      {/* Verify any certificate */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-3">Verify Certificate</h2>
        <form onSubmit={handleVerify} className="flex gap-3">
          <input value={verifyCode} onChange={e => setVerifyCode(e.target.value)}
            placeholder="Enter certificate code e.g. CERT-A1B2C3"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          <button type="submit" className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl text-sm">Verify</button>
        </form>
        {verifyResult && (
          <div className={`mt-4 p-4 rounded-xl text-sm ${verifyResult.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
            {verifyResult.ok ? (
              <div>
                <div className="flex items-center gap-2 font-semibold"><CheckCircle size={16} /> Valid Certificate</div>
                <div className="mt-2 space-y-1 text-xs">
                  <div>Student: <strong>{verifyResult.student_name}</strong></div>
                  <div>Event: <strong>{verifyResult.event_title}</strong></div>
                  <div>Date: {verifyResult.date} · Issued: {verifyResult.issued_at}</div>
                  <div>Code: <code className="bg-white px-1 rounded">{verifyResult.certificate_code}</code></div>
                </div>
              </div>
            ) : verifyResult.message}
          </div>
        )}
      </div>

      {/* Student: my certificates */}
      {user?.role === 'student' && (
        <div>
          <h2 className="font-bold text-gray-900 mb-4">My Certificates</h2>
          {certs.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-card border border-gray-100 text-gray-400">
              No certificates yet. Attend events to earn them.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {certs.map(c => (
                <div key={c.certificate_code} className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100">
                  <div className="bg-gradient-to-r from-primary-600 to-violet-600 p-5 text-white">
                    <div className="text-xs uppercase tracking-wider opacity-80">Certificate of Participation</div>
                    <div className="font-bold text-lg mt-1">{c.title}</div>
                  </div>
                  <div className="p-5 text-sm space-y-2">
                    <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{c.date}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Venue</span><span>{c.venue}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Code</span>
                      <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{c.certificate_code}</code>
                    </div>
                    <div className="flex justify-between"><span className="text-gray-500">Issued</span><span>{c.issued_at?.slice(0, 10)}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Host/Admin: issue certificates */}
      {(user?.role === 'host' || user?.role === 'admin') && (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-900">Issue Certificates</h2>
          {msg && <div className="p-3 bg-primary-50 text-primary-800 rounded-xl text-sm">{msg}</div>}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
              <h3 className="font-semibold text-sm text-gray-700 mb-3">Select Event</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {events.map(ev => (
                  <button key={ev.id} onClick={() => loadAttendance(ev.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${selectedEvent === ev.id ? 'bg-primary-50 text-primary-700 font-semibold' : 'hover:bg-gray-50'}`}>
                    {ev.title}
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2">
              {selectedEvent && attendance ? (
                <div className="bg-white rounded-2xl shadow-card border border-gray-100">
                  <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-sm">{attendance.checked_in} attendees</span>
                    <button onClick={issueBulk}
                      className="px-4 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-lg">
                      Issue All
                    </button>
                  </div>
                  <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                    {attendance.attendance?.map(a => (
                      <div key={a.id} className="px-5 py-3 flex items-center justify-between text-sm">
                        <div>
                          <div className="font-medium">{a.student_name}</div>
                          <div className="text-xs text-gray-400">{a.college_id || a.email}</div>
                        </div>
                        <button onClick={() => issueOne(a.student_id || a.id)}
                          className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg">
                          Issue Cert
                        </button>
                      </div>
                    ))}
                    {(!attendance.attendance || attendance.attendance.length === 0) && (
                      <div className="px-5 py-8 text-center text-gray-400 text-sm">No attendees yet</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center shadow-card border border-gray-100 text-gray-400">
                  Select an event to issue certificates
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
