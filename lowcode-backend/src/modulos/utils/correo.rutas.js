// src/modulos/utils/correo.rutas.js
import { Router } from 'express';
import { verificarCorreo } from '../../config/correo.js';
import {
  enviarCorreo,
  correoBienvenidaEstudiante,
  correoBienvenidaAdmin,
} from '../../servicios/correo.servicio.js';

const r = Router();

/**
 * GET /api/utils/smtp/verificar
 * Verifica la configuración de transporte SMTP.
 */
r.get('/smtp/verificar', async (_req, res) => {
  try {
    const ok = await verificarCorreo();
    res.json(ok);
  } catch (e) {
    console.error('[SMTP/verificar] Error:', e?.message || e);
    res.status(500).json({ ok: false, error: 'No se pudo verificar SMTP' });
  }
});

/**
 * POST /api/utils/smtp/enviar-prueba
 * Body: { para: string, nombre?: string, rol?: "admin" | "estudiante" }
 * Envía un correo de bienvenida de prueba usando la plantilla acorde al rol.
 * Si no se pasa rol, se asume "estudiante".
 */
r.post('/smtp/enviar-prueba', async (req, res) => {
  try {
    const { para, nombre = 'Usuario', rol = 'estudiante' } = req.body || {};
    if (!para) {
      return res.status(400).json({ ok: false, error: 'Falta "para" en el body' });
    }

    const html =
      String(rol).toLowerCase() === 'admin'
        ? correoBienvenidaAdmin({ nombre })
        : correoBienvenidaEstudiante({ nombre });

    const asunto =
      String(rol).toLowerCase() === 'admin'
        ? 'Bienvenido/a (Admin) · Plataforma Low-Code'
        : 'Bienvenido/a · Plataforma Low-Code';

    await enviarCorreo({ para, asunto, html });
    res.json({ ok: true });
  } catch (e) {
    console.error('[SMTP/enviar-prueba] Error:', e?.message || e);
    res.status(500).json({ ok: false, error: 'No se pudo enviar el correo de prueba' });
  }
});

export default r;
