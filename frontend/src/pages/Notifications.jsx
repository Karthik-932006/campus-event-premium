import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Check } from '../components/Icons'
import { MOCK_NOTIFICATIONS } from '../data/mockData'

export default function Notifications() {
  const [notifs, setNotifs] = useState(MOCK_NOTIFICATIONS)

  const markAll = () => setNotifs(n => n.map(x => ({ ...x, read: true })))
  const markRead = (id) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x))

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button onClick={markAll} className="text-sm text-primary-600 font-medium flex items-center gap-1"><Check size={14}/> Mark all read</button>
      </div>
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 divide-y divide-gray-50">
        {notifs.map(n => (
          <Link key={n.id} to={n.eventId ? `/events/${n.eventId}` : '#'} onClick={() => markRead(n.id)}
            className={`flex gap-4 p-4 hover:bg-gray-50 transition ${!n.read ? 'bg-primary-50/30' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
            }`}>
              <Bell size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900 text-sm">{n.title}</span>
                {!n.read && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{n.time}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
