import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export function Login() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setBusy(true)

    const { error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    setBusy(false)

    if (error) {
      setError(error.message)
      return
    }

    if (mode === 'signup') {
      setInfo('Account creato. Controlla la mail per confermare, poi accedi.')
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-gray-950 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-gray-900 p-6 shadow-xl"
      >
        <h1 className="text-xl font-semibold text-gray-100">
          {mode === 'signin' ? 'Accedi' : 'Crea account'}
        </h1>

        <div className="space-y-1">
          <label className="text-sm text-gray-400">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100 outline-none focus:border-green-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-400">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100 outline-none focus:border-green-500"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {info && <p className="text-sm text-green-400">{info}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-green-600 py-2 font-medium text-white disabled:opacity-50"
        >
          {mode === 'signin' ? 'Accedi' : 'Crea account'}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="w-full text-sm text-gray-400 underline"
        >
          {mode === 'signin' ? 'Non hai un account? Creane uno' : 'Hai già un account? Accedi'}
        </button>
      </form>
    </div>
  )
}
