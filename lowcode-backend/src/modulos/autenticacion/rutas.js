import { Router } from 'express';
import { registrar, login, contarSesiones } from './controlador.js'; 
import { auth } from '../../middlewares/auth.js';

const r = Router();

// ping opcional para verificar montaje
r.get('/ping', (req, res) => res.json({ ok: true, scope: 'autenticacion' }));

r.post('/registro', registrar);                 
r.post('/login', login);

// 🔹 contador real de sesiones (logins)
r.get('/sesiones/contador', auth, contarSesiones);

export default r;
