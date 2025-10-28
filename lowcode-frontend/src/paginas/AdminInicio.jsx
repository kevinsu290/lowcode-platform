// lowcode-frontend/src/paginas/AdminInicio.jsx
import { useEffect, useMemo, useState } from 'react';
import cliente from '../api/cliente.js';
import Nav from '../components/Nav.jsx';
import { useAut } from '../contexto/Aut.jsx';

/* ===== Helpers de formato + Tooltip coherente ===== */
const fmt = {
  num: (n) => (n ?? 0).toLocaleString(),
  secs: (s) => `${Math.round(s ?? 0)}s`,
};

function CustomTooltip({ active, payload, label, title }) {
  if (!active || !payload || !payload.length) return null;
  // fila cruda del punto (para valores extra como promPorEst / compAcum)
  const row = payload?.[0]?.payload;

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
        minWidth: 180,
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

      {/* Extra contexto para gráficos de cobertura / series con datos adicionales */}
      {row && (row.promPorEst != null || row.compAcum != null) && (
        <div style={{marginTop:6, borderTop:'var(--border)', paddingTop:6}}>
          {row.promPorEst != null && (
            <div className="row" style={{justifyContent:'space-between'}}>
              <span className="muted" style={{fontSize:12}}>Prom. por estudiante</span>
              <b>{(row.promPorEst ?? 0).toFixed(2)}</b>
            </div>
          )}
          {row.compAcum != null && (
            <div className="row" style={{justifyContent:'space-between'}}>
              <span className="muted" style={{fontSize:12}}>Resueltos (acum.)</span>
              <b>{fmt.num(row.compAcum ?? 0)}</b>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Íconos SVG coherentes
import {
  IconUsers,
  IconShield,
  IconGraduationCap,
  IconChartBar,
  IconCalendar,
  IconCheckCircle,
  IconClipboardList,
  IconClock,
} from '../components/icons.jsx';

// 📊 Recharts
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

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

/* Barra horizontal compacta para distribuciones Likert */
function MiniBar({ value = 0, max = 1 }) {
  const pct = max > 0 ? Math.floor((value / max) * 100) : 0;
  return (
    <div className="minibar">
      <div style={{ width:`${pct}%` }}/>
    </div>
  );
}

/* ---------- Página ---------- */
export default function AdminInicio(){
  const { salir } = useAut();
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(()=> {
    (async ()=>{
      try {
        const { data } = await cliente.get('/admin/resumen');
        setData(data);
      } catch (e) {
        setData({ error: e?.response?.data?.error || 'Error al cargar' });
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const loading = cargando || !data;

  // Total estudiantes
  const estTotal = Number(data?.usuarios?.estudiantes ?? 1);

  // % GLOBAL normalizado (clamp a 100)
  const pctGlobal = useMemo(()=> {
    if (loading) return 0;
    const arr = data?.niveles || [];
    const totEj = arr.reduce((s,n)=> s + (n.ejercicios_total||0), 0);
    const comp  = arr.reduce((s,n)=> s + (n.ejercicios_completados||0), 0);
    const denom = Math.max(1, totEj * estTotal);
    return Math.min(100, Math.round((comp / denom) * 100));
  }, [loading, data, estTotal]);

  // Likert helpers
  const enc = data?.encuestas || {};
  const distMot = enc?.distribucion?.motivacion || {1:0,2:0,3:0,4:0,5:0};
  const distCom = enc?.distribucion?.compromiso || {1:0,2:0,3:0,4:0,5:0};
  const maxBar = Math.max(...Object.values(distMot), ...Object.values(distCom), 1);

  /* ---------- Series + normalizados ---------- */

  // Filas de nivel con % normalizado (clamp a 100)
  const nivelesNorm = useMemo(()=>{
    const arr = data?.niveles || [];
    return arr.map(n => {
      const alumnosNivel = Number(n.alumnos ?? estTotal);
      const totalEj = Number(n.ejercicios_total || 0);
      const comp    = Number(n.ejercicios_completados || 0);
      const denom   = Math.max(1, totalEj * alumnosNivel);
      const pctNorm = Math.min(100, Math.round((comp / denom) * 100));
      return { ...n, porcentaje_normalizado: pctNorm };
    });
  }, [data, estTotal]);

  // 📊 Cobertura del temario por nivel (informativa, ≤ 100%)
  const serieCoberturaNivel = useMemo(()=>{
    const niveles = data?.niveles || [];
    const alumnos = Number(data?.usuarios?.estudiantes ?? 0);

    return niveles.map(n => {
      const total = Number(n.ejercicios_total || 0);
      const compAcum = Number(n.ejercicios_completados || 0);         // acumulado por todos
      const cubiertos = Math.min(total, compAcum);                     // ejercicios “tocados”
      const restantes = Math.max(0, total - cubiertos);
      const promPorEst = alumnos > 0 ? compAcum / alumnos : 0;

      return {
        nivel: n.nombre,
        total,
        cubiertos,
        restantes,
        promPorEst,
        compAcum,
      };
    });
  }, [data]);

  // 2) Barras: tiempo promedio por nivel
  const serieTiempoNivel = useMemo(()=>{
    const niveles = data?.niveles || [];
    return niveles.map(n => ({
      nivel: n.nombre,
      tiempo: Number(n.tiempo_promedio_seg || 0),
    }));
  }, [data]);

  // 3) Stacked bars: Distribución Likert (Motivación vs Compromiso)
  const serieLikert = useMemo(()=>{
    const rowMot = { grupo: 'Motivación', '1':distMot[1], '2':distMot[2], '3':distMot[3], '4':distMot[4], '5':distMot[5] };
    const rowCom = { grupo: 'Compromiso', '1':distCom[1], '2':distCom[2], '3':distCom[3], '4':distCom[4], '5':distCom[5] };
    return [rowMot, rowCom];
  }, [distMot, distCom]);

  // 4) Línea: respuestas por día (últimos 7 días)
  const serieRespuestasDia = useMemo(()=>{
    const rec = enc?.recientes || [];
    const byDay = new Map();
    rec.forEach(r=>{
      const d = new Date(r.creado_en);
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0,10);
      byDay.set(key, (byDay.get(key)||0) + 1);
    });
    const out = [];
    const today = new Date();
    for(let i=6;i>=0;i--){
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate()-i);
      const key = d.toISOString().slice(0,10);
      out.push({ dia: key.slice(5), respuestas: byDay.get(key)||0 }); // mm-dd
    }
    return out;
  }, [enc?.recientes]);

  return (
    <>
      <Nav/>
      <section className="section">
        <div className="container stack">

          {/* Héroe Admin */}
          <div className="card card--hero">
            <div className="card-body">
              <div className="row" style={{ justifyContent:'space-between', alignItems:'center' }}>
                <div className="stack">
                  <div className="row" style={{ alignItems:'center', gap:10 }}>
                    <span className="brand-dot"></span>
                    <h2 style={{ margin:0 }}>Panel de administrador</h2>
                    <span className="badge badge--gradient">Resumen operativo</span>
                  </div>
                  <span className="muted" style={{ maxWidth: 760 }}>
                    Supervisa el avance por niveles, la actividad reciente y las percepciones de los estudiantes.
                  </span>
                </div>
                <div className="row" style={{ gap:8 }}>
                  <button className="btn btn-outline" onClick={salir}>Cerrar sesión</button>
                </div>
              </div>

              {/* Barra de % global + chips */}
              <div className="row" style={{ gap:16, marginTop:14 }}>
                <div style={{ flex:1, minWidth:260 }}>
                  <div className="muted" style={{ fontSize:13, marginBottom:6 }}>
                    % Completado (global normalizado)
                  </div>
                  <ProgressBar value={pctGlobal} height={12} label="Completado global" />
                  <div className="row" style={{ justifyContent:'space-between', marginTop:6 }}>
                    <span className="muted">{loading ? 'Cargando…' : `${pctGlobal}%`}</span>
                    <span className="muted">Últimos 7 días: <b>{loading ? '…' : (enc?.respuestas_7d ?? 0)}</b> respuestas</span>
                  </div>
                </div>

                <div className="chips chips--icons" style={{ alignItems:'stretch' }}>
                  <span className="chip">
                    <span className="icon"><IconUsers/></span>
                    Usuarios: <b>{loading ? '…' : (data?.usuarios?.total ?? 0)}</b>
                  </span>
                  <span className="chip">
                    <span className="icon"><IconShield/></span>
                    Admins: <b>{loading ? '…' : (data?.usuarios?.admins ?? 0)}</b>
                  </span>
                  <span className="chip">
                    <span className="icon"><IconGraduationCap/></span>
                    Estudiantes: <b>{loading ? '…' : (data?.usuarios?.estudiantes ?? 0)}</b>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="kpis" style={{ gridTemplateColumns:'repeat(4, minmax(0,1fr))' }}>
            <Kpi
              title="Usuarios"
              value={loading ? '…' : (data?.usuarios?.total ?? 0)}
              sub={loading ? '' : `Admins ${data?.usuarios?.admins ?? 0} · Est. ${data?.usuarios?.estudiantes ?? 0}`}
              icon={<IconUsers/>}
            />
            <Kpi
              title="Sesiones (7 días)"
              value={loading ? '…' : (data?.sesiones_7d ?? 0)}
              icon={<IconCalendar/>}
            />
            <Kpi
              title="% Completado (global normalizado)"
              value={loading ? '…' : `${pctGlobal}%`}
              icon={<IconCheckCircle/>}
            />
            <Kpi
              title="Encuestas (7 días)"
              value={loading ? '…' : (enc?.respuestas_7d ?? 0)}
              sub={loading ? '' : `Mot. ${enc?.motivacion_avg_7d ?? '—'} · Comp. ${enc?.compromiso_avg_7d ?? '—'}`}
              icon={<IconClipboardList/>}
            />
          </div>

          {/* Progreso por nivel (tabla) */}
          <Card
            title="Progreso por nivel"
            right={<span className="muted"></span>}
            icon={<IconGraduationCap/>}
          >
            <div style={{ overflowX:'auto' }}>
              <table className="table table--hover" style={{ minWidth: 980 }}>
                <thead>
                  <tr>
                    <th>Nivel</th>
                    <th>Ejercicios</th>
                    <th>Resueltos (acumulado)</th>
                    <th>Prom. por estudiante</th>
                    <th>Cobertura estimada</th>
                    <th>% normalizado</th>
                    <th>Tiempo promedio (s)</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="muted">Cargando…</td></tr>
                  ) : (nivelesNorm || []).length ? (
                    (nivelesNorm || []).map(n => {
                      const alumnosNivel = Number(n.alumnos ?? (data?.usuarios?.estudiantes ?? 0));
                      const totalEj = Number(n.ejercicios_total || 0);
                      const compAcum = Number(n.ejercicios_completados || 0);

                      const promPorEst = alumnosNivel > 0 ? compAcum / alumnosNivel : 0;

                      // Cobertura estimada: min(totalEj, compAcum)
                      const cubiertosAprox = Math.min(totalEj, compAcum);
                      const pctCobertura = totalEj > 0 ? Math.round((cubiertosAprox / totalEj) * 100) : 0;

                      return (
                        <tr key={n.id}>
                          <td>{n.nombre}</td>
                          <td>{totalEj}</td>
                          <td title="Suma total de ejercicios resueltos por todos los estudiantes">
                            {fmt.num(compAcum)}
                          </td>
                          <td title="Promedio de ejercicios resueltos por estudiante">
                            {promPorEst.toFixed(2)}
                          </td>
                          <td title="Estimación: ejercicios distintos con al menos 1 resolución">
                            {cubiertosAprox}/{totalEj} ({pctCobertura}%)
                          </td>
                          <td>{n.porcentaje_normalizado}%</td>
                          <td>{n.tiempo_promedio_seg}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan={7} className="muted">Sin datos</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* 📈 Sección de gráficos */}
          <div className="grid grid-2">
            {/* 1) Cobertura por nivel (stacked) */}
            <Card title="Cobertura por nivel" icon={<IconChartBar/>}>
              {loading ? (
                <p className="muted">Cargando…</p>
              ) : (
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={serieCoberturaNivel} margin={{ top:8, right:12, left:0, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.35)" />
                      <XAxis dataKey="nivel" />
                      <YAxis tickFormatter={fmt.num} />
                      <Tooltip content={<CustomTooltip title="Cobertura del temario" />} />
                      <Legend />
                      <Bar dataKey="cubiertos"  name="Cubiertos"  stackId="c" fill="var(--chart-blue)"/>
                      <Bar dataKey="restantes"  name="Restantes"  stackId="c" fill="var(--chart-violet)"/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* 2) Tiempo promedio por nivel */}
            <Card title="Tiempo promedio por nivel (s)" icon={<IconClock/>}>
              {loading ? (
                <p className="muted">Cargando…</p>
              ) : (
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[...serieTiempoNivel].sort((a,b)=>b.tiempo-a.tiempo)}
                      margin={{ top:8, right:12, left:0, bottom:0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.35)" />
                      <XAxis dataKey="nivel" />
                      <YAxis tickFormatter={fmt.secs} />
                      <Tooltip content={<CustomTooltip title="Tiempo promedio" />} />
                      <Bar dataKey="tiempo" name="Tiempo" fill="var(--chart-green)"/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          <div className="grid grid-2">
            {/* 3) Distribución Likert (stacked) */}
            <Card title="Distribución Likert (7 días)" icon={<IconClipboardList/>}>
              {loading ? (
                <p className="muted">Cargando…</p>
              ) : (
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={serieLikert} margin={{ top:8, right:12, left:0, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.35)" />
                      <XAxis dataKey="grupo" />
                      <YAxis tickFormatter={fmt.num} />
                      <Tooltip content={<CustomTooltip title="Distribución Likert" />} />
                      <Legend />
                      <Bar dataKey="1" name="1" stackId="l" fill="var(--chart-slate)"/>
                      <Bar dataKey="2" name="2" stackId="l" fill="var(--chart-amber)"/>
                      <Bar dataKey="3" name="3" stackId="l" fill="var(--chart-blue)"/>
                      <Bar dataKey="4" name="4" stackId="l" fill="var(--chart-violet)"/>
                      <Bar dataKey="5" name="5" stackId="l" fill="var(--chart-green)"/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* 4) Respuestas por día (7d) */}
            <Card title="Respuestas por día (7 días)" icon={<IconCalendar/>}>
              {loading ? (
                <p className="muted">Cargando…</p>
              ) : (
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={serieRespuestasDia} margin={{ top:8, right:12, left:0, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.35)" />
                      <XAxis dataKey="dia" />
                      <YAxis allowDecimals={false} tickFormatter={fmt.num}/>
                      <Tooltip content={<CustomTooltip title="Respuestas por día" />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="respuestas"
                        name="Respuestas"
                        stroke="var(--chart-blue)"
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

          {/* Likert + Recientes (mini-barras + tabla) */}
          <div className="grid grid-2">
            <Card title="Distribución Likert (7 días)" icon={<IconChartBar/>}>
              {loading ? (
                <p className="muted">Cargando…</p>
              ) : (
                <>
                  <div className="row" style={{ gap:16 }}>
                    <div style={{ flex:1 }}>
                      <div className="muted" style={{ marginBottom:8 }}><b>Motivación</b></div>
                      {[1,2,3,4,5].map(v=>(
                        <div key={'m'+v} className="row" style={{ gap:10, alignItems:'center', marginBottom:8 }}>
                          <div style={{ width:22, textAlign:'right', fontSize:13 }}>{v}</div>
                          <MiniBar value={distMot[v]} max={maxBar}/>
                          <div style={{ width:36, textAlign:'right', fontSize:13 }}>{distMot[v]}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ flex:1 }}>
                      <div className="muted" style={{ marginBottom:8 }}><b>Compromiso</b></div>
                      {[1,2,3,4,5].map(v=>(
                        <div key={'c'+v} className="row" style={{ gap:10, alignItems:'center', marginBottom:8 }}>
                          <div style={{ width:22, textAlign:'right', fontSize:13 }}>{v}</div>
                          <MiniBar value={distCom[v]} max={maxBar}/>
                          <div style={{ width:36, textAlign:'right', fontSize:13 }}>{distCom[v]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="muted" style={{ marginTop:8, fontSize:13 }}>
                    Total 7 días: <b>{enc?.respuestas_7d ?? 0}</b>
                  </div>
                </>
              )}
            </Card>

            <Card title="Últimas respuestas" icon={<IconClock/>}>
              {loading ? (
                <p className="muted">Cargando…</p>
              ) : (enc?.recientes && enc.recientes.length) ? (
                <div style={{ overflowX:'auto' }}>
                  <table className="table table--hover" style={{ minWidth: 560 }}>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Usuario</th>
                        <th>Motivación</th>
                        <th>Compromiso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enc.recientes.map(r=>(
                        <tr key={r.id}>
                          <td>{new Date(r.creado_en).toLocaleString()}</td>
                          <td className="muted">{r.nombre || `#${r.usuario_id}`}</td>
                          <td>{r.motivacion}</td>
                          <td>{r.compromiso}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="muted">Sin respuestas recientes.</p>
              )}
            </Card>
          </div>

          <div className="footer">Plataforma Low-Code · Panel Admin</div>
        </div>
      </section>
    </>
  );
}
