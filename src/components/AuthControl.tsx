import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

function SignInModal({ onClose }: { onClose: () => void }) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await signIn(email.trim(), password)
    setBusy(false)
    if (error) setError(error)
    else onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ecr-charcoal/40 p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-[320px] rounded-lg bg-white p-5 shadow-xl"
      >
        <h2 className="font-ui text-[13px] font-bold uppercase tracking-[0.1em] text-ecr-charcoal">
          Editor Sign In
        </h2>
        <p className="mt-1 font-body text-[12px] text-ecr-charcoal-70">
          Sign in to add photos and edit project details.
        </p>
        <input
          type="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="mt-3 w-full rounded-md border border-ecr-charcoal-20 px-3 py-2 font-ui text-[13px] focus:border-ecr-charcoal-70 focus:outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mt-2 w-full rounded-md border border-ecr-charcoal-20 px-3 py-2 font-ui text-[13px] focus:border-ecr-charcoal-70 focus:outline-none"
        />
        {error && <p className="mt-2 font-ui text-[11px] text-ecr-red">{error}</p>}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border border-ecr-charcoal-20 py-2 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-ecr-charcoal-70"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-md bg-ecr-charcoal py-2 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  )
}

export function AuthControl() {
  const { enabled, isEditor, email, signOut } = useAuth()
  const [modal, setModal] = useState(false)

  if (!enabled) return null

  if (isEditor) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden font-ui text-[9px] uppercase tracking-[0.12em] text-white/50 sm:inline">
          {email}
        </span>
        <button
          onClick={signOut}
          className="rounded-full border border-white/25 px-2.5 py-1 font-ui text-[9px] font-semibold uppercase tracking-[0.12em] text-white/80 transition-colors hover:bg-white/10"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setModal(true)}
        className="rounded-full border border-white/25 px-2.5 py-1 font-ui text-[9px] font-semibold uppercase tracking-[0.12em] text-white/70 transition-colors hover:bg-white/10"
      >
        Sign in
      </button>
      {modal && <SignInModal onClose={() => setModal(false)} />}
    </>
  )
}
