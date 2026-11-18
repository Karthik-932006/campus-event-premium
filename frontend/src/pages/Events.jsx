import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Filter, Calendar, MapPin, Bookmark, BookmarkCheck, Grid, List, X } from '../components/Icons'
import { MOCK_EVENTS, CATEGORIES, getCategoryColor, formatDate, formatPrice } from '../data/mockData'

export default function Events({ user, trending }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [priceFilter, setPriceFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sort, setSort] = useState('date')
  const [view, setView] = useState('grid')
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem('savedEvents') || '[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('savedEvents', JSON.stringify(saved))
  }, [saved])

  const toggleSave = (id) => {
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const filtered = useMemo(() => {
    let list = [...MOCK_EVENTS]
    if (query) {
      const q = query.toLowerCase()
      list = list.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q))
    }
    if (category !== 'all') list = list.filter(e => e.category === category)
    if (priceFilter === 'free') list = list.filter(e => e.price === 0)
    if (priceFilter === 'paid') list = list.filter(e => e.price > 0)
    if (dateFilter === 'today') {
      const today = new Date().toISOString().slice(0, 10)
      list = list.filter(e => e.date === today)
    }
    if (dateFilter === 'week') {
      const now = new Date()
      const week = new Date(now.getTime() + 7 * 86400000)
      list = list.filter(e => new Date(e.date) <= week)
    }
    if (sort === 'date') list.sort((a, b) => a.date.localeCompare(b.date))
    if (sort === 'popularity') list.sort((a, b) => b.registered - a.registered)
    if (sort === 'price') list.sort((a, b) => a.price - b.price)
    if (trending) list.sort((a, b) => b.registered - a.registered)
    return list
  }, [query, category, priceFilter, dateFilter, sort, trending])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{trending ? 'Trending Events' : 'Explore Events'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} events found</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('grid')} className={`p-2 rounded-lg ${view === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:bg-gray-100'}`}><Grid size={18} /></button>
          <button onClick={() => setView('list')} className={`p-2 rounded-lg ${view === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:bg-gray-100'}`}><List size={18} /></button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
            <option value="all">Any Date</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
            <option value="all">Any Price</option>
            <option value="free">Free Only</option>
            <option value="paid">Paid</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
            <option value="date">Sort by Date</option>
            <option value="popularity">Sort by Popularity</option>
            <option value="price">Sort by Price</option>
          </select>
          {(query || category !== 'all' || priceFilter !== 'all' || dateFilter !== 'all') && (
            <button onClick={() => { setQuery(''); setCategory('all'); setPriceFilter('all'); setDateFilter('all') }} className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-1">
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-card border border-gray-100">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900">No events found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your filters or search query</p>
          <button onClick={() => { setQuery(''); setCategory('all'); setPriceFilter('all'); setDateFilter('all') }} className="mt-4 px-5 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl">Clear filters</button>
        </div>
      ) : (
        <div className={view === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-4'}>
          {filtered.map((event) => (
            <article key={event.id} className={`bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100 hover:shadow-hover transition group ${view === 'list' ? 'flex' : ''}`}>
              <div className={`relative overflow-hidden ${view === 'list' ? 'w-48 flex-shrink-0' : 'h-44'}`}>
                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80' }} />
                <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize ${getCategoryColor(event.category)} bg-white/95`}>{event.category}</span>
                <button onClick={() => toggleSave(event.id)} className="absolute top-3 right-3 p-2 rounded-lg bg-white/90 hover:bg-white text-gray-600">
                  {saved.includes(event.id) ? <BookmarkCheck size={16} className="text-primary-600" /> : <Bookmark size={16} />}
                </button>
              </div>
              <div className="p-4 flex-1">
                <Link to={`/events/${event.id}`}><h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-600">{event.title}</h3></Link>
                <div className="mt-2 space-y-1 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(event.date)} · {event.startTime}</div>
                  <div className="flex items-center gap-1.5"><MapPin size={14} /> {event.venue}</div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs font-bold ${event.price === 0 ? 'text-emerald-600' : 'text-gray-700'}`}>{formatPrice(event.price)}</span>
                  <span className="text-xs text-gray-400">{event.seats - event.registered} seats left</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link to={`/events/${event.id}`} className="flex-1 text-center py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl">Register</Link>
                  <Link to={`/events/${event.id}`} className="px-3 py-2 border border-gray-200 text-sm rounded-xl">Details</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
