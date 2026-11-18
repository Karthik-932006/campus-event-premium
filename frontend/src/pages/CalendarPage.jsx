import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from '../components/Icons'
import { MOCK_EVENTS, getCategoryColor } from '../data/mockData'

export default function CalendarPage() {
  const [view, setView] = useState('month')
  const [current, setCurrent] = useState(new Date(2026, 10, 1)) // Nov 2026

  const monthName = current.toLocaleString('default', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate()
  const startDay = new Date(current.getFullYear(), current.getMonth(), 1).getDay()

  const eventsByDate = {}
  MOCK_EVENTS.forEach(e => {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = []
    eventsByDate[e.date].push(e)
  })

  const prev = () => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1))
  const next = () => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1))

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <div className="flex gap-2">
          {['month', 'week', 'agenda'].map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-sm rounded-lg capitalize ${view === v ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{v}</button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prev} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20}/></button>
          <h2 className="text-lg font-bold">{monthName}</h2>
          <button onClick={next} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight size={20}/></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400 mb-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDay }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${current.getFullYear()}-${String(current.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
            const dayEvents = eventsByDate[dateStr] || []
            return (
              <div key={day} className="aspect-square border border-gray-50 rounded-lg p-1 hover:bg-gray-50">
                <div className="text-xs font-medium text-gray-700">{day}</div>
                {dayEvents.slice(0,2).map(e => (
                  <Link key={e.id} to={`/events/${e.id}`} className={`block text-[9px] truncate px-1 py-0.5 rounded mt-0.5 ${getCategoryColor(e.category)}`}>{e.title}</Link>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
