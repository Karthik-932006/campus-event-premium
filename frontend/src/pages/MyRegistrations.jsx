import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Ticket, X } from '../components/Icons'
import { formatDate } from '../data/mockData'
import { api } from '../services/api'

export default function MyRegistrations({ user }) {
  const [regs, setRegs] = useState([])
  const [showTicket, setShowTicket] = useState(null)

  useEffect(() => {
    const load = async () => {
      if (user?.id) {
        try {
          const data = await api.getMyRegistrations(user.id)
          setRegs(data.map(r => ({
            id: r.event_id,
            title: r.title,
            date: r.date,
            startTime: r.start_time,
            venue: r.venue || r.location,
            status: r.status === 'confirmed' ? 'Confirmed' : r.status,
            image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80',
            qr_token: r.qr_token,
            attended: r.attended,
            has_certificate: r.has_certificate,
            certificate_code: r.certificate_code,
            registration_id: r.registration_id
          })))
          return
        } catch {}
      }
      setRegs(JSON.parse(localStorage.getItem('myRegistrations') || '[]'))
    }
    load()
  }, [user])

  const cancel = (id) => {
    const next = regs.map(r => r.id === id ? { ...r, status: 'Cancelled' } : r)
    setRegs(next)
    localStorage.setItem('myRegistrations', JSON.stringify(next))
  }

  if (regs.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="text-4xl mb-3">🎫</div>
        <h2 className="text-xl font-bold">No registrations yet</h2>
        <p className="text-gray-500 mt-2">Register for events to see them here</p>
        <Link to="/events" className="mt-6 inline-block px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl">Browse Events</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Registrations</h1>
      <div className="space-y-4">
        {regs.map((r, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 flex flex-col sm:flex-row gap-4">
            <img src={r.image} alt="" className="w-full sm:w-32 h-24 object-cover rounded-xl" />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{r.title}</h3>
                  <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                    <div className="flex items-center gap-1.5"><Calendar size={14}/> {formatDate(r.date)} · {r.startTime}</div>
                    <div className="flex items-center gap-1.5"><MapPin size={14}/> {r.venue}</div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  r.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                  r.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>{r.status || 'Confirmed'}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setShowTicket(r)} className="px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-lg flex items-center gap-1"><Ticket size={12}/> View Ticket</button>
                <Link to={`/events/${r.id}`} className="px-3 py-1.5 border border-gray-200 text-xs rounded-lg">View Event</Link>
                {r.status !== 'Cancelled' && (
                  <button onClick={() => cancel(r.id)} className="px-3 py-1.5 text-red-600 text-xs rounded-lg hover:bg-red-50">Cancel</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowTicket(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white text-center">
              <div className="text-xs uppercase tracking-wider opacity-80">CampusConnect Pass</div>
              <div className="text-lg font-bold mt-1">{showTicket.title}</div>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{formatDate(showTicket.date)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-medium">{showTicket.startTime}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Venue</span><span className="font-medium">{showTicket.venue}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-medium text-emerald-600">{showTicket.status || 'Confirmed'}</span></div>
              <div className="mt-4 p-4 bg-gray-50 rounded-xl flex flex-col items-center">
                <img
                  src={showTicket.qr_token ? `http://localhost:8080/api/qr/image/${encodeURIComponent(showTicket.qr_token)}` : '/ticket-qr.png'}
                  alt="QR Pass"
                  className="w-36 h-36 object-contain bg-white rounded-lg border border-gray-200"
                  onError={(e) => { e.target.src = '/ticket-qr.png' }}
                />
                <p className="text-center text-xs text-gray-400 mt-2">Show this pass at the venue</p>
                {(showTicket.qr_token || 'CAMPUS-QR-TICKET-DEMO') && (
                  <code className="text-[10px] font-mono text-gray-400 mt-1 break-all text-center">
                    {showTicket.qr_token || 'CAMPUS-QR-TICKET-DEMO'}
                  </code>
                )}
              </div>
            </div>
            <button onClick={() => setShowTicket(null)} className="w-full py-3 border-t border-gray-100 text-sm font-medium text-gray-600 hover:bg-gray-50">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
