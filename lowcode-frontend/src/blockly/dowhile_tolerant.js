// lowcode-frontend/src/blockly/dowhile_tolerant.js
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

/**
 * Bloque: do_while_root
 * Forma:  do { <acciones> } while (<condición>);
 */
Blockly.Blocks['do_while_root'] = {
  init: function () {
    this.setStyle('loop_blocks'); // color coherente con bucles
    this.appendDummyInput()
      .appendField('hacer');
    this.appendStatementInput('DO')
      .setCheck(null)
      .appendField('acciones');

    this.appendValueInput('COND')
      .setCheck('Boolean')
      .appendField('mientras');

    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Ejecuta las acciones y luego evalúa la condición; si es verdadera, repite.');
    this.setHelpUrl('https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/do...while');

    // Avisos tolerantes (no corta conexiones: solo advierte)
    this.setOnChange(() => {
      if (!this.workspace || this.isInFlyout) return;
      const cond = this.getInputTargetBlock('COND');
      if (!cond) {
        this.setWarningText('Falta la condición. Por defecto se usará "false" (se ejecuta una vez).');
      } else {
        this.setWarningText(null);
      }
    });
  }
};

// Generador JS
javascriptGenerator.forBlock['do_while_root'] = function (block) {
  const branch = javascriptGenerator.statementToCode(block, 'DO') || '';
  const cond = javascriptGenerator.valueToCode(block, 'COND', javascriptGenerator.ORDER_NONE) || 'false';
  // Asegura identación agradable
  const body = branch.replace(/^/gm, '  ');
  return `do {\n${body}} while (${cond});\n`;
};
