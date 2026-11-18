import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import MyRegistrations from './pages/MyRegistrations'
import CreateEvent from './pages/CreateEvent'
import SavedEvents from './pages/SavedEvents'
import Clubs from './pages/Clubs'
import CalendarPage from './pages/CalendarPage'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Help from './pages/Help'
import MyEvents from './pages/MyEvents'
import GiveMarks from './pages/GiveMarks'
import ForYou from './pages/ForYou'
import Tickets from './pages/Tickets'
import Approvals from './pages/Approvals'
import Attendance from './pages/Attendance'
import Certificates from './pages/Certificates'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('campusUser')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch { localStorage.removeItem('campusUser') }
    }
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('campusUser', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('campusUser')
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={login} />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register onLogin={login} />} />

      <Route element={<MainLayout user={user} onLogout={logout} />}>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/events" element={<Events user={user} />} />
        <Route path="/events/:id" element={<EventDetail user={user} />} />
        <Route path="/for-you" element={<ForYou user={user} />} />
        <Route path="/trending" element={<Events user={user} trending />} />
        <Route path="/calendar" element={<CalendarPage user={user} />} />
        <Route path="/my-registrations" element={user ? <MyRegistrations user={user} /> : <Navigate to="/login" />} />
        <Route path="/saved" element={<SavedEvents user={user} />} />
        <Route path="/tickets" element={user ? <Tickets user={user} /> : <Navigate to="/login" />} />
        <Route path="/clubs" element={<Clubs user={user} />} />
        <Route path="/groups" element={<Clubs user={user} />} />
        <Route path="/create-event" element={user ? <CreateEvent user={user} /> : <Navigate to="/login" />} />
        <Route path="/my-events" element={user ? <MyEvents user={user} /> : <Navigate to="/login" />} />
        {/* Module 2 – Approval */}
        <Route path="/approvals" element={<Approvals user={user} />} />
        {/* Module 3 – Attendance + QR */}
        <Route path="/attendance" element={<Attendance user={user} />} />
        {/* Module 4 – Certificates */}
        <Route path="/certificates" element={<Certificates user={user} />} />
        <Route path="/notifications" element={<Notifications user={user} />} />
        <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
        <Route path="/settings" element={<Settings user={user} onLogout={logout} />} />
        <Route path="/help" element={<Help />} />
        <Route path="/give-marks/:eventId" element={user ? <GiveMarks user={user} /> : <Navigate to="/login" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
