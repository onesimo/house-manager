import { useState, useEffect } from 'react'
import { ref, onValue, push, update, remove } from 'firebase/database'
import { db } from '../firebase'

function CheckList({ title, fbPath, placeholder }) {
  const [items, setItems] = useState([])
  const [input, setInput] = useState('')

  useEffect(() => {
    return onValue(ref(db, fbPath), (snap) => {
      const data = snap.val()
      setItems(
        data
          ? Object.entries(data)
              .map(([id, val]) => ({ id, ...val }))
              .sort((a, b) => (a.checked ? 1 : 0) - (b.checked ? 1 : 0))
          : []
      )
    })
  }, [fbPath])

  const addItem = () => {
    const text = input.trim()
    if (!text) return
    push(ref(db, fbPath), { text, checked: false })
    setInput('')
  }

  const toggle = (id, checked) => update(ref(db, `${fbPath}/${id}`), { checked: !checked })

  const clearChecked = () => {
    items.filter((i) => i.checked).forEach((i) => remove(ref(db, `${fbPath}/${i.id}`)))
  }

  const checkedCount = items.filter((i) => i.checked).length

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {checkedCount > 0 && (
          <button
            onClick={clearChecked}
            className="text-xs text-red-400 hover:text-red-600"
          >
            Clear {checkedCount} done
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder={placeholder}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          onClick={addItem}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Add
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">Nothing here yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm cursor-pointer"
              onClick={() => toggle(item.id, item.checked)}
            >
              <span
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  item.checked
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-gray-300'
                }`}
              >
                {item.checked && (
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span
                className={`flex-1 text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}
              >
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function Lists() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-5">Lists</h1>
      <CheckList title="🛒 Shopping" fbPath="shopping" placeholder="Add item..." />
      <CheckList title="✅ Chores" fbPath="chores" placeholder="Add chore..." />
    </div>
  )
}
