import { useState, useEffect } from 'react'
import { ref, onValue, set } from 'firebase/database'
import { db } from '../firebase'

function getWeekOffset(startDate) {
  const start = new Date(startDate)
  const now = new Date()
  return Math.max(0, Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000)))
}

const DEFAULT_CONFIG = {
  people: ['Alice', 'Bob', 'Charlie'],
  tasks: ['Kitchen', 'Bathroom', 'Living room'],
  startDate: new Date().toISOString().split('T')[0],
}

export default function Schedule() {
  const [config, setConfig] = useState(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null)

  useEffect(() => {
    return onValue(ref(db, 'schedule'), (snap) => {
      const data = snap.val()
      if (data) {
        setConfig(data)
      } else {
        set(ref(db, 'schedule'), DEFAULT_CONFIG)
      }
    })
  }, [])

  if (!config) return <p className="text-gray-400 py-12 text-center">Loading...</p>

  const weekOffset = getWeekOffset(config.startDate)
  const { people, tasks } = config
  const assignments = people.map((person, i) => ({
    person,
    task: tasks[(i + weekOffset) % tasks.length],
  }))

  const startEdit = () => {
    setDraft({
      people: [...config.people],
      tasks: [...config.tasks],
      startDate: config.startDate,
    })
    setEditing(true)
  }

  const saveEdit = () => {
    const cleaned = {
      people: draft.people.map((p) => p.trim()).filter(Boolean),
      tasks: draft.tasks.map((t) => t.trim()).filter(Boolean),
      startDate: draft.startDate,
    }
    set(ref(db, 'schedule'), cleaned)
    setEditing(false)
  }

  const updateList = (field, index, value) => {
    setDraft((d) => {
      const updated = [...d[field]]
      updated[index] = value
      return { ...d, [field]: updated }
    })
  }

  const addItem = (field) => setDraft((d) => ({ ...d, [field]: [...d[field], ''] }))
  const removeItem = (field, index) =>
    setDraft((d) => ({ ...d, [field]: d[field].filter((_, i) => i !== index) }))

  if (editing && draft) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-5">Edit Schedule</h1>

        <div className="grid grid-cols-2 gap-4 mb-5">
          {['people', 'tasks'].map((field) => (
            <div key={field} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 capitalize">{field}</h2>
              <ul className="space-y-2">
                {draft[field].map((val, i) => (
                  <li key={i} className="flex gap-2">
                    <input
                      value={val}
                      onChange={(e) => updateList(field, i, e.target.value)}
                      className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                    <button
                      onClick={() => removeItem(field, i)}
                      className="text-gray-300 hover:text-red-400 text-xl leading-none"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => addItem(field)}
                className="mt-3 text-indigo-600 text-sm hover:underline"
              >
                + Add
              </button>
            </div>
          ))}
        </div>

        <div className="mb-5">
          <label className="text-sm text-gray-600 block mb-1">Rotation start date</label>
          <input
            type="date"
            value={draft.startDate}
            onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={saveEdit}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-800">Cleaning Schedule</h1>
        <button
          onClick={startEdit}
          className="text-sm text-indigo-600 hover:underline"
        >
          Edit
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-5">
        Week {weekOffset + 1} — rotates every Monday
      </p>

      <ul className="space-y-3">
        {assignments.map(({ person, task }) => (
          <li
            key={person}
            className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm"
          >
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm shrink-0">
              {person[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-800 text-sm">{person}</p>
              <p className="text-gray-500 text-sm">{task}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
