import { NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex-1 py-3 text-center text-sm font-medium ${
    isActive ? 'text-green-500' : 'text-gray-400'
  }`

export function NavBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 flex border-t border-gray-800 bg-gray-950">
      <NavLink to="/" end className={linkClass}>
        Allenamento del giorno
      </NavLink>
      <NavLink to="/storico" className={linkClass}>
        Storico
      </NavLink>
      <NavLink to="/schede" className={linkClass}>
        Schede
      </NavLink>
      <button
        onClick={() => supabase.auth.signOut()}
        className="flex-1 py-3 text-center text-sm font-medium text-gray-400"
      >
        Esci
      </button>
    </nav>
  )
}
