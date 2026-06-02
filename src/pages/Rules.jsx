import { useState, useEffect } from 'react'
import { ref, onValue, push, remove } from 'firebase/database'
import { db } from '../firebase'
import { useAdmin } from '../AdminContext'
import { useLanguage } from '../LanguageContext'
import PinModal from '../components/PinModal'

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

function UnlockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-indigo-500">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
    </svg>
  )
}

export default function Rules() {
  const { isAdmin, lock } = useAdmin()
  const { t, lang } = useLanguage()
  const [rules, setRules] = useState([])
  const [input, setInput] = useState('')
  const [showPin, setShowPin] = useState(false)

  useEffect(() => {
    return onValue(ref(db, 'rules'), (snap) => {
      const data = snap.val()
      setRules(data ? Object.entries(data).map(([id, val]) => ({ id, text: val.text })) : [])
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
      {showPin && <PinModal onClose={() => setShowPin(false)} />}

      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{t.rules.title}</h1>
        <button
          onClick={() => isAdmin ? lock() : setShowPin(true)}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
          aria-label={isAdmin ? 'Lock admin' : 'Unlock admin'}
        >
          {isAdmin ? <UnlockIcon /> : <LockIcon />}
        </button>
      </div>
      <p className="text-gray-500 dark:text-zinc-500 text-sm mb-5">{t.rules.subtitle}</p>

      {isAdmin && (
        <div className="flex gap-2 mb-5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addRule()}
            placeholder={t.rules.placeholder}
            className="flex-1 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={addRule}
            className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-base font-medium hover:bg-indigo-500 active:bg-indigo-700 transition-colors"
          >
            {t.common.add}
          </button>
        </div>
      )}

      {rules.length === 0 ? (
        <p className="text-gray-400 dark:text-zinc-600 text-sm text-center py-12">{t.rules.noRules}</p>
      ) : (
        <ul className="space-y-2">
          {rules.map((rule, i) => (
            <li key={rule.id} className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 min-h-[52px]">
              <span className="text-gray-400 dark:text-zinc-600 text-sm w-6 shrink-0 text-center">{i + 1}.</span>
              <span className="flex-1 text-base text-gray-800 dark:text-zinc-200 py-3">{t.rules.items?.[i] ?? rule.text}</span>
              {isAdmin && (
                <button
                  onClick={() => remove(ref(db, `rules/${rule.id}`))}
                  className="text-gray-300 hover:text-red-500 dark:text-zinc-700 dark:hover:text-red-400 transition-colors p-2 -mr-2 text-2xl leading-none"
                  aria-label="Remove rule"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
