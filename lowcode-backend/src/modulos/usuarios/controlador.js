import { db } from '../../config/db.js';
export async function miPerfil(req,res){
  const [rows] = await db.query(
    `SELECT id, nombre_completo, correo, nivel_actual_id, rol_id,
            CASE WHEN rol_id=1 THEN 'admin' ELSE 'estudiante' END AS rol
     FROM usuarios WHERE id=?`,
    [req.usuario.id]
  );
  res.json(rows[0]);
}
export async function actualizarPreferencias(req,res){
  const { modo_contraste='normal', escala_fuente=1.0, tipografia='system-ui' } = req.body;
  await db.query('INSERT INTO preferencias_usuario(usuario_id,modo_contraste,escala_fuente,tipografia) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE modo_contraste=VALUES(modo_contraste), escala_fuente=VALUES(escala_fuente), tipografia=VALUES(tipografia)',
    [req.usuario.id, modo_contraste, escala_fuente, tipografia]);
  res.json({ ok:true });
}
export async function cambiarNivel(req,res){
  const { id } = req.params; const { nivel_id } = req.body;
  await db.query('UPDATE usuarios SET nivel_actual_id=? WHERE id=?',[nivel_id, id]);
  res.json({ ok:true });
}
