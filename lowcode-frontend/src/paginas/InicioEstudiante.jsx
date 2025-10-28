// lowcode-frontend/src/paginas/InicioEstudiante.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAut } from '../contexto/Aut.jsx';
import cliente from '../api/cliente.js';
import Nav from '../components/Nav.jsx';

/* ---------- UI helpers ---------- */
function ProgressBar({ value = 0, height = 10, label }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label || 'Progreso'}
      style={{
        width: '100%',
        background: 'var(--surface-2)',
        border: 'var(--border)',
        borderRadius: 999,
        overflow: 'hidden',
        height
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, var(--brand), #8b5cf6)',
          height: '100%',
          transition: 'width .25s ease'
        }}
      />
    </div>
  );
}

function Kpi({ title, value, sub }) {
  return (
    <div className="kpi">
      <div className="muted" style={{ fontSize: 13 }}>{title}</div>
      <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
        <b style={{ fontSize: 22 }}>{value}</b>
        {sub && <span className="muted" style={{ fontSize: 12 }}>{sub}</span>}
      </div>
    </div>
  );
}

function Card({ title, right, children }) {
  return (
    <div className="card">
      <div className="card-body">
        {(title || right) && (
          <div className="row" style={{ justifyContent:'space-between', alignItems:'center' }}>
            {title ? <h3 className="card-title" style={{ margin:0 }}>{title}</h3> : <span/>}
            {right}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* ---------- Página ---------- */
export default function InicioEstudiante(){
  const nav = useNavigate();
  const { usuario, salir } = useAut();

  const [sesiones, setSesiones] = useState(0);
  const [niveles, setNiveles] = useState([]);
  const [progreso, setProgreso] = useState({ porcentaje: 0, completados: 0, total_ejercicios: 0 });

  // Para “Continuar”
  const [ejerciciosNivel, setEjerciciosNivel] = useState([]);
  const [completadosIds, setCompletadosIds] = useState([]);

  const [cargando, setCargando] = useState(true);

  const fallbackNiveles = useMemo(() => ([
    { id: 1, nombre: 'Principiante', posicion: 1, requisitos_min_ejercicios: 5 },
    { id: 2, nombre: 'Intermedio',   posicion: 2, requisitos_min_ejercicios: 5 },
    { id: 3, nombre: 'Avanzado',     posicion: 3, requisitos_min_ejercicios: 5 },
  ]), []);

  const nivelActualId = Number(usuario?.nivel_actual_id || 1);

  const nivelActual = useMemo(() => {
    const fromApi = niveles.find(n => Number(n.id) === nivelActualId);
    const fromFallback = fallbackNiveles.find(n => n.id === nivelActualId);
    return fromApi || fromFallback || { id: nivelActualId, nombre:`Nivel ${nivelActualId}`, posicion: nivelActualId, requisitos_min_ejercicios: 5 };
  }, [niveles, fallbackNiveles, nivelActualId]);

  const nombreNivel = nivelActual?.nombre || `Nivel ${nivelActualId}`;
  const reqMin = Number(nivelActual?.requisitos_min_ejercicios ?? 5);

  const siguienteNivel = useMemo(() => {
    const arr = (niveles.length ? niveles : fallbackNiveles).slice().sort((a,b)=>a.posicion-b.posicion);
    const idx = arr.findIndex(n => Number(n.id) === nivelActualId);
    return idx >= 0 ? arr[idx+1] : null;
  }, [niveles, fallbackNiveles, nivelActualId]);

  const total = Number(progreso.total_ejercicios || 0);
  const comp  = Number(progreso.completados || 0);
  const pct   = Number(progreso.porcentaje || (total>0 ? Math.round((comp/total)*100) : 0));
  const pendientes = Math.max(0, total - comp);
  const faltaParaDesbloqueo = Math.max(0, reqMin - comp);

  const sugerido = useMemo(() => {
    if (!Array.isArray(ejerciciosNivel) || !ejerciciosNivel.length) return null;
    const setComp = new Set((completadosIds || []).map(Number));
    return ejerciciosNivel.find(e => !setComp.has(Number(e.id))) || null;
  }, [ejerciciosNivel, completadosIds]);

  // “Recomendados” simples: los 3 primeros pendientes
  const recomendados = useMemo(() => {
    if (!Array.isArray(ejerciciosNivel)) return [];
    const setComp = new Set((completadosIds || []).map(Number));
    return ejerciciosNivel.filter(e => !setComp.has(Number(e.id))).slice(0,3);
  }, [ejerciciosNivel, completadosIds]);

  useEffect(()=> {
    (async ()=>{
      try {
        // Sesiones
        try {
          const { data: ses } = await cliente.get('/autenticacion/sesiones/contador');
          setSesiones(Number(ses?.sesiones || 0));
        } catch { setSesiones(0); }

        // Niveles
        try {
          const { data: nivelesApi } = await cliente.get('/niveles');
          setNiveles(Array.isArray(nivelesApi) ? nivelesApi : []);
        } catch { setNiveles([]); }

        // Progreso
        try {
          const { data: est } = await cliente.get(`/progreso/estadisticas?nivelId=${nivelActualId}`);
          setProgreso({
            porcentaje: Number(est?.porcentaje || 0),
            completados: Number(est?.completados || 0),
            total_ejercicios: Number(est?.total_ejercicios || 0),
          });
        } catch { setProgreso({ porcentaje: 0, completados: 0, total_ejercicios: 0 }); }

        // Listado del nivel + completados
        try {
          const { data: ej } = await cliente.get(`/ejercicios?nivelId=${nivelActualId}`);
          setEjerciciosNivel(Array.isArray(ej) ? ej : []);
        } catch { setEjerciciosNivel([]); }

        try {
          const { data: doneIds } = await cliente.get(`/progreso/completados?nivelId=${nivelActualId}`);
          setCompletadosIds(Array.isArray(doneIds) ? doneIds : []);
        } catch { setCompletadosIds([]); }

      } finally {
        setCargando(false);
      }
    })();
  }, [nivelActualId]);

  return (
    <>
      <Nav/>
      <section className="section">
        <div className="container stack">

          {/* Encabezado con “tarjeta héroe” */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,.10), rgba(139,92,246,.10))' }}>
            <div className="card-body">
              <div className="row" style={{ justifyContent:'space-between', alignItems:'center' }}>
                <div className="stack">
                  <div className="row" style={{ alignItems:'center', gap:10 }}>
                    <span className="brand-dot"></span>
                    <h2 style={{ margin:0 }}>Hola, {usuario?.nombre_completo}</h2>
                    <span className="chip">Nivel: <b>{cargando ? '…' : nombreNivel}</b></span>
                  </div>
                  <span className="muted" style={{ maxWidth: 720 }}>
                    Retoma tus ejercicios, revisa tu progreso y desbloquea el siguiente nivel.
                  </span>
                </div>

                <div className="row" style={{ gap:8 }}>
                  <button className="btn btn-outline" onClick={salir}>Cerrar sesión</button>
                </div>
              </div>

              <div className="row" style={{ gap:16, marginTop:14 }}>
                <div style={{ flex:1, minWidth: 220 }}>
                  <div className="muted" style={{ fontSize:13, marginBottom:6 }}>Progreso del nivel</div>
                  <ProgressBar value={pct} height={12} label="Progreso del nivel" />
                  <div className="row" style={{ justifyContent:'space-between', marginTop:6 }}>
                    <span className="muted">Completados: <b>{cargando ? '…' : comp}</b> / {cargando ? '…' : total}</span>
                    <span className="muted">{cargando ? '…' : `${pct}%`}</span>
                  </div>
                </div>

                <div className="chips" style={{ alignItems:'stretch' }}>
                  <span className="chip">Sesiones: <b>{cargando ? '…' : sesiones}</b></span>
                  <span className="chip">Pendientes: <b>{cargando ? '…' : pendientes}</b></span>
                  <span className="chip">
                    {cargando ? 'Desbloqueo…' :
                      (faltaParaDesbloqueo === 0
                        ? (siguienteNivel ? `Puedes desbloquear: ${siguienteNivel.nombre}` : 'Último nivel alcanzado')
                        : `Faltan ${faltaParaDesbloqueo}`)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* KPIs compactos */}
          <div className="kpis" style={{ gridTemplateColumns:'repeat(4, minmax(0,1fr))' }}>
            <Kpi title="Nivel actual" value={cargando ? '…' : nombreNivel}/>
            <Kpi title="Progreso" value={cargando ? '…' : `${pct}%`} sub={`${comp}/${total}`}/>
            <Kpi title="Sesiones" value={cargando ? '…' : sesiones} sub="En total"/>
            <Kpi title="Pendientes" value={cargando ? '…' : pendientes} sub="Por completar"/>
          </div>

          {/* Continuar + Recomendados */}
          <div className="grid grid-2">
            <Card
              title="Continuar donde lo dejaste"
              right={!cargando && sugerido && (
                <button className="btn btn-primary" onClick={()=> nav(`/jugar?id=${sugerido.id}`)}>Reanudar</button>
              )}
            >
              {cargando ? (
                <p className="muted">Cargando…</p>
              ) : sugerido ? (
                <div className="row" style={{ justifyContent:'space-between', alignItems:'center', marginTop:6 }}>
                  {/* 🔧 Título y descripción con separación clara */}
                  <div className="stack" style={{ gap:6 }}>
                    <div style={{ fontWeight:700, fontSize:16 }}>{sugerido.titulo}</div>
                    <p className="muted" style={{ maxWidth:620, margin:0 }}>{sugerido.descripcion}</p>
                  </div>
                </div>
              ) : (
                <div className="row" style={{ justifyContent:'space-between', alignItems:'center' }}>
                  <span className="muted">¡No tienes pendientes en este nivel! Explora el listado completo.</span>
                  <Link className="btn" to="/ejercicios">Ver ejercicios</Link>
                </div>
              )}
            </Card>

            <Card title="Atajos">
              <div className="chips" style={{ marginTop:6 }}>
                <Link className="btn" to="/ejercicios">Ejercicios</Link>
                <Link className="btn" to="/encuestas">Encuestas</Link>
                <Link className="btn" to="/preferencias">Accesibilidad</Link>
              </div>
              <p className="muted" style={{ marginTop:10, fontSize:13 }}>
                Consejo: cada ejercicio aprobado puedes <b>contarlo</b> para tu progreso y desbloquear niveles.
              </p>
            </Card>
          </div>

          {/* Recomendados (3) */}
          <Card
            title={`Recomendados para ${nombreNivel}`}
            right={<Link className="btn" to="/ejercicios">Abrir listado</Link>}
          >
            {cargando ? (
              <p className="muted">Cargando…</p>
            ) : recomendados.length ? (
              <div className="grid grid-3" style={{ marginTop:8 }}>
                {recomendados.map(e => {
                  return (
                    <div key={e.id} className="card">
                      <div className="card-body">
                        <div className="row" style={{ justifyContent:'space-between', alignItems:'center' }}>
                          <div style={{ fontWeight:700, maxWidth:240, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {e.titulo}
                          </div>
                          <span className="badge">Pendiente</span>
                        </div>
                        {/* 🔧 separación título/descripción */}
                        <p className="muted" style={{ marginTop:6, minHeight:36 }}>{e.descripcion}</p>
                        <div className="row" style={{ justifyContent:'flex-end', gap:8 }}>
                          <button className="btn" onClick={()=> nav(`/jugar?id=${e.id}`)}>Resolver</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="muted">No hay recomendaciones por ahora. ¡Buen trabajo!</p>
            )}
          </Card>

          {/* Vista del nivel completa (primeras 6) */}
          <Card
            title={`Ejercicios del nivel ${nombreNivel}`}
            right={<Link className="btn" to="/ejercicios">Abrir listado</Link>}
          >
            {cargando ? (
              <p className="muted">Cargando…</p>
            ) : (ejerciciosNivel.slice(0,6)).length ? (
              <div className="grid grid-3" style={{ marginTop:8 }}>
                {(ejerciciosNivel.slice(0,6)).map(e => {
                  const done = completadosIds.includes(Number(e.id));
                  return (
                    <div key={e.id} className="card">
                      <div className="card-body">
                        <div className="row" style={{ justifyContent:'space-between', alignItems:'center' }}>
                          <div style={{ fontWeight:700, maxWidth:240, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {e.titulo}
                          </div>
                          <span className={`badge ${done ? 'badge-success' : ''}`}>{done ? 'Completado' : 'Pendiente'}</span>
                        </div>
                        {/* 🔧 separación título/descripción */}
                        <p className="muted" style={{ marginTop:6, minHeight:36 }}>{e.descripcion}</p>
                        <div className="row" style={{ justifyContent:'flex-end' }}>
                          <button
                            className="btn btn-primary"
                            onClick={()=> nav(`/jugar?id=${e.id}`)}
                          >
                            {done ? 'Rehacer' : 'Resolver'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="muted">No hay ejercicios disponibles en este nivel.</p>
            )}
          </Card>

          <div className="footer">Plataforma Low-Code · v1.0</div>
        </div>
      </section>
    </>
  );
}
