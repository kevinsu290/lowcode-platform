// src/modulos/admins/controlador.js
import { db } from '../../config/db.js';
import bcrypt from 'bcrypt';
import { enviarCorreo, correoBienvenidaAdmin } from '../../servicios/correo.servicio.js';

/**
 * GET /api/admins/resumen
 * (protegido por auth + soloAdmin en rutas)
 */
export async function resumen(req, res) {
  try {
    const esAdmin = req.usuario?.rol === 'admin' || req.usuario?.rol_id === 1;
    if (!esAdmin) return res.status(403).json({ error: 'Solo administradores' });

    // === Usuarios ===
    const [[uTot]] = await db.query('SELECT COUNT(*) AS total FROM usuarios');
    const [[uAdm]] = await db.query('SELECT COUNT(*) AS total FROM usuarios WHERE rol_id=1');
    const [[uEst]] = await db.query('SELECT COUNT(*) AS total FROM usuarios WHERE rol_id=2');

    // === Sesiones últimos 7 días ===
    const [[ses7d]] = await db.query(`
      SELECT COUNT(*) AS total
      FROM sesiones_login
      WHERE creado_en >= (NOW() - INTERVAL 7 DAY)
    `);

    // === Niveles y progreso ===
    const [niveles] = await db.query(`
      SELECT id, nombre, posicion, COALESCE(requisitos_min_ejercicios, 0) AS req
      FROM niveles
      ORDER BY posicion ASC
    `);
    const [ejPorNivel] = await db.query(`
      SELECT nivel_id, COUNT(*) AS total
      FROM ejercicios
      GROUP BY nivel_id
    `);
    const [compPorNivel] = await db.query(`
      SELECT e.nivel_id, COUNT(*) AS completados
      FROM progreso_resumen pr
      JOIN ejercicios e ON e.id = pr.ejercicio_id
      WHERE pr.exito=1
      GROUP BY e.nivel_id
    `);
    const [avgTiempo] = await db.query(`
      SELECT e.nivel_id, AVG(p.tiempo_seg) AS avg_seg
      FROM progreso p
      JOIN ejercicios e ON e.id = p.ejercicio_id
      WHERE p.exito=1 AND p.contar=1 AND p.tiempo_seg IS NOT NULL
      GROUP BY e.nivel_id
    `);

    const mapEj   = new Map(ejPorNivel.map(r => [Number(r.nivel_id), Number(r.total)]));
    const mapComp = new Map(compPorNivel.map(r => [Number(r.nivel_id), Number(r.completados)]));
    const mapAvg  = new Map(avgTiempo.map(r => [Number(r.nivel_id), Number(r.avg_seg)]));

    const nivelesKPI = niveles.map(n => {
      const total = mapEj.get(n.id) || 0;
      const completados = mapComp.get(n.id) || 0;
      const pct = total > 0 ? Math.round((completados / total) * 100) : 0;
      const avg = mapAvg.get(n.id) || 0;
      return {
        id: n.id,
        nombre: n.nombre,
        posicion: n.posicion,
        ejercicios_total: total,
        ejercicios_completados: completados,
        porcentaje_completado: pct,
        tiempo_promedio_seg: Math.round(avg)
      };
    });

    // === Encuestas tipo Likert (7 días) ===
    let encuestas = {
      respuestas_7d: 0,
      motivacion_avg_7d: null,
      compromiso_avg_7d: null,
      distribucion: {
        motivacion: { 1:0,2:0,3:0,4:0,5:0 },
        compromiso: { 1:0,2:0,3:0,4:0,5:0 },
      },
      recientes: []
    };

    try {
      const [[rCount]] = await db.query(`
        SELECT COUNT(*) AS total
        FROM encuestas_likert
        WHERE creado_en >= (NOW() - INTERVAL 7 DAY)
      `);
      const [[rAvg]] = await db.query(`
        SELECT AVG(motivacion) AS motivacion_avg, AVG(compromiso) AS compromiso_avg
        FROM encuestas_likert
        WHERE creado_en >= (NOW() - INTERVAL 7 DAY)
      `);
      const [[dist]] = await db.query(`
        SELECT
          SUM(CASE WHEN motivacion=1 THEN 1 ELSE 0 END) AS m1,
          SUM(CASE WHEN motivacion=2 THEN 1 ELSE 0 END) AS m2,
          SUM(CASE WHEN motivacion=3 THEN 1 ELSE 0 END) AS m3,
          SUM(CASE WHEN motivacion=4 THEN 1 ELSE 0 END) AS m4,
          SUM(CASE WHEN motivacion=5 THEN 1 ELSE 0 END) AS m5,
          SUM(CASE WHEN compromiso=1 THEN 1 ELSE 0 END) AS c1,
          SUM(CASE WHEN compromiso=2 THEN 1 ELSE 0 END) AS c2,
          SUM(CASE WHEN compromiso=3 THEN 1 ELSE 0 END) AS c3,
          SUM(CASE WHEN compromiso=4 THEN 1 ELSE 0 END) AS c4,
          SUM(CASE WHEN compromiso=5 THEN 1 ELSE 0 END) AS c5
        FROM encuestas_likert
        WHERE creado_en >= (NOW() - INTERVAL 7 DAY)
      `);
      const [ultimas] = await db.query(`
        SELECT er.id, er.usuario_id, u.nombre_completo,
               er.motivacion, er.compromiso, er.creado_en
        FROM encuestas_likert er
        LEFT JOIN usuarios u ON u.id = er.usuario_id
        ORDER BY er.creado_en DESC
        LIMIT 10
      `);

      encuestas = {
        respuestas_7d: Number(rCount?.total || 0),
        motivacion_avg_7d: rAvg?.motivacion_avg != null ? Number(Number(rAvg.motivacion_avg).toFixed(2)) : null,
        compromiso_avg_7d: rAvg?.compromiso_avg != null ? Number(Number(rAvg.compromiso_avg).toFixed(2)) : null,
        distribucion: {
          motivacion: { 1:Number(dist?.m1||0), 2:Number(dist?.m2||0), 3:Number(dist?.m3||0), 4:Number(dist?.m4||0), 5:Number(dist?.m5||0) },
          compromiso: { 1:Number(dist?.c1||0), 2:Number(dist?.c2||0), 3:Number(dist?.c3||0), 4:Number(dist?.c4||0), 5:Number(dist?.c5||0) },
        },
        recientes: ultimas.map(r => ({
          id: r.id,
          usuario_id: r.usuario_id,
          nombre: r.nombre_completo,
          motivacion: r.motivacion,
          compromiso: r.compromiso,
          creado_en: r.creado_en
        }))
      };
    } catch (e) {
      console.warn('[ADMIN] Métricas de encuestas no disponibles:', e.code || e.message);
    }

    return res.json({
      usuarios: {
        total: Number(uTot?.total || 0),
        admins: Number(uAdm?.total || 0),
        estudiantes: Number(uEst?.total || 0),
      },
      sesiones_7d: Number(ses7d?.total || 0),
      niveles: nivelesKPI,
      encuestas
    });
  } catch (e) {
    console.error('ADMIN_RESUMEN_ERROR', e.message);
    res.status(500).json({ error: 'Error al obtener resumen admin' });
  }
}

