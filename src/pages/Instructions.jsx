import { useLanguage } from '../LanguageContext'

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function StepBox({ number, children, variant = 'default' }) {
  const variants = {
    default: 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800',
    hot: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50',
    cold: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50',
    warn: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50',
  }
  return (
    <div className={`flex gap-3 rounded-xl border px-4 py-3 ${variants[variant]}`}>
      <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        {number}
      </span>
      <div className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">{children}</div>
    </div>
  )
}

export default function Instructions() {
  const { t } = useLanguage()
  const ti = t.instructions

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-1">{ti.title}</h1>
      <p className="text-gray-500 dark:text-zinc-500 text-sm mb-6">{ti.subtitle}</p>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide mb-3">{ti.noticesTitle}</h2>
        <ul className="space-y-2">
          {ti.notices.map((notice, i) => (
            <li key={i} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3">
              <div className="flex gap-3">
                <CheckIcon />
                <span className="text-sm text-gray-800 dark:text-zinc-200 leading-relaxed">{notice.text}</span>
              </div>
              {notice.sub && (
                <ul className="mt-2 ml-7 space-y-1.5">
                  {notice.sub.map((s, j) => (
                    <li key={j} className="flex gap-2 text-sm text-gray-600 dark:text-zinc-400">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-zinc-500 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              )}
              {notice.videos && (
                <div className="mt-3 ml-7 space-y-3">
                  {notice.videos.map((group, j) => (
                    <div key={j}>
                      <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">{group.label}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {group.srcs.map((src, k) => (
                          <video
                            key={k}
                            src={`${import.meta.env.BASE_URL}${src}`}
                            controls
                            playsInline
                            className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-black"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide mb-3">{ti.showerTitle}</h2>
        <div className="space-y-2">
          <StepBox number="1" variant="default">
            <span className="font-medium text-gray-900 dark:text-zinc-100">{ti.showerStepTitle}</span>
          </StepBox>

          <div className="grid grid-cols-2 gap-2 pl-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide px-1">{ti.waterHot}</p>
              <StepBox number="→" variant="hot">{ti.switchOffLabel}</StepBox>
              <StepBox number="→" variant="warn">{ti.switchOnLabel}</StepBox>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide px-1">{ti.waterCold}</p>
              <StepBox number="→" variant="cold">{ti.coldLabel}</StepBox>
            </div>
          </div>

          <StepBox number="2" variant="default">
            <span className="font-medium text-gray-900 dark:text-zinc-100">{ti.step2}</span>
          </StepBox>
          <StepBox number="3" variant="default">
            {ti.step3}
          </StepBox>
        </div>
      </section>
    </div>
  )
}
