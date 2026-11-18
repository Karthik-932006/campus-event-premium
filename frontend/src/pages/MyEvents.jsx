import { Link } from 'react-router-dom'
import { MOCK_EVENTS } from '../data/mockData'

export default function MyEvents({ user }) {
  const events = MOCK_EVENTS.slice(0, 4)
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
        <Link to="/create-event" className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl">Create Event</Link>
      </div>
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100"><div className="text-2xl font-bold">{events.length}</div><div className="text-sm text-gray-500">Total Events</div></div>
        <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100"><div className="text-2xl font-bold">342</div><div className="text-sm text-gray-500">Total Registrations</div></div>
        <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100"><div className="text-2xl font-bold">89%</div><div className="text-sm text-gray-500">Avg Attendance</div></div>
      </div>
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-5 py-3 font-medium">Event</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Registrations</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {events.map(e => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{e.title}</td>
                <td className="px-5 py-3 text-gray-500">{e.date}</td>
                <td className="px-5 py-3">{e.registered}/{e.seats}</td>
                <td className="px-5 py-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">Published</span></td>
                <td className="px-5 py-3"><Link to={`/events/${e.id}`} className="text-primary-600 font-medium">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
