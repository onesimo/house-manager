import { useState, useEffect } from 'react'
import { ref, onValue, push, remove } from 'firebase/database'
import { db } from '../firebase'

export default function Rules() {
  const [rules, setRules] = useState([])
  const [input, setInput] = useState('')

  useEffect(() => {
    return onValue(ref(db, 'rules'), (snap) => {
      const data = snap.val()
      setRules(
        data
          ? Object.entries(data).map(([id, val]) => ({ id, text: val.text }))
          : []
      )
    })
  }, [])

  const addRule = () => {
    const text = input.trim()
    if (!text) return
    push(ref(db, 'rules'), { text })
    setInput('')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">House Rules</h1>
      <p className="text-gray-500 text-sm mb-5">The agreed rules for everyone living here.</p>

      <div className="flex gap-2 mb-5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addRule()}
          placeholder="Add a rule..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          onClick={addRule}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Add
        </button>
      </div>

      {rules.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-12">No rules yet. Add the first one above.</p>
      ) : (
        <ul className="space-y-2">
          {rules.map((rule, i) => (
            <li
              key={rule.id}
              className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm"
            >
              <span className="text-gray-400 text-sm mt-0.5 w-5 shrink-0">{i + 1}.</span>
              <span className="flex-1 text-gray-700 text-sm">{rule.text}</span>
              <button
                onClick={() => remove(ref(db, `rules/${rule.id}`))}
                className="text-gray-300 hover:text-red-400 transition-colors text-xl leading-none"
                aria-label="Remove rule"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
