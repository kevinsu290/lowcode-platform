import jwt from 'jsonwebtoken';
export function auth(req,res,next){
  const h=req.headers.authorization; if(!h) return res.status(401).json({error:'Token faltante'});
  const token=h.replace('Bearer ','');
  try{ const p=jwt.verify(token, process.env.JWT_SECRETO); req.usuario={ id:p.id, rol:p.rol, nivelId:p.nivelId }; next(); }
  catch{ res.status(401).json({error:'Token inválido'}); }
}