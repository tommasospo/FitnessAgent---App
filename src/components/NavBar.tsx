import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const link = ({ isActive }: { isActive: boolean }) => `block py-4 text-base ${isActive ? 'text-green-500' : 'text-gray-200'}`

export function NavBar() {
  const [aperto, setAperto] = useState(false)

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-gray-800 bg-gray-950 px-4 py-3">
        <span className="text-sm font-semibold text-gray-100">Buzz</span>
        <button onClick={() => setAperto((v) => !v)} aria-label="Menu" className="flex h-8 w-8 flex-col items-center justify-center gap-1.5">
          <span className="h-0.5 w-5 bg-gray-300" />
          <span className="h-0.5 w-5 bg-gray-300" />
          <span className="h-0.5 w-5 bg-gray-300" />
        </button>
      </header>

      {aperto && (
        <div className="fixed inset-0 z-30 bg-gray-950/98 pt-14" onClick={() => setAperto(false)}>
          <nav className="flex flex-col divide-y divide-gray-800 px-4" onClick={(e) => e.stopPropagation()}>
            <NavLink to="/" end className={link} onClick={() => setAperto(false)}>
              Allenamento del giorno
            </NavLink>
            <NavLink to="/nutrizione" className={link} onClick={() => setAperto(false)}>
              Nutrizione
            </NavLink>
            <NavLink to="/attivita" className={link} onClick={() => setAperto(false)}>
              Attività
            </NavLink>
            <NavLink to="/storico" className={link} onClick={() => setAperto(false)}>
              Storico
            </NavLink>
            <NavLink to="/schede" className={link} onClick={() => setAperto(false)}>
              Schede
            </NavLink>
            <NavLink to="/profilo" className={link} onClick={() => setAperto(false)}>
              Profilo
            </NavLink>
            <button onClick={() => supabase.auth.signOut()} className="py-4 text-left text-base text-gray-400">
              Esci
            </button>
          </nav>
        </div>
      )}
    </>
  )
}
