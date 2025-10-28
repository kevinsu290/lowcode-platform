// lowcode-frontend/src/paginas/AdminRegistrar.jsx
import { useMemo, useState } from 'react';
import Nav from '../components/Nav.jsx';
import cliente from '../api/cliente.js';

function genPass(len = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$%*.-_';
  let out = '';
  crypto.getRandomValues(new Uint32Array(len)).forEach(n => out += chars[n % chars.length]);
  return out;
}

export default function AdminRegistrar(){
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState('');

  const valid = useMemo(()=>{
    return (
      nombre.trim().length >= 3 &&
      /\S+@\S+\.\S+/.test(correo) &&
      pass.length >= 8 &&
      pass === confirm
    );
  }, [nombre, correo, pass, confirm]);

  async function onSubmit(e){
    e.preventDefault();
    if (!valid || enviando) return;
    setErr('');
    setEnviando(true);
    try{
      const { data } = await cliente.post('/admin/crear', {
        nombre_completo: nombre.trim(),
        correo: correo.trim(),
        contrasena: pass
      });
      if (data?.ok) setOk(true);
    }catch(e){
      const msg = e?.response?.data?.error || 'No se pudo crear el administrador';
      setErr(msg);
    }finally{
      setEnviando(false);
    }
  }

  return (
    <>
      <Nav/>
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="card card--hero">
            <div className="card-body">
              <div className="row" style={{ justifyContent:'space-between', alignItems:'center' }}>
                <div className="stack">
                  <div className="row" style={{ alignItems:'center', gap:10 }}>
                    <span className="brand-dot"></span>
                    <h2 style={{ margin:0 }}>Registrar administrador</h2>
                    <span className="badge badge--gradient">Solo admins</span>
                  </div>
                  <span className="muted" style={{ maxWidth: 640 }}>
                    Crea una cuenta de administrador. Se enviará un e-mail de confirmación automáticamente.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 14 }}>
            <div className="card-body">
              {ok ? (
                <div className="stack">
                  <div className="badge" style={{ borderColor:'var(--success)', background:'rgba(76,208,135,.12)', color:'#caffdf' }}>
                    Administrador creado correctamente. Se ha enviado un correo de confirmación.
                  </div>
                  <p className="muted">
                    Puedes crear otro administrador o continuar gestionando la plataforma.
                  </p>
                  <div className="row" style={{ justifyContent:'flex-end' }}>
                    <button className="btn" onClick={()=>{
                      setOk(false);
                      setNombre(''); setCorreo(''); setPass(''); setConfirm('');
                    }}>Crear otro</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="stack" style={{ gap: 12 }}>
                  {err && (
                    <div className="badge" style={{ borderColor:'var(--danger)', background:'rgba(255,107,107,.12)', color:'#ffd6d6' }}>
                      {err}
                    </div>
                  )}

                  <div className="field">
                    <label>Nombre completo</label>
                    <input
                      className="input input-lg"
                      type="text"
                      placeholder="Ej. Ana Pérez"
                      value={nombre}
                      onChange={e=>setNombre(e.target.value)}
                      required
                      disabled={enviando}
                    />
                  </div>

                  <div className="field">
                    <label>Correo</label>
                    <input
                      className="input input-lg"
                      type="email"
                      placeholder="admin@ejemplo.com"
                      value={correo}
                      onChange={e=>setCorreo(e.target.value)}
                      required
                      disabled={enviando}
                    />
                  </div>

                  <div className="row" style={{ gap:12, flexWrap:'wrap' }}>
                    <div className="field" style={{ flex:1, minWidth: 240 }}>
                      <label>Contraseña</label>
                      <input
                        className="input input-lg"
                        type="text"
                        placeholder="Mínimo 8 caracteres"
                        value={pass}
                        onChange={e=>setPass(e.target.value)}
                        required
                        disabled={enviando}
                      />
                    </div>
                    <div className="field" style={{ width: 160, alignSelf:'flex-end' }}>
                      <button
                        className="btn"
                        type="button"
                        onClick={()=> setPass(genPass())}
                        disabled={enviando}
                        title="Generar una contraseña segura"
                      >
                        Generar segura
                      </button>
                    </div>
                  </div>

                  <div className="field">
                    <label>Confirmar contraseña</label>
                    <input
                      className="input input-lg"
                      type="password"
                      placeholder="Repite la contraseña"
                      value={confirm}
                      onChange={e=>setConfirm(e.target.value)}
                      required
                      disabled={enviando}
                    />
                  </div>

                  <div className="row" style={{ justifyContent:'flex-end', gap:8 }}>
                    <button className="btn" type="button" onClick={()=>{
                      setNombre(''); setCorreo(''); setPass(''); setConfirm(''); setErr('');
                    }} disabled={enviando}>
                      Limpiar
                    </button>
                    <button className="btn btn-primary" type="submit" disabled={!valid || enviando}>
                      {enviando ? 'Creando…' : 'Crear administrador'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <p className="muted" style={{ marginTop:8, fontSize:13 }}>
            Por seguridad, la contraseña no se envía por correo. Compártela de forma segura al nuevo administrador.
          </p>
        </div>
      </section>
    </>
  );
}
