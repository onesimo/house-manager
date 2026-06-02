import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../LanguageContext'

function getSaved() {
  try { return JSON.parse(localStorage.getItem('induction')) || {} }
  catch { return {} }
}

function buildSteps(rules, notices) {
  return [
    ...rules.map((r, i) => ({ type: 'rule', text: r.text, index: i, total: rules.length })),
    ...notices.map((n, i) => ({ type: 'notice', ...n, index: i, total: notices.length })),
    { type: 'shower' },
    { type: 'complete' },
  ]
}

function ProgressBar({ current, total, t, tr }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs text-gray-400 dark:text-zinc-500 mb-1.5">
        <span>{tr(t.induction.stepOf, { current, total })}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function Badge({ label }) {
  return (
    <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4">
      {label}
    </span>
  )
}

function StepNum({ children }) {
  return (
    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
      {children}
    </span>
  )
}

export default function Induction() {
  const { t, tr } = useLanguage()
  const [rules, setRules] = useState(null)
  const [step, setStep] = useState(() => {
    const saved = getSaved()
    return saved.completed ? 0 : (saved.step ?? 0)
  })
  const navigate = useNavigate()

  useEffect(() => {
    return onValue(ref(db, 'rules'), (snap) => {
      const data = snap.val()
      const list = data
        ? Object.entries(data)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([, v]) => ({ text: v.text }))
        : []
      setRules(list)
    })
  }, [])

  if (rules === null) {
    return <p className="text-gray-400 dark:text-zinc-600 py-20 text-center">{t.common.loading}</p>
  }

  const notices = t.induction.notices
  const translatedRules = rules.map((r, i) => ({ ...r, text: t.rules.items?.[i] ?? r.text }))
  const steps = buildSteps(translatedRules, notices)
  const clampedStep = Math.min(step, steps.length - 1)
  const current = steps[clampedStep]
  const progressTotal = steps.length - 1

  const save = (nextStep) => {
    const isComplete = nextStep >= steps.length - 1
    localStorage.setItem('induction', JSON.stringify({
      step: nextStep,
      completed: isComplete || nextStep >= steps.length,
      ...(isComplete ? { completedAt: Date.now() } : {}),
    }))
  }

  const advance = () => {
    const next = clampedStep + 1
    save(next)
    setStep(next)
  }

  const goBack = () => {
    if (clampedStep > 0) setStep(clampedStep - 1)
  }

  const restart = () => {
    localStorage.removeItem('induction')
    setStep(0)
  }

  // ── Complete ──────────────────────────────────────────────────────────────
  if (current.type === 'complete' || clampedStep >= steps.length) {
    return (
      <div className="min-h-[72vh] flex flex-col justify-center max-w-sm mx-auto text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">{t.induction.completeTitle}</h1>
        <p className="text-gray-500 dark:text-zinc-400 text-sm leading-relaxed mb-8">{t.induction.completeText}</p>
        <div className="space-y-3">
          <button onClick={() => navigate('/')} className="w-full bg-indigo-600 text-white py-4 rounded-xl text-base font-semibold hover:bg-indigo-500 transition-colors">
            {t.induction.goHome}
          </button>
          <button onClick={restart} className="w-full border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 py-3 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
            {t.induction.restart}
          </button>
        </div>
      </div>
    )
  }

  // ── Rule / Notice ─────────────────────────────────────────────────────────
  if (current.type === 'rule' || current.type === 'notice') {
    const label = current.type === 'rule'
      ? tr(t.induction.houseRule, { i: current.index + 1, total: current.total })
      : tr(t.induction.importantNotice, { i: current.index + 1, total: current.total })

    return (
      <div className="max-w-sm mx-auto">
        <ProgressBar current={clampedStep + 1} total={progressTotal} t={t} tr={tr} />
        <Badge label={label} />

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl px-5 py-5 mb-6 min-h-[140px]">
          <p className="text-gray-900 dark:text-zinc-100 text-base leading-relaxed">{current.text}</p>
          {current.sub && (
            <ul className="mt-3 space-y-2">
              {current.sub.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-zinc-400">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-3">
          {clampedStep > 0 && (
            <button onClick={goBack} className="px-5 py-4 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
              {t.common.back}
            </button>
          )}
          <button onClick={advance} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl text-base font-semibold hover:bg-indigo-500 transition-colors">
            {t.common.gotIt}
          </button>
        </div>
      </div>
    )
  }

  // ── Shower ────────────────────────────────────────────────────────────────
  if (current.type === 'shower') {
    const ti = t.instructions
    return (
      <div className="max-w-sm mx-auto">
        <ProgressBar current={clampedStep + 1} total={progressTotal} t={t} tr={tr} />
        <Badge label={t.induction.showerLabel} />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-4">{t.induction.showerTitle}</h2>

        <div className="space-y-2 mb-6">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 flex gap-3">
            <StepNum>1</StepNum>
            <p className="text-sm text-gray-800 dark:text-zinc-200 font-medium">{ti.showerStepTitle}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 pl-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide px-1">{ti.waterHot}</p>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl px-3 py-2.5">
                <p className="text-xs text-gray-700 dark:text-zinc-300">{ti.switchOffLabel}</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl px-3 py-2.5">
                <p className="text-xs text-gray-700 dark:text-zinc-300">{ti.switchOnLabel}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide px-1">{ti.waterCold}</p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl px-3 py-2.5">
                <p className="text-xs text-gray-700 dark:text-zinc-300">{ti.coldLabel}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 flex gap-3">
            <StepNum>2</StepNum>
            <p className="text-sm text-gray-800 dark:text-zinc-200">{ti.step2}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 flex gap-3">
            <StepNum>3</StepNum>
            <p className="text-sm text-gray-800 dark:text-zinc-200">{ti.step3}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={goBack} className="px-5 py-4 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
            {t.common.back}
          </button>
          <button onClick={advance} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl text-base font-semibold hover:bg-indigo-500 transition-colors">
            {t.common.gotIt}
          </button>
        </div>
      </div>
    )
  }

  return null
}
