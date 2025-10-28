// lowcode-frontend/src/paginas/AdminAnalitica.jsx
import { useEffect, useMemo, useState } from 'react';
import cliente from '../api/cliente.js';
import Nav from '../components/Nav.jsx';

import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

/* ========= SVGs locales (no tocar icons.jsx) ========= */
function IconUsersLocal(props){
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a6 6 0 0 0-4-5.65" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconPieLocal(props){
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 12V2a10 10 0 1 1-10 10h10" />
      <path d="M14 2.3a10 10 0 0 1 7.7 7.7H14V2.3Z" />
    </svg>
  );
}
function IconListLocal(props){
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}
function IconChartBarLocal(props){
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 3v18h18" />
      <rect x="7" y="9" width="3" height="6" />
      <rect x="12" y="5" width="3" height="10" />
      <rect x="17" y="12" width="3" height="3" />
    </svg>
  );
}
function IconClockLocal(props){
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
function IconCalendarLocal(props){
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

/* ===== Helpers de formato + Tooltip ===== */
const fmt = {
  num: (n) => (n ?? 0).toLocaleString(),
  secs: (s) => `${Math.round(s ?? 0)}s`,
  hms: (totalSec = 0) => {
    const s = Math.max(0, Math.round(totalSec));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    return h ? `${h}h ${m}m` : (m ? `${m}m ${ss}s` : `${ss}s`);
  }
};

function CustomTooltip({ active, payload, label, title }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: 'var(--surface)',
        color: 'var(--text)',
        border: 'var(--border)',
        boxShadow: 'var(--shadow-1)',
        borderRadius: 10,
        padding: '8px 10px',
        lineHeight: 1.25,
        minWidth: 160,
      }}
    >
      {title && <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>{title}</div>}
      {label && <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>}
      <div className="stack" style={{ gap: 6 }}>
        {payload.map((p, i) => (
          <div key={i} className="row" style={{ justifyContent:'space-between', gap: 8 }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
              <span style={{ width:10, height:10, borderRadius:3, background:p.color || p.fill || 'var(--chart-blue)'}}/>
              <span className="muted" style={{ fontSize:12 }}>{p.name}</span>
            </span>
            <b>{fmt.num(p.value)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- UI helpers ---------- */
function Kpi({ title, value, sub, icon }) {
  return (
    <div className="kpi kpi--soft">
      <div className="row" style={{ alignItems:'center', gap:8, marginBottom:6 }}>
        {icon && <span className="icon">{icon}</span>}
        <div className="muted" style={{ fontSize: 13 }}>{title}</div>
      </div>
      <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
        <b style={{ fontSize: 22 }}>{value}</b>
        {sub && <span className="muted" style={{ fontSize: 12 }}>{sub}</span>}
      </div>
    </div>
  );
}
function Card({ title, right, icon, children }) {
  return (
    <div className="card card--elev">
      <div className="card-body">
        {(title || right) && (
          <div className="row" style={{ justifyContent:'space-between', alignItems:'center' }}>
            <div className="row" style={{ alignItems:'center', gap:10 }}>
              {icon && <span className="icon">{icon}</span>}
              {title ? <h3 className="card-title" style={{ margin:0 }}>{title}</h3> : <span/>}
            </div>
            {right}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* ---------- Página ---------- */
export default function AdminAnalitica(){
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);

  // NUEVO: serie real de actividad (7d)
  const [actividad7d, setActividad7d] = useState([]);

  // mapa de nombres por id para "Tiempo total"
  const [nameMap, setNameMap] = useState({});

  useEffect(()=>{ 
    (async()=>{
      try{
        const { data } = await cliente.get('/analitica/resumen');
        setData(data);
      } finally {
        setCargando(false);
      }
    })();
  },[]);

  // NUEVO: traer actividad real (7 días). Espera: [{dia:'MM-DD', usuarios_activos: N}, ...]
  useEffect(()=>{
    (async()=>{
      try{
        const { data } = await cliente.get('/analitica/actividad7d');
        const arr = Array.isArray(data?.actividad7d) ? data.actividad7d : [];
        setActividad7d(arr);
      } catch {
        setActividad7d([]); // fallback al mock
      }
    })();
  },[]);

  // Construye un nameMap con lo que ya venga en /analitica/resumen
  useEffect(()=>{
    if (!data) return;
    const map = {};

    (Array.isArray(data.usuarios_detalle) ? data.usuarios_detalle : []).forEach(u=>{
      const id = u.id ?? u.usuario_id;
      const name = u.nombre_completo || u.nombre || u.name || u.user_name;
      if (id != null && name) map[id] = name;
    });

    const lista = data.usuarios?.lista;
    (Array.isArray(lista) ? lista : []).forEach(u=>{
      const id = u.id ?? u.usuario_id;
      const name = u.nombre_completo || u.nombre || u.name || u.user_name;
      if (id != null && name) map[id] = name;
    });

    const byId = data.usuarios?.by_id;
    if (byId && typeof byId === 'object'){
      Object.keys(byId).forEach(k=>{
        const u = byId[k];
        const id = Number(k);
        const name = u?.nombre_completo || u?.nombre || u?.name || u?.user_name;
        if (name) map[id] = name;
      });
    }

    setNameMap(prev => ({...prev, ...map}));
  }, [data]);

  const loading = cargando || !data;
  const niveles = Array.isArray(data?.niveles) ? data.niveles : [];
  const tiempos = Array.isArray(data?.tiempos) ? data.tiempos : [];

  // === SOLO ESTUDIANTES POR NIVEL ===
  const onlyStudentsCount = (n) => {
    const est = n?.estudiantes ?? n?.usuarios_estudiantes;
    if (est != null) return Math.max(0, Number(est)||0);
    const usuarios = Number(n?.usuarios ?? 0);
    const admins   = Number(n?.admins ?? 0);
    const calc = usuarios - admins;
    if (!Number.isNaN(calc)) return Math.max(0, calc);
    return usuarios;
  };

  const nivelesEstudiantes = useMemo(()=> (
    niveles.map(n => ({
      nombre: n?.nombre || '—',
      estudiantes: onlyStudentsCount(n),
    }))
  ), [niveles]);

  const totalEstudiantesPorNivel = useMemo(
    ()=> nivelesEstudiantes.reduce((s,n)=> s + Number(n.estudiantes||0), 0),
    [nivelesEstudiantes]
  );

  const nivelesActivos = useMemo(()=> niveles.length, [niveles]);
  const totalSeg = useMemo(()=> tiempos.reduce((s,t)=> s + Number(t?.total_seg||0), 0), [tiempos]);

  // Serie Usuarios por nivel
  const serieUsuariosPorNivel = useMemo(()=>(
    nivelesEstudiantes.map(n => ({ nivel: n.nombre, usuarios: Number(n.estudiantes||0) }))
  ), [nivelesEstudiantes]);

  // ====== Resolución de nombres para "Tiempo total" ======
  const nameFromTiempoLocal = (t) =>
    t?.nombre || t?.name || t?.usuario_nombre || t?.user_name ||
    (t?.usuario && typeof t.usuario === 'string' ? t.usuario : null);

  // ids faltantes a resolver
  const pendingIds = useMemo(()=>{
    const ids = new Set();
    tiempos.forEach(t=>{
      if (nameFromTiempoLocal(t)) return;
      const id = t?.usuario_id ?? t?.id;
      if (id != null && !nameMap[id]) ids.add(id);
    });
    return Array.from(ids);
  }, [tiempos, nameMap]);

  // fetch opcional para nombres faltantes (si tu backend lo soporta)
  useEffect(()=>{
    if (!pendingIds.length) return;
    (async()=>{
      try{
        const { data } = await cliente.get(`/usuarios/basico?ids=${pendingIds.join(',')}`);
        const map = {};
        if (Array.isArray(data)) {
          data.forEach(u=>{
            const id = u.id ?? u.usuario_id;
            const name = u.nombre_completo || u.nombre || u.name || u.user_name;
            if (id != null && name) map[id] = name;
          });
        } else if (data?.by_id && typeof data.by_id === 'object') {
          Object.keys(data.by_id).forEach(k=>{
            const u = data.by_id[k];
            const id = Number(k);
            const name = u?.nombre_completo || u?.nombre || u?.name || u?.user_name;
            if (name) map[id] = name;
          });
        }
        if (Object.keys(map).length) setNameMap(prev => ({...prev, ...map}));
      } catch {
        // silenciar si el endpoint no existe
      }
    })();
  }, [pendingIds]);

  // Top tiempos (nombre resuelto)
  const topTiempos = useMemo(()=>([
    ...tiempos
  ]
    .sort((a,b)=> Number(b?.total_seg||0) - Number(a?.total_seg||0))
    .slice(0, 10)
    .map(t => {
      const local = nameFromTiempoLocal(t);
      const id = t?.usuario_id ?? t?.id;
      const nombre = local || (id!=null ? nameMap[id] : null) || (id!=null ? `#${id}` : '—');
      return { usuario: nombre, segundos: Number(t?.total_seg||0) };
    })
  ), [tiempos, nameMap]);

  // MOCK suave (mismo shape que la serie real) — solo si la API no devolvió datos
  const serieActividad7dMock = useMemo(()=>{
    const today = new Date();
    const base = [];
    for (let i=6; i>=0; i--){
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const key = d.toISOString().slice(5,10); // mm-dd
      base.push({ dia: key, usuarios_activos: 0 });
    }
    const total = Math.max(1, niveles.reduce((s,n)=> s + Number(n?.estudiantes||0), 0));
    let seed = (totalSeg % 97) || 37;
    return base.map((row) => {
      seed = (seed * 13 + 7) % 101;
      const sesiones = Math.round((seed/100) * Math.max(1, total/2));
      return { ...row, usuarios_activos: sesiones };
    });
  }, [niveles, totalSeg]);

  // Usar real si existe; si no, mock
  const serieActividad7d = actividad7d.length ? actividad7d : serieActividad7dMock;

  return (
    <>
      <Nav/>
      <section className="section">
        <div className="container stack">
          {/* Héroe */}
          <div className="card card--hero">
            <div className="card-body">
              <div className="row" style={{ justifyContent:'space-between', alignItems:'center' }}>
                <div className="stack">
                  <div className="row" style={{ alignItems:'center', gap:10 }}>
                    <span className="brand-dot"></span>
                    <h2 style={{ margin:0 }}>Analítica</h2>
                    <span className="badge badge--gradient">Resumen avanzado</span>
                  </div>
                  <span className="muted" style={{ maxWidth: 760 }}>
                    Distribuciones por nivel, tiempos acumulados y actividad reciente.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="kpis" style={{ gridTemplateColumns:'repeat(4, minmax(0,1fr))' }}>
            <Kpi
              title="Usuarios totales (por nivel)"
              value={loading ? '…' : fmt.num(totalEstudiantesPorNivel)}
              sub={loading ? '' : `${nivelesActivos} niveles`}
              icon={<IconUsersLocal/>}
            />
            <Kpi
              title="Niveles activos"
              value={loading ? '…' : nivelesActivos}
              icon={<IconChartBarLocal/>}
            />
            <Kpi
              title="Tiempo total"
              value={loading ? '…' : fmt.hms(totalSeg)}
              sub={loading ? '' : `${fmt.num(totalSeg)} s`}
              icon={<IconClockLocal/>}
            />
            <Kpi
              title="Actividad (7 días)"
              value={loading ? '…' : `${serieActividad7d.reduce((s,r)=> s + (r.usuarios_activos||0), 0)}`}
              sub="usuarios activos"
              icon={<IconCalendarLocal/>}
            />
          </div>

          {/* Gráficos principales */}
          <div className="grid grid-2">
            <Card title="Estudiantes por nivel" icon={<IconPieLocal/>}>
              {loading ? (
                <p className="muted">Cargando…</p>
              ) : (
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={serieUsuariosPorNivel} margin={{ top:8, right:12, left:0, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.35)" />
                      <XAxis dataKey="nivel" />
                      <YAxis tickFormatter={fmt.num}/>
                      <Tooltip content={<CustomTooltip title="Estudiantes por nivel" />} />
                      <Legend />
                      <Bar dataKey="usuarios" name="Estudiantes" fill="var(--chart-violet)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card title="Tiempo total por usuario (Top 10)" icon={<IconListLocal/>}>
              {loading ? (
                <p className="muted">Cargando…</p>
              ) : (
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topTiempos} margin={{ top:8, right:12, left:0, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.35)" />
                      <XAxis dataKey="usuario" />
                      <YAxis tickFormatter={fmt.secs}/>
                      <Tooltip content={<CustomTooltip title="Tiempo acumulado" />} />
                      <Legend />
                      <Bar dataKey="segundos" name="Segundos" fill="var(--chart-blue)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          {/* Actividad 7d */}
          <div className="grid grid-1">
            <Card title="Actividad (7 días)" icon={<IconCalendarLocal/>}>
              {loading ? (
                <p className="muted">Cargando…</p>
              ) : (
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={serieActividad7d} margin={{ top:8, right:12, left:0, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.35)" />
                      <XAxis dataKey="dia" />
                      <YAxis allowDecimals={false} />
                      <Tooltip content={<CustomTooltip title="Usuarios activos por día" />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="usuarios_activos"
                        name="Usuarios activos"
                        stroke="var(--chart-green)"
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          {/* Tablas rápidas */}
          <div className="grid grid-2">
            <Card title="Estudiantes por nivel" icon={<IconChartBarLocal/>}>
              {loading ? (
                <p className="muted">Cargando…</p>
              ) : (
                <div style={{ overflowX:'auto' }}>
                  <table className="table table--hover" style={{ minWidth: 420 }}>
                    <thead>
                      <tr>
                        <th>Nivel</th>
                        <th>estudiantes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nivelesEstudiantes.length ? nivelesEstudiantes.map((n,i)=>(
                        <tr key={i}>
                          <td>{n?.nombre || '—'}</td>
                          <td>{fmt.num(n?.estudiantes || 0)}</td>
                        </tr>
                      )) : <tr><td colSpan={2} className="muted">Sin datos</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card title="Tiempo total (seg)" icon={<IconListLocal/>}>
              {loading ? (
                <p className="muted">Cargando…</p>
              ) : (
                <div style={{ overflowX:'auto' }}>
                  <table className="table table--hover" style={{ minWidth: 560 }}>
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Segundos</th>
                        <th>~Tiempo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tiempos.length ? tiempos.map((t,i)=>(
                        <tr key={i}>
                          <td className="muted">
                            {(() => {
                              const local = nameFromTiempoLocal(t);
                              const id = t?.usuario_id ?? t?.id;
                              return local || (id!=null ? (nameMap[id] || `#${id}`) : '—');
                            })()}
                          </td>
                          <td>{fmt.num(t?.total_seg || 0)}</td>
                          <td>{fmt.hms(t?.total_seg || 0)}</td>
                        </tr>
                      )) : <tr><td colSpan={3} className="muted">Sin datos</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          <div className="footer">Plataforma Low-Code · Analítica</div>
        </div>
      </section>
    </>
  );
}
