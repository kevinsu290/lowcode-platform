// lowcode-frontend/src/components/EditorBlockly.jsx
import { useMemo, useRef } from 'react';
import { BlocklyWorkspace } from 'react-blockly';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';
import '../blockly/switchx_tolerant.js';
import '../blockly/dowhile_tolerant.js';

javascriptGenerator.INFINITE_LOOP_TRAP = 'if(--window.__loopTrap < 0) throw "Loop limit exceeded";\n';
window.__loopTrap = 10000;  

// 🔕 Desactivar el "loop trap" global de Blockly:
javascriptGenerator.INFINITE_LOOP_TRAP = null;
javascriptGenerator.STATEMENT_PREFIX = null;
// (por si algún plugin lo usa)
javascriptGenerator.addLoopTrap = (code /*, id*/) => code;

/* --------------------------------------------
   Override: "for" en sintaxis JS clásica (±1)
   -------------------------------------------- */
const _origForGen = javascriptGenerator.forBlock['controls_for'];

javascriptGenerator.forBlock['controls_for'] = function (block) {
  // nombre de la variable (ej: i)
  const varName = javascriptGenerator.nameDB_.getName(
    block.getFieldValue('VAR'),
    Blockly.VARIABLE_CATEGORY_NAME
  );

  // from / to / by
  let from = javascriptGenerator.valueToCode(block, 'FROM', javascriptGenerator.ORDER_NONE) || '0';
  let to   = javascriptGenerator.valueToCode(block, 'TO',   javascriptGenerator.ORDER_NONE) || '0';
  let by   = javascriptGenerator.valueToCode(block, 'BY',   javascriptGenerator.ORDER_NONE) || '1';

  const branch = javascriptGenerator.statementToCode(block, 'DO');

  from = from.trim(); to = to.trim(); by = by.trim();

  const isNum = /^-?\d+(\.\d+)?$/.test(by);
  const byNum = isNum ? Number(by) : NaN;

  // BY vacío o 1 -> i++
  if (!by || by === '' || byNum === 1 || by === '1') {
    return `for (${varName} = ${from}; ${varName} <= ${to}; ${varName}++) {\n${branch}}\n`;
  }
  // BY -1 -> i--
  if (byNum === -1 || by === '-1') {
    return `for (${varName} = ${from}; ${varName} >= ${to}; ${varName}--) {\n${branch}}\n`;
  }

  // Otros casos: generador original de Blockly
  return _origForGen ? _origForGen.call(this, block) : '';
};

export default function EditorBlockly({
  toolboxJson,
  onCode,
  allowedVars = ['x'],
  initialXml = '<xml></xml>',
}) {
  const toolbox = useMemo(() => {
    try { return typeof toolboxJson === 'string' ? JSON.parse(toolboxJson) : toolboxJson; }
    catch { return { kind: 'flyoutToolbox', contents: [] }; }
  }, [toolboxJson]);

  const lockRef = useRef(false);
  const initedRef = useRef(false);

  function enforceAllowedVariables(workspace, names) {
    if (!workspace || !Array.isArray(names) || names.length === 0) return;

    // 1) crear las permitidas si no existen
    const current = workspace.getAllVariables?.() || [];
    const byName = new Map(current.map(v => [v.name, v]));
    const ensured = {};
    for (const n of names) ensured[n] = byName.get(n) || workspace.createVariable(n);

    const allowedIds = new Set(Object.values(ensured).map(v => v.getId()));

    // 2) eliminar no permitidas
    for (const v of current) {
      if (!allowedIds.has(v.getId())) {
        try { workspace.deleteVariableById?.(v.getId()); } catch {}
      }
    }

    // 3) reasignar dropdowns VAR a una permitida (la primera por defecto)
    const defaultId = ensured[names[0]].getId();
    for (const b of workspace.getAllBlocks(false) || []) {
      const f = b.getField && b.getField('VAR');
      if (f && !allowedIds.has(f.getValue())) f.setValue(defaultId);
    }
  }

  function handleWorkspaceChange(workspace) {
    if (!workspace) return;

    // primera vez: aplicar enforcement
    if (!initedRef.current) {
      lockRef.current = true;
      enforceAllowedVariables(workspace, allowedVars);
      lockRef.current = false;
      initedRef.current = true;
    }

    // cada cambio: no dejar colar variables
    if (!lockRef.current) {
      lockRef.current = true;
      enforceAllowedVariables(workspace, allowedVars);
      lockRef.current = false;
    }

    // generar JS y métrica de bloques
    try {
      const code = javascriptGenerator.workspaceToCode(workspace) || '';
      const bloques = workspace.getAllBlocks(false).length || 0;
      onCode && onCode(code, { bloques });
    } catch (e) {
      console.error('Error generando JS desde Blockly:', e);
    }
  }

  return (
    <div style={{ height: '60vh', width: '100%' }}>
      <BlocklyWorkspace
        toolboxConfiguration={toolbox}
        className="blockly-container"
        onWorkspaceChange={handleWorkspaceChange}
        initialXml={initialXml}
      />
    </div>
  );
}
