import nodemailer from 'nodemailer';
export const transporteCorreo = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
export async function verificarCorreo(){
  try { await transporteCorreo.verify(); return { ok:true }; }
  catch (e){ return { ok:false, error: e?.message || 'Error SMTP' }; }
}