import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchEmittersLastSeen } from './api'
import logo from './paraVectorizar.png'
import LoginPage from './LoginPage'

const POLL_INTERVAL_MS = Number(import.meta.env.VITE_POLL_INTERVAL_MS || 30000)

// Cambiá colores acá si querés rojo/verde
const ACTIVE_COLOR_CLASS = 'badge ok'   // activo (verde)
const INACTIVE_COLOR_CLASS = 'badge off' // inactivo (rojo)

function fmt(ts) {
  if (!ts) return 'N/A'
  try { return new Date(ts).toLocaleString() } catch { return ts }
}

function Dashboard({ user, onLogout }) {
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [modalData, setModalData] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [theme, setTheme] = useState('dark')
  const timerRef = useRef(null)

  async function load(){
    try {
      const data = await fetchEmittersLastSeen()
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    }
  }

  function showModal(item, e) {
    if (!item.fechaAlta) return
    const rect = e.currentTarget.getBoundingClientRect()
    setModalData({
      fecha: item.fechaAlta,
      top: rect.top + rect.height / 2,
      left: rect.left + rect.width / 2,
    })
  }

  function closeModal() {
    setModalData(null)
  }

  function toggleTheme() {
    setTheme(t => t === 'light' ? 'dark' : 'light')
  }

  useEffect(() => {
    load()
    timerRef.current = setInterval(load, POLL_INTERVAL_MS)
    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    document.body.className = theme
  }, [theme])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const start = startDate ? new Date(startDate) : null
    if (start) start.setHours(0,0,0,0)
    const end = endDate ? new Date(endDate) : null
    if (end) end.setHours(23,59,59,999)

    return items
      .map(it => ({...it, isActive: it.fechaAlta !== null }))
      .filter(it => {
        if (statusFilter === 'active' && !it.isActive) return false
        if (statusFilter === 'inactive' && it.isActive) return false
        return true
      })
      .filter(it => {
        if (!start && !end) return true
        if (!it.fechaAlta) return false
        const itemDate = new Date(it.fechaAlta)
        if (start && itemDate < start) return false
        if (end && itemDate > end) return false
        return true
      })
      .filter(it => !needle || String(it.idEmisor).toLowerCase().includes(needle) || (it.name && it.name.toLowerCase().includes(needle)))
      .sort((a,b) => {
        if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
        return String(a.idEmisor).localeCompare(String(b.idEmisor))
      })
  }, [items, q, statusFilter, startDate, endDate])

  return (
    <div className="container">
      <div className="header">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
          <h1>CLIENTES FEBROS</h1>
        </div>
        <div className="user-info">
          <span>Vendedor: <strong>{user}</strong></span>
          <button onClick={onLogout} className="logout-button">Salir</button>
        </div>
        <div className="filters">
          <input className="search" placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <div className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '☀️' : '🌙'}
          </div>
        </div>
      </div>
      <div className="grid">
        {filtered.map(it => (
          <div key={it.idEmisor} className={`card ${!it.isActive ? 'inactive' : ''}`} onClick={(e) => showModal(it, e)}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <strong>{it.name ? `${it.name} (${it.idEmisor})` : it.idEmisor}</strong>
              <span className={it.isActive ? ACTIVE_COLOR_CLASS : INACTIVE_COLOR_CLASS}>
                {it.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card"><div className="time">Sin datos aún…</div></div>
        )}
      </div>
      <div className="footer">Refresco: {Math.round(POLL_INTERVAL_MS/1000)}s</div>

      {modalData && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" style={{ top: modalData.top, left: modalData.left }} onClick={e => e.stopPropagation()}>
            <strong>Fecha de pago:</strong>
            <div>{fmt(modalData.fecha)}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(localStorage.getItem('user'))

  function handleLoginSuccess(username) {
    localStorage.setItem('user', username)
    setUser(username)
  }

  function handleLogout() {
    localStorage.removeItem('user')
    setUser(null)
  }

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return <Dashboard user={user} onLogout={handleLogout} />
}