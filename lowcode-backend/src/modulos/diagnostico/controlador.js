import { db } from '../../config/db.js';
import jwt from 'jsonwebtoken';
import {
  enviarCorreo,
  correoDiagnosticoResultado,
  correoDiagnosticoOmitido
} from '../../servicios/correo.servicio.js';

const JWT_SECRETO = process.env.JWT_SECRETO || 'devsecret';

/* ========= Config ========= */
const UMBRALES = {
  principiante: { min: 0,  max: 6,   nivel_id: 1 },
  intermedio:   { min: 7,  max: 12,  nivel_id: 2 },
  avanzado:     { min: 13, max: 999, nivel_id: 3 },
};

/* ========= Formulario ========= */
const FORM = [
  {
    id: 1,
    titulo: 'Lógica básica',
    pregunta:
      'Si un bloque se repite 3 veces y otro 2 veces, ¿cuántas ejecuciones totales hay?',
    opciones: [
      { id: 'A', label: '5', score: 1 },
      { id: 'B', label: '6', score: 2 },
      { id: 'C', label: 'Depende de si están anidados', score: 3 },
      { id: 'D', label: 'No sé', score: 0 },
    ],
  },
  {
    id: 2,
    titulo: 'Variables',
    pregunta: '¿Para qué sirve una variable en programación visual?',
    opciones: [
      { id: 'A', label: 'Para repetir bloques', score: 0 },
      { id: 'B', label: 'Para almacenar y reutilizar valores', score: 3 },
      { id: 'C', label: 'Para colorear el código', score: 0 },
      { id: 'D', label: 'Para conectar bloques', score: 1 },
    ],
  },
  {
    id: 3,
    titulo: 'Condiciones',
    pregunta: 'Selecciona el mejor uso de un bloque “si / si no”.',
    opciones: [
      { id: 'A', label: 'Mostrar siempre el mismo mensaje', score: 0 },
      { id: 'B', label: 'Tomar decisiones según una condición', score: 3 },
      { id: 'C', label: 'Mover un sprite a la derecha', score: 0 },
      { id: 'D', label: 'Repetir 10 veces una acción', score: 1 },
    ],
  },
  {
    id: 4,
    titulo: 'Bucles',
    pregunta: '¿Qué bloque usarías para ejecutar un bloque 10 veces?',
    opciones: [
      { id: 'A', label: 'Repetir (10)', score: 3 },
      { id: 'B', label: 'Si / si no', score: 0 },
      { id: 'C', label: 'Esperar 1 seg', score: 0 },
      { id: 'D', label: 'Definir función', score: 1 },
    ],
  },
  {
    id: 5,
    titulo: 'Funciones',
    pregunta: '¿Por qué definirías un bloque/función propio?',
    opciones: [
      { id: 'A', label: 'Para agrupar y reutilizar lógica', score: 3 },
      { id: 'B', label: 'Para decorar el proyecto', score: 0 },
      { id: 'C', label: 'Para contar cuántos bloques hay', score: 0 },
      { id: 'D', label: 'Para ejecutar una sola vez', score: 1 },
    ],
  },
  {
    id: 6,
    titulo: 'Depuración',
    pregunta: '¿Qué harías si tu programa no hace lo esperado?',
    opciones: [
      { id: 'A', label: 'Probar paso a paso y revisar variables', score: 3 },
      { id: 'B', label: 'Agregar más bloques aleatorios', score: 0 },
      { id: 'C', label: 'Eliminar todo y empezar de cero', score: 1 },
      { id: 'D', label: 'Renunciar', score: 0 },
    ],
  },
];

/* ========= Helpers de auth ========= */
function pickFirst(...vals) { for (const v of vals) if (v !== undefined && v !== null) return v; }

function getJwtPayload(req) {
  try {
    const a = req.headers?.authorization || '';
    if (a.startsWith('Bearer ')) return jwt.verify(a.slice(7).trim(), JWT_SECRETO);
  } catch {}
  try {
    const t = req.cookies?.token || req.cookies?.jwt;
    if (t) return jwt.verify(t, JWT_SECRETO);
  } catch {}
  return null;
}

async function getAuthedUser(req) {
  const candidate = pickFirst(req.user, req.usuario, req.auth, req.session?.usuario) || {};
  let id = pickFirst(candidate.id, candidate.userId, candidate.uid, req.userId, req.uid, req.session?.usuario_id);
  if (!id) { const p = getJwtPayload(req); id = pickFirst(p?.id, p?.userId); }
  if (!id) return null;
  id = Number(id);

  let rol_id = pickFirst(candidate.rol_id, candidate.roleId, candidate.role, candidate?.data?.rol_id);
  if (rol_id === undefined || rol_id === null) {
    const [[u]] = await db.query('SELECT rol_id FROM usuarios WHERE id = ? LIMIT 1', [id]);
    rol_id = u?.rol_id;
  }
  return { id, rol_id };
}

