import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { soloAdmin } from '../../middlewares/rbac.js';
import { miPerfil, actualizarPreferencias, cambiarNivel } from './controlador.js';
const r = Router();
r.get('/mi-perfil', auth, miPerfil);
r.patch('/mis-preferencias', auth, actualizarPreferencias);
r.patch('/:id/cambiar-nivel', auth, soloAdmin, cambiarNivel);
export default r;