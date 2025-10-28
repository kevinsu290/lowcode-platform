// lowcode-frontend/src/paginas/JugarEjercicio.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cliente from '../api/cliente.js';
import EditorBlockly from '../components/EditorBlockly.jsx';
import Nav from '../components/Nav.jsx';
import EncuestaLikertModal from '../components/EncuestaLikertModal.jsx'; // 👈 NUEVO

export default function JugarEjercicio(){
  const [ej,setEj]=useState(null);
  const [bloques,setBloques]=useState(0);
  const [codigo,setCodigo]=useState('');
  const [evalRes, setEvalRes] = useState(null);
  const [loadingEval, setLoadingEval] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showLikert, setShowLikert] = useState(false); // 👈 NUEVO
  const [elapsed, setElapsed] = useState(0); // segundos transcurridos
  const startedRef = useRef(false);
  const t0Ref = useRef(null);
  const tickRef = useRef(null);
  const nav = useNavigate();
  const id = new URLSearchParams(location.search).get('id');

  useEffect(()=>{ (async()=>{
    const {data}=await cliente.get(`/ejercicios/${id}`);
    const toolboxJson = typeof data.toolbox_json==='string' ? JSON.parse(data.toolbox_json) : data.toolbox_json;
    setEj({...data, toolbox_json: toolboxJson});

    // cronómetro
    t0Ref.current = Date.now();
    startedRef.current = true;
    tickRef.current = setInterval(()=>{
      if (startedRef.current && t0Ref.current) {
        const secs = Math.floor((Date.now() - t0Ref.current)/1000);
        setElapsed(secs);
      }
    }, 1000);
  })(); },[id]);

  useEffect(()=>()=>{ // cleanup
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
  },[]);

  async function evaluar(){
    if(!ej) return;
    setLoadingEval(true); setEvalRes(null);
    try{
      const { data } = await cliente.post(`/ejercicios/${ej.id}/evaluar`, { codigo });
      setEvalRes(data);
      if(data.aprobado){
        setShowModal(true); // dialogo: contar o no
      }
    }catch(e){
      setEvalRes({ error: e?.response?.data?.error || 'Error al evaluar' });
    }finally{
      setLoadingEval(false);
    }
  }

  async function registrarYSalir(contar){
    if(!ej) return;

    if (!contar) {
      // Solo salir
      nav('/ejercicios', { replace: true });
      return;
    }

    try{
      const { data } = await cliente.post('/progreso/completar',{
        ejercicio_id: ej.id,
        exito: true,
        contar: true,
        tiempo_seg: elapsed,
        codigo_generado: codigo,
        bloques_json: { bloques }
      });
      // Si contó, abrimos encuesta Likert
      if (data?.ok && data?.contado) {
        setShowModal(false);
        setShowLikert(true); // 👈 abre encuesta
      } else {
        alert('No se registró la sesión (revisa backend).');
        nav('/ejercicios', { replace: true });
      }
    }catch(e){
      console.error('PROGRESO_COMPLETAR_ERROR', e?.response?.data || e);
      alert('Error al registrar sesión');
      nav('/ejercicios', { replace: true });
    }
  }

  async function guardar(){
    if(!ej) return;
    // opcional: telemetría
    try{
      await cliente.post('/progreso/telemetria',{
        ejercicio_id: ej.id,
        codigo_len:(codigo||'').length,
        bloques,
        tiempo_ms: elapsed*1000
      });
      alert('Cambios guardados');
    }catch{
      alert('No se pudo guardar la telemetría');
    }
  }

  return ej ? (
    <>
      <Nav/>
      <section className="section">
        <div className="container stack">
          <div className="row" style={{justifyContent:'space-between', alignItems:'baseline'}}>
            <div>
              <h2 style={{margin:0}}>{ej.titulo}</h2>
              <p className="muted" style={{marginTop:4}}>{ej.descripcion}</p>
            </div>
            <div className="chips">
              <span className="chip">Bloques: <b>{bloques}</b></span>
              <span className="chip">Tiempo: <b>{elapsed}s</b></span>
            </div>
          </div>

          <div className="editor-wrap">
            <div className="editor-pane">
              <div className="editor-toolbar">
                <span className="muted">Editor de bloques</span>
                <span className="badge">Blockly</span>
              </div>
              <div style={{padding:12}}>
                {/* 👇 Cambio solicitado: allowedVars según slug */}
                <EditorBlockly
  toolboxJson={ej.toolbox_json}
  onCode={(js,{bloques:bCount})=>{ setCodigo(js); setBloques(bCount||0); }}
  allowedVars={['for-suma-1-a-x','for-factorial'].includes(ej?.slug) ? ['x','y','i'] : ['x','y']}
/>
              </div>
            </div>
            <div className="editor-pane">
              <div className="editor-toolbar">
                <span className="muted">Código generado (JS)</span>
              </div>
              <div className="card-body">
                <pre className="code mono" style={{minHeight: '40vh'}}>{codigo || '// tu código aparecerá aquí…'}</pre>
                <div className="row" style={{justifyContent:'flex-end', gap:8, marginTop:12}}>
                  <button className="btn" onClick={guardar}>Guardar cambios</button>
                  <button className="btn btn-primary" onClick={evaluar} disabled={loadingEval}>
                    {loadingEval ? 'Evaluando…' : 'Evaluar'}
                  </button>
                </div>

                {evalRes && (
                  <div className="card" style={{marginTop:12}}>
                    <div className="card-body">
                      {evalRes.error ? (
                        <div className="badge" style={{background:'rgba(255,107,107,.12)', borderColor:'var(--danger)', color:'#ffd6d6'}}>
                          {evalRes.error}
                        </div>
                      ) : (
                        <>
                          <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
                            <h4 style={{margin:0}}>Resultado</h4>
                            <span className="badge" style={{
                              background: evalRes.aprobado ? 'rgba(76,208,135,.12)' : 'rgba(255,107,107,.12)',
                              borderColor: evalRes.aprobado ? 'var(--success)' : 'var(--danger)',
                              color: evalRes.aprobado ? '#caffdf' : '#ffd6d6'
                            }}>
                              {evalRes.aprobado ? 'APROBADO' : 'NO APROBADO'}
                            </span>
                          </div>

                          {evalRes.mustUse && (
                            <div className="stack" style={{marginTop:10}}>
                              <span className="muted">Estructuras requeridas:</span>
                              <div className="chips">
                                {evalRes.mustUse.details?.map((m,i)=>(
                                  <span key={i} className="chip" style={{borderColor: m.ok ? 'var(--success)' : 'var(--danger)'}}>
                                    {m.token} {m.ok ? '✓' : '✗'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {Array.isArray(evalRes.tests) && (
                            <div className="stack" style={{marginTop:10}}>
                              <span className="muted">Pruebas:</span>
                              <table className="table">
                                <thead><tr><th>Vars</th><th>Esperado</th><th>Obtenido</th><th>OK</th></tr></thead>
                                <tbody>
                                  {evalRes.tests.map((t,i)=>(
                                    <tr key={i}>
                                      <td className="muted">{JSON.stringify(t.vars)}</td>
                                      <td>{String(t.expectPrint)}</td>
                                      <td>{String(t.obtained || t.error || '')}</td>
                                      <td>{t.ok ? '✓' : '✗'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal contar/no contar */}
          {showModal && (
            <div className="modal-backdrop">
              <div className="modal">
                <h3>¡Ejercicio aprobado! 🎉</h3>
                <p>¿Deseas <b>contar este intento</b> para tu progreso (puede desbloquear el siguiente nivel)?</p>
                <div className="row" style={{justifyContent:'flex-end', gap:8, marginTop:12}}>
                  <button className="btn" onClick={()=>registrarYSalir(false)}>Solo salir</button>
                  <button className="btn btn-primary" onClick={()=>registrarYSalir(true)}>Contar y seguir</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal encuesta Likert */}
          {showLikert && (
            <EncuestaLikertModal
              open={showLikert}
              onClose={()=>{ setShowLikert(false); nav('/ejercicios', { replace:true }); }}
              ejercicioId={ej?.id}
              nivelId={ej?.nivel_id}
            />
          )}
        </div>
      </section>
    </>
  ) : null;
}
