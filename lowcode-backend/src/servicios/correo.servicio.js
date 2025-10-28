// src/servicios/correo.servicio.js
import { transporteCorreo } from '../config/correo.js';

const FRONT_URL = process.env.FRONT_URL || 'http://localhost:5173';
const MAIL_FROM = process.env.MAIL_FROM || 'no-reply@lowcode.local';

function plantillaBase({ titulo='Notificación', contenido='' }) {
  return `<!doctype html><html><body style="margin:0;background:#f7f7fb;padding:24px 0;color:#111;font-family:system-ui,Segoe UI,Roboto,Arial;line-height:1.5">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden">
      <div style="padding:20px 24px;border-bottom:1px solid #eee">
        <h2 style="margin:0;font-weight:800;letter-spacing:.2px">${titulo}</h2>
      </div>
      <div style="padding:20px 24px">${contenido}</div>
      <div style="padding:14px 24px;background:#fafafa;border-top:1px solid #eee">
        <p style="margin:0;font-size:12px;color:#666">Este es un mensaje automático de la plataforma Low-Code.</p>
      </div>
    </div>
  </body></html>`;
}

export async function enviarCorreo({ para, asunto, html }) {
  return transporteCorreo.sendMail({
    from: MAIL_FROM,
    to: para,
    subject: asunto,
    html
  });
}

export function nivelNombreById(id) {
  switch (Number(id)) {
    case 1: return 'Principiante';
    case 2: return 'Intermedio';
    case 3: return 'Avanzado';
    default: return `Nivel ${id}`;
  }
}

/* ====== PLANTILLAS ====== */
export const correoBienvenidaEstudiante = ({ nombre, enlaceDiagnostico = `${FRONT_URL}/diagnostico` }) =>
  plantillaBase({
    titulo: '🎉 ¡Bienvenido/a a Low-Code!',
    contenido: `
      <p>Hola ${nombre},</p>
      <p>Gracias por registrarte. Antes de comenzar, realiza un breve <b>examen de ubicación</b> para asignarte el nivel adecuado.</p>
      <p style="margin:16px 0">
      </p>
      <p>Te tomará menos de 2 minutos.</p>
    `
  });

export const correoBienvenidaAdmin = ({ nombre }) =>
  plantillaBase({
    titulo: '👋 Bienvenido/a (Admin) a Low-Code',
    contenido: `
      <p>Hola ${nombre},</p>
      <p>Tu cuenta de administrador está lista. Puedes gestionar usuarios, niveles y analítica desde el panel administrativo.</p>
    `
  });

export const correoDiagnosticoResultado = ({ nombre, nivel_id }) =>
  plantillaBase({
    titulo: '✅ Resultado de tu diagnóstico',
    contenido: `
      <p>Hola ${nombre},</p>
      <p>Hemos analizado tus respuestas y te ubicamos en el nivel <b>${nivelNombreById(nivel_id)}</b>.</p>
      <p>Puedes empezar a practicar desde ahora en la sección de ejercicios.</p>
      <p style="margin:16px 0">
      </p>
    `
  });

export const correoDiagnosticoOmitido = ({ nombre }) =>
  plantillaBase({
    titulo: 'ℹ️ Asignación de nivel',
    contenido: `
      <p>Hola ${nombre},</p>
      <p>Has omitido el diagnóstico. Te asignamos automáticamente al nivel <b>Principiante</b>.</p>
      <p>Podrás avanzar de nivel al completar ejercicios y encuestas.</p>
      <p style="margin:16px 0">
      </p>
    `
  });

export const correoNivelDesbloqueado = ({ nombre, nuevoNivel }) =>
  plantillaBase({
    titulo: '🎉 ¡Nuevo nivel desbloqueado!',
    contenido: `
      <p>Hola ${nombre},</p>
      <p>¡Felicidades! Acabas de desbloquear el nivel <b>${nuevoNivel}</b>.</p>
      <p style="margin:16px 0">
      </p>
    `
  });

export const correoRecuperacion = ({ nombre, enlace }) =>
  plantillaBase({
    titulo: '🔐 Recuperación de contraseña',
    contenido: `
      <p>Hola ${nombre},</p>
      <p>Para restablecer tu contraseña, usa este enlace:</p>
      <p><a href="${enlace}">${enlace}</a></p>
    `
  });