/* ========= Scoring ========= */
function puntuar(respuestas = []) {
  let total = 0;
  const mapa = new Map(respuestas.map(r => [Number(r.preguntaId), String(r.opcionId)]));
  const detalle = FORM.map(q => {
    const opSel = mapa.get(q.id);
    const op = q.opciones.find(o => o.id === opSel);
    const sc = op ? (op.score || 0) : 0;
    total += sc;
    return { preguntaId: q.id, opcionId: opSel || null, score: sc };
  });

  let nivel = UMBRALES.principiante.nivel_id;
  if (total >= UMBRALES.avanzado.min) nivel = UMBRALES.avanzado.nivel_id;
  else if (total >= UMBRALES.intermedio.min) nivel = UMBRALES.intermedio.nivel_id;

  return { total, detalle, nivel_sugerido_id: nivel };
}

/* ========= Controladores ========= */
export async function estado(req, res) {
  try {
    const user = await getAuthedUser(req);
    if (!user) return res.status(401).json({ error: 'No autenticado' });

    // Omitir prueba para administradores
    if (Number(user.rol_id) === 1) return res.json({ pendiente: false, motivo: 'admin' });

    const [[row]] = await db.query(
      'SELECT 1 AS tiene FROM diagnosticos WHERE usuario_id = ? LIMIT 1',
      [user.id]
    );
    return res.json({ pendiente: !row });
  } catch (e) {
    console.error('diagnostico/estado error:', e);
    return res.status(500).json({ error: 'Error al consultar el estado' });
  }
}

export async function form(req, res) {
  try {
    return res.json({ preguntas: FORM });
  } catch (e) {
    console.error('diagnostico/form error:', e);
    return res.status(500).json({ error: 'Error al cargar formulario' });
  }
}

export async function responder(req, res) {
  try {
    const user = await getAuthedUser(req);
    if (!user) return res.status(401).json({ error: 'No autenticado' });

    const [[ya]] = await db.query(
      'SELECT 1 AS tiene FROM diagnosticos WHERE usuario_id = ? LIMIT 1',
      [user.id]
    );
    if (ya) return res.status(409).json({ error: 'Ya completaste el diagnóstico' });

    const respuestas = Array.isArray(req.body?.respuestas) ? req.body.respuestas : [];
    const resultado = puntuar(respuestas);

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        'INSERT INTO diagnosticos (usuario_id, resultado_json, nivel_sugerido_id) VALUES (?, ?, ?)',
        [user.id, JSON.stringify(resultado), resultado.nivel_sugerido_id]
      );
      await conn.query(
        'UPDATE usuarios SET nivel_actual_id = ? WHERE id = ?',
        [resultado.nivel_sugerido_id, user.id]
      );
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      console.error('diagnostico/responder tx error:', e);
      return res.status(500).json({ error: 'No se pudo guardar el diagnóstico' });
    } finally {
      conn.release();
    }

    // Email de resultado (no bloqueante)
    try {
      const [[u]] = await db.query(
        'SELECT nombre_completo, correo FROM usuarios WHERE id = ? LIMIT 1',
        [user.id]
      );
      if (u?.correo) {
        await enviarCorreo({
          para: u.correo,
          asunto: 'Tu resultado de diagnóstico en Low-Code',
          html: correoDiagnosticoResultado({
            nombre: u.nombre_completo || 'Estudiante',
            nivel_id: resultado.nivel_sugerido_id
          })
        });
      }
    } catch (e) {
      console.warn('Correo resultado diagnóstico falló:', e?.message);
    }

    return res.json({
      ok: true,
      nivel_asignado: resultado.nivel_sugerido_id,
      total: resultado.total
    });
  } catch (e) {
    console.error('diagnostico/responder error:', e);
    return res.status(500).json({ error: 'Error al procesar el diagnóstico' });
  }
}

export async function omitir(req, res) {
  try {
    const user = await getAuthedUser(req);
    if (!user) return res.status(401).json({ error: 'No autenticado' });

    const [[ya]] = await db.query(
      'SELECT 1 AS tiene FROM diagnosticos WHERE usuario_id = ? LIMIT 1',
      [user.id]
    );
    if (ya) return res.status(409).json({ error: 'Ya completaste el diagnóstico' });

    const nivel = UMBRALES.principiante.nivel_id;
    const resultado = { total: 0, detalle: [], nivel_sugerido_id: nivel, motivo: 'omitido' };

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        'INSERT INTO diagnosticos (usuario_id, resultado_json, nivel_sugerido_id) VALUES (?, ?, ?)',
        [user.id, JSON.stringify(resultado), nivel]
      );
      await conn.query('UPDATE usuarios SET nivel_actual_id = ? WHERE id = ?', [nivel, user.id]);
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      console.error('diagnostico/omitir tx error:', e);
      return res.status(500).json({ error: 'No se pudo omitir el diagnóstico' });
    } finally {
      conn.release();
    }

    // Email de omisión (no bloqueante)
    try {
      const [[u]] = await db.query(
        'SELECT nombre_completo, correo FROM usuarios WHERE id = ? LIMIT 1',
        [user.id]
      );
      if (u?.correo) {
        await enviarCorreo({
          para: u.correo,
          asunto: 'Asignación de nivel en Low-Code',
          html: correoDiagnosticoOmitido({ nombre: u.nombre_completo || 'Estudiante' })
        });
      }
    } catch (e) {
      console.warn('Correo diagnóstico omitido falló:', e?.message);
    }

    return res.json({ ok: true, nivel_asignado: nivel, omitido: true });
  } catch (e) {
    console.error('diagnostico/omitir error:', e);
    return res.status(500).json({ error: 'Error al omitir el diagnóstico' });
  }
}
