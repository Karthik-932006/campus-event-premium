import { useState, useEffect } from 'react'
import { Ticket } from '../components/Icons'
import { formatDate } from '../data/mockData'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

const API_BASE = 'http://localhost:8080/api'
/** Static demo QR always available for prototype presentation */
const DEMO_QR = '/ticket-qr.png'
const DEMO_QR_ALT = '/demo-qr.png'

export default function Tickets({ user }) {
  const [regs, setRegs] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      if (user?.id) {
        try {
          const data = await api.getMyRegistrations(user.id)
          setRegs(data.filter(r => r.status !== 'cancelled'))
          setLoading(false)
          return
        } catch (e) {
          console.warn('API registrations failed, using local', e)
        }
      }
      const local = JSON.parse(localStorage.getItem('myRegistrations') || '[]')
        .filter(r => r.status !== 'Cancelled')
      // Ensure at least one demo ticket for prototype if empty
      if (local.length === 0) {
        setRegs([{
          registration_id: 'demo-1',
          title: 'TechFest 2026 – Code the Future',
          date: '2026-11-22',
          start_time: '09:00',
          venue: 'Main Auditorium',
          status: 'confirmed',
          qr_token: 'CAMPUS-QR-TICKET-DEMO',
          demo: true
        }])
      } else {
        setRegs(local)
      }
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading tickets...</div>
  }

  if (regs.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <Ticket size={40} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold">No tickets yet</h2>
        <p className="text-gray-500 mt-2">
          Register for a published event to get a digital pass with QR code.
        </p>
        <Link to="/events" className="mt-6 inline-block px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl">
          Find Events
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tickets & Passes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Show this QR pass at the venue. Host/Admin scans or pastes the token to mark attendance.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {regs.map((r, i) => {
          const regId = r.registration_id || r.id
          const token = r.qr_token || 'CAMPUS-QR-TICKET-DEMO'
          // Prefer live backend QR when token exists; always fall back to static demo image
          const liveQr = token && !r.demo
            ? `${API_BASE}/qr/image/${encodeURIComponent(token)}`
            : null

          return (
            <div key={regId || i} className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100">
              <div className="bg-gradient-to-r from-primary-600 to-violet-600 p-4 text-white">
                <div className="text-xs opacity-80 tracking-wider">CAMPUSCONNECT PASS</div>
                <div className="font-bold mt-1 line-clamp-1">{r.title}</div>
              </div>
              <div className="p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span>
                    {r.date
                      ? (String(r.date).includes('-') ? formatDate(r.date) : r.date)
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time</span>
                  <span>{r.start_time || r.startTime || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Venue</span>
                  <span>{r.venue || r.location || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="text-emerald-600 font-medium capitalize">{r.status || 'confirmed'}</span>
                </div>
                {r.attended ? (
                  <div className="text-xs text-emerald-600 font-semibold">✓ Attendance marked</div>
                ) : null}

                {/* QR Pass – always shows an image */}
                <div className="mt-4 p-4 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-100 flex flex-col items-center">
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Scan for check-in</div>
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                    <img
                      src={liveQr || DEMO_QR}
                      alt="Event QR Pass"
                      className="w-44 h-44 object-contain"
                      onError={(e) => {
                        // If live API QR fails, force static demo QR
                        if (e.target.src.indexOf('ticket-qr') === -1) {
                          e.target.src = DEMO_QR
                        } else if (e.target.src.indexOf('demo-qr') === -1) {
                          e.target.src = DEMO_QR_ALT
                        }
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-3 text-center font-medium">
                    Digital Event Pass
                  </p>
                  <code className="mt-1 text-[10px] font-mono text-gray-400 break-all text-center max-w-full px-2">
                    {token}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(token)
                      setCopied(token)
                      setTimeout(() => setCopied(null), 2000)
                    }}
                    className="mt-2 px-3 py-1 text-[11px] font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg"
                  >
                    {copied === token ? '✓ Token copied' : 'Copy QR token'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
