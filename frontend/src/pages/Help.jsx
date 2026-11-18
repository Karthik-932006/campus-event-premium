export default function Help() {
  const faqs = [
    { q: 'How do I register for an event?', a: 'Open any event and click Register Now. Fill in your details and confirm.' },
    { q: 'Can I cancel a registration?', a: 'Yes. Go to My Registrations and click Cancel on the event.' },
    { q: 'How do I create an event?', a: 'If you are a host, use Create Event from the sidebar. Fill the form and publish.' },
    { q: 'Where is my ticket?', a: 'My Registrations → View Ticket. Show the QR at the venue.' },
  ]
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 divide-y divide-gray-100">
        {faqs.map((f, i) => (
          <div key={i} className="p-5">
            <h3 className="font-semibold text-gray-900">{f.q}</h3>
            <p className="text-sm text-gray-500 mt-1">{f.a}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Contact Support</h3>
        <textarea className="w-full border border-gray-200 rounded-xl p-3 text-sm" rows={3} placeholder="Describe your issue..." />
        <button className="mt-3 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl">Send Feedback</button>
      </div>
    </div>
  )
}
