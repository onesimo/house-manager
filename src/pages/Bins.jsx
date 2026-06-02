import { useLanguage } from '../LanguageContext'

const COLLECTION_START = '2025-12-15'

// 2-week alternating rotation:
// Week A: General Waste (black) — alone
// Week B: Recycling (green) + Organic (brown) — same day
const ROTATION = [
  [{ binType: 'black' }],
  [{ binType: 'green' }, { binType: 'brown' }],
]

const BIN_COLORS = {
  black: 'bg-zinc-600 text-zinc-100',
  brown: 'bg-amber-800 text-amber-100',
  green: 'bg-green-700 text-green-100',
}

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
        bins: ROTATION[weekIdx % ROTATION.length],
      })
    }
    weekIdx++
  }
  return results
}

function formatDate(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long' })
}

function daysUntil(iso, t, tr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((new Date(iso + 'T00:00:00') - today) / 86400000)
  if (diff === 0) return t.bins.today
  if (diff === 1) return t.bins.tomorrow
  if (diff < 0) return tr(t.bins.daysAgo, { n: Math.abs(diff) })
  return tr(t.bins.inDays, { n: diff })
}

export default function Bins() {
  const { t, tr } = useLanguage()
  const collections = getUpcomingCollections(8)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-1">{t.bins.title}</h1>
      <p className="text-gray-500 dark:text-zinc-500 text-sm mb-5">{t.bins.subtitle}</p>

      <ul className="space-y-3 mb-8">
        {collections.map((c, i) => (
          <li
            key={c.date}
            className={`flex items-center gap-3 rounded-xl px-4 py-4 border ${
              i === 0
                ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950'
                : 'border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
            }`}
          >
            <div className="flex flex-col gap-1.5 shrink-0">
              {c.bins.map((bin) => (
                <span key={bin.binType} className={`px-3 py-1 rounded-full text-xs font-semibold ${BIN_COLORS[bin.binType]}`}>
                  {t.binLabels[bin.binType]}
                </span>
              ))}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-zinc-200 truncate">{formatDate(c.date)}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">{daysUntil(c.date, t, tr)}</p>
            </div>
          </li>
        ))}
      </ul>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-3">{t.bins.pdfTitle}</h2>
        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <iframe
            src={`${import.meta.env.BASE_URL}panda-calendar.pdf`}
            title="Panda waste collection calendar 2025/2026"
            className="w-full"
            style={{ height: '70vh', minHeight: '400px' }}
          />
        </div>
        <p className="text-xs text-gray-400 dark:text-zinc-600 mt-2">
          {t.bins.pdfNote}
        </p>
      </div>
    </div>
  )
}
