import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function Register({ onLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.register(form)
      onLogin(data.user || { ...form, id: Date.now() })
      navigate('/')
    } catch (err) {
      // Demo: allow local register
      onLogin({ id: Date.now(), name: form.name, email: form.email, role: form.role })
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-2xl">C</div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Create account</h1>
          <p className="text-gray-500 mt-1">Join CampusConnect</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl">{error}</div>}
          {['name', 'email', 'password'].map(f => (
            <div key={f}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 capitalize">{f}</label>
              <input type={f === 'password' ? 'password' : f === 'email' ? 'email' : 'text'} required value={form[f]} onChange={e => setForm({...form, [f]: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl">
              <option value="student">Student</option>
              <option value="host">Host / Organizer</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl">{loading ? 'Creating...' : 'Create Account'}</button>
          <p className="text-center text-sm text-gray-500">Already have an account? <Link to="/login" className="text-primary-600 font-medium">Sign in</Link></p>
        </form>
      </div>
    </div>
  )
}
