import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rutasAuth from './modulos/autenticacion/rutas.js';
import rutasUsuarios from './modulos/usuarios/rutas.js';
import rutasNiveles from './modulos/niveles/rutas.js';
import rutasEjercicios from './modulos/ejercicios/rutas.js';
import rutasProgreso from './modulos/progreso/rutas.js';
import rutasEncuestas from './modulos/encuestas/rutas.js';
import rutasAnalitica from './modulos/analitica/rutas.js';
import rutasCorreo from './modulos/utils/correo.rutas.js';
import encuestasRutas from './modulos/encuestas/rutas.js';
import diagnosticoRoutes from './modulos/diagnostico/rutas.js';

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/api', diagnosticoRoutes);

app.get('/salud', (_, res) => res.json({ ok: true }));
app.use('/api/autenticacion', rutasAuth);
app.use('/api/usuarios', rutasUsuarios);
app.use('/api/niveles', rutasNiveles);
app.use('/api/ejercicios', rutasEjercicios);
app.use('/api/progreso', rutasProgreso);
app.use('/api/encuestas', rutasEncuestas);
app.use('/api/analitica', rutasAnalitica);
app.use('/api/utils', rutasCorreo);
app.use('/api/encuestas', encuestasRutas);

app.use((err, req, res, next) => {
  console.error('[Error middleware]', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal error' });
});

export default app;