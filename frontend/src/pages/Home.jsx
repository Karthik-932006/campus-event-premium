import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Bookmark, BookmarkCheck, ArrowRight, Sparkles, Ticket, Heart, CheckCircle } from '../components/Icons'
import { MOCK_EVENTS, CATEGORIES, getCategoryColor, formatDate, formatPrice } from '../data/mockData'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Home({ user }) {
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem('savedEvents') || '[]') } catch { return [] }
  })
  const [toast, setToast] = useState(null)

  useEffect(() => {
    localStorage.setItem('savedEvents', JSON.stringify(saved))
  }, [saved])

  const toggleSave = (id) => {
    setSaved(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      setToast(prev.includes(id) ? 'Removed from saved' : 'Event saved!')
      setTimeout(() => setToast(null), 2000)
      return next
    })
  }

  const featured = MOCK_EVENTS.find(e => e.isFeatured) || MOCK_EVENTS[0]
  const upcoming = MOCK_EVENTS.slice(0, 6)
  const name = user?.name?.split(' ')[0] || 'Student'

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-in">
          {toast}
        </div>
      )}

      {/* Welcome */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {getGreeting()}, {name} 👋
          </h1>
          <p className="text-gray-500 mt-1">Discover what's happening around your campus.</p>
          <p className="text-sm text-gray-400 mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/events" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition shadow-soft">
            Explore Events <ArrowRight size={16} />
          </Link>
          <Link to="/create-event" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:border-primary-300 text-gray-700 text-sm font-semibold rounded-xl transition">
            Create Event
          </Link>
        </div>
      </section>

      {/* Featured Hero */}
      <section className="relative rounded-2xl overflow-hidden shadow-soft group">
        <div className="absolute inset-0">
          <img src={featured.image} alt={featured.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80' }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>
        <div className="relative px-6 sm:px-10 py-12 sm:py-16 max-w-2xl">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${getCategoryColor(featured.category)} bg-white/90`}>
            {featured.category}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">{featured.title}</h2>
          <p className="text-white/80 text-sm sm:text-base line-clamp-2 mb-5">{featured.description}</p>
          <div className="flex flex-wrap gap-4 text-white/90 text-sm mb-6">
            <span className="flex items-center gap-1.5"><Calendar size={16} /> {formatDate(featured.date)}</span>
            <span className="flex items-center gap-1.5"><MapPin size={16} /> {featured.venue}</span>
            <span className="flex items-center gap-1.5"><Users size={16} /> {featured.organizer.name}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={`/events/${featured.id}`} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-xl transition">
              Register Now
            </Link>
            <Link to={`/events/${featured.id}`} className="px-6 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur text-white text-sm font-semibold rounded-xl transition border border-white/20">
              View Details
            </Link>
            <button onClick={() => toggleSave(featured.id)} className="p-2.5 bg-white/15 hover:bg-white/25 backdrop-blur text-white rounded-xl border border-white/20 transition">
              {saved.includes(featured.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Upcoming Events', value: MOCK_EVENTS.length, icon: Calendar, color: 'text-blue-600 bg-blue-50', trend: '+3 this week' },
          { label: 'Registered', value: user ? 2 : 0, icon: Ticket, color: 'text-violet-600 bg-violet-50', trend: '2 upcoming' },
          { label: 'Saved Events', value: saved.length, icon: Heart, color: 'text-pink-600 bg-pink-50', trend: 'Keep exploring' },
          { label: 'Attended', value: user ? 5 : 0, icon: CheckCircle, color: 'text-teal-600 bg-teal-50', trend: 'Great streak!' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 hover:shadow-hover transition">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                <s.icon size={20} />
              </div>
              <span className="text-[11px] text-gray-400 font-medium">{s.trend}</span>
            </div>
            <div className="mt-4 text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Browse by Category</h2>
          <Link to="/events" className="text-sm font-medium text-primary-600 hover:text-primary-700">View all</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/events?category=${cat.id}`}
              className="group bg-white rounded-2xl p-4 shadow-card border border-gray-100 hover:shadow-hover hover:border-primary-200 transition text-center"
            >
              <div className={`w-12 h-12 mx-auto rounded-xl ${cat.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition`}>
                <Sparkles size={22} />
              </div>
              <div className="text-sm font-semibold text-gray-900">{cat.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{cat.count} events</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Upcoming Events</h2>
          <Link to="/events" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
            See all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {upcoming.map((event) => (
            <article key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100 hover:shadow-hover transition group">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80' }}
                />
                <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize ${getCategoryColor(event.category)} bg-white/95`}>
                  {event.category}
                </span>
                <button
                  onClick={(e) => { e.preventDefault(); toggleSave(event.id) }}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-white/90 hover:bg-white text-gray-600 transition"
                >
                  {saved.includes(event.id) ? <BookmarkCheck size={16} className="text-primary-600" /> : <Bookmark size={16} />}
                </button>
                {event.price === 0 ? (
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500 text-white">FREE</span>
                ) : (
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-900/80 text-white">₹{event.price}</span>
                )}
              </div>
              <div className="p-4">
                <Link to={`/events/${event.id}`}>
                  <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition">{event.title}</h3>
                </Link>
                <div className="mt-2 space-y-1.5 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(event.date)} · {event.startTime}</div>
                  <div className="flex items-center gap-1.5"><MapPin size={14} /> {event.venue}</div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={event.organizer.avatar} alt="" className="w-6 h-6 rounded-full" />
                    <span className="text-xs text-gray-500">{event.organizer.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{event.seats - event.registered} seats left</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link to={`/events/${event.id}`} className="flex-1 text-center py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition">
                    Register
                  </Link>
                  <Link to={`/events/${event.id}`} className="px-3 py-2 border border-gray-200 hover:border-primary-300 text-gray-600 text-sm font-medium rounded-xl transition">
                    Details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
