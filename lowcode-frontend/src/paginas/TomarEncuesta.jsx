import { useEffect, useState } from 'react';
import cliente from '../api/cliente.js';
import Nav from '../components/Nav.jsx';

export default function TomarEncuesta(){
  const [encuesta,setEncuesta]=useState(null);
  const [resp,setResp]=useState({});
  useEffect(()=>{ (async()=>{ const me=await cliente.get('/usuarios/mi-perfil'); const {data}=await cliente.get('/encuestas',{params:{nivelId: me.data.nivel_actual_id}}); setEncuesta(data[0]); })(); },[]);
  function setValor(id,val){ setResp(r=>({...r,[id]:val})); }
  async function enviar(){ await cliente.post(`/encuestas/${encuesta.id}/respuestas`,{ respuestas: resp }); alert('Gracias'); }
  return encuesta ? (
    <>
      <Nav/>
      <section className="section">
        <div className="container">
          <div className="card"><div className="card-body">
            <h2 className="card-title">{encuesta.nombre}</h2>
            <div className="stack" style={{marginTop:10}}>
              {JSON.parse(encuesta.preguntas_json).map(q=> (
                <div key={q.id} className="card" style={{background:'#0f1220'}}>
                  <div className="card-body row" style={{justifyContent:'space-between'}}>
                    <span>{q.texto}</span>
                    <div className="row">
                      {[1,2,3,4,5].map(v=> (
                        <label key={v} className="badge" style={{cursor:'pointer'}}>
                          <input type="radio" name={q.id} onChange={()=>setValor(q.id,v)} /> {v}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <div className="row" style={{justifyContent:'flex-end'}}>
                <button className="btn btn-primary" onClick={enviar}>Enviar</button>
              </div>
            </div>
          </div></div>
        </div>
      </section>
    </>
  ) : null;
}
