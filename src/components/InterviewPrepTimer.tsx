import { useEffect, useState } from 'react'
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react'

const PREP_DURATION_SECONDS = 120

const QUESTIONS: string[] = [
  'Ceritakan tentang dirimu dan kenapa kamu tertarik magang di bidang IT.',
  'Jelaskan proyek yang paling kamu banggakan. Apa peranmu dan tantangan terbesarnya?',
  'Apa perbedaan let, const, dan var di JavaScript?',
  'Bagaimana cara kerja useEffect di React, dan kapan perlu fungsi cleanup?',
  'Ceritakan saat kamu menemukan bug yang sulit. Bagaimana cara kamu men-debug-nya?',
  'Bagaimana kamu bekerja dalam tim saat ada perbedaan pendapat soal solusi teknis?',
  'Apa yang kamu ketahui tentang Git? Jelaskan alur branch & pull request.',
]

function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Latihan interview: countdown 02:00 per soal. */
export function InterviewPrepTimer() {
  const [index, setIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(PREP_DURATION_SECONDS)
  const [isRunning, setIsRunning] = useState(false)

  // Derived: timer benar-benar jalan hanya jika di-start DAN waktu masih ada
  const isTicking = isRunning && secondsLeft > 0
  const isTimeUp = secondsLeft === 0

  useEffect(() => {
    if (!isTicking) return
    const intervalId = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    // Wajib cleanup: interval berhenti saat pause / waktu habis / modal ditutup (unmount),
    // sehingga saat dibuka lagi tidak ada 2 interval yang mempercepat hitungan.
    return () => clearInterval(intervalId)
  }, [isTicking])

  const reset = () => {
    setIsRunning(false)
    setSecondsLeft(PREP_DURATION_SECONDS)
  }

  const nextQuestion = () => {
    setIndex((i) => (i + 1) % QUESTIONS.length)
    reset()
  }

  const progress = (secondsLeft / PREP_DURATION_SECONDS) * 100

  return (
    <section className="panel prep">
      <div className="prep__header">
        <span className="muted">
          Soal {index + 1} dari {QUESTIONS.length}
        </span>
        <span className={`prep__timer ${isTimeUp ? 'is-up' : secondsLeft <= 30 ? 'is-low' : ''}`} aria-live="polite">
          {formatTimer(secondsLeft)}
        </span>
      </div>

      <p className="prep__question">{QUESTIONS[index]}</p>

      <div className="progress__track">
        <div className="progress__bar" style={{ transform: `scaleX(${progress / 100})` }} />
      </div>

      {isTimeUp && <p className="field__error">Waktu habis. Reset atau lanjut ke soal berikutnya</p>}

      <div className="prep__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setIsRunning((r) => !r)}
          disabled={isTimeUp}
        >
          {isTicking ? <Pause size={16} strokeWidth={1.5} /> : <Play size={16} strokeWidth={1.5} />}
          {isTicking ? 'Pause' : 'Start'}
        </button>
        <button type="button" className="btn" onClick={reset}>
          <RotateCcw size={16} strokeWidth={1.5} />
          Reset
        </button>
        <button type="button" className="btn" onClick={nextQuestion}>
          <SkipForward size={16} strokeWidth={1.5} />
          Soal berikutnya
        </button>
      </div>
    </section>
  )
}
