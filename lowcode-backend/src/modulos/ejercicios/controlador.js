import { db } from '../../config/db.js';

function parseMaybeJSON(v) {
  if (v == null) return null;
  if (typeof v === 'object') return v;
  try { return JSON.parse(v); } catch { return null; }
}

export async function listarPorNivel(req, res) {
  const nivelId = Number(req.query.nivelId);
  if (!nivelId) return res.status(400).json({ error: 'nivelId es requerido' });
  const [rows] = await db.query(
    'SELECT id,slug,titulo,descripcion FROM ejercicios WHERE nivel_id=? ORDER BY id DESC',
    [nivelId]
  );
  res.json(rows);
}

export async function obtenerEjercicio(req, res) {
  const [rows] = await db.query('SELECT * FROM ejercicios WHERE id=?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
  res.json(rows[0]);
}

export async function crear(req, res) {
  try {
    const {
      nivel_id,
      slug,
      titulo,
      descripcion = '',
      objetivos_json = null,
      toolbox_json,
      criterios_exito_json
    } = req.body;

    if (!nivel_id || !slug || !titulo || !toolbox_json || !criterios_exito_json) {
      return res.status(400).json({ error: 'Campos requeridos: nivel_id, slug, titulo, toolbox_json, criterios_exito_json' });
    }

    // Validación de slug único
    const [dup] = await db.query('SELECT id FROM ejercicios WHERE slug=?', [slug]);
    if (dup.length) return res.status(409).json({ error: 'slug ya existe' });

    const objetivos = parseMaybeJSON(objetivos_json);
    const toolbox = parseMaybeJSON(toolbox_json);
    const criterios = parseMaybeJSON(criterios_exito_json);

    const [r] = await db.query(
      `INSERT INTO ejercicios (nivel_id,slug,titulo,descripcion,objetivos_json,toolbox_json,criterios_exito_json)
       VALUES (?,?,?,?,?,?,?)`,
      [
        Number(nivel_id),
        slug,
        titulo,
        descripcion,
        objetivos ? JSON.stringify(objetivos) : null,
        JSON.stringify(toolbox),
        JSON.stringify(criterios)
      ]
    );

    res.status(201).json({ id: r.insertId });
  } catch (e) {
    console.error('EJERCICIO_CREAR_ERROR', e.code, e.message);
    res.status(500).json({ error: 'Error al crear ejercicio', detalle: e.code || e.message });
  }
}

export async function actualizar(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'id inválido' });

    // Obtener actual
    const [rows] = await db.query('SELECT * FROM ejercicios WHERE id=?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'No encontrado' });

    const {
      nivel_id = rows[0].nivel_id,
      slug = rows[0].slug,
      titulo = rows[0].titulo,
      descripcion = rows[0].descripcion,
      objetivos_json = rows[0].objetivos_json,
      toolbox_json = rows[0].toolbox_json,
      criterios_exito_json = rows[0].criterios_exito_json
    } = req.body || {};

    // Si cambia slug, valida unicidad
    if (slug !== rows[0].slug) {
      const [dup] = await db.query('SELECT id FROM ejercicios WHERE slug=? AND id<>?', [slug, id]);
      if (dup.length) return res.status(409).json({ error: 'slug ya existe' });
    }

    const objetivos = parseMaybeJSON(objetivos_json);
    const toolbox = parseMaybeJSON(toolbox_json);
    const criterios = parseMaybeJSON(criterios_exito_json);

    await db.query(
      `UPDATE ejercicios SET nivel_id=?, slug=?, titulo=?, descripcion=?, objetivos_json=?, toolbox_json=?, criterios_exito_json=?
       WHERE id=?`,
      [
        Number(nivel_id),
        slug,
        titulo,
        descripcion ?? '',
        objetivos ? JSON.stringify(objetivos) : null,
        JSON.stringify(toolbox),
        JSON.stringify(criterios),
        id
      ]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error('EJERCICIO_ACTUALIZAR_ERROR', e.code, e.message);
    res.status(500).json({ error: 'Error al actualizar ejercicio', detalle: e.code || e.message });
  }
}

