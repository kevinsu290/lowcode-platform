// src/modulos/analitica/controlador.js
import { db } from '../../config/db.js';

export async function resumen(req, res) {
  try {
    // 1) Usuarios por nivel (solo estudiantes)
    const [niveles] = await db.query(`
      SELECT
        n.id,
        n.nombre,
        n.posicion,
        COUNT(CASE WHEN u.rol_id = 2 THEN 1 END) AS estudiantes
      FROM niveles n
      LEFT JOIN usuarios u
        ON u.nivel_actual_id = n.id
      GROUP BY n.id, n.nombre, n.posicion
      ORDER BY n.posicion ASC, n.id ASC
    `);

    // 2) Tiempos por usuario (solo exitosos) — top por tiempo acumulado
    const [tiempos] = await db.query(`
      SELECT
        u.id AS usuario_id,
        COALESCE(NULLIF(u.nombre_completo, ''), u.correo, CONCAT('Usuario #', u.id)) AS nombre,
        SUM(p.tiempo_seg) AS total_seg
      FROM progreso p
      INNER JOIN usuarios u ON u.id = p.usuario_id
      WHERE p.exito = 1
        AND u.rol_id = 2
      GROUP BY u.id, nombre
      ORDER BY total_seg DESC
    `);

    res.json({ niveles, tiempos });
  } catch (e) {
    console.error('Error /analitica/resumen:', e);
    res.status(500).json({ error: 'Error al cargar analítica' });
  }
}

/**
 * Usuarios activos diarios últimos 7 días (DAU).
 * Cuenta a cada usuario una sola vez por día: COUNT(DISTINCT usuario_id).
 * Compatible con MySQL 5.7+: generamos el "calendario" de 7 días en JS.
 */
export async function actividad7d(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT DATE(creado_en) AS d, COUNT(DISTINCT usuario_id) AS usuarios_activos
      FROM sesiones_login
      WHERE creado_en >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(creado_en)
      ORDER BY d
    `);

    // Mapeo fecha -> valor
    const map = new Map(
      rows.map(r => [r.d instanceof Date ? r.d.toISOString().slice(0,10) : String(r.d), Number(r.usuarios_activos || 0)])
    );

    // Construir los 7 días (hoy y 6 días atrás)
    const out = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const key = d.toISOString().slice(0,10);    // YYYY-MM-DD
      out.push({
        dia: key.slice(5,10),                     // MM-DD (para el eje X)
        usuarios_activos: map.get(key) || 0
      });
    }

    res.json({ actividad7d: out });
  } catch (e) {
    console.error('Error /analitica/actividad7d:', e);
    res.status(500).json({ error: 'Error al cargar actividad 7d' });
  }
}
