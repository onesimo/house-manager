// Panda Monday collection for Drogheda (DROG_MON_A)
// Collections start Dec 15 2025, every Monday, 4-week rotation
const COLLECTION_START = '2025-12-15'
const ROTATION = [
  { binType: 'brown', label: 'Organic (Brown Bin)', color: 'bg-amber-700 text-white', emoji: '🟤' },
  { binType: 'black', label: 'General Waste (Black Bin)', color: 'bg-gray-800 text-white', emoji: '⚫' },
  { binType: 'brown', label: 'Organic (Brown Bin)', color: 'bg-amber-700 text-white', emoji: '🟤' },
  { binType: 'green', label: 'Recycling (Green Bin)', color: 'bg-green-600 text-white', emoji: '♻️' },
]

function getUpcomingCollections(count = 8) {
  const start = new Date(COLLECTION_START + 'T12:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const weeksSinceStart = Math.floor((today - start) / (7 * 24 * 60 * 60 * 1000))
  const results = []
  let weekIdx = Math.max(0, weeksSinceStart)

  while (results.length < count) {
    const d = new Date(start)
    d.setDate(d.getDate() + weekIdx * 7)
    if (d >= today) {
      results.push({
        date: d.toISOString().split('T')[0],
        ...ROTATION[weekIdx % ROTATION.length],
      })
    }
    weekIdx++
  }
  return results
}

function formatDate(iso) {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long' })
}

function daysUntil(iso) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(iso + 'T00:00:00')
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24))
  if (diff === 0) return '🚨 Today — put it out tonight!'
  if (diff === 1) return '⚠️ Tomorrow — put it out tonight!'
  if (diff === 2) return 'Put out in 2 days'
  return `In ${diff} days`
}

export default function Bins() {
  const collections = getUpcomingCollections(8)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Bin Schedule</h1>
      <p className="text-gray-500 text-sm mb-5">
        Monday collections — put the bin out Sunday night.
      </p>

      <ul className="space-y-3 mb-8">
        {collections.map((c, i) => (
          <li
            key={c.date}
            className={`flex items-center gap-4 rounded-lg px-5 py-4 shadow-sm border ${
              i === 0 ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-white'
            }`}
          >
            <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${c.color}`}>
              {c.emoji} {c.label}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{formatDate(c.date)}</p>
              <p className="text-xs text-gray-400">{daysUntil(c.date)}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mb-2">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">📄 Full Panda Calendar</h2>
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <iframe
            src="/panda-calendar.pdf"
            title="Panda waste collection calendar 2025/2026"
            className="w-full"
            style={{ height: '72vh', minHeight: '400px' }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          If the rotation above looks off, the PDF is the source of truth.
          Replace <code className="bg-gray-100 px-1 rounded">public/panda-calendar.pdf</code> each year.
        </p>
      </div>
    </div>
  )
}
