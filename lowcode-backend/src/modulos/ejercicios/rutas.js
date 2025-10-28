import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { soloAdmin } from '../../middlewares/rbac.js';
import {
  listarPorNivel,
  obtenerEjercicio,
  crear,
  actualizar,
  eliminar,
  evaluar // 👈 añade esto
} from './controlador.js';

const r = Router();

// Estudiante/usuario autenticado
r.get('/', auth, listarPorNivel);         // ?nivelId=
r.get('/:id', auth, obtenerEjercicio);
r.post('/:id/evaluar', auth, evaluar);    // 👈 evaluar solución del alumno

// Solo admin
r.post('/', auth, soloAdmin, crear);
r.put('/:id', auth, soloAdmin, actualizar);
r.delete('/:id', auth, soloAdmin, eliminar);

export default r;
