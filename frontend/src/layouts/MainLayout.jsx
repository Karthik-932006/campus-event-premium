import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Compass, Heart, Calendar, Ticket, Users, PlusCircle, Bell, HelpCircle,
  Settings, LogOut, Menu, X, Search, ChevronDown, LayoutDashboard,
  Bookmark, ClipboardList, Building2, CheckCircle
} from '../components/Icons'

const navSections = [
  {
    title: 'DISCOVER',
    items: [
      { path: '/', label: 'Explore Events', icon: Compass },
      { path: '/for-you', label: 'For You', icon: Heart },
      { path: '/trending', label: 'Trending', icon: LayoutDashboard },
      { path: '/calendar', label: 'Calendar', icon: Calendar },
    ]
  },
  {
    title: 'MY ACTIVITIES',
    items: [
      { path: '/my-registrations', label: 'My Registrations', icon: ClipboardList },
      { path: '/saved', label: 'Saved Events', icon: Bookmark },
      { path: '/tickets', label: 'Tickets & Passes', icon: Ticket },
      { path: '/certificates', label: 'My Certificates', icon: CheckCircle },
    ]
  },
  {
    title: 'COMMUNITY',
    items: [
      { path: '/clubs', label: 'Clubs & Organizations', icon: Users },
      { path: '/groups', label: 'Campus Groups', icon: Building2 },
    ]
  },
  {
    title: 'MANAGEMENT',
    items: [
      { path: '/create-event', label: 'Create Event', icon: PlusCircle },
      { path: '/my-events', label: 'My Events', icon: ClipboardList },
      { path: '/approvals', label: 'Event Approvals', icon: CheckCircle },
      { path: '/attendance', label: 'Attendance / QR', icon: Users },
      { path: '/certificates', label: 'Issue Certificates', icon: Ticket },
    ]
  },
]

export default function MainLayout({ user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/events?q=${encodeURIComponent(search.trim())}`)
    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg shadow-soft">
            C
          </div>
          {!collapsed && (
            <div>
              <div className="font-bold text-gray-900 text-[15px] leading-tight">CampusConnect</div>
              <div className="text-[11px] text-gray-500">Your campus. Your events.</div>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={18} className={active ? 'text-primary-600' : 'text-gray-400'} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        <div>
          {!collapsed && (
            <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              OTHER
            </div>
          )}
          <div className="space-y-0.5">
            <Link to="/notifications" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${location.pathname === '/notifications' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Bell size={18} className="text-gray-400" />
              {!collapsed && <span>Notifications</span>}
            </Link>
            <Link to="/help" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${location.pathname === '/help' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <HelpCircle size={18} className="text-gray-400" />
              {!collapsed && <span>Help & Support</span>}
            </Link>
            <Link to="/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${location.pathname === '/settings' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Settings size={18} className="text-gray-400" />
              {!collapsed && <span>Settings</span>}
            </Link>
          </div>
        </div>
      </nav>

      {/* User */}
      {user && (
        <div className="border-t border-gray-100 p-3">
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
            >
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                alt={user.name}
                className="w-9 h-9 rounded-full bg-primary-100"
              />
              {!collapsed && (
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{user.name}</div>
                  <div className="text-xs text-gray-500 truncate">{user.email}</div>
                </div>
              )}
              {!collapsed && <ChevronDown size={16} className="text-gray-400" />}
            </button>
            {showProfile && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">View Profile</Link>
                <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</Link>
                <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-30 transition-sidebar ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-primary-600"
        >
          {collapsed ? <Menu size={12} /> : <X size={12} />}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 transition-sidebar ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between gap-4 px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <Menu size={20} />
              </button>
              <div className="hidden sm:block text-sm font-medium text-gray-500 capitalize">
                {location.pathname === '/' ? 'Discover' : location.pathname.slice(1).replace(/-/g, ' ')}
              </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events, clubs, workshops..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition"
                />
              </div>
            </form>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 transition"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              {user ? (
                <Link to="/create-event" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition shadow-soft">
                  <PlusCircle size={16} /> Create
                </Link>
              ) : (
                <Link to="/login" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition">
                  Login
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
