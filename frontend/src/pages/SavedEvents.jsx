import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Calendar, MapPin, Trash2 } from '../components/Icons'
import { MOCK_EVENTS, formatDate, getCategoryColor } from '../data/mockData'

export default function SavedEvents() {
  const [savedIds, setSavedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('savedEvents') || '[]') } catch { return [] }
  })
  const events = MOCK_EVENTS.filter(e => savedIds.includes(e.id))

  const remove = (id) => {
    const next = savedIds.filter(x => x !== id)
    setSavedIds(next)
    localStorage.setItem('savedEvents', JSON.stringify(next))
  }

  if (events.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="w-16 h-16 mx-auto bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
          <Bookmark size={28} className="text-primary-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No saved events yet</h2>
        <p className="text-gray-500 mt-2">Bookmark events you like and find them here later.</p>
        <Link to="/events" className="mt-6 inline-block px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl">Explore Events</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Saved Events <span className="text-gray-400 text-lg font-normal">({events.length})</span></h1>
      <div className="grid sm:grid-cols-2 gap-5">
        {events.map(event => (
          <article key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100 flex">
            <img src={event.image} alt="" className="w-32 object-cover" onError={(e)=>{e.target.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80'}} />
            <div className="p-4 flex-1">
              <span className={`text-[11px] font-semibold capitalize px-2 py-0.5 rounded ${getCategoryColor(event.category)}`}>{event.category}</span>
              <Link to={`/events/${event.id}`} className="block font-semibold text-gray-900 mt-1 hover:text-primary-600">{event.title}</Link>
              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <div className="flex items-center gap-1"><Calendar size={12}/> {formatDate(event.date)}</div>
                <div className="flex items-center gap-1"><MapPin size={12}/> {event.venue}</div>
              </div>
              <div className="mt-3 flex gap-2">
                <Link to={`/events/${event.id}`} className="px-3 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-lg">Register</Link>
                <button onClick={() => remove(event.id)} className="px-3 py-1.5 border border-gray-200 text-xs rounded-lg flex items-center gap-1 text-red-600"><Trash2 size={12}/> Remove</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
