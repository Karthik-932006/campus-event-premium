import { useState } from 'react'

export default function Settings({ user, onLogout }) {
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifPush, setNotifPush] = useState(true)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 divide-y divide-gray-100">
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Account</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Email</span><span>{user?.email || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Role</span><span className="capitalize">{user?.role || '—'}</span></div>
          </div>
        </div>
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between text-sm">
              <span>Email notifications</span>
              <input type="checkbox" checked={notifEmail} onChange={e => setNotifEmail(e.target.checked)} className="w-4 h-4" />
            </label>
            <label className="flex items-center justify-between text-sm">
              <span>Push notifications</span>
              <input type="checkbox" checked={notifPush} onChange={e => setNotifPush(e.target.checked)} className="w-4 h-4" />
            </label>
          </div>
        </div>
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Security</h3>
          <button className="text-sm text-primary-600 font-medium">Change password</button>
        </div>
        <div className="p-6">
          <button onClick={onLogout} className="text-sm text-red-600 font-medium">Log out</button>
        </div>
      </div>
    </div>
  )
}
