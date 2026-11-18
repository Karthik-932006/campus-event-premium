import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { CheckCircle, X, Clock, Calendar, MapPin, Users } from '../components/Icons'

export default function Approvals({ user }) {
  const [pending, setPending] = useState([])
  const [all, setAll] = useState([])
  const [tab, setTab] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)
  const [rejectId, setRejectId] = useState(null)
  const [reason, setReason] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [p, a] = await Promise.all([
        api.getPendingEvents().catch(() => []),
        api.getAllEvents().catch(() => [])
      ])
      setPending(p)
      setAll(a)
    } catch {
      setPending([])
      setAll([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleAction = async (eventId, action) => {
    try {
      const res = await api.approveEvent({
        event_id: eventId,
        admin_id: user.id,
        action,
        reason: action === 'reject' ? reason : undefined
      })
      setMsg(res.message)
      setRejectId(null)
      setReason('')
      load()
      setTimeout(() => setMsg(null), 3000)
    } catch (err) {
      setMsg(err.message)
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h2 className="text-xl font-bold">Admin access required</h2>
        <p className="text-gray-500 mt-2">Only administrators can approve events.</p>
        <p className="text-sm text-gray-400 mt-4">Demo: admin@campus.edu / admin123</p>
      </div>
    )
  }

  const list = tab === 'pending' ? pending : all

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Event Approval Workflow</h1>
        <p className="text-gray-500 mt-1">Review and approve events submitted by hosts</p>
      </div>

      {msg && (
        <div className="p-4 bg-primary-50 text-primary-800 rounded-xl text-sm font-medium">{msg}</div>
      )}

      <div className="flex gap-2">
        <button onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold ${tab === 'pending' ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
          Pending ({pending.length})
        </button>
        <button onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold ${tab === 'all' ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
          All Events ({all.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-card border border-gray-100">
          <Clock size={32} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-semibold text-gray-900">No {tab === 'pending' ? 'pending' : ''} events</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map(ev => (
            <div key={ev.id} className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900">{ev.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      ev.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' :
                      ev.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                      ev.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      ev.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{ev.status?.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ev.description}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {ev.date}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {ev.venue || ev.location}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> by {ev.organizer_name || 'Host'}</span>
                    <span className="capitalize">{ev.category}</span>
                  </div>
                  {ev.rejection_reason && (
                    <p className="text-xs text-red-600 mt-2">Reason: {ev.rejection_reason}</p>
                  )}
                </div>
                {ev.status === 'pending_approval' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleAction(ev.id, 'approve')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl flex items-center gap-1">
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button onClick={() => setRejectId(ev.id)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl flex items-center gap-1">
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
              {rejectId === ev.id && (
                <div className="mt-4 p-4 bg-red-50 rounded-xl space-y-3">
                  <textarea value={reason} onChange={e => setReason(e.target.value)}
                    placeholder="Rejection reason (optional)" rows={2}
                    className="w-full px-3 py-2 border border-red-200 rounded-xl text-sm" />
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(ev.id, 'reject')}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl">Confirm Reject</button>
                    <button onClick={() => setRejectId(null)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
