import { useEffect, useMemo, useState } from 'react';
import cliente from '../api/cliente.js';
import Nav from '../components/Nav.jsx';
import { useAut } from '../contexto/Aut.jsx';

export default function ListaEncuestas(){
  const { usuario } = useAut();
  const [respuestas, setRespuestas] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [nivelId, setNivelId] = useState('');
  const [loading, setLoading] = useState(true);

  // fallback por si /niveles no está montado
  const nivelesFallback = useMemo(()=>[
    { id:1, nombre:'Principiante' },
    { id:2, nombre:'Intermedio' },
    { id:3, nombre:'Avanzado' },
  ],[]);

  async function cargar() {
    try{
      setLoading(true);

      // niveles (para filtro legible)
      try{
        const { data: ns } = await cliente.get('/niveles');
        setNiveles(Array.isArray(ns) && ns.length ? ns : []);
      }catch{
        setNiveles([]);
      }

      // respuestas del usuario (con filtro opcional)
      const qs = new URLSearchParams();
      if (nivelId) qs.set('nivelId', nivelId);
      const { data } = await cliente.get(`/encuestas/mis-respuestas?${qs.toString()}`);
      setRespuestas(Array.isArray(data) ? data : []);
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{ cargar(); },[nivelId]);

  function nombreNivelById(id){
    const found = niveles.find(n => Number(n.id) === Number(id))
               || nivelesFallback.find(n => Number(n.id) === Number(id));
    return found?.nombre || `Nivel ${id}`;
  }

  return (
    <>
      <Nav/>
      <section className="section">
        <div className="container stack">
          <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
            <h2 style={{margin:0}}>Mis encuestas</h2>
            <div className="row" style={{gap:8}}>
              <select value={nivelId} onChange={e=>setNivelId(e.target.value)}>
                <option value="">Todos los niveles</option>
                <option value="1">Principiante</option>
                <option value="2">Intermedio</option>
                <option value="3">Avanzado</option>
              </select>
              <button className="btn" onClick={cargar}>Refrescar</button>
            </div>
          </div>

          <div className="card" style={{marginTop:12}}>
            <div className="card-body">
              <h3 className="card-title">Respuestas registradas</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Ejercicio</th>
                    <th>Nivel</th>
                    <th>Motivación</th>
                    <th>Compromiso</th>
                    <th>Comentario</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={6} className="muted">Cargando…</td></tr>
                  )}
                  {!loading && respuestas.length === 0 && (
                    <tr><td colSpan={6} className="muted">Sin respuestas aún.</td></tr>
                  )}
                  {!loading && respuestas.map(r=>(
                    <tr key={r.id}>
                      <td className="muted">{new Date(r.creado_en).toLocaleString()}</td>
                      <td>{r.ejercicio_titulo} <span className="muted">#{r.ejercicio_id}</span></td>
                      <td>{nombreNivelById(r.nivel_id)}</td>
                      <td>{r.motivacion}</td>
                      <td>{r.compromiso}</td>
                      <td>{r.comentario || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* (opcional) Resumen personal */}
          <ResumenPersonal respuestas={respuestas}/>
        </div>
      </section>
    </>
  );
}

function ResumenPersonal({ respuestas }){
  if (!Array.isArray(respuestas) || !respuestas.length) return null;

  const avg = (arr) => (arr.reduce((s,n)=>s+Number(n||0),0) / arr.length) || 0;
  const avgMot = avg(respuestas.map(r=>r.motivacion)).toFixed(2);
  const avgCom = avg(respuestas.map(r=>r.compromiso)).toFixed(2);

  return (
    <div className="kpis" style={{marginTop:12}}>
      <div className="kpi">
        <span className="muted">Total respuestas</span><br/>
        <b>{respuestas.length}</b>
      </div>
      <div className="kpi">
        <span className="muted">Motivación promedio</span><br/>
        <b>{avgMot}</b>
      </div>
      <div className="kpi">
        <span className="muted">Compromiso promedio</span><br/>
        <b>{avgCom}</b>
      </div>
    </div>
  );
}
