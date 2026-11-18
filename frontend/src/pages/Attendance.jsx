import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { CheckCircle, Users } from '../components/Icons'

const DEMO_QR = '/ticket-qr.png'
const DEMO_TOKEN = 'CAMPUS-QR-TICKET-DEMO'

/**
 * MODULE 3 – Attendance & QR Check-in
 * Shows a sample QR pass for prototype demos.
 * Host/Admin can paste token or mark present manually.
 */
export default function Attendance({ user }) {
  const [events, setEvents] = useState([])
  const [selected, setSelected] = useState(null)
  const [qrInput, setQrInput] = useState('')
  const [result, setResult] = useState(null)
  const [attendance, setAttendance] = useState(null)
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getAllEvents()
        setEvents(data)
      } catch {
        try {
          const data = await api.getEvents()
          setEvents(data)
        } catch {
          setEvents([])
          setError('Could not load events. Backend may be offline – you can still demo the QR pass UI.')
        }
      }
    }
    load()
  }, [])

  const loadEventData = async (eventId) => {
    setSelected(eventId)
    setResult(null)
    setError(null)
    try {
      const [att, parts] = await Promise.all([
        api.getAttendance(eventId),
        api.getParticipants(eventId)
      ])
      setAttendance(att)
      setParticipants(parts)
    } catch (e) {
      setAttendance({ attendance: [], checked_in: 0, total_registered: 0 })
      setParticipants([])
    }
  }

  const handleQRCheckin = async (e) => {
    e.preventDefault()
    if (!qrInput.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)

    // Demo mode: accept the static demo token without backend
    if (qrInput.trim() === DEMO_TOKEN || qrInput.trim().startsWith('CAMPUS')) {
      setResult({
        ok: true,
        already: false,
        message: 'Demo check-in successful',
        student_name: 'Demo Student',
        event_title: 'Prototype Event'
      })
      setQrInput('')
      setLoading(false)
      return
    }

    try {
      const res = await api.checkinQR({
        qr_token: qrInput.trim(),
        checked_in_by: user?.id
      })
      setResult({ ok: true, ...res })
      setQrInput('')
      if (selected) loadEventData(selected)
    } catch (err) {
      setResult({ ok: false, message: err.message || 'Check-in failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleManual = async (studentId) => {
    if (!selected) return
    setError(null)
    try {
      const res = await api.checkinManual({
        event_id: selected,
        student_id: studentId,
        checked_in_by: user.id
      })
      setResult({ ok: true, ...res })
      loadEventData(selected)
    } catch (err) {
      setResult({ ok: false, message: err.message })
    }
  }

  const fillDemoToken = () => setQrInput(DEMO_TOKEN)

  if (!user || (user.role !== 'host' && user.role !== 'admin')) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="text-4xl mb-3">📱</div>
        <h2 className="text-xl font-bold">Host or Admin access required</h2>
        <p className="text-gray-500 mt-2">
          Only event organizers and admins can mark attendance via QR or manual check-in.
        </p>
        <p className="text-sm text-gray-400 mt-4">
          Login as host@campus.edu / host123 or admin@campus.edu / admin123
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance & QR Check-in</h1>
        <p className="text-gray-500 mt-1">
          Scan student QR passes or mark attendance manually. Host and Admin only.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-sm">{error}</div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Sample QR pass for demo */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-card border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-1">Sample student pass</h2>
          <p className="text-xs text-gray-500 mb-4">
            In a real venue the student shows this QR from <strong>Tickets & Passes</strong>.
          </p>
          <div className="bg-gradient-to-b from-primary-50 to-white rounded-xl border border-primary-100 p-4 flex flex-col items-center">
            <div className="text-[10px] uppercase tracking-widest text-primary-400 mb-2">Event pass QR</div>
            <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
              <img src={DEMO_QR} alt="Demo QR Pass" className="w-40 h-40 object-contain" />
            </div>
            <code className="mt-3 text-[10px] font-mono text-gray-500 break-all text-center">{DEMO_TOKEN}</code>
            <button
              type="button"
              onClick={fillDemoToken}
              className="mt-3 w-full py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl"
            >
              Use this token for check-in
            </button>
          </div>
        </div>

        {/* Check-in form */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-card border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-1">QR / Token check-in</h2>
          <p className="text-sm text-gray-500 mb-4">
            Paste the token from the student ticket, or click “Use this token” on the sample pass.
          </p>
          <form onSubmit={handleQRCheckin} className="flex flex-col sm:flex-row gap-3">
            <input
              value={qrInput}
              onChange={e => setQrInput(e.target.value)}
              placeholder="Paste QR token here..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-mono"
            />
            <button
              type="submit"
              disabled={loading || !qrInput.trim()}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl disabled:opacity-60"
            >
              {loading ? 'Checking...' : 'Mark Attendance'}
            </button>
          </form>
          {result && (
            <div className={`mt-4 p-4 rounded-xl text-sm ${result.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
              {result.ok ? (
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} />
                  <span>
                    {result.already ? 'Already checked in' : (result.message || 'Attendance marked successfully')}
                    {result.student_name && <> — <strong>{result.student_name}</strong></>}
                    {result.event_title && <> for <strong>{result.event_title}</strong></>}
                  </span>
                </div>
              ) : (
                result.message
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">Select Event</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {events.length === 0 && (
              <p className="text-sm text-gray-400">No events loaded (backend offline is OK for QR demo)</p>
            )}
            {events.map(ev => (
              <button
                key={ev.id}
                onClick={() => loadEventData(ev.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition ${
                  selected === ev.id ? 'bg-primary-50 text-primary-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {ev.title}
                <div className="text-xs text-gray-400 mt-0.5">{ev.date} · {ev.status}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selected && attendance && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                  <div className="text-2xl font-bold text-emerald-600">{attendance.checked_in ?? 0}</div>
                  <div className="text-sm text-gray-500">Checked In</div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                  <div className="text-2xl font-bold text-gray-900">{attendance.total_registered ?? 0}</div>
                  <div className="text-sm text-gray-500">Registered</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <Users size={16} /> Participants
                </div>
                <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                  {participants.map(p => (
                    <div key={p.registration_id} className="px-5 py-3 flex items-center justify-between text-sm">
                      <div>
                        <div className="font-medium text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-400">
                          {p.college_id || p.email} · {p.department || '—'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.attended ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                            Present
                          </span>
                        ) : (
                          <button
                            onClick={() => handleManual(p.student_id)}
                            className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-lg hover:bg-primary-100"
                          >
                            Mark Present
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {participants.length === 0 && (
                    <div className="px-5 py-8 text-center text-gray-400 text-sm">
                      No registrations for this event yet — use the sample QR above for demo check-in
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          {!selected && (
            <div className="bg-white rounded-2xl p-12 text-center shadow-card border border-gray-100 text-gray-400">
              Select an event for participant list, or use the sample QR pass for a quick demo
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
