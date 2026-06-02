import { useState, useEffect } from 'react'
import { ref, onValue, push, remove } from 'firebase/database'
import { db } from '../firebase'
import { useLanguage } from '../LanguageContext'

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
]

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

function isCleanedThisWeek(logs, person) {
  const monday = toMonday(new Date())
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const mondayISO = monday.toISOString().split('T')[0]
  const sundayISO = sunday.toISOString().split('T')[0]
  return logs.some(log => log.person === person && log.date >= mondayISO && log.date <= sundayISO)
}

function formatLogDate(iso, lang) {
  return new Date(iso + 'T12:00:00').toLocaleDateString(
    lang === 'pt' ? 'pt-BR' : 'en-IE',
    { weekday: 'short', day: 'numeric', month: 'short' }
  )
}

// ── Cleaning Modal ────────────────────────────────────────────────────────────
function CleaningModal({ tasks, person, onClose }) {
  const { t, lang } = useLanguage()
  const cl = t.home.cleaningLog
  const today = new Date().toISOString().split('T')[0]

  const [step, setStep] = useState('date')
  const [date, setDate] = useState(today)
  const [showPicker, setShowPicker] = useState(false)
  const [checked, setChecked] = useState(() =>
    Object.fromEntries(tasks.map((_, i) => [i, false]))
  )
  const [saving, setSaving] = useState(false)

  const allChecked = tasks.every((_, i) => checked[i])

  const finalize = async () => {
    setSaving(true)
    await push(ref(db, 'cleaningLog'), { person, date, completedAt: Date.now() })
    setSaving(false)
    onClose()
  }

  const toggle = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }))

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">{cl.modalTitle}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 text-2xl leading-none">×</button>
        </div>

        {/* Step: date */}
        {step === 'date' && (
          <div className="px-5 py-5 space-y-3">
            <p className="text-sm text-gray-600 dark:text-zinc-400 mb-4">{cl.whenQuestion}</p>

            {!showPicker ? (
              <>
                <button
                  onClick={() => { setDate(today); setStep('tasks') }}
                  className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-500 transition-colors"
                >
                  {cl.todayBtn} — {new Date().toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-IE', { weekday: 'long', day: 'numeric', month: 'long' })}
                </button>
                <button
                  onClick={() => setShowPicker(true)}
                  className="w-full border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 py-3 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  {cl.otherDate}
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <input
                  type="date"
                  value={date}
                  max={today}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => setStep('tasks')}
                  disabled={!date}
                  className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-500 disabled:opacity-40 transition-colors"
                >
                  {cl.next}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step: tasks */}
        {step === 'tasks' && (
          <div className="px-5 py-5">
            <p className="text-sm font-medium text-gray-800 dark:text-zinc-200 mb-1">{cl.tasksTitle}</p>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mb-4">{cl.tasksHint}</p>

            <ul className="space-y-2 mb-5 max-h-80 overflow-y-auto">
              {tasks.map((task, i) => (
                <li
                  key={i}
                  onClick={() => toggle(i)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer border transition-colors ${
                    checked[i]
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50'
                      : 'bg-white border-gray-200 dark:bg-zinc-800 dark:border-zinc-700'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    checked[i] ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-zinc-600'
                  }`}>
                    {checked[i] && (
                      <svg viewBox="0 0 12 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                        <polyline points="1 5 4 8 11 1" />
                      </svg>
                    )}
                  </span>
                  <span className={`text-sm ${checked[i] ? 'line-through text-gray-400 dark:text-zinc-500' : 'text-gray-800 dark:text-zinc-200'}`}>
                    {task}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={finalize}
              disabled={!allChecked || saving}
              className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-500 disabled:opacity-40 transition-colors"
            >
              {saving ? cl.saving : cl.finalize}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Cleaning Widget ───────────────────────────────────────────────────────────
function CleaningWidget() {
  const { t, lang } = useLanguage()
  const [config, setConfig] = useState(null)
  const [logs, setLogs] = useState([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const unsubSchedule = onValue(ref(db, 'schedule'), snap => {
      if (snap.val()) setConfig(snap.val())
    })
    const unsubLog = onValue(ref(db, 'cleaningLog'), snap => {
      const data = snap.val()
      setLogs(
        data
          ? Object.entries(data)
              .map(([id, val]) => ({ id, ...val }))
              .sort((a, b) => b.completedAt - a.completedAt)
          : []
      )
    })
    return () => { unsubSchedule(); unsubLog() }
  }, [])

  if (!config) return null

  const weekOffset = getWeekOffset(config.startDate)
  const { people } = config
  const personIdx = weekOffset % people.length
  const person = people[personIdx]
  const color = AVATAR_COLORS[personIdx % AVATAR_COLORS.length]
  const cl = t.home.cleaningLog

  const monday = toMonday(new Date())
  const mondayISO = monday.toISOString().split('T')[0]
  const sundayISO = new Date(monday.getTime() + 6 * 86400000).toISOString().split('T')[0]
  const currentWeekLog = logs.find(l => l.person === person && l.date >= mondayISO && l.date <= sundayISO)
  const cleaned = !!currentWeekLog

  return (
    <section className="mb-6">
      {showModal && (
        <CleaningModal
          tasks={config.tasks || []}
          person={person}
          onClose={() => setShowModal(false)}
        />
      )}

      <h2 className="text-base font-semibold text-gray-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">{t.home.cleaning}</h2>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${color}`}>
            {person[0].toUpperCase()}
          </div>
          <p className="font-semibold text-gray-900 dark:text-zinc-100">{person}</p>
        </div>
        {cleaned ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 text-xs font-semibold px-3 py-2 rounded-lg">
              {cl.done}
            </span>
            <button
              onClick={() => remove(ref(db, `cleaningLog/${currentWeekLog.id}`))}
              title="Desfazer"
              className="text-gray-300 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 transition-colors text-xl leading-none p-1"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 bg-indigo-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-indigo-500 active:bg-indigo-700 transition-colors"
          >
            {cl.button}
          </button>
        )}
      </div>

      {logs.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide mb-2">{cl.logTitle}</p>
          <ul className="space-y-1.5">
            {logs.slice(0, 5).map(log => (
              <li key={log.id} className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-bold flex items-center justify-center shrink-0">
                    {log.person[0].toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-gray-800 dark:text-zinc-200">{log.person}</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-zinc-500">{formatLogDate(log.date, lang)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

// ── Bins Widget ───────────────────────────────────────────────────────────────
const COLLECTION_START = '2025-12-15'
const ROTATION = [
  [{ binType: 'black' }],
  [{ binType: 'green' }, { binType: 'brown' }],
]

const BIN_COLORS = {
  black: 'bg-zinc-600 text-zinc-100',
  brown: 'bg-amber-800 text-amber-100',
  green: 'bg-green-700 text-green-100',
}

function getNextCollections(count = 2) {
  const start = new Date(COLLECTION_START + 'T12:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weeksSinceStart = Math.floor((today - start) / (7 * 24 * 60 * 60 * 1000))
  const results = []
  let weekIdx = Math.max(0, weeksSinceStart)
  while (results.length < count) {
    const d = new Date(start)
    d.setDate(d.getDate() + weekIdx * 7)
    if (d >= today) results.push({ date: d.toISOString().split('T')[0], bins: ROTATION[weekIdx % ROTATION.length] })
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

function BinsWidget() {
  const { t, tr } = useLanguage()
  const collections = getNextCollections(2)
  return (
    <section className="mb-6">
      <h2 className="text-base font-semibold text-gray-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">{t.home.nextCollections}</h2>
      <ul className="space-y-2">
        {collections.map((c, i) => (
          <li
            key={c.date}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
              i === 0
                ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950'
                : 'border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
            }`}
          >
            <div className="flex flex-col gap-1 shrink-0">
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
    </section>
  )
}

// ── Notes Wall ────────────────────────────────────────────────────────────────
const NOTE_COLORS = [
  'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/40 dark:border-yellow-700/50',
  'bg-blue-50 border-blue-300 dark:bg-indigo-900/40 dark:border-indigo-700/50',
  'bg-pink-50 border-pink-300 dark:bg-pink-900/40 dark:border-pink-700/50',
  'bg-emerald-50 border-emerald-300 dark:bg-emerald-900/40 dark:border-emerald-700/50',
  'bg-orange-50 border-orange-300 dark:bg-orange-900/40 dark:border-orange-700/50',
  'bg-sky-50 border-sky-300 dark:bg-sky-900/40 dark:border-sky-700/50',
]

function NotesWall() {
  const { t } = useLanguage()
  const [notes, setNotes] = useState([])
  const [input, setInput] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)

  useEffect(() => {
    return onValue(ref(db, 'notes'), (snap) => {
      const data = snap.val()
      setNotes(
        data
          ? Object.entries(data)
              .map(([id, val]) => ({ id, ...val }))
              .sort((a, b) => b.createdAt - a.createdAt)
          : []
      )
    })
  }, [])

  const addNote = () => {
    const text = input.trim()
    if (!text) return
    push(ref(db, 'notes'), { text, createdAt: Date.now() })
    setInput('')
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-gray-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">{t.home.wallOfNotes}</h2>

      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addNote()}
          placeholder={t.home.notePlaceholder}
          className="flex-1 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={addNote}
          className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-base font-medium hover:bg-indigo-500 active:bg-indigo-700 transition-colors"
        >
          {t.common.post}
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="text-gray-400 dark:text-zinc-600 text-sm text-center py-8">{t.home.noNotes}</p>
      ) : (
        <div className="columns-2 gap-3">
          {notes.map((note, i) => (
            <div key={note.id} className={`break-inside-avoid mb-3 rounded-xl border px-4 py-3 ${NOTE_COLORS[i % NOTE_COLORS.length]}`}>
              <p className="text-gray-800 dark:text-zinc-200 text-sm leading-relaxed">{note.text}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-400 dark:text-zinc-600 text-xs">
                  {new Date(note.createdAt).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}
                </span>
                {pendingDelete === note.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { remove(ref(db, `notes/${note.id}`)); setPendingDelete(null) }}
                      className="text-xs font-semibold text-red-500 hover:text-red-600 px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-900/30 transition-colors"
                    >
                      Sim
                    </button>
                    <button
                      onClick={() => setPendingDelete(null)}
                      className="text-xs text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 px-2 py-0.5 rounded-md transition-colors"
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setPendingDelete(note.id)}
                    className="text-gray-300 hover:text-red-500 dark:text-zinc-700 dark:hover:text-red-400 transition-colors text-lg leading-none p-1 -mr-1"
                    aria-label="Remove note"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const { t } = useLanguage()
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-1">Bryanstown Manor</h1>
      <p className="text-gray-500 dark:text-zinc-500 text-sm mb-6">{t.home.subtitle}</p>
      <CleaningWidget />
      <BinsWidget />
      <NotesWall />
    </div>
  )
}
