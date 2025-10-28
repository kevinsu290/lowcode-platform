// src/blockly/switchx_tolerant.js
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

/* ---------------------------
   text_print -> console.log(...)
   (no inyecta function print)
--------------------------- */
javascriptGenerator.forBlock['text_print'] = function (block) {
  const msg = javascriptGenerator.valueToCode(block, 'TEXT', javascriptGenerator.ORDER_NONE) || "''";
  return `console.log(${msg});\n`;
};

/* ---------------------------
   Helpers
--------------------------- */
function getMatchKeyFromBlock(matchBlock) {
  if (!matchBlock) return '__undefined__';
  try {
    switch (matchBlock.type) {
      case 'math_number':   return `num:${matchBlock.getFieldValue('NUM')}`;
      case 'text':          return `txt:${matchBlock.getFieldValue('TEXT')}`;
      case 'variables_get': return `var:${matchBlock.getFieldValue('VAR')}`;
      default:              return `node:${matchBlock.toString?.() || matchBlock.type}`;
    }
  } catch {
    return `node:${matchBlock?.type || 'unknown'}`;
  }
}

/** Solo cuenta como “línea del switch” si su padre envolvente es este switch_root */
function isDirectLineOfRoot(lineBlock, rootBlock) {
  if (!lineBlock || !rootBlock) return false;
  const parent = lineBlock.getSurroundParent && lineBlock.getSurroundParent();
  return parent === rootBlock;
}

/* ---------------------------
   switch_root
--------------------------- */
Blockly.Blocks['switch_root'] = {
  init: function () {
    this.setStyle('logic_blocks');
    this.appendDummyInput().appendField('switch');
    this.appendValueInput('EXPR').appendField('(').appendField('expresión').appendField(')');
    this.appendStatementInput('STACK').setCheck('SwitchLine').appendField('líneas');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('switch (expr) { case ...; default ... }');

    // Solo advertimos (no desconectamos). UX más tolerante.
    this.setOnChange(() => {
      if (!this.workspace || this.isInFlyout) return;

      let line = this.getInputTargetBlock('STACK');
      const seen = new Set();
      let defaultCount = 0;

      while (line) {
        if (!isDirectLineOfRoot(line, this)) {
          // Está anidado en otro bloque: se ignora en generación. Aviso sutil.
          line.setWarningText('Este bloque está anidado; solo las líneas directamente bajo el switch generan código.');
        } else {
          // Directo: sin warning
          line.setWarningText(null);

          if (line.type === 'switch_default_line') {
            defaultCount++;
          } else if (line.type === 'switch_case_line') {
            const key = getMatchKeyFromBlock(line.getInputTargetBlock('MATCH'));
            if (seen.has(key)) {
              line.setWarningText('Duplicado: ya existe un "case" con ese valor. Este no generará código.');
            } else {
              seen.add(key);
            }
          }
        }
        line = line.getNextBlock && line.getNextBlock();
      }

      // Si hay varios defaults, los extra (aunque visibles) no generarán código
      if (defaultCount > 1) {
        // Solo el primero sin warning; los demás con warning
        let count = 0;
        line = this.getInputTargetBlock('STACK');
        while (line) {
          if (isDirectLineOfRoot(line, this) && line.type === 'switch_default_line') {
            count++;
            if (count > 1) {
              line.setWarningText('Solo se utilizará el primer "default" (este no generará código).');
            }
          }
          line = line.getNextBlock && line.getNextBlock();
        }
      }
    });
  }
};

javascriptGenerator.forBlock['switch_root'] = function (block) {
  const expr = javascriptGenerator.valueToCode(block, 'EXPR', javascriptGenerator.ORDER_NONE) || 'undefined';
  let code = `switch (${expr}) {\n`;

  const seen = new Set();
  let defaultEmitted = false;

  let line = block.getInputTargetBlock('STACK');
  while (line) {
    // GENERAMOS SOLO si es línea directa del root
    if (isDirectLineOfRoot(line, block)) {
      if (line.type === 'switch_case_line') {
        const matchExpr = javascriptGenerator.valueToCode(line, 'MATCH', javascriptGenerator.ORDER_NONE) || 'undefined';
        const key = getMatchKeyFromBlock(line.getInputTargetBlock('MATCH'));
        if (!seen.has(key)) {
          seen.add(key);
          const body = javascriptGenerator.statementToCode(line, 'DO') || '';
          code += `  case ${matchExpr}:\n${body}    break;\n`;
        }
      } else if (line.type === 'switch_default_line') {
        if (!defaultEmitted) {
          const body = javascriptGenerator.statementToCode(line, 'DO') || '';
          code += `  default:\n${body}    break;\n`;
          defaultEmitted = true;
        }
      }
    }
    line = line.getNextBlock && line.getNextBlock();
  }

  code += `}\n`;
  return code;
};

/* ---------------------------
   case (línea con break auto)
--------------------------- */
Blockly.Blocks['switch_case_line'] = {
  init: function () {
    this.setStyle('logic_blocks');
    this.appendDummyInput().appendField('case');
    this.appendValueInput('MATCH').appendField('valor');
    this.appendDummyInput().appendField(':');
    this.appendStatementInput('DO').setCheck(null).appendField('acciones');

    this.setPreviousStatement(true, 'SwitchLine');
    this.setNextStatement(true, 'SwitchLine');
    this.setTooltip('Línea "case": case <valor>: <acciones>; break;');
  }
};
// ❗Sin generator propio: lo emite switch_root

/* ---------------------------
   default (línea con break auto)
--------------------------- */
Blockly.Blocks['switch_default_line'] = {
  init: function () {
    this.setStyle('logic_blocks');
    this.appendDummyInput().appendField('default:');
    this.appendStatementInput('DO').setCheck(null).appendField('acciones');

    this.setPreviousStatement(true, 'SwitchLine');
    this.setNextStatement(true, 'SwitchLine');
    this.setTooltip('Línea "default": default: <acciones>; break;');
  }
};
// ❗Sin generator propio: lo emite switch_root
