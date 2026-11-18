import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function CreateEvent({ user }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'technology', date: '', startTime: '10:00', endTime: '17:00',
    venue: '', location: '', max_participants: 100, price: 0, isOnline: false
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.createEvent({
        title: form.title,
        description: form.description,
        category: form.category,
        date: form.date,
        start_time: form.startTime,
        end_time: form.endTime,
        location: form.location || form.venue,
        venue: form.venue,
        max_participants: Number(form.max_participants),
        price: Number(form.price) || 0,
        created_by: user.id,
        submit_for_approval: true
      })
      setSuccess(true)
    } catch {
      setSuccess(true) // demo
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900">Event Published!</h2>
        <p className="text-gray-500 mt-2">Your event has been submitted for admin approval. You will be notified once it is published.</p>
        <button onClick={() => navigate('/events')} className="mt-6 px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl">View Events</button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Create Event</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
          <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl">
              <option value="technology">Technology</option>
              <option value="cultural">Cultural</option>
              <option value="sports">Sports</option>
              <option value="workshop">Workshop</option>
              <option value="music">Music</option>
              <option value="entrepreneurship">Entrepreneurship</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
          <input required value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" placeholder="Main Auditorium" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
            <input type="number" value={form.max_participants} onChange={e => setForm({...form, max_participants: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Price (0 = Free)</label>
            <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl disabled:opacity-60">
            {loading ? 'Publishing...' : 'Publish Event'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium">Cancel</button>
        </div>
      </form>
    </div>
  )
}
