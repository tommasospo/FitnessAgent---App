import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './lib/useAuth'
import { Login } from './pages/Login'
import { AllenamentoDelGiorno } from './pages/AllenamentoDelGiorno'
import { Nutrizione } from './pages/Nutrizione'
import { Attivita } from './pages/Attivita'
import { Storico } from './pages/Storico'
import { SessioneDettaglio } from './pages/SessioneDettaglio'
import { Schede } from './pages/Schede'
import { SchedaDettaglio } from './pages/SchedaDettaglio'
import { Profilo } from './pages/Profilo'
import { NavBar } from './components/NavBar'

export function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-gray-950">
        <p className="text-gray-400">Carico...</p>
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="min-h-svh bg-gray-950 pt-14">
        <Routes>
          <Route path="/" element={<AllenamentoDelGiorno />} />
          <Route path="/nutrizione" element={<Nutrizione />} />
          <Route path="/attivita" element={<Attivita />} />
          <Route path="/storico" element={<Storico />} />
          <Route path="/storico/:id" element={<SessioneDettaglio />} />
          <Route path="/schede" element={<Schede />} />
          <Route path="/schede/:id" element={<SchedaDettaglio />} />
          <Route path="/profilo" element={<Profilo />} />
        </Routes>
        <NavBar />
      </div>
    </BrowserRouter>
  )
}
