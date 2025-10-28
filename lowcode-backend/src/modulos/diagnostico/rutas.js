import { Router } from 'express';
import { estado, form, responder, omitir } from './controlador.js';
import { auth } from '../../middlewares/auth.js';

const r = Router();

r.get('/diagnostico/estado', auth, estado);
r.get('/diagnostico/form',   auth, form);
r.post('/diagnostico',       auth, responder);
r.post('/diagnostico/omitir',auth, omitir);   // 👈 nuevo endpoint

export default r;
