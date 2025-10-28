import 'dotenv/config';
import app from './app.js';

// 🔹 Monta ambos routers
import authRutas from './modulos/autenticacion/rutas.js';
import progresoRutas from './modulos/progreso/rutas.js';
import adminRutas from './modulos/admin/rutas.js';

// (opcional) healthcheck
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Prefijos EXACTOS que usa el frontend
app.use('/api/autenticacion', authRutas);
app.use('/api/progreso', progresoRutas);
app.use('/api/admin', adminRutas); 

// 404 catch-all con log (útil para debug)
app.use((req, res) => {
  console.warn('404 Not Found:', req.method, req.originalUrl);
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

// 👉 Loguea errores que de otra forma matarían el proceso
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});
process.on('unhandledRejection', (reason, p) => {
  console.error('[unhandledRejection]', reason);
});

const puerto = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || '0.0.0.0';
app.listen(puerto, HOST, () => console.log(`API lista en http://${HOST}:${puerto}`));