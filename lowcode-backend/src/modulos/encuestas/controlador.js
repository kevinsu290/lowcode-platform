import { db } from '../../config/db.js';

function v5(n) {
  const x = Number(n);
  return Number.isFinite(x) && x >= 1 && x <= 5 ? x : null;
}

// POST /api/encuestas/likert  (auth)
export async function crearLikert(req, res) {
  try {
    const usuarioId = req.usuario.id;
    const { ejercicio_id, nivel_id = null, motivacion, compromiso, comentario = null } = req.body || {};

    if (!ejercicio_id) return res.status(400).json({ error: 'ejercicio_id es requerido' });
    const mot = v5(motivacion), com = v5(compromiso);
    if (!mot || !com) return res.status(400).json({ error: 'motivacion y compromiso deben ser 1..5' });

    const [[ej]] = await db.query('SELECT id, nivel_id FROM ejercicios WHERE id=?', [ejercicio_id]);
    if (!ej) return res.status(404).json({ error: 'Ejercicio no encontrado' });

    const lvl = nivel_id ?? ej.nivel_id;

    await db.query(
      `INSERT INTO encuestas_likert (usuario_id, ejercicio_id, nivel_id, motivacion, compromiso, comentario)
       VALUES (?,?,?,?,?,?)`,
      [usuarioId, ejercicio_id, lvl, mot, com, comentario?.toString().slice(0,300) ?? null]
    );

    res.status(201).json({ ok: true });
  } catch (e) {
    console.error('ENCUESTA_LIKERT_ERROR', e.code || e.name, e.message);
    res.status(500).json({ error: 'Error al registrar encuesta' });
  }
}

// GET /api/encuestas/likert/resumen (admin)
// query: nivelId?, desde?, hasta?
export async function resumenLikert(req, res) {
  try {
    // (opcional) podrías validar que req.usuario.rol === 'admin'
    const nivelId = req.query.nivelId ? Number(req.query.nivelId) : null;
    const desde = req.query.desde || null; // 'YYYY-MM-DD'
    const hasta = req.query.hasta || null;

    const where = [];
    const params = [];

    if (nivelId) { where.push('el.nivel_id = ?'); params.push(nivelId); }
    if (desde)   { where.push('el.creado_en >= ?'); params.push(desde + ' 00:00:00'); }
    if (hasta)   { where.push('el.creado_en <= ?'); params.push(hasta + ' 23:59:59'); }

    const W = where.length ? ('WHERE ' + where.join(' AND ')) : '';

    // KPIs globales
    const [[kpi]] = await db.query(
      `SELECT COUNT(*) AS respuestas,
              ROUND(AVG(el.motivacion),2) AS avg_motivacion,
              ROUND(AVG(el.compromiso),2) AS avg_compromiso
         FROM encuestas_likert el
         ${W}`, params
    );

    // Por ejercicio
    const [porEj] = await db.query(
      `SELECT e.id AS ejercicio_id, e.titulo,
              COUNT(*) AS respuestas,
              ROUND(AVG(el.motivacion),2) AS avg_motivacion,
              ROUND(AVG(el.compromiso),2) AS avg_compromiso
         FROM encuestas_likert el
         JOIN ejercicios e ON e.id = el.ejercicio_id
         ${W}
         GROUP BY e.id, e.titulo
         ORDER BY e.id DESC`, params
    );

    res.json({
      kpis: {
        respuestas: Number(kpi?.respuestas || 0),
        avg_motivacion: Number(kpi?.avg_motivacion || 0),
        avg_compromiso: Number(kpi?.avg_compromiso || 0)
      },
      por_ejercicio: porEj
    });
  } catch (e) {
    console.error('RESUMEN_LIKERT_ERROR', e.message);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
}

export async function misRespuestas(req, res) {
  try {
    const uid = req.usuario.id;
    const nivelId = req.query.nivelId ? Number(req.query.nivelId) : null;
    const ejercicioId = req.query.ejercicioId ? Number(req.query.ejercicioId) : null;

    const where = ['el.usuario_id = ?'];
    const params = [uid];

    if (nivelId)     { where.push('el.nivel_id = ?');     params.push(nivelId); }
    if (ejercicioId) { where.push('el.ejercicio_id = ?'); params.push(ejercicioId); }

    const W = 'WHERE ' + where.join(' AND ');

    const [rows] = await db.query(
      `SELECT el.id, el.ejercicio_id, el.nivel_id, el.motivacion, el.compromiso, el.comentario, el.creado_en,
              e.titulo AS ejercicio_titulo
         FROM encuestas_likert el
         JOIN ejercicios e ON e.id = el.ejercicio_id
        ${W}
        ORDER BY el.creado_en DESC, el.id DESC`,
      params
    );

    res.json(rows);
  } catch (e) {
    console.error('MIS_RESPUESTAS_ERROR', e.message);
    res.status(500).json({ error: 'Error al obtener tus respuestas' });
  }
}