/**
 * POST /api/admins/crear
 * (protegido por auth + soloAdmin en rutas)
 * body: { nombre_completo, correo, contrasena }
 */
export async function crear(req, res) {
  try {
    const esAdmin = req.usuario?.rol === 'admin' || req.usuario?.rol_id === 1;
    if (!esAdmin) return res.status(403).json({ error: 'Solo administradores' });

    const { nombre_completo, correo, contrasena } = req.body || {};
    if (!nombre_completo || !correo || !contrasena) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    if (String(contrasena).length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const [exists] = await db.query('SELECT id FROM usuarios WHERE correo=? LIMIT 1', [correo]);
    if (exists.length) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    const hash = await bcrypt.hash(contrasena, 10);
    const [ins] = await db.query(
      'INSERT INTO usuarios (nombre_completo, correo, contrasena_hash, nivel_actual_id, rol_id) VALUES (?,?,?,?,?)',
      [nombre_completo, correo, hash, 1, 1] // rol_id 1 => admin
    );

    // Email (no bloquear en caso de error)
    enviarCorreo({
      para: correo,
      asunto: 'Tu acceso de administrador — Plataforma Low-Code',
      html: correoBienvenidaAdmin({ nombre: nombre_completo })
    }).catch(()=>{});

    return res.json({
      ok: true,
      admin: { id: ins.insertId, nombre_completo, correo, rol_id: 1 }
    });
  } catch (e) {
    console.error('[CREAR_ADMIN_ERROR]', e);
    return res.status(500).json({ error: 'Error al crear administrador' });
  }
}
