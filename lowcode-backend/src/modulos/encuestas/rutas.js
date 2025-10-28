import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { crearLikert, resumenLikert } from './controlador.js';
import { misRespuestas } from './controlador.js';

const r = Router();

r.get('/ping', (req,res)=>res.json({ok:true, scope:'encuestas'}));
r.post('/likert', auth, crearLikert);

// si quieres sólo admin, puedes envolver con middleware de rol
r.get('/likert/resumen', auth, resumenLikert);
r.get('/mis-respuestas', auth, misRespuestas);
export default r;
