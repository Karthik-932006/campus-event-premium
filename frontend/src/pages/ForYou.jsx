import { Link } from 'react-router-dom'
import { MOCK_EVENTS, getCategoryColor, formatDate } from '../data/mockData'

export default function ForYou({ user }) {
  const recommended = MOCK_EVENTS.filter(e => ['technology', 'workshop', 'entrepreneurship'].includes(e.category))
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">For You</h1>
        <p className="text-gray-500 mt-1">Personalized recommendations based on your interests</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        {recommended.map(e => (
          <Link key={e.id} to={`/events/${e.id}`} className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100 hover:shadow-hover transition flex">
            <img src={e.image} alt="" className="w-28 object-cover" />
            <div className="p-4">
              <span className={`text-[11px] font-semibold capitalize px-2 py-0.5 rounded ${getCategoryColor(e.category)}`}>{e.category}</span>
              <h3 className="font-semibold text-gray-900 mt-1 line-clamp-1">{e.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{formatDate(e.date)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
