// lowcode-frontend/src/paginas/Registro.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import { useAut } from '../contexto/Aut.jsx';

export default function Registro(){
  const nav = useNavigate();
  const { registro } = useAut(); // ← tu método actual

  const [nombre, setNombre]   = useState('');
  const [correo, setCorreo]   = useState('');
  const [pass, setPass]       = useState('');
  const [pass2, setPass2]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [acepta, setAcepta]   = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState('');

  async function onSubmit(e){
    e.preventDefault();
    if (loading) return;

    // Validaciones UX
    if (!nombre.trim())  return setErr('Por favor ingresa tu nombre.');
    if (!correo.trim())  return setErr('Por favor ingresa tu correo.');
    if (pass.length < 6) return setErr('La contraseña debe tener al menos 6 caracteres.');
    if (pass !== pass2)  return setErr('Las contraseñas no coinciden.');
    setErr('');
    setLoading(true);
    try{
      // Usa tu firma: registro(nombre, correo, contrasena)
      await registro(nombre, correo, pass);
      nav('/login', { replace:true }); // o nav('/', {replace:true}) si prefieres entrar directo
    }catch(e){
      setErr(e?.response?.data?.error || e?.response?.data?.detalle || 'No se pudo crear la cuenta.');
    }finally{
      setLoading(false);
    }
  }

  return (
    <>
      <Nav/>

      <section className="section" style={{paddingTop:0}}>
        <div className="auth">
          {/* Panel visual */}
          <div className="auth-hero">
            <div className="hero-card">
              <div className="auth-brand">
                <span className="dot"/> <b>Low-Code</b><span className="badge">Beta</span>
              </div>
              <h2 className="auth-title">Crea tu cuenta</h2>
              <p className="auth-subtitle">
                Únete y empieza a resolver ejercicios con bloques, paso a paso.
              </p>

              <div className="hero-kpi">
              </div>
            </div>
          </div>

          {/* Panel formulario */}
          <div className="auth-form">
            <form className="auth-card" onSubmit={onSubmit}>
              <div className="auth-brand">
                <span className="dot"/><b>Crear cuenta</b>
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
                <label>Nombre completo</label>
                <input
                  className="input input-lg"
                  type="text"
                  placeholder="Tus nombres y apellidos"
                  value={nombre}
                  onChange={(e)=>setNombre(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="field">
                <label>Correo electrónico</label>
                <input
                  className="input input-lg"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={correo}
                  onChange={(e)=>setCorreo(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="field">
                <label>Contraseña</label>
                <div className="input-with-btn">
                  <input
                    className="input input-lg"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={pass}
                    onChange={(e)=>setPass(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={()=>setShowPass(s => !s)}
                    aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPass ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>

              <div className="field">
                <label>Confirmar contraseña</label>
                <div className="input-with-btn">
                  <input
                    className="input input-lg"
                    type={showPass2 ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={pass2}
                    onChange={(e)=>setPass2(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={()=>setShowPass2(s => !s)}
                    aria-label={showPass2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPass2 ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>

              <div className="auth-actions" style={{justifyContent:'space-between'}}>
                <label style={{display:'flex', alignItems:'center', gap:8}}>
                </label>
              </div>

              <button
                className="btn btn-primary btn-pill"
                type="submit"
                disabled={loading}
                style={{width:'100%', marginTop:14}}
              >
                {loading ? 'Creando cuenta…' : 'Crear cuenta'}
              </button>

              <div className="divider"></div>

              <div className="auth-footer">
                <span>¿Ya tienes cuenta?</span>
                <Link className="link" to="/login">Iniciar sesión</Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
