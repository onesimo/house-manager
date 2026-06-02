import { useState, useEffect } from 'react'
import { ref, onValue, push, update, remove } from 'firebase/database'
import { db } from '../firebase'
import { useLanguage } from '../LanguageContext'

function CheckList({ title, fbPath, placeholder }) {
  const { t, tr } = useLanguage()
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{title}</h2>
        {checkedCount > 0 && (
          <button onClick={clearChecked} className="text-sm text-red-500 hover:text-red-400 dark:text-red-400 dark:hover:text-red-300 py-1 px-2 -mr-2">
            {tr(t.lists.clearDone, { n: checkedCount })}
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder={placeholder}
          className="flex-1 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={addItem}
          className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-base font-medium hover:bg-indigo-500 active:bg-indigo-700 transition-colors"
        >
          {t.common.add}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-400 dark:text-zinc-600 text-sm text-center py-6">{t.lists.nothing}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 min-h-[52px] active:bg-gray-50 dark:active:bg-zinc-800 cursor-pointer"
              onClick={() => toggle(item.id, item.checked)}
            >
              <span
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                  item.checked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 dark:border-zinc-600'
                }`}
              >
                {item.checked && (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className={`flex-1 text-base py-3 ${item.checked ? 'line-through text-gray-400 dark:text-zinc-600' : 'text-gray-800 dark:text-zinc-200'}`}>
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
  const { t } = useLanguage()
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-5">{t.lists.title}</h1>
      <CheckList title={t.lists.shopping} fbPath="shopping" placeholder={t.lists.addItem} />
      <CheckList title={t.lists.chores} fbPath="chores" placeholder={t.lists.addChore} />
    </div>
  )
}
