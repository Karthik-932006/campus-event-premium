import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function GiveMarks({ user }) {
  const { eventId } = useParams()
  const [marks, setMarks] = useState(8)
  const [feedback, setFeedback] = useState('')
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await api.giveMarks({ event_id: Number(eventId), student_id: user.id, marks, feedback })
    } catch {}
    setDone(true)
  }

  if (done) return (
    <div className="max-w-md mx-auto py-20 text-center">
      <div className="text-4xl mb-3">⭐</div>
      <h2 className="text-xl font-bold">Thanks for your feedback!</h2>
      <button onClick={() => navigate('/events')} className="mt-4 text-primary-600 font-medium">Back to events</button>
    </div>
  )

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Rate Event</h1>
      <form onSubmit={submit} className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Marks (1-10)</label>
          <input type="range" min="1" max="10" value={marks} onChange={e => setMarks(Number(e.target.value))} className="w-full" />
          <div className="text-center text-2xl font-bold text-primary-600">{marks}</div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Feedback</label>
          <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl p-3 text-sm" />
        </div>
        <button type="submit" className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-xl">Submit</button>
      </form>
    </div>
  )
}
