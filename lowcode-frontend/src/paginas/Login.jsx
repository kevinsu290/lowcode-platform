// lowcode-frontend/src/paginas/Login.jsx
import { useState } from 'react';
import { useAut } from '../contexto/Aut.jsx';
import { useNavigate, Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import cliente from '../api/cliente.js';

export default function Login(){
  const { login } = useAut();
  const nav = useNavigate();

  // Estados de UI
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [err, setErr] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e){
    e.preventDefault();
    if (loading) return;
    setErr('');
    setLoading(true);

    try {
      // 1) Autenticar
      await login(correo, contrasena);

      // 2) Consultar estado del diagnóstico y redirigir en consecuencia
      try {
        const { data: est } = await cliente.get('/diagnostico/estado');
        if (est?.pendiente) {
          nav('/diagnostico', { replace:true });
        } else {
          nav('/', { replace:true });
        }
      } catch {
        // Si falla la consulta del diagnóstico, enviamos al inicio como fallback
        nav('/', { replace:true });
      }
    } catch {
      setErr('Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Si prefieres login sin navbar, elimina <Nav/> */}
      <Nav/>

      <section className="section" style={{paddingTop:0}}>
        <div className="auth">
          {/* Panel visual (oculto en móvil por CSS) */}
          <div className="auth-hero">
            <div className="hero-card">
              <div className="auth-brand">
                <span className="dot"/> <b>Low-Code</b><span className="badge">Beta</span>
              </div>
              <h2 className="auth-title">¡Bienvenido de vuelta!</h2>
              <p className="auth-subtitle">
                Construye y aprende con bloques. Inicia sesión para continuar con tus ejercicios.
              </p>
              <div className="hero-kpi">{/* espacio para métricas si las necesitas */}</div>
            </div>
          </div>

          {/* Panel formulario */}
          <div className="auth-form">
            <form className="auth-card" onSubmit={onSubmit}>
              <div className="auth-brand">
                <span className="dot"/><b>¡Bienvenido de vuelta!</b>
              </div>

              {err && (
                <div
                  className="badge"
                  style={{
                    borderColor:'var(--danger)',
                    color:'#fff',
                    background:'rgba(255,107,107,.12)',
                    marginBottom:8
                  }}
                >
                  {err}
                </div>
              )}

              <div className="field">
                <label>Correo electrónico</label>
                <input
                  className="input input-lg"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={correo}
                  onChange={(e)=>setCorreo(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <div className="field">
                <label>Contraseña</label>
                <div className="input-with-btn">
                  <input
                    className="input input-lg"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={contrasena}
                    onChange={(e)=>setContrasena(e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={()=>setShowPass(s => !s)}
                    aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    disabled={loading}
                  >
                    {showPass ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>

              <div className="auth-actions">
                {/* espacio para "Recordarme" o "Olvidé mi contraseña" si lo necesitas */}
              </div>

              <button
                className="btn btn-primary btn-pill"
                type="submit"
                disabled={loading}
                style={{width:'100%', marginTop:14}}
              >
                {loading ? 'Ingresando…' : 'Iniciar sesión'}
              </button>

              <div className="divider"></div>

              <div className="auth-footer">
                <span>¿No tienes cuenta?</span>
                <Link className="link" to="/registro">Crear cuenta</Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
