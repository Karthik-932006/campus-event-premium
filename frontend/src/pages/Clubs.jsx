import { Link } from 'react-router-dom'
import { Users, Calendar } from '../components/Icons'
import { MOCK_CLUBS } from '../data/mockData'

export default function Clubs() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clubs & Organizations</h1>
        <p className="text-gray-500 mt-1">Join communities that match your interests</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {MOCK_CLUBS.map(club => (
          <article key={club.id} className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100 hover:shadow-hover transition group">
            <div className="h-32 relative">
              <img src={club.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <img src={club.logo} alt="" className="absolute -bottom-6 left-4 w-14 h-14 rounded-xl border-4 border-white bg-white shadow" />
            </div>
            <div className="pt-8 p-5">
              <h3 className="font-bold text-gray-900">{club.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{club.description}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Users size={12}/> {club.members} members</span>
                <span className="flex items-center gap-1"><Calendar size={12}/> {club.upcomingEvents} events</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl">Join Club</button>
                <button className="px-4 py-2 border border-gray-200 text-sm rounded-xl">View</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
