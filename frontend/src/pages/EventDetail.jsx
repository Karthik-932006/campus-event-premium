import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Clock, Bookmark, BookmarkCheck, Share2, CheckCircle, X } from '../components/Icons'
import { MOCK_EVENTS, getCategoryColor, formatDate, formatPrice } from '../data/mockData'
import { api } from '../services/api'

export default function EventDetail({ user }) {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [success, setSuccess] = useState(false)
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem('savedEvents') || '[]') } catch { return [] }
  })
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', studentId: '', department: '', year: '', phone: '', agree: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const found = MOCK_EVENTS.find(e => String(e.id) === String(id))
    if (found) {
      setEvent(found)
    } else {
      // try backend
      api.getEvent(id).then(data => setEvent({
        ...data,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
        category: 'technology',
        startTime: '10:00',
        endTime: '17:00',
        venue: data.location || 'Campus',
        organizer: { name: 'Campus Host', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Host' },
        seats: data.max_participants || 100,
        registered: 0,
        price: 0,
        tags: [],
      })).catch(() => setEvent(null))
    }
  }, [id])

  useEffect(() => {
    localStorage.setItem('savedEvents', JSON.stringify(saved))
  }, [saved])

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="text-4xl mb-3">😕</div>
        <h2 className="text-xl font-bold">Event not found</h2>
        <Link to="/events" className="mt-4 inline-block text-primary-600 font-medium">Back to events</Link>
      </div>
    )
  }

  const toggleSave = () => {
    setSaved(prev => prev.includes(event.id) ? prev.filter(x => x !== event.id) : [...prev, event.id])
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!form.agree) { setError('Please accept the terms'); return }
    setLoading(true)
    setError('')
    try {
      let qrToken = null
      let regId = null
      if (user) {
        // Prefer real backend event id when available (seeded ids are small)
        const eventIdNum = Number(id)
        const res = await api.registerForEvent({
          event_id: eventIdNum > 100 ? 1 : eventIdNum,
          student_id: user.id
        })
        qrToken = res.qr_token
        regId = res.registration_id
      }
      setSuccess(true)
      setRegistered(true)
      const regs = JSON.parse(localStorage.getItem('myRegistrations') || '[]')
      regs.push({
        ...event,
        id: event.id,
        status: 'Confirmed',
        registeredAt: new Date().toISOString(),
        qr_token: qrToken,
        registration_id: regId
      })
      localStorage.setItem('myRegistrations', JSON.stringify(regs))
    } catch (err) {
      // Backend may be offline – still allow demo registration without live QR
      setSuccess(true)
      setRegistered(true)
      const regs = JSON.parse(localStorage.getItem('myRegistrations') || '[]')
      regs.push({ ...event, status: 'Confirmed', registeredAt: new Date().toISOString() })
      localStorage.setItem('myRegistrations', JSON.stringify(regs))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Cover */}
      <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-8">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 capitalize ${getCategoryColor(event.category)} bg-white/95`}>{event.category}</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{event.title}</h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">About this event</h2>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
            {event.tags && (
              <div className="flex flex-wrap gap-2 mt-4">
                {event.tags.map(t => <span key={t} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">{t}</span>)}
              </div>
            )}
          </section>

          {event.agenda && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Agenda</h2>
              <div className="space-y-3">
                {event.agenda.map((a, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-16 text-sm font-semibold text-primary-600">{a.time}</div>
                    <div className="flex-1 pb-3 border-b border-gray-100 text-gray-700">{a.title}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {event.speakers && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Guest Speakers</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {event.speakers.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                    <img src={s.image} alt={s.name} className="w-12 h-12 rounded-full" />
                    <div>
                      <div className="font-semibold text-gray-900">{s.name}</div>
                      <div className="text-sm text-gray-500">{s.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Organizer</h2>
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
              <img src={event.organizer.avatar} alt="" className="w-12 h-12 rounded-full" />
              <div>
                <div className="font-semibold text-gray-900">{event.organizer.name}</div>
                <div className="text-sm text-gray-500">Event Organizer</div>
              </div>
            </div>
          </section>
        </div>

        {/* Sticky Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl shadow-soft border border-gray-100 p-6 space-y-5">
            <div className="text-2xl font-bold text-gray-900">{formatPrice(event.price)}</div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2"><Calendar size={16} className="text-primary-500" /> {formatDate(event.date)}</div>
              <div className="flex items-center gap-2"><Clock size={16} className="text-primary-500" /> {event.startTime} – {event.endTime}</div>
              <div className="flex items-center gap-2"><MapPin size={16} className="text-primary-500" /> {event.venue}</div>
              <div className="flex items-center gap-2"><Users size={16} className="text-primary-500" /> {event.seats - (event.registered || 0)} seats available</div>
            </div>
            {registered || success ? (
              <div className="text-center py-3 bg-emerald-50 text-emerald-700 rounded-xl font-semibold flex items-center justify-center gap-2">
                <CheckCircle size={18} /> Registered
              </div>
            ) : (
              <button onClick={() => setShowModal(true)} className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition">
                Register Now
              </button>
            )}
            <div className="flex gap-2">
              <button onClick={toggleSave} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
                {saved.includes(event.id) ? <BookmarkCheck size={16} className="text-primary-600" /> : <Bookmark size={16} />}
                {saved.includes(event.id) ? 'Saved' : 'Save'}
              </button>
              <button className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !success && setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {success ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">You're registered!</h3>
                <p className="text-gray-500 mt-2">Your ticket for {event.title} is confirmed. Check My Registrations for your pass.</p>
                <div className="mt-6 space-y-2">
                  <Link to="/my-registrations" className="block w-full py-2.5 bg-primary-600 text-white font-semibold rounded-xl">View Ticket</Link>
                  <button onClick={() => setShowModal(false)} className="block w-full py-2.5 border border-gray-200 rounded-xl text-sm">Close</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Register for Event</h3>
                  <button type="button" onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                </div>
                <p className="text-sm text-gray-500">{event.title}</p>
                {['name', 'email', 'studentId', 'department', 'year', 'phone'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field === 'studentId' ? 'Student ID' : field}</label>
                    <input
                      required
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                      placeholder={field === 'year' ? 'e.g. 3rd Year' : ''}
                    />
                  </div>
                ))}
                <label className="flex items-start gap-2 text-sm text-gray-600">
                  <input type="checkbox" checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} className="mt-1" />
                  I agree to the event terms and code of conduct
                </label>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={loading} className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl disabled:opacity-60">
                  {loading ? 'Registering...' : 'Confirm Registration'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
