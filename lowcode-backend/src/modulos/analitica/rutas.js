import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { soloAdmin } from '../../middlewares/rbac.js';
import { resumen, actividad7d } from './controlador.js';

const r = Router();

r.get('/resumen', auth, soloAdmin, resumen);
r.get('/actividad7d', auth, soloAdmin, actividad7d);

export default r;
