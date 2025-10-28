// lowcode-frontend/src/paginas/AdminEncuestas.jsx
import { useEffect, useMemo, useState } from 'react';
import cliente from '../api/cliente.js';
import Nav from '../components/Nav.jsx';

// Recharts
import {
  ResponsiveContainer,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

/* ===== Helpers de formato ===== */
const fmt = {
  num: (n) => (n ?? 0).toLocaleString(),
  dec2: (n) => Number(n ?? 0).toFixed(2),
};

/* ===== Tooltip bonito para charts ===== */
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
              <span style={{ width:10, height:10, borderRadius:3, background:p.color || p.fill || 'var(--brand)'}}/>
              <span className="muted" style={{ fontSize:12 }}>{p.name}</span>
            </span>
            <b>{fmt.num(p.value)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Pequeños iconos inline (no depende de icons.jsx) ===== */
const IcoUsers = (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16 11a4 4 0 1 0-4-4a4 4 0 0 0 4 4m-8 8v-1a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1zm-2-1v1H2v-1a6 6 0 0 1 6-6h1.26A6 6 0 0 0 6 18m3-8a3 3 0 1 1 3-3a3 3 0 0 1-3 3"/></svg>
);
const IcoSpark = (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11 21v-5.5L6.5 11L11 6.5V1l6 6l-6 6v8Z"/></svg>
);
const IcoHeart = (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5C2 6 4 4 6.5 4C8.04 4 9.54 4.81 10.35 6.09C11.16 4.81 12.66 4 14.2 4C16.7 4 18.7 6 18.7 8.5c0 3.78-3.4 6.86-8.55 11.18z"/></svg>
);

/* ===== Componentes UI ===== */
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

function Card({ title, right, children }) {
  return (
    <div className="card card--elev">
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

/* ===== Página ===== */
export default function AdminEncuestas(){
  const [nivelId, setNivelId] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [data, setData] = useState({ kpis:{respuestas:0,avg_motivacion:0,avg_compromiso:0}, por_ejercicio:[] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // ordenado tabla
  const [sort, setSort] = useState({ key: 'respuestas', dir: 'desc' });

  async function cargar(){
    try{
      setLoading(true);
      setErr('');
      const qs = new URLSearchParams();
      if (nivelId) qs.set('nivelId', nivelId);
      if (desde) qs.set('desde', desde);
      if (hasta) qs.set('hasta', hasta);
      const { data } = await cliente.get(`/encuestas/likert/resumen?${qs.toString()}`);
      setData(data || { kpis:{respuestas:0,avg_motivacion:0,avg_compromiso:0}, por_ejercicio:[] });
    }catch(e){
      setErr('No se pudo cargar el resumen.');
      setData({ kpis:{respuestas:0,avg_motivacion:0,avg_compromiso:0}, por_ejercicio:[] });
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{ cargar(); },[]);

  // top 8 por respuestas
  const topByRespuestas = useMemo(()=>{
    const arr = Array.isArray(data?.por_ejercicio) ? data.por_ejercicio.slice() : [];
    return arr.sort((a,b)=> (b.respuestas||0)-(a.respuestas||0)).slice(0,8);
  }, [data]);

  // dataset para comparación promedio
  const seriePromedios = useMemo(()=>{
    return topByRespuestas.map(e => ({
      ejercicio: e.titulo || `#${e.ejercicio_id}`,
      motivacion: Number(e.avg_motivacion || 0),
      compromiso: Number(e.avg_compromiso || 0),
    }));
  }, [topByRespuestas]);

  // tabla ordenable
  const rowsOrdenadas = useMemo(()=>{
    const arr = Array.isArray(data?.por_ejercicio) ? data.por_ejercicio.slice() : [];
    const { key, dir } = sort;
    arr.sort((a,b)=>{
      const av = a[key]; const bv = b[key];
      if (typeof av === 'number' && typeof bv === 'number') {
        return dir === 'asc' ? av - bv : bv - av;
      }
      const as = String(av ?? '').toLowerCase();
      const bs = String(bv ?? '').toLowerCase();
      return dir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as);
    });
    return arr;
  }, [data, sort]);

  function onSort(col) {
    setSort(prev => {
      if (prev.key === col) return { key: col, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      return { key: col, dir: 'desc' };
    });
  }

  // Export CSV (tabla actual ordenada)
  function exportCSV() {
    const header = ['ejercicio_id','titulo','respuestas','avg_motivacion','avg_compromiso'];
    const rows = rowsOrdenadas.map(r => [
      r.ejercicio_id,
      `"${(r.titulo ?? '').replace(/"/g,'""')}"`,
      r.respuestas ?? 0,
      Number(r.avg_motivacion ?? 0).toFixed(2),
      Number(r.avg_compromiso ?? 0).toFixed(2),
    ]);
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'encuestas_por_ejercicio.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Nav/>
      <section className="section">
        <div className="container stack">

          {/* Header + filtros */}
          <div className="card card--hero">
            <div className="card-body">
              <div className="row" style={{ justifyContent:'space-between', alignItems:'center' }}>
                <div className="stack">
                  <div className="row" style={{ alignItems:'center', gap:10 }}>
                    <span className="brand-dot"></span>
                    <h2 style={{ margin:0 }}>Métricas de Encuestas (Likert)</h2>
                    <span className="badge badge--gradient">Analítica</span>
                  </div>
                  <span className="muted" style={{ maxWidth: 760 }}>
                    Observa respuestas, promedios de Motivación/Compromiso y desglose por ejercicio.
                  </span>
                </div>

                <div className="row" style={{ gap:8, flexWrap:'wrap' }}>
                  <select value={nivelId} onChange={e=>setNivelId(e.target.value)}>
                    <option value="">Todos los niveles</option>
                    <option value="1">Principiante</option>
                    <option value="2">Intermedio</option>
                    <option value="3">Avanzado</option>
                  </select>
                  <input type="date" value={desde} onChange={e=>setDesde(e.target.value)} />
                  <input type="date" value={hasta} onChange={e=>setHasta(e.target.value)} />
                  <button className="btn" onClick={cargar}>Filtrar</button>
                  <button className="btn btn-outline" onClick={exportCSV}>Exportar CSV</button>
                </div>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="kpis" style={{ gridTemplateColumns:'repeat(3, minmax(0,1fr))' }}>
            <Kpi
              title="Respuestas"
              value={loading ? '…' : fmt.num(data?.kpis?.respuestas ?? 0)}
              icon={IcoUsers}
            />
            <Kpi
              title="Motivación (1–5)"
              value={loading ? '…' : fmt.dec2(data?.kpis?.avg_motivacion)}
              icon={IcoHeart}
            />
            <Kpi
              title="Compromiso (1–5)"
              value={loading ? '…' : fmt.dec2(data?.kpis?.avg_compromiso)}
              icon={IcoSpark}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-2">
            <Card title="Top ejercicios por respuestas">
              {loading ? (
                <p className="muted">Cargando…</p>
              ) : topByRespuestas.length ? (
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topByRespuestas} margin={{ top:8, right:12, left:0, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.35)" />
                      <XAxis dataKey={(d)=> (d.titulo?.length>18 ? d.titulo.slice(0,18)+'…' : d.titulo) || `#${d.ejercicio_id}`} />
                      <YAxis allowDecimals={false} />
                      <Tooltip content={<CustomTooltip title="Respuestas por ejercicio" />} />
                      <Legend />
                      <Bar dataKey="respuestas" name="Respuestas" fill="var(--chart-blue)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="muted">Sin datos para el filtro.</p>
              )}
            </Card>

            <Card title="Promedio: Motivación vs Compromiso (Top por respuestas)">
              {loading ? (
                <p className="muted">Cargando…</p>
              ) : seriePromedios.length ? (
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={seriePromedios} margin={{ top:8, right:12, left:0, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.35)" />
                      <XAxis dataKey="ejercicio" />
                      <YAxis domain={[1,5]} ticks={[1,2,3,4,5]} />
                      <Tooltip content={<CustomTooltip title="Promedios (1–5)" />} />
                      <Legend />
                      <Bar dataKey="motivacion" name="Motivación" fill="var(--chart-violet)" />
                      <Bar dataKey="compromiso" name="Compromiso" fill="var(--chart-green)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="muted">Sin datos para el filtro.</p>
              )}
            </Card>
          </div>

          {/* Tabla por ejercicio */}
          <Card
            title="Por ejercicio"
            right={
              <span className="muted" style={{ fontSize:12 }}>
                Click en los encabezados para ordenar
              </span>
            }
          >
            <div style={{ overflowX:'auto' }}>
              <table className="table table--hover" style={{ minWidth: 760 }}>
                <thead>
                  <tr>
                    <th style={{cursor:'pointer'}} onClick={()=>onSort('ejercicio_id')}>ID</th>
                    <th style={{cursor:'pointer'}} onClick={()=>onSort('titulo')}>Ejercicio</th>
                    <th style={{cursor:'pointer'}} onClick={()=>onSort('respuestas')}>Respuestas</th>
                    <th style={{cursor:'pointer'}} onClick={()=>onSort('avg_motivacion')}>Motivación</th>
                    <th style={{cursor:'pointer'}} onClick={()=>onSort('avg_compromiso')}>Compromiso</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="muted">Cargando…</td></tr>
                  ) : rowsOrdenadas.length ? (
                    rowsOrdenadas.map(r=>(
                      <tr key={r.ejercicio_id}>
                        <td>{r.ejercicio_id}</td>
                        <td style={{maxWidth:360, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}} title={r.titulo}>{r.titulo}</td>
                        <td>{fmt.num(r.respuestas)}</td>
                        <td>{fmt.dec2(r.avg_motivacion)}</td>
                        <td>{fmt.dec2(r.avg_compromiso)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="muted">Sin respuestas para el filtro.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {err && <div className="badge" style={{ borderColor:'var(--danger)', background:'rgba(255,107,107,.12)' }}>{err}</div>}
        </div>
      </section>
    </>
  );
}
