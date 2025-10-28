import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { listarNiveles, reglasDeNivel } from './controlador.js';
const r = Router();
r.get('/', auth, listarNiveles);
r.get('/:id/reglas', auth, reglasDeNivel);
export default r;