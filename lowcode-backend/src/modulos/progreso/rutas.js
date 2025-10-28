import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { completadosPorNivel, completar, estadisticas } from './controlador.js';

const r = Router();

r.get('/completados', auth, completadosPorNivel); // ?nivelId=
r.post('/completar', auth, completar);            // { ejercicio_id, exito, contar, ... }
r.get('/estadisticas', auth, estadisticas);       // ✅ nuevo endpoint

export default r;
