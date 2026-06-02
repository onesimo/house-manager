import { useState, useEffect } from 'react'
import { ref, onValue, set } from 'firebase/database'
import { db } from '../firebase'
import { useAdmin } from '../AdminContext'
import { useLanguage } from '../LanguageContext'
import PinModal from '../components/PinModal'

function toMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekOffset(startDate) {
  const startMonday = toMonday(new Date(startDate + 'T12:00:00'))
  const currentMonday = toMonday(new Date())
  return Math.max(0, Math.round((currentMonday - startMonday) / (7 * 24 * 60 * 60 * 1000)))
}

function nextMonday(weeksFromNow = 0) {
  const currentMonday = toMonday(new Date())
  const target = new Date(currentMonday)
  target.setDate(currentMonday.getDate() + weeksFromNow * 7)
  return target.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })
}

const DEFAULT_CONFIG = {
  people: ['Alice', 'Bob', 'Charlie'],
  tasks: ['Kitchen', 'Bathroom', 'Living room'],
  startDate: new Date().toISOString().split('T')[0],
}

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
]

export default function Schedule() {
  const { isAdmin, lock } = useAdmin()
  const { t, tr } = useLanguage()
  const [config, setConfig] = useState(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null)
  const [showPin, setShowPin] = useState(false)

  useEffect(() => {
    return onValue(ref(db, 'schedule'), (snap) => {
      const data = snap.val()
      if (data) { setConfig(data) } else { set(ref(db, 'schedule'), DEFAULT_CONFIG) }
    })
  }, [])

  if (!config) return <p className="text-gray-400 dark:text-zinc-600 py-12 text-center">{t.common.loading}</p>

  const weekOffset = getWeekOffset(config.startDate)
  const { people, tasks } = config
  const currentPersonIdx = weekOffset % people.length
  const currentPerson = people[currentPersonIdx]
  const currentColor = AVATAR_COLORS[currentPersonIdx % AVATAR_COLORS.length]

  const upcomingWeeks = Array.from({ length: people.length - 1 }, (_, i) => {
    const idx = (currentPersonIdx + i + 1) % people.length
    return { person: people[idx], color: AVATAR_COLORS[idx % AVATAR_COLORS.length], weeksFromNow: i + 1 }
  })

  const startEdit = () => {
    setDraft({ people: [...config.people], tasks: [...config.tasks], startDate: config.startDate })
    setEditing(true)
  }

  const saveEdit = () => {
    const monday = toMonday(new Date(draft.startDate + 'T12:00:00'))
    const cleaned = {
      people: draft.people.map((p) => p.trim()).filter(Boolean),
      tasks: draft.tasks.map((t) => t.trim()).filter(Boolean),
      startDate: monday.toISOString().split('T')[0],
    }
    set(ref(db, 'schedule'), cleaned)
    setEditing(false)
  }

  const updateList = (field, index, value) =>
    setDraft((d) => { const u = [...d[field]]; u[index] = value; return { ...d, [field]: u } })
  const addItem = (field) => setDraft((d) => ({ ...d, [field]: [...d[field], ''] }))
  const removeItem = (field, index) =>
    setDraft((d) => ({ ...d, [field]: d[field].filter((_, i) => i !== index) }))

  if (editing && draft) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-5">{t.schedule.editTitle}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {['people', 'tasks'].map((field) => (
            <div key={field} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-zinc-400 mb-3 capitalize">
                {field === 'people' ? t.schedule.people : t.schedule.tasks}
              </h2>
              <ul className="space-y-2">
                {draft[field].map((val, i) => (
                  <li key={i} className="flex gap-2">
                    <input
                      value={val}
                      onChange={(e) => updateList(field, i, e.target.value)}
                      className="flex-1 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-base text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button onClick={() => removeItem(field, i)} className="text-gray-300 hover:text-red-500 dark:text-zinc-700 dark:hover:text-red-400 text-2xl leading-none p-2">×</button>
                  </li>
                ))}
              </ul>
              <button onClick={() => addItem(field)} className="mt-3 text-indigo-600 dark:text-indigo-400 text-sm py-1">+ {t.common.add}</button>
            </div>
          ))}
        </div>
        <div className="mb-6">
          <label className="text-sm text-gray-500 dark:text-zinc-500 block mb-1">{t.schedule.startDate}</label>
          <input
            type="date"
            value={draft.startDate}
            onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))}
            className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={saveEdit} className="flex-1 sm:flex-none bg-indigo-600 text-white px-6 py-3 rounded-xl text-base font-medium hover:bg-indigo-500">{t.common.save}</button>
          <button onClick={() => setEditing(false)} className="flex-1 sm:flex-none border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 px-6 py-3 rounded-xl text-base hover:bg-gray-50 dark:hover:bg-zinc-800">{t.common.cancel}</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {showPin && <PinModal onClose={() => setShowPin(false)} />}

      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{t.schedule.title}</h1>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button onClick={startEdit} className="text-sm text-indigo-600 dark:text-indigo-400 py-2 px-1">
              {t.common.edit}
            </button>
          )}
          <button
            onClick={() => isAdmin ? lock() : setShowPin(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
          >
            {isAdmin ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-indigo-500">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            )}
          </button>
        </div>
      </div>
      <p className="text-gray-500 dark:text-zinc-500 text-sm mb-5">{tr(t.schedule.subtitle, { n: weekOffset + 1 })}</p>

      <div className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-xl px-5 py-4 mb-4">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-3">{t.schedule.thisWeek}</p>
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${currentColor}`}>
            {currentPerson[0].toUpperCase()}
          </div>
          <p className="text-xl font-semibold text-gray-900 dark:text-zinc-100">{currentPerson}</p>
        </div>
        <ul className="space-y-1.5">
          {tasks.map((task) => (
            <li key={task} className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              {task}
            </li>
          ))}
        </ul>
      </div>

      {upcomingWeeks.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide mb-2 mt-5">{t.schedule.comingUp}</p>
          <ul className="space-y-2">
            {upcomingWeeks.map(({ person, color, weeksFromNow }) => (
              <li key={person} className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${color}`}>
                  {person[0].toUpperCase()}
                </div>
                <p className="flex-1 font-medium text-gray-900 dark:text-zinc-100 text-sm">{person}</p>
                <span className="text-xs text-gray-400 dark:text-zinc-500 shrink-0">
                  {t.schedule.from} {nextMonday(weeksFromNow)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
