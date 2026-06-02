import { useState, useEffect, useRef } from 'react'
import { useAdmin } from '../AdminContext'
import { useLanguage } from '../LanguageContext'

export default function PinModal({ onClose }) {
  const { unlock } = useAdmin()
  const { t } = useLanguage()
  const [digits, setDigits] = useState(['', '', '', ''])
  const [shake, setShake] = useState(false)
  const inputs = [useRef(), useRef(), useRef(), useRef()]

  useEffect(() => { inputs[0].current?.focus() }, [])

  const handleDigit = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[i] = val
    setDigits(next)
    if (val && i < 3) inputs[i + 1].current?.focus()
    if (val && i === 3) {
      const pin = [...next].join('')
      if (unlock(pin)) {
        onClose()
      } else {
        setShake(true)
        setDigits(['', '', '', ''])
        setTimeout(() => { setShake(false); inputs[0].current?.focus() }, 600)
      }
    }
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs[i - 1].current?.focus()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-8 sm:pb-0" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl p-7 w-full max-w-xs shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 text-center mb-1">{t.admin.pinTitle}</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-500 text-center mb-6">{t.admin.pinSubtitle}</p>

        <div className={`flex justify-center gap-3 mb-6 ${shake ? 'animate-shake' : ''}`}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={inputs[i]}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none transition-colors ${
                shake
                  ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-zinc-700 focus:border-indigo-500'
              }`}
            />
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
        >
          {t.common.cancel}
        </button>
      </div>
    </div>
  )
}
