import { db } from '../../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  enviarCorreo,
  correoBienvenidaEstudiante,
  correoBienvenidaAdmin
} from '../../servicios/correo.servicio.js';

const JWT_SECRETO = process.env.JWT_SECRETO || 'devsecret';

/**
 * POST /api/autenticacion/registro
 */
export async function registrar(req, res) {
  try {
    const { nombre_completo, correo, contrasena } = req.body || {};
    if (!nombre_completo || !correo || !contrasena) {
      return res.status(400).json({ error: 'faltan campos' });
    }

    const [rows] = await db.query('SELECT id FROM usuarios WHERE correo=? LIMIT 1', [correo]);
    if (rows.length) return res.status(409).json({ error: 'El correo ya está registrado' });

    const hash = await bcrypt.hash(contrasena, 10);
    const [resultado] = await db.query(
      'INSERT INTO usuarios(nombre_completo,correo,contrasena_hash,nivel_actual_id,rol_id) VALUES (?,?,?,?,?)',
      [nombre_completo, correo, hash, 1, 2] // rol_id 2 = estudiante
    );

    const id = resultado.insertId;
    const token = jwt.sign(
      { id, rol: 'estudiante', nivelId: 1 },
      JWT_SECRETO,
      { expiresIn: '7d' }
    );

    // Correo de bienvenida (si falla NO rompe el flujo)
    enviarCorreo({
      para: correo,
      asunto: 'Bienvenido/a a la Plataforma Low-Code',
      html: correoBienvenidaEstudiante({ nombre: nombre_completo })
    }).catch(() => {});

    res.json({
      token,
      usuario: { id, nombre_completo, correo, rol: 'estudiante', nivel_actual_id: 1 }
    });
  } catch (e) {
    console.error('REGISTRO_ERROR', e.message);
    res.status(500).json({ error: 'Error al registrar' });
  }
}

/**
 * POST /api/autenticacion/login
 */
export async function login(req, res) {
  try {
    const { correo, contrasena } = req.body || {};
    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'correo y contrasena son requeridos' });
    }

    const [rows] = await db.query('SELECT * FROM usuarios WHERE correo=? LIMIT 1', [correo]);
    const u = rows[0];
    if (!u) return res.status(401).json({ error: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(contrasena, u.contrasena_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const rol = u.rol_id === 1 ? 'admin' : 'estudiante';
    const token = jwt.sign(
      { id: u.id, rol, nivelId: u.nivel_actual_id },
      JWT_SECRETO,
      { expiresIn: '7d' }
    );

    // Registrar sesión de login (no romper si falla)
    try {
      const ip = (req.headers['x-forwarded-for'] || req.ip || '').toString().slice(0, 45);
      const ua = (req.headers['user-agent'] || '').toString().slice(0, 255);
      await db.query(
        'INSERT INTO sesiones_login (usuario_id, ip, user_agent) VALUES (?,?,?)',
        [u.id, ip, ua]
      );
    } catch (e) {
      console.error('[LOGIN] No se pudo registrar sesión:', e.code || e.message);
    }

    res.json({
      token,
      usuario: {
        id: u.id,
        nombre_completo: u.nombre_completo,
        correo: u.correo,
        rol,
        nivel_actual_id: u.nivel_actual_id
      }
    });
  } catch (e) {
    console.error('LOGIN_ERROR', e.message);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

/**
 * GET /api/autenticacion/sesiones/contador (auth)
 */
export async function contarSesiones(req, res) {
  try {
    const uid = req.usuario.id;
    const [[row]] = await db.query(
      'SELECT COUNT(*) AS sesiones FROM sesiones_login WHERE usuario_id=?',
      [uid]
    );
    res.json({ sesiones: Number(row?.sesiones || 0) });
  } catch (e) {
    console.error('CONTAR_SESIONES_ERROR', e.message);
    res.status(500).json({ error: 'Error al contar sesiones' });
  }
}

export const iniciarSesion = login;
