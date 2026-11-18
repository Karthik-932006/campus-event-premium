import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.login({ email, password })
      onLogin(data.user || data)
      navigate('/')
    } catch (err) {
      // Demo fallback
      if (email === 'student@campus.edu' && password === 'student123') {
        onLogin({ id: 2, name: 'Demo Student', email, role: 'student' })
        navigate('/')
      } else if (email === 'host@campus.edu' && password === 'host123') {
        onLogin({ id: 2, name: 'Campus Host', email, role: 'host' })
        navigate('/')
      } else if (email === 'admin@campus.edu' && password === 'admin123') {
        onLogin({ id: 1, name: 'Campus Admin', email, role: 'admin' })
        navigate('/')
      } else {
        setError(err.message || 'Invalid credentials')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-2xl shadow-soft">C</div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to CampusConnect</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8 space-y-5">
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="you@college.edu" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-sm text-gray-500">
            Don't have an account? <Link to="/register" className="text-primary-600 font-medium">Register</Link>
          </p>
          <div className="text-xs text-gray-400 text-center border-t border-gray-100 pt-4">
            Demo: student@campus.edu / student123 · host@campus.edu / host123 · admin@campus.edu / admin123
          </div>
        </form>
      </div>
    </div>
  )
}
