import { useEffect, useMemo, useState } from 'react';
import cliente from '../api/cliente.js';
import Nav from '../components/Nav.jsx';

const TOOLBOX_PLANTILLAS = {
  1: { // Principiante: if/else
    kind: "flyoutToolbox",
    contents: [
      { kind: "block", type: "controls_if" },
      { kind: "block", type: "logic_compare" },
      { kind: "block", type: "logic_boolean" },
      { kind: "block", type: "math_number" },
      { kind: "block", type: "text_print" },
      { kind: "block", type: "variables_set" },
      { kind: "block", type: "variables_get" }
    ]
  },
  2: { // Intermedio: condiciones, listas básicas (placeholder hasta switch personalizado)
    kind: "flyoutToolbox",
    contents: [
      { kind: "block", type: "controls_if" },
      { kind: "block", type: "logic_compare" },
      { kind: "block", type: "logic_operation" },
      { kind: "block", type: "lists_create_with" },
      { kind: "block", type: "math_number" },
      { kind: "block", type: "text_print" }
    ]
  },
  3: { // Avanzado: bucles
    kind: "flyoutToolbox",
    contents: [
      { kind: "block", type: "controls_repeat_ext" },
      { kind: "block", type: "controls_whileUntil" },
      { kind: "block", type: "math_number" },
      { kind: "block", type: "logic_compare" },
      { kind: "block", type: "text_print" },
      { kind: "block", type: "variables_set" },
      { kind: "block", type: "variables_get" }
    ]
  }
};

const CRITERIOS_EJEMPLO = {
  mustUse: ["if"],
  checks: [{ lhs: "x", op: ">", rhs: 10 }]
};

