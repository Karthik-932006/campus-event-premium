export default function Profile({ user }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8">
        <div className="flex items-center gap-5">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="" className="w-20 h-20 rounded-2xl bg-primary-50" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-0.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full capitalize">{user?.role}</span>
          </div>
        </div>
        <div className="mt-8 grid sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-gray-50 rounded-xl"><div className="text-gray-400 text-xs">Student ID</div><div className="font-medium mt-0.5">STU-{user?.id || '2026001'}</div></div>
          <div className="p-4 bg-gray-50 rounded-xl"><div className="text-gray-400 text-xs">Department</div><div className="font-medium mt-0.5">Computer Science</div></div>
          <div className="p-4 bg-gray-50 rounded-xl"><div className="text-gray-400 text-xs">Year</div><div className="font-medium mt-0.5">3rd Year</div></div>
          <div className="p-4 bg-gray-50 rounded-xl"><div className="text-gray-400 text-xs">Phone</div><div className="font-medium mt-0.5">+91 98765 43210</div></div>
        </div>
        <button className="mt-6 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl">Edit Profile</button>
      </div>
    </div>
  )
}
