// src/modulos/admins/rutas.js
import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { soloAdmin } from '../../middlewares/rbac.js';
import { resumen, crear } from './controlador.js';

const r = Router();

// Solo admins
r.get('/resumen', auth, soloAdmin, resumen);
r.post('/crear', auth, soloAdmin, crear);

export default r;