export default function AdminEjercicios(){
  const [niveles, setNiveles] = useState([]);
  const [nivelSel, setNivelSel] = useState(1);
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState({
    nivel_id: 1,
    slug: "",
    titulo: "",
    descripcion: "",
    objetivos_json: "",
    toolbox_json: JSON.stringify(TOOLBOX_PLANTILLAS[1], null, 2),
    criterios_exito_json: JSON.stringify(CRITERIOS_EJEMPLO, null, 2)
  });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await cliente.get('/niveles');
      setNiveles(data);
      setNivelSel(data?.[0]?.id || 1);
    })();
  }, []);

  useEffect(() => {
    if (!nivelSel) return;
    (async () => {
      const { data } = await cliente.get('/ejercicios', { params: { nivelId: nivelSel } });
      setLista(data);
    })();
  }, [nivelSel]);

  function onNivelChange(n) {
    setNivelSel(n);
    setForm(f => ({
      ...f,
      nivel_id: n,
      toolbox_json: JSON.stringify(TOOLBOX_PLANTILLAS[n] || TOOLBOX_PLANTILLAS[1], null, 2)
    }));
  }

  function onEdit(ej) {
    setEditId(ej.id);
    (async () => {
      const { data } = await cliente.get(`/ejercicios/${ej.id}`);
      setForm({
        nivel_id: data.nivel_id,
        slug: data.slug,
        titulo: data.titulo,
        descripcion: data.descripcion || "",
        objetivos_json: data.objetivos_json ? JSON.stringify(JSON.parse(data.objetivos_json), null, 2) : "",
        toolbox_json: data.toolbox_json ? JSON.stringify(JSON.parse(data.toolbox_json), null, 2) : "",
        criterios_exito_json: data.criterios_exito_json ? JSON.stringify(JSON.parse(data.criterios_exito_json), null, 2) : ""
      });
      setMsg("");
    })();
  }

  async function onDelete(id) {
    if (!confirm('¿Eliminar ejercicio?')) return;
    await cliente.delete(`/ejercicios/${id}`);
    const { data } = await cliente.get('/ejercicios', { params: { nivelId: nivelSel } });
    setLista(data);
    setMsg("Ejercicio eliminado");
    setEditId(null);
  }

  async function onSubmit(e){
    e.preventDefault(); setMsg("");

    const payload = {
      ...form,
      objetivos_json: form.objetivos_json ? form.objetivos_json : null,
      toolbox_json: form.toolbox_json,
      criterios_exito_json: form.criterios_exito_json
    };

    if (editId) {
      await cliente.put(`/ejercicios/${editId}`, payload);
      setMsg("Ejercicio actualizado");
    } else {
      const { data } = await cliente.post('/ejercicios', payload);
      setMsg(`Ejercicio creado (id=${data.id})`);
    }

    // refresca lista
    const { data } = await cliente.get('/ejercicios', { params: { nivelId: nivelSel } });
    setLista(data);
    setEditId(null);
    // conserva el formulario por si quieres crear más; opcionalmente limpiar slug/título
  }

  const nivelNombre = useMemo(
    () => niveles.find(n => n.id === Number(nivelSel))?.nombre || "Nivel",
    [niveles, nivelSel]
  );

  return (
    <>
      <Nav/>
      <section className="section">
        <div className="container grid grid-2">
          {/* Panel izquierdo: listado */}
          <div className="stack">
            <div className="card">
              <div className="card-body">
                <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
                  <h3 className="card-title" style={{margin:0}}>Ejercicios</h3>
                  <select
                    className="select"
                    style={{width:220}}
                    value={nivelSel}
                    onChange={e => onNivelChange(Number(e.target.value))}
                  >
                    {niveles.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                  </select>
                </div>
                <p className="card-subtitle">Mostrando: {nivelNombre}</p>

                <table className="table">
                  <thead>
                    <tr><th>Título</th><th>Slug</th><th style={{width:180}}>Acciones</th></tr>
                  </thead>
                  <tbody>
                    {lista.map(ej => (
                      <tr key={ej.id}>
                        <td>{ej.titulo}</td>
                        <td className="muted">{ej.slug}</td>
                        <td>
                          <div className="row">
                            <button className="btn" onClick={()=>onEdit(ej)}>Editar</button>
                            <button className="btn btn-danger" onClick={()=>onDelete(ej.id)}>Eliminar</button>
                            <a className="btn btn-primary" href={`/jugar?id=${ej.id}`}>Probar</a>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!lista.length && <tr><td colSpan={3} className="muted">No hay ejercicios en este nivel.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Panel derecho: formulario */}
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">{editId ? 'Editar ejercicio' : 'Nuevo ejercicio'}</h3>
              <p className="card-subtitle">Completa los campos y guarda</p>
              {msg && <div className="badge" style={{background:'rgba(76,208,135,.12)', borderColor:'var(--success)', color:'#caffdf'}}>{msg}</div>}

              <form onSubmit={onSubmit} className="stack" style={{marginTop:8}}>
                <div className="grid grid-2">
                  <div className="stack">
                    <label className="label">Nivel</label>
                    <select
                      className="select"
                      value={form.nivel_id}
                      onChange={e=> setForm(f => ({
                        ...f,
                        nivel_id: Number(e.target.value),
                        toolbox_json: JSON.stringify(TOOLBOX_PLANTILLAS[Number(e.target.value)] || TOOLBOX_PLANTILLAS[1], null, 2)
                      }))}
                    >
                      {niveles.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                    </select>
                  </div>
                  <div className="stack">
                    <label className="label">Slug (único)</label>
                    <input className="input" value={form.slug} onChange={e=>setForm(f=>({...f,slug:e.target.value}))} placeholder="if-basico-2"/>
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="stack">
                    <label className="label">Título</label>
                    <input className="input" value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} placeholder="Condicional básico 2"/>
                  </div>
                  <div className="stack">
                    <label className="label">Descripción</label>
                    <input className="input" value={form.descripcion} onChange={e=>setForm(f=>({...f,descripcion:e.target.value}))} placeholder="Usa if para evaluar x > 10"/>
                  </div>
                </div>

                <div className="stack">
                  <label className="label">Objetivos (JSON opcional)</label>
                  <textarea className="textarea" rows={4}
                    value={form.objetivos_json}
                    onChange={e=>setForm(f=>({...f,objetivos_json:e.target.value}))}
                    placeholder='{"competencias":["if/else","comparaciones"]}'
                  />
                </div>

                <div className="stack">
                  <label className="label">Toolbox (JSON)</label>
                  <textarea className="textarea mono" rows={10}
                    value={form.toolbox_json}
                    onChange={e=>setForm(f=>({...f,toolbox_json:e.target.value}))}
                  />
                </div>

                <div className="stack">
                  <label className="label">Criterios de éxito (JSON)</label>
                  <textarea className="textarea mono" rows={8}
                    value={form.criterios_exito_json}
                    onChange={e=>setForm(f=>({...f,criterios_exito_json:e.target.value}))}
                  />
                </div>

                <div className="row" style={{justifyContent:'flex-end', gap:12}}>
                  {editId && <button type="button" className="btn" onClick={()=>{ setEditId(null); setMsg(''); }}>Cancelar</button>}
                  <button className="btn btn-primary" type="submit">{editId ? 'Guardar cambios' : 'Crear ejercicio'}</button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
