import { db } from '../../config/db.js';

/**
 * Devuelve IDs de ejercicios completados (exito=1) por el usuario actual.
 * GET /api/progreso/completados?nivelId=1
 */
export async function completadosPorNivel(req, res){
  const usuarioId = req.usuario.id;
  const nivelId = Number(req.query.nivelId) || null;

  let sql = `
    SELECT p.ejercicio_id
    FROM progreso p
    JOIN ejercicios e ON e.id = p.ejercicio_id
    WHERE p.usuario_id=? AND p.exito=1
  `;
  const params = [usuarioId];

  if(nivelId){
    sql += ' AND e.nivel_id=?';
    params.push(nivelId);
  }

  sql += ' GROUP BY p.ejercicio_id';

  const [rows] = await db.query(sql, params);
  res.json(rows.map(r => r.ejercicio_id));
}

export async function completar(req, res){
  const usuarioId = req.usuario.id;
  const { ejercicio_id, exito = false, contar = false, tiempo_seg = null, codigo_generado = null, bloques_json = null } = req.body || {};
  if(!ejercicio_id) return res.status(400).json({ error: 'ejercicio_id es requerido' });

  // Guarda el intento (telemetría básica)
  await db.query(
    `INSERT INTO progreso (usuario_id, ejercicio_id, exito, contar, tiempo_seg, codigo_generado, bloques_json)
     VALUES (?,?,?,?,?,?,?)`,
    [usuarioId, ejercicio_id, exito ? 1 : 0, contar ? 1 : 0, tiempo_seg, codigo_generado, bloques_json ? JSON.stringify(bloques_json) : null]
  );

  // Si no cuenta para progreso o no fue exitoso, solo devolvemos info
  if(!(contar && exito)){
    return res.json({ ok:true, contado:false, desbloqueo:null });
  }

  // Upsert “estado final” de este ejercicio como completado (idempotente)
  await db.query(
    `INSERT INTO progreso_resumen (usuario_id, ejercicio_id, exito)
     VALUES (?,?,1)
     ON DUPLICATE KEY UPDATE exito=VALUES(exito)`,
    [usuarioId, ejercicio_id]
  );

  // ¿Cuántos completados llevamos en este nivel?
  const [[ej]] = await db.query('SELECT nivel_id FROM ejercicios WHERE id=?',[ejercicio_id]);
  const nivelId = ej?.nivel_id;

  const [[reqs]] = await db.query(
    'SELECT requisitos_min_ejercicios, posicion FROM niveles WHERE id=?',
    [nivelId]
  );
  const minReq = reqs?.requisitos_min_ejercicios ?? 5; // por defecto 5 si no hay columna
  const posActual = reqs?.posicion ?? 1;

  const [[cont]] = await db.query(
    `SELECT COUNT(*) AS total
     FROM progreso_resumen pr
     JOIN ejercicios e ON e.id = pr.ejercicio_id
     WHERE pr.usuario_id=? AND pr.exito=1 AND e.nivel_id=?`,
    [usuarioId, nivelId]
  );

  let desbloqueo = null;

  // Si ya cumple el mínimo → desbloquear siguiente nivel (si existe)
  if ((cont?.total || 0) >= minReq) {
    const [[sig]] = await db.query(
      'SELECT id FROM niveles WHERE posicion > ? ORDER BY posicion ASC LIMIT 1',
      [posActual]
    );
    if (sig?.id) {
      // Solo subir si el usuario sigue en este nivel (evitar bajar)
      await db.query(
        'UPDATE usuarios SET nivel_actual_id = GREATEST(nivel_actual_id, ?) WHERE id=?',
        [sig.id, usuarioId]
      );
      desbloqueo = { nuevo_nivel_id: sig.id };
    }
  }

  res.json({ ok:true, contado:true, completados: cont?.total || 0, requerido:minReq, desbloqueo });
}

/**
 * GET /api/progreso/estadisticas?nivelId=opcional
 * Calcula total, completados (distintos) y porcentaje del nivel.
 * Usa progreso_resumen si existe, si no, recurre a progreso con DISTINCT.
 */
export async function estadisticas(req, res) {
  try {
    const uid = req.usuario.id;
    const nivelId = Number(req.query.nivelId || req.usuario.nivelId || 1);

    // total ejercicios en el nivel
    const [[t]] = await db.query(
      'SELECT COUNT(*) AS total FROM ejercicios WHERE nivel_id=?',
      [nivelId]
    );
    const total = Number(t?.total || 0);

    // completados distintos por el usuario (prioriza progreso_resumen si existe)
    let completados = 0;

    try {
      const [[c1]] = await db.query(
        `SELECT COUNT(*) AS hechos
           FROM progreso_resumen pr
           JOIN ejercicios e ON e.id = pr.ejercicio_id
          WHERE pr.usuario_id=? AND pr.exito=1 AND e.nivel_id=?`,
        [uid, nivelId]
      );
      completados = Number(c1?.hechos || 0);
    } catch {
      // fallback a progreso con DISTINCT por ejercicio_id
      const [[c2]] = await db.query(
        `SELECT COUNT(DISTINCT p.ejercicio_id) AS hechos
           FROM progreso p
           JOIN ejercicios e ON e.id = p.ejercicio_id
          WHERE p.usuario_id=? AND p.exito=1 AND e.nivel_id=?`,
        [uid, nivelId]
      );
      completados = Number(c2?.hechos || 0);
    }

    const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0;

    res.json({
      total_ejercicios: total,
      completados,
      porcentaje,
      nivel_id: nivelId
    });
  } catch (e) {
    console.error('PROGRESO_ESTADISTICAS_ERROR', e.message);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}