export async function eliminar(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'id inválido' });

    await db.query('DELETE FROM ejercicios WHERE id=?', [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error('EJERCICIO_ELIMINAR_ERROR', e.code, e.message);
    res.status(500).json({ error: 'Error al eliminar ejercicio', detalle: e.code || e.message });
  }
}

/** =======================
 *  EVALUADOR (DEV SANDBOX)
 *  ======================= */

/**
 * Parche: aceptar también window.alert(...)
 * Capturamos console.log y window.alert en el arreglo `logs`.
 */
function safeRunJS(codigo, vars = {}) {
  const logs = [];
  const fakeConsole = { log: (...args) => logs.push(args.map(String).join(' ')) };
  const fakeWindow  = { alert: (msg) => logs.push(String(msg)) }; // 👈 NUEVO: soporta alert()

  const keys = Object.keys(vars);
  const vals = Object.values(vars);

  // Inyectamos `console` y `window` como argumentos
  const fn = new Function(
    'console', 'window',
    ...keys,
    `"use strict";\ntry {\n${codigo}\n} catch (e) {\nthrow e;\n}`
  );

  try {
    fn(fakeConsole, fakeWindow, ...vals);
    return { ok: true, logs };
  } catch (e) {
    return { ok: false, error: e.message || String(e), logs };
  }
}

function includesAll(haystack, needles = []) {
  const H = (haystack || '').toLowerCase();
  return needles.map(n => ({ token: n, ok: H.includes(String(n).toLowerCase()) }));
}

// Comparación: usamos el último log como salida principal
function compareExpectPrint(logs = [], expectPrint) {
  const last = (logs[logs.length - 1] || '').trim();
  const exp = String(expectPrint).trim();
  return { last, ok: last === exp };
}

export async function evaluar(req, res) {
  try {
    const id = Number(req.params.id);
    const { codigo } = req.body || {};

    if (!id) return res.status(400).json({ error: 'id inválido' });
    if (!codigo) return res.status(400).json({ error: 'codigo es requerido' });

    const [rows] = await db.query('SELECT * FROM ejercicios WHERE id=?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Ejercicio no encontrado' });

    const ej = rows[0];

    // Parse de criterios
    let criterios = {};
    try {
      criterios = ej.criterios_exito_json
        ? (typeof ej.criterios_exito_json === 'string'
            ? JSON.parse(ej.criterios_exito_json)
            : ej.criterios_exito_json)
        : {};
    } catch {
      criterios = {};
    }

    const mustUse = Array.isArray(criterios.mustUse) ? criterios.mustUse : [];
    const tests = Array.isArray(criterios.tests) ? criterios.tests : [];

    // 1) Verificación estática (mustUse)
    const mustUseChecks = includesAll(codigo, mustUse);
    const mustUseOK = mustUseChecks.every(x => x.ok);

    // 2) Ejecutar tests
    const testsResult = [];
    let testsOK = true;

    for (const t of tests) {
      const { vars = {}, expectPrint } = t || {};
      const run = safeRunJS(codigo, vars);
      if (!run.ok) {
        testsOK = false;
        testsResult.push({
          ok: false,
          error: run.error,
          vars,
          expectPrint,
          obtained: (run.logs[run.logs.length - 1] || null)
        });
        continue;
      }
      const cmp = compareExpectPrint(run.logs, expectPrint);
      const ok = cmp.ok;
      if (!ok) testsOK = false;
      testsResult.push({
        ok,
        vars,
        expectPrint,
        obtained: cmp.last
      });
    }

    const aprobado = mustUseOK && testsOK;

    return res.json({
      aprobado,
      mustUse: {
        required: mustUse,
        details: mustUseChecks
      },
      tests: testsResult
    });
  } catch (e) {
    console.error('EJERCICIO_EVALUAR_ERROR', e.code || e.name, e.message);
    res.status(500).json({ error: 'Error al evaluar', detalle: e.code || e.message });
  }
}
