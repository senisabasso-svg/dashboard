import { useState } from 'react'
import logo from './paraVectorizar.png'
import { fetchUsers } from './api'
import SHA256 from 'crypto-js/sha256'

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()

    // Traés los usuarios del backend
    const users = await fetchUsers()
    const user = users.find(u => u.nombre === username)

    // Hasheás la contraseña ingresada por el usuario
    const hashedPassword = SHA256(password).toString()

    // Comparás hash vs hash
    if (user && user.sha256 === hashedPassword) {
      setError('')
      onLoginSuccess(username)
    } else {
      setError('Usuario o contraseña incorrectos')
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <img src={logo} alt="Logo" className="logo" />
        <h2>Acceso Administradores FEBROS</h2>
        <div className="input-group">
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit">Ingresar</button>
      </form>
    </div>
  )
}
