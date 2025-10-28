// lowcode-frontend/src/paginas/ListaEjercicios.jsx
import { useEffect, useState, useMemo } from 'react';
import cliente from '../api/cliente.js';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav.jsx';

export default function ListaEjercicios(){
  const [data,setData]=useState([]);                 // ejercicios del nivel actual (modo normal)
  const [done,setDone]=useState(new Set());          // completados del nivel actual
  const [nivelNombre,setNivelNombre]=useState('');
  const [niveles,setNiveles]=useState([]);           // todos los niveles
  const [allDone,setAllDone]=useState(false);        // flag: completó todo en todos los niveles
  const [perLevelData,setPerLevelData]=useState({}); // { [nivelId]: ejercicios[] } (modo allDone)
  const [perLevelDone,setPerLevelDone]=useState({}); // { [nivelId]: Set(ids) }   (modo allDone)

  const nav=useNavigate();

  useEffect(()=>{ (async()=>{
    // 1) Perfil y lista completa de niveles
    const me = await cliente.get('/usuarios/mi-perfil');
    const nivelId = me.data.nivel_actual_id;

    const { data: nivelesList } = await cliente.get('/niveles');
    const nivelesArr = Array.isArray(nivelesList) ? nivelesList : [];
    setNiveles(nivelesArr);

    // 2) Para cada nivel, traer ejercicios y completados (en paralelo)
    const porNivel = await Promise.all(
      nivelesArr.map(async (n) => {
        const [list, comp] = await Promise.all([
          cliente.get('/ejercicios', { params:{ nivelId: n.id } }),
          cliente.get('/progreso/completados', { params:{ nivelId: n.id } }),
        ]);
        const ejercicios = Array.isArray(list.data) ? list.data : [];
        const completados = new Set(Array.isArray(comp.data) ? comp.data : []);
        return { nivel: n, ejercicios, completados };
      })
    );

    // 3) ¿Están terminados TODOS los niveles con ejercicios?
    const nivelesConEj = porNivel.filter(x => x.ejercicios.length > 0);
    const todoCompletado = nivelesConEj.length > 0 &&
      nivelesConEj.every(x => x.completados.size >= x.ejercicios.length);

    if (todoCompletado) {
      setAllDone(true);
      const mapData = {};
      const mapDone = {};
      porNivel.forEach(({ nivel, ejercicios, completados })=>{
        mapData[nivel.id] = ejercicios;
        mapDone[nivel.id] = completados;
      });
      setPerLevelData(mapData);
      setPerLevelDone(mapDone);
    } else {
      // Modo normal (solo nivel actual)
      const actual = porNivel.find(x => x.nivel.id === nivelId) || null;
      setNivelNombre(nivelesArr.find(n=>n.id===nivelId)?.nombre || '');
      setData(actual?.ejercicios || []);
      setDone(actual?.completados || new Set());
    }
  })(); },[]);

  // ✅ Hook fuera de condicionales (no cambia el orden de hooks entre renders)
  const nivelesOrdenados = useMemo(
    () => [...niveles].sort((a,b)=> (a.posicion ?? 0) - (b.posicion ?? 0)),
    [niveles]
  );

  function Card({ej, isDone}){
    return (
      <div className="card fade-in" style={isDone ? {borderColor:'var(--success)', background:'rgba(76,208,135,.06)'} : {}}>
        <div className="card-body">
          <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <h3 className="card-title" style={{marginBottom:4}}>{ej.titulo}</h3>
              <p className="muted" style={{margin:0}}>{ej.descripcion}</p>
            </div>
            {isDone && (
              <span className="badge" style={{background:'rgba(76,208,135,.12)', borderColor:'var(--success)', color:'#caffdf'}}>
                Completado ✓
              </span>
            )}
          </div>
          <div className="row" style={{justifyContent:'flex-end', marginTop:12}}>
            <button className="btn btn-primary" onClick={()=>nav(`/jugar?id=${ej.id}`)}>
              {isDone ? '¿Quieres intentarlo de nuevo?' : 'Abrir'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Render =====
  if (allDone) {
    // Vista: todos los ejercicios por nivel (repetición)
    return (
      <>
        <Nav/>
        <section className="section">
          <div className="container stack">
            <div className="row" style={{justifyContent:'space-between', alignItems:'baseline'}}>
              <h2 style={{margin:'6px 0'}}>Todos los ejercicios</h2>
              <span className="chip">Modo repetición</span>
            </div>

            {nivelesOrdenados.map(n => {
              const ejercicios = perLevelData[n.id] || [];
              const completados = perLevelDone[n.id] || new Set();
              if (!ejercicios.length) return null; // ocultar niveles vacíos

              return (
                <div key={n.id} className="stack">
                  <div className="row" style={{justifyContent:'space-between', alignItems:'center', marginTop:6}}>
                    <h3 style={{margin:'8px 0'}}>{n.nombre}</h3>
                    <span className="muted" style={{fontSize:13}}>
                      {completados.size}/{ejercicios.length} completados
                    </span>
                  </div>
                  <div className="grid grid-2">
                    {ejercicios.map(ej => (
                      <Card key={ej.id} ej={ej} isDone={completados.has(ej.id)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </>
    );
  }

  // Vista normal: solo nivel actual
  return (
    <>
      <Nav/>
      <section className="section">
        <div className="container stack">
          <div className="row" style={{justifyContent:'space-between', alignItems:'baseline'}}>
            <h2 style={{margin:'6px 0'}}>Ejercicios</h2>
            {nivelNombre && <span className="chip">{nivelNombre}</span>}
          </div>
          <div className="grid grid-2">
            {data.map(ej => <Card key={ej.id} ej={ej} isDone={done.has(ej.id)} />)}
            {!data.length && <div className="muted">No hay ejercicios en este nivel.</div>}
          </div>
        </div>
      </section>
    </>
  );
}
