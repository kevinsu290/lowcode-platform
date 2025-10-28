import { db } from '../../config/db.js';
export async function listarNiveles(_,res){
  const [rows] = await db.query('SELECT * FROM niveles ORDER BY posicion');
  res.json(rows);
}
export async function reglasDeNivel(req,res){
  const [rows] = await db.query('SELECT * FROM reglas_nivel WHERE nivel_id=?',[req.params.id]);
  res.json(rows[0]||null);
}