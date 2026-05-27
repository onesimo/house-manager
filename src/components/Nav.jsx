import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: '📋 Lists' },
  { to: '/rules', label: '📜 Rules' },
  { to: '/schedule', label: '🧹 Schedule' },
  { to: '/bins', label: '🗑️ Bins' },
]

export default function Nav() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 flex items-center gap-1 h-14">
        <span className="font-bold text-gray-800 mr-4 text-lg">🏠 Our House</span>
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
