import './field_dropdown.js'
import './variables_mutator.js';
import './list_create.js';
import './blocks/colour.js';
import './blocks/lists.js';
import './blocks/logic.js';
import './blocks/loops.js';
import './blocks/math.js';
// import './blocks/procedures.js';
import './blocks/text.js';
import {createMinusField} from './field_minus';
import {createPlusField} from './field_plus';
import { icons } from './toolbox.js';

import { DarkTheme, LightTheme } from './themes.js';
const yaml = require('js-yaml');

function listVariables() {
  var res = [[Blockly.Msg['SELECT_VARIABLE'], '']];
  for (var i of allVariables) {
    res.push(i);
  }
  return res;
}

Blockly.Msg['CONSOLE_PRINTLN_TITLE'] = 'print'
Blockly.Msg['CONSOLE_PRINT_TITLE'] = 'write and stay in the same line'
Blockly.Msg['TEXT_REPLACE_REPLACE'] = 'replace';
Blockly.Msg['TEXT_REPLACE_WITH'] = 'with';
Blockly.Msg['TEXT_REPLACE_IN'] = 'in';
Blockly.Msg['TEXT_GET_SUBSTRING_FROM'] = 'get substring from';
Blockly.Msg['TEXT_GET_SUBSTRING_TO'] = 'to';
Blockly.Msg['TEXT_GET_SUBSTRING_END'] = 'end';
Blockly.Msg['TEXT_CONTAINS'] = 'contains';
Blockly.Msg['TEXT_STARTS_WITH'] = 'starts with';
Blockly.Msg['TEXT_ENDS_WITH'] = 'ends with';
Blockly.Msg['TEXT_CODE_POINT_AT'] = 'code of character';
Blockly.Msg['TEXT_CODE_POINT_AT_IN'] = 'in';
Blockly.Msg['TEXT_EQUALS_IGNORE_CASE_EQUALS_TO'] = 'equals to';
Blockly.Msg['TEXT_EQUALS_IGNORE_CASE_IGNORE_CASE'] = 'ignoring case';
Blockly.Msg['TEXT_MATCHES'] = 'matches regex';
Blockly.Msg['TEXT_INDEX_OF_FROM_INDEX'] = 'from index';
Blockly.Msg['TEXT_REVERSE'] = 'reverse';
Blockly.Msg['MATH_NEGATIVE_OF'] = 'negative of';
Blockly.Msg['MATH_RANDOM_RANDINT_0'] = 'random number from';
Blockly.Msg['MATH_RANDOM_RANDINT_1'] = 'to';
Blockly.Msg['MATH_RANDOM_RANDINT_TOOLTIP'] = 'returns a pesudorandom number between minimum and maximum values.';
Blockly.Msg['CREATE_CLASS'] = 'create class';
Blockly.Msg['CREATE_INSTANCE_OF'] = 'create new';
Blockly.Msg['CREATE_INSTANCE_WITH'] = 'with';
Blockly.Msg['CLASS_CALL_METHOD'] = 'call method';
Blockly.Msg['CLASS_CALL_METHOD_FROM'] = 'from instnace';
Blockly.Msg['CLASS_CALL_STATIC_METHOD'] = 'call static method';
Blockly.Msg['CLASS_CALL_STATIC_METHOD_FROM'] = 'from';
Blockly.Msg['CLASS_GET_PROPERTY'] = 'get property';
Blockly.Msg['CLASS_GET_PROPERTY_FROM'] = Blockly.Msg['CLASS_CALL_METHOD_FROM'];
Blockly.Msg['CLASS_GET_STATIC_PROPERTY'] = 'get static property';
Blockly.Msg['CLASS_GET_STATIC_PROPERTY_FROM'] = 'from class';
Blockly.Msg['CLASS_SET_PROPERTY'] = 'set property';
Blockly.Msg['CLASS_SET_PROPERTY_IN_INSTANCE'] = 'in';
Blockly.Msg['CLASS_SET_STATIC_PROPERTY'] = 'set static property';
Blockly.Msg['CLASS_SET_STATIC_PROPERTY_IN_INSTANCE'] = 'in class';
Blockly.Msg['CLASS_SET_PROPERTY_TO'] = Blockly.Msg['CLASS_SET_STATIC_PROPERTY_TO'] = Blockly.Msg['LISTS_APPEND_TO'] = 'to';
Blockly.Msg['LISTS_APPEND'] = 'append';
Blockly.Msg['LISTS_REVERSE'] = 'reverse';
Blockly.Msg['LISTS_SORT'] = 'sort';
Blockly.Msg['LISTS_SORT_NUMERIC'] = 'sort list';
Blockly.Msg['LISTS_SORT_NUMERIC_NUMERICALLY'] = 'numerically';
Blockly.Msg['LISTS_INSERT'] = 'insert';
Blockly.Msg['LISTS_INSERT_AT'] = 'at';
Blockly.Msg['LISTS_INSERT_OF'] = 'of';
Blockly.Msg['TEXT_INPUT'] = 'prompt for input';
Blockly.Msg['PROCEDURES_DEFRETURN_TITLE_STATIC_METHOD'] = 'define static method';
Blockly.Msg['CLASS_DECLARE_STATIC_PROPERTY'] = 'declare static property';
Blockly.Msg['MATH_LEFT_SHIFT'] = 'left shift';
Blockly.Msg['MATH_RIGHT_SHIFT'] = 'right shift';
Blockly.Msg['MATH_LEFT_SHIFT_WITH'] = 'with';
Blockly.Msg['LOGIC_BITWISE_NOT'] = 'bitwise not';
Blockly.Msg['MATH_DECREASE'] = 'decrease';
Blockly.Msg['MATH_INCREASE'] = 'increase';
Blockly.Msg['MATH_INCREASE_AND_GET_WHAT_IT_WAS'] = 'and get what it was'
Blockly.Msg['MATH_INCREASE_AND_GET'] = 'and get'
Blockly.Msg['LINKER_SET_RANDOM_WALLPAPER'] = 'set random image as wallpaper'


function addBlock(blockName, blockCategory, blockDefaultValues, blockFunctionName,
  blockFunctionParameters, paramTypes, functionCode, blockUI, tooltip, helpUrl, output, inline) {
  var element = document.createElement("block");
  element.setAttribute('type', blockName);
  document.getElementById(blockCategory + "Category").appendChild(element);
  element.innerHTML = blockDefaultValues;
  const blockFunctionName_ = blockFunctionName;
  if (blockFunctionName != undefined) {
    if (typeof blockFunctionName == 'string' && blockFunctionName.includes('.')) blockFunctionName = '#C' + blockFunctionName.replace('.', '#')
    var functionNameInBackend = blockFunctionName + ":";
    for (var tmp of blockFunctionParameters) {
      functionNameInBackend += "," + tmp;
    }
    functions[functionNameInBackend] = blockName;
  } else return;
  Blockly.Blocks[blockName] = {
    init: function() {
      if (inline) {
        this.setInputsInline(true);
      }
      this.setTooltip(tooltip);
      this.setHelpUrl(helpUrl);
      var i = 0;
      var blockToAddField;
      for (var tmp of blockUI) {
        if (tmp === null) {
          if (paramTypes[i]) {
            blockToAddField = this.appendValueInput("ARG" + i);
            blockToAddField.setCheck(null);
          } else {
            blockToAddField = this.appendStatementInput("ARG" + i);
            blockToAddField.setCheck(null);
          }
          i++;
        } else if (typeof tmp == 'string') {
          if (!blockToAddField) blockToAddField = this.appendDummyInput();
          blockToAddField.appendField(tmp);
        } else if (tmp instanceof Array) {
          if (!blockToAddField) blockToAddField = this.appendDummyInput();
          blockToAddField.appendField(new Blockly.FieldDropdown(tmp), "ARG" + i);
          i++;
        } else if (typeof tmp == 'function') {
          tmp(this, blockToAddField);
        } else if (tmp === undefined) {
          blockToAddField = undefined;
        }
      }
      if (output) {
        if (output == 'parent') {
          // do nothing
        } else if (typeof output == 'string') {
          this.setOutput(true, output);
        } else {
          this.setOutput(true, null);
        }
      } else if (output != "parent") {
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
      }
      if (DarkTheme.blockStyles[blockCategory.toLowerCase() + '_blocks'] != undefined) this.setStyle(blockCategory.toLowerCase() + '_blocks');
      else this.setColour(document.getElementById(blockCategory + "Category").getAttribute('colour'));
    }
  };
  if (typeof blockFunctionName == "function") {
    Blockly.genCode[blockName] = blockFunctionName;
  } else {
    Blockly.genCode.addReservedWords(blockFunctionName);
    Blockly.genCode[blockName] = function(block) {
      var code = blockFunctionName_ + "(";
      for (var i = 0; i < paramTypes.length; i++) {
        if (paramTypes[i])
          code += Blockly.genCode.valueToCode(block, 'ARG' + i, Blockly.genCode.ORDER_ATOMIC);
        else
          code += "() -> {\n" + Blockly.genCode.statementToCode(block, 'ARG' + i) + "}";
        if (i != paramTypes.length - 1) code += ', ';
      }
      if (output && output != 'parent') return [code + ')', Blockly.genCode.ORDER_FUNCTION_CALL];
      else return code + ')\n';
    };
    functionCodes += '\n' + functionCode;
  }
}

function addLabel(labelContent, category, style) {
  var element = document.createElement("label");
  element.setAttribute('text', labelContent);
  if (style) {
    element.setAttribute('web-class', style);
  }
  document.getElementById(category + "Category").appendChild(element);
}

function addCategory(name, text, color) {
  if (Blockly.Msg["CATEGORY_" + name.toUpperCase()] == null) {
    Blockly.Msg["CATEGORY_" + name.toUpperCase()] = text;
  }
  var element = document.createElement("category");
  element.setAttribute('id', name + "Category");
  element.setAttribute('name', "%{BKY_CATEGORY_" + name.toUpperCase() + "}");
  Blockly.Msg[name.toUpperCase() + "_CATEGORY_COLOR"] = color
  element.setAttribute('colour', "%{BKY_" + name.toUpperCase() + "_CATEGORY_COLOR}");
  document.getElementById("toolbox").appendChild(element);
  color = color.replace('#', '')
  DarkTheme.blockStyles[name.toLowerCase() + "_blocks"] = {
    'colourPrimary': color,
    'colourSecondary': lighter(color),
    'colourTertiary': darker(color),
  }
  LightTheme.blockStyles[name.toLowerCase() + "_blocks"] = {
    'colourPrimary': color,
    'colourSecondary': lighter(color),
    'colourTertiary': darker(color),
  }
}

function putValue(value) {
  if (typeof value == 'number') {
    return '<shadow type="math_number"><field name="NUM">' + value + '</field></shadow>';
  } else if (typeof value == 'string') {
    return '<shadow type="text"><field name="TEXT">' + value + '</field></shadow>';
  } else if (typeof value == 'boolean') {
    return '<shadow type="logic_boolean"><field name="BOOL">' + (value? "TRUE":"FALSE") + '</field></shadow>';
  } else if (value == null) {
    return '<shadow type="logic_null"></shadow>';
  }
}

function createShadows(values) {
  var out = "";
  var counter = 0;
  for (var i of values) {
    if (typeof i == 'number') {
      out += '<value name="ARG' + counter++ + '"><shadow type="math_number"><field name="NUM">' + i + '</field></shadow></value>';
    } else if (typeof i == 'string') {
      out += '<value name="ARG' + counter++ + '"><shadow type="text"><field name="TEXT">' + i + '</field></shadow></value>';
    } else if (typeof i == 'boolean') {
      out += '<value name="ARG' + counter++ + '"><shadow type="logic_boolean"><field name="BOOL">' + (i? "TRUE":"FALSE") + '</field></shadow></value>';
    } else if (i === null) {
      out += '<value name="ARG' + counter++ + '"><shadow type="logic_null"></shadow></value>';
    } else if (typeof i == 'object' && i instanceof Array) {
      out += '<value name="ARG' + counter++ + '"><shadow type="lists_create_with"><mutation items="' + i.length + '"></mutation>';
      var c = 0;
      for (var j of i) {
        out += '<value name="ADD' + c++ + '">' + putValue(j) + "</value>";
      }
      out += '</shadow></value>';
    } else {
      counter++;
    }
  }
  return out;
}

var callBackCounter = 0;
var clickListeners = []

function addButton(category, text, onClick) {
  var element = document.createElement("button");
  let num = ''
  while (Blockly.Msg['BUTTON_' + text.replace(' ', '_').toUpperCase() + num]) {
    if (typeof num == 'string') {
      num = 0
    } else {
      num++
    }
  }
  Blockly.Msg['BUTTON_' + text.replace(' ', '_').toUpperCase() + num] = text
  element.setAttribute('text', '%{BKY_BUTTON_' + text.replace(' ', '_').toUpperCase() + num + '}');
  element.setAttribute('callbackKey', 'callback' + (++callBackCounter));
  document.getElementById(category + "Category").appendChild(element);
  clickListeners.push(workspace => workspace.registerButtonCallback('callback' + callBackCounter, onClick))
}

function lighter(colorCode) {
  colorCode = colorCode.toUpperCase()
  var res = ''
  for (var i of colorCode) {
    var code = i.codePointAt(0) + 1
    if (code > 70) code = 70
    res += String.fromCharCode(code)
  }
  return res.replaceAll(':', 'A')
}

function darker(colorCode) {
  colorCode = colorCode.toUpperCase()
  var res = ''
  for (var i of colorCode) {
    var code = i.codePointAt(0) - 1
    if (code < 48) code = 48
    res += String.fromCharCode(code)
  }
  return res.replaceAll('@', 'A')
}

function createBlocksFromYAML(yml) {
  let parsed = yaml.load(yml)
  for (var i of Object.keys(parsed)) {
    if (parsed[i]['color'] && parsed[i]['icon'] && parsed[i]['blocks']) {
      let categoryName = i.replace(' ', '_').toLowerCase();
      icons[categoryName] = parsed[i]['icon']
      addCategory(categoryName, i, '#' + parsed[i]['color'])
      for (var j of parsed[i]['blocks']) {
        var messages = []
        for (var k of j[Object.keys(j)[0]]['messages']) {
          if (typeof k == 'string') messages.push(Blockly.Msg[(categoryName + '_' + Object.keys(j)[0] + '_' + k.replace(' ', '_')).toUpperCase()] = k)
          else messages.push(k)
          messages.push(null)
        }
        messages.pop()
        addBlock(categoryName + '_' + Object.keys(j)[0], categoryName, j[Object.keys(j)[0]]['shadows']? createShadows(j[Object.keys(j)[0]]['shadows']):'', j[Object.keys(j)[0]]['function'],
          Object.keys(j[Object.keys(j)[0]]['args']), j[Object.keys(j)[0]]['args']? Object.values(j[Object.keys(j)[0]]['args']).map(k => k == 'value'):[],
          j[Object.keys(j)[0]]['code']? j[Object.keys(j)[0]]['code']:'', messages, j[Object.keys(j)[0]]['tooltip']? j[Object.keys(j)[0]]['tooltip']:'', j[Object.keys(j)[0]]['helpUrl']? j[Object.keys(j)[0]]['helpUrl']:'',
          j[Object.keys(j)[0]]['hasReturn']? j[Object.keys(j)[0]]['hasReturn']:false, true
          );
        }
    }
  }
}

function initBlocks() {
  // addBlock("math_arithmetic", "Math", `<field name="OP">ADD</field>
  // <value name="A">
    // <shadow type="math_number">
      // <field name="NUM">1</field>
    // </shadow>
  // </value>
  // <value name="B">
    // <shadow type="math_number">
      // <field name="NUM">1</field>
    // </shadow>
  // </value>`);

  // addBlock("test", "Math", createShadows(["10"]), "test", ['v', 'f'], [true, false],
  //   `func test(v, f) {
  //     print v
  //     print "\\n"
  //     f!()
  //   }`, ['text 1', null, undefined, "text 2", null, function(block) { //image field
  //     block.appendDummyInput().appendField(new Blockly.FieldImage("https://www.gstatic.com/codesite/ph/images/star_on.gif", 15, 15, { alt: "*", flipRtl: "FALSE" }));
  //   }], 'tooltip', 'helpUrl'
  // );
  //
  // addBlock("negate", "Math", createShadows([1]), function(block) {
  //   var data = Blockly.genCode.valueToCode(block, 'ARG0',
  //       Blockly.genCode.ORDER_NONE) || 'null';
  //   return ['-' + data, Blockly.genCode.ORDER_UNARY_SIGN];
  // }, [null], [true],
  //   '', [null, '-'], 'tooltip', 'helpUrl', true);
  //
  // addBlock("test", "Math", createShadows(["10"]), "test", ['v', 'f'], [true, false],
  //   `func test(v, f) {
  //     print v
  //     print "\\n"
  //     f!()
  //   }`, ['text 1', null, undefined, "text 2", null, function(block) { //image field
  //     block.appendDummyInput().appendField(new Blockly.FieldImage("https://www.gstatic.com/codesite/ph/images/star_on.gif", 15, 15, { alt: "*", flipRtl: "FALSE" }));
  //   }], 'tooltip', 'helpUrl', true);
  addBlock("math_random_int", "Math", createShadows([1, 10]), "random", ['a', 'b'], [true, true],
    `import 'random'`, [Blockly.Msg['MATH_RANDOM_RANDINT_0'], null, undefined, Blockly.Msg['MATH_RANDOM_RANDINT_1'], null], Blockly.Msg['MATH_RANDOM_RANDINT_TOOLTIP'], Blockly.Msg['MATH_RANDOM_RANDINT_HELPURL'], "Number");

  addBlock("math_negative", "Math", createShadows([1]), function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_UNARY_SIGN) || '0';
    return ['-' + data, Blockly.genCode.ORDER_UNARY_SIGN];
  }, [], [true], '', [Blockly.Msg['MATH_NEGATIVE_OF'], null], Blockly.Msg['MATH_RANDOM_RANDINT_TOOLTIP'], Blockly.Msg['MATH_RANDOM_RANDINT_HELPURL'], true, true);

  addLabel("Advanced", "Math", "smaller-title");
  
  addBlock("math_shift", "Math", createShadows([8, undefined, 1]), function(block) {
    let side = block.getFieldValue('ARG1');
    let data = Blockly.genCode.valueToCode(block, 'ARG2',
        Blockly.genCode.ORDER_NONE) || '0';
    let data1 = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || '0';
    return [data1 + (side == 'LEFT'? ' << ':' >> ') + data, Blockly.genCode.ORDER_BITWISE_SHIFT];
  }, [], [true, true, true], '', [null, [[Blockly.Msg['MATH_LEFT_SHIFT'], 'LEFT'], [Blockly.Msg['MATH_RIGHT_SHIFT'], 'RIGHT']], null, Blockly.Msg['MATH_LEFT_SHIFT_WITH']], Blockly.Msg['MATH_LEFT_SHIFT_TOOLTIP'], Blockly.Msg['MATH_LEFT_SHIFT_HELPURL'], true, true);

  addBlock("math_increase", "Math", '', function(block) {
    let side = block.getFieldValue('ARG1');
    let data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || '0';
    return [data + side, Blockly.genCode.ORDER_ATOMIC];
  }, [], [true, true], '', [null, [[Blockly.Msg['MATH_INCREASE'], '++'], [Blockly.Msg['MATH_DECREASE'], '--']], Blockly.Msg['MATH_INCREASE_AND_GET_WHAT_IT_WAS']], Blockly.Msg['MATH_INCREASE_TOOLTIP'], Blockly.Msg['MATH_INCREASE_HELPURL'], true, true);

  addBlock("math_increase_prefix", "Math", '', function(block) {
    let side = block.getFieldValue('ARG1');
    let data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || '0';
    return [data + side, Blockly.genCode.ORDER_ATOMIC];
  }, [], [true, true], '', [null, [[Blockly.Msg['MATH_INCREASE'], '++'], [Blockly.Msg['MATH_DECREASE'], '--']], Blockly.Msg['MATH_INCREASE_AND_GET']], Blockly.Msg['MATH_INCREASE_TOOLTIP'], Blockly.Msg['MATH_INCREASE_HELPURL'], true, true);

  addLabel("Statements", "Logic", "smaller-title");

  addBlock("logic_if", "Logic", '', function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || 'true';
    var code = Blockly.genCode.statementToCode(block, 'ARG1',
        Blockly.genCode.ORDER_NONE) || '';
    code = 'if ' + data + ' {\n' + code + '}';
    if (block.getNextBlock() == null || (block.getNextBlock().type != "logic_if"
      && block.getNextBlock().type != "logic_elseif"
      && block.getNextBlock().type != "logic_else")) {
      code += '\n';
    }
    return code;
  }, [], [true, false],'', [null, Blockly.Msg['CONTROLS_IF_MSG_IF'], function(self, blockToAddField) {
    blockToAddField.setCheck(["Number", "Boolean"]);
  }, null,Blockly.Msg['CONTROLS_IF_MSG_THEN']], Blockly.Msg['CONTROLS_IF_TOOLTIP'],
    Blockly.Msg['CONTROLS_IF_HELPURL']
  );

  addBlock("logic_elseif", "Logic", '', function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || 'true';
    var code = Blockly.genCode.statementToCode(block, 'ARG1',
        Blockly.genCode.ORDER_NONE) || '';
    if (block.getPreviousBlock() == null || block.getPreviousBlock().type != "logic_if") {
      throw 'else if only can attach to if block';
    }
    code = ' else if ' + data + ' {\n' + code + '}';
    if (block.getNextBlock() == null || block.getNextBlock().type != "logic_else") {
      code += '\n';
    }
    return code;
  }, [], [true, false],'', [null, Blockly.Msg['CONTROLS_IF_MSG_ELSEIF'], function(self, blockToAddField) {
    blockToAddField.setCheck(["Number", "Boolean"]);
  }, null,Blockly.Msg['CONTROLS_IF_MSG_THEN']], Blockly.Msg['CONTROLS_ELSE_IF_TOOLTIP'] || Blockly.Msg['CONTROLS_IF_TOOLTIP'],
    Blockly.Msg['CONTROLS_ELSE_IF_HELPURL'] || Blockly.Msg['CONTROLS_IF_HELPURL']
  );

  addBlock("logic_else", "Logic", '', function(block) {
    var code = Blockly.genCode.statementToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || '';
        if (block.getPreviousBlock() == null || (block.getPreviousBlock().type != "logic_if" && block.getPreviousBlock().type != "logic_elseif")) {
          throw 'else only can attach to if or else if block';
        }
    return ' else {\n' + code + '}\n';
  }, [], [false],'', [Blockly.Msg['CONTROLS_IF_MSG_ELSE'], null, Blockly.Msg['CONTROLS_IF_MSG_THEN']],
    Blockly.Msg['CONTROLS_ELSE_TOOLTIP'] || Blockly.Msg['CONTROLS_IF_TOOLTIP'],
    Blockly.Msg['CONTROLS_ELSE_HELPURL'] || Blockly.Msg['CONTROLS_IF_HELPURL']
  );

  addLabel("Advanced", "Logic", "smaller-title");

  addBlock("logic_bitwise_not", "Logic", createShadows([1]), function(block) {
    let data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || '1';
    return ['~' + data, Blockly.genCode.ORDER_BITWISE_NOT];
  }, [], [true], '', [null, Blockly.Msg['LOGIC_BITWISE_NOT']], Blockly.Msg['LOGIC_BITWISE_NOT_TOOLTIP'], Blockly.Msg['LOGIC_BITWISE_NOT_HELPURL'], true, true);

  addBlock("logic_operation_advanced", "Logic", createShadows([true, true]), function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || 'false';
    var data1 = Blockly.genCode.valueToCode(block, 'ARG1',
        Blockly.genCode.ORDER_NONE) || 'true';
    var OPERATORS = {
      'OR': '|',
      'AND': '&'
    };
    return [data + ' ' + OPERATORS[block.getFieldValue('OP')] + ' ' + data1, Blockly.genCode.ORDER_ATOMIC];
  }, [], [true, true], '', [null, function(self, blockToAddField) {self.appendDummyInput().appendField(new Blockly.FieldDropdown([
      ['|', 'OR'],
      ['&', 'AND']
  ]), 'OP');}, null], Blockly.Msg['LOGIC_OPERATION_ADVANCED_TOOLTIP'], Blockly.Msg['LOGIC_OPERATION_ADVANCED_HELPURL'], 'Boolean');


  addBlock("loops_while", "Loops", '', function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || 'false';
    var code = Blockly.genCode.statementToCode(block, 'ARG1',
        Blockly.genCode.ORDER_NONE) || '';
    return 'while ' + data + ' {\n' + code + '}\n';
  }, [], [true, false],'', [null, Blockly.Msg['CONTROLS_WHILEUNTIL_OPERATOR_WHILE'], function(self, blockToAddField) {
    blockToAddField.setCheck(["Number", "Boolean"]);
  }, null, Blockly.Msg['CONTROLS_WHILEUNTIL_INPUT_DO']], Blockly.Msg['CONTROLS_WHILEUNTIL_TOOLTIP_WHILE'],
    Blockly.Msg['CONTROLS_WHILEUNTIL_HELPURL'], false, undefined, 'loop_blocks'
  );

  addBlock("control_break", "Loops");
  addBlock("control_continue", "Loops");
  addLabel("On Start", "Loops", "smaller-title");
  addBlock("main_entry", "Loops");

  addBlock("text_length", "Text", '<value name="VALUE"><shadow type="text"><field name="TEXT">abc</field></shadow></value>');

  addBlock("text_replace", "Text", createShadows(['Hello', 'H', 'h']), function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || "'text'";
    var data1 = Blockly.genCode.valueToCode(block, 'ARG1',
        Blockly.genCode.ORDER_NONE) || "'text'";
    var data2 = Blockly.genCode.valueToCode(block, 'ARG2',
        Blockly.genCode.ORDER_NONE) || "'text'";
    return [data2 + '.replace(' + data + ', ' + data1 + ')', Blockly.genCode.ORDER_ATOMIC];
  }, [], [true, true, true], '', [null, Blockly.Msg['TEXT_REPLACE_REPLACE'], null, Blockly.Msg['TEXT_REPLACE_WITH'], null, Blockly.Msg['TEXT_REPLACE_IN']], Blockly.Msg['TEXT_REPLACE_TOOLTIP'], Blockly.Msg['TEXT_REPLACE_HELPURL'], true, true);

  addBlock("text_codePointAt", "Text", createShadows([0, '*']), function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || "'text'";
    var data1 = Blockly.genCode.valueToCode(block, 'ARG1',
        Blockly.genCode.ORDER_NONE) || "'text'";
    var data2 = Blockly.genCode.valueToCode(block, 'ARG2',
        Blockly.genCode.ORDER_NONE) || "'text'";
    return [data1 + '.codePointAt(' + data + ')', Blockly.genCode.ORDER_ATOMIC];
  }, [], [true, true], '', [null, Blockly.Msg['TEXT_CODE_POINT_AT'], null, Blockly.Msg['TEXT_CODE_POINT_AT_IN']], Blockly.Msg['TEXT_CODE_POINT_AT_TOOLTIP'], Blockly.Msg['TEXT_CODE_POINT_AT_HELPURL'], true, true);

  addBlock("text_substring", "Text", createShadows(['abc', 1, 3]), function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || "'text'";
    var data1 = Blockly.genCode.valueToCode(block, 'ARG1',
        Blockly.genCode.ORDER_NONE) || "0";
    var data2 = Blockly.genCode.valueToCode(block, 'ARG2',
        Blockly.genCode.ORDER_NONE) || "0";
    return [data + '.substring(' + data1 + ', ' + data2 + ')', Blockly.genCode.ORDER_ATOMIC];
  }, [], [true, true, true], '', [null, Blockly.Msg['TEXT_GET_SUBSTRING_INPUT_IN_TEXT'], null, Blockly.Msg['TEXT_GET_SUBSTRING_FROM'], null, Blockly.Msg['TEXT_GET_SUBSTRING_TO']], Blockly.Msg['TEXT_GET_SUBSTRING_TOOLTIP'], Blockly.Msg['TEXT_GET_SUBSTRING_HELPURL'], true, true);

  addBlock("text_substring1", "Text", createShadows(['abc', 1, 3]), function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || "'text'";
    var data1 = Blockly.genCode.valueToCode(block, 'ARG1',
        Blockly.genCode.ORDER_NONE) || "'text'";
    return [data + '.substring(' + data1 + ')', Blockly.genCode.ORDER_ATOMIC];
  }, [], [true, true], '', [null, Blockly.Msg['TEXT_GET_SUBSTRING_INPUT_IN_TEXT'], null, Blockly.Msg['TEXT_GET_SUBSTRING_FROM'], undefined, Blockly.Msg['TEXT_GET_SUBSTRING_TO'], undefined, Blockly.Msg['TEXT_GET_SUBSTRING_END']], Blockly.Msg['TEXT_GET_SUBSTRING_TOOLTIP'], Blockly.Msg['TEXT_GET_SUBSTRING_HELPURL'], true, true);

  addBlock("text_indexOf", "Text");

  addBlock("text_reverse", "Text", createShadows(['abc']), function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || "'text'";
    return [data + '.reverse()', Blockly.genCode.ORDER_ATOMIC];
  }, [], [true], '', [null, Blockly.Msg['TEXT_REVERSE']], Blockly.Msg['TEXT_REVERSE_TOOLTIP'], Blockly.Msg['TEXT_REVERSE_HELPURL'], true, true);

  addBlock("text_contains", "Text", createShadows(['abc', 'a']), function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || "'text'";
    var data1 = Blockly.genCode.valueToCode(block, 'ARG1',
        Blockly.genCode.ORDER_NONE) || "'text'";
    return [data + '.contains(' + data1 + ')', Blockly.genCode.ORDER_ATOMIC];
  }, [], [true, true], '', [null, null, Blockly.Msg['TEXT_CONTAINS']], Blockly.Msg['TEXT_CONTAINS_TOOLTIP'], Blockly.Msg['TEXT_CONTAINS_HELPURL'], "Boolean", true);

  addBlock("text_equalsIgnoreCase", "Text", createShadows(['abc', 'ABC']), function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || "'text'";
    var data1 = Blockly.genCode.valueToCode(block, 'ARG1',
        Blockly.genCode.ORDER_NONE) || "'text'";
    var data2 = Blockly.genCode.valueToCode(block, 'ARG2',
        Blockly.genCode.ORDER_NONE) || "'text'";
    return [data1 + '.equalsIgnoreCase(' + data + ')', Blockly.genCode.ORDER_ATOMIC];
  }, [], [true, true], '', [null, undefined, Blockly.Msg['TEXT_EQUALS_IGNORE_CASE_EQUALS_TO'], null, undefined, Blockly.Msg['TEXT_EQUALS_IGNORE_CASE_IGNORE_CASE']], Blockly.Msg['TEXT_EQUALS_IGNORE_CASE_TOOLTIP'], Blockly.Msg['TEXT_EQUALS_IGNORE_CASE_HELPURL'], "Boolean", true);

  addBlock("text_isEmpty", "Text", '<shadow type="text"><field name="TEXT"></field></shadow>');

  addBlock("text_matches", "Text", createShadows(['123', '\\\\d+']), function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || "'text'";
    var data1 = Blockly.genCode.valueToCode(block, 'ARG1',
        Blockly.genCode.ORDER_NONE) || "'text'";
    return [data + '.matches(' + data1 + ')', Blockly.genCode.ORDER_ATOMIC];
  }, [], [true, true], '', [null, null, Blockly.Msg['TEXT_MATCHES']], Blockly.Msg['TEXT_MATCHES_TOOLTIP'], Blockly.Msg['TEXT_MATCHES_HELPURL'], "Boolean", true);

  addBlock("text_startsWith", "Text", createShadows(['abc', 'a']), function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || "'text'";
    var data1 = Blockly.genCode.valueToCode(block, 'ARG1',
        Blockly.genCode.ORDER_NONE) || "'text'";
    return [data + '.startsWith(' + data1 + ')', Blockly.genCode.ORDER_ATOMIC];
  }, [], [true, true], '', [null, null, Blockly.Msg['TEXT_STARTS_WITH']], Blockly.Msg['TEXT_STARTS_WITH_TOOLTIP'], Blockly.Msg['TEXT_STARTS_WITH_HELPURL'], "Boolean", true);

  addBlock("text_endsWith", "Text", createShadows(['abc', 'c']), function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || "'text'";
    var data1 = Blockly.genCode.valueToCode(block, 'ARG1',
        Blockly.genCode.ORDER_NONE) || "'text'";
    return [data + '.endsWith(' + data1 + ')', Blockly.genCode.ORDER_ATOMIC];
  }, [], [true, true], '', [null, null, Blockly.Msg['TEXT_ENDS_WITH']], Blockly.Msg['TEXT_ENDS_WITH_TOOLTIP'], Blockly.Msg['TEXT_ENDS_WITH_HELPURL'], "Boolean", true);

  addBlock("logic_compare_advanced", "Logic", createShadows(['10', 10]), function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || 'false';
    var data1 = Blockly.genCode.valueToCode(block, 'ARG1',
        Blockly.genCode.ORDER_NONE) || 'true';
    var OPERATORS = {
      'EQ': '=?',
      'NEQ': '!=?'
    };
    return [data + ' ' + OPERATORS[block.getFieldValue('OP')] + ' ' + data1, Blockly.genCode.ORDER_ATOMIC];
  }, [], [true, true], '', [null, function(self, blockToAddField) {self.appendDummyInput().appendField(new Blockly.FieldDropdown([
      ['=?', 'EQ'],
      ['!=?', 'NEQ']
  ]), 'OP');}, null], Blockly.Msg['LOGIC_COMPARE_ADVANCED_TOOLTIP'], Blockly.Msg['LOGIC_COMPARE_ADVANCED_HELPURL'], 'Boolean');

  addCategory("Class", "Classes", "#BD488E");
  addCategory("Console", "Console", "3344dd");
  addBlock("text_println", "Console", createShadows(['abc']).replace('ARG0', 'TEXT'))
  addBlock("text_input", "Console", createShadows([1, 10]), "input", [], [], '',
  [Blockly.Msg['TEXT_INPUT']], Blockly.Msg['TEXT_INPUT_TOOLTIP'], Blockly.Msg['TEXT_INPUT_HELPURL'], "Text");
  addLabel("Advanced", "Console", "smaller-title");
  addBlock("text_print", "Console", createShadows(['abc']).replace('ARG0', 'TEXT'))

  addBlock("create_class", "Class", "", function(block) {
    var code = Blockly.genCode.statementToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || '\n';
    return 'class ' + (block.getFieldValue('NAME') || 'unnamed') + ' {\n' + code + '}';
  }, [], [false], '', [function(block) {
    block.appendDummyInput().appendField(Blockly.Msg['CREATE_CLASS']).appendField(new Blockly.FieldTextInput(), "NAME");
  }, null], Blockly.Msg['LOGIC_COMPARE_ADVANCED_TOOLTIP'], Blockly.Msg['LOGIC_COMPARE_ADVANCED_HELPURL'], 'parent');

  // addBlock("procedures_defnoreturn_method", "Class");
  addBlock("procedures_defreturn_method", "Class");
  addBlock("procedures_defreturn_static_method", "Class");
  addBlock("create_instance", "Class");
  addBlock("class_get_property", "Class");
  addBlock("class_set_property", "Class");
  addBlock("class_call_method", "Class");
  addBlock("class_call_method_statement", "Class");
  addBlock("class_call_static_method", "Class");
  addBlock("class_call_static_method_statement", "Class");
  addBlock("class_declare_static_property", "Class");
  addBlock("class_get_static_property", "Class");
  addBlock("class_set_static_property", "Class");

    const textIndexOfMutator = {
      suppressPrefixSuffix: true,
      hasFromIndex: false,
      mutationToDom: function() {
        if (!this.hasFromIndex) {
          return null;
        }
        const container = Blockly.utils.xml.createElement('mutation');
        if (this.hasFromIndex) {
          container.setAttribute('hasFromIndex', 1);
        }
        return container;
      },

      domToMutation: function(xmlElement) {
        this.hasFromIndex = !!parseInt(xmlElement.getAttribute('hasFromIndex')) || 0;
        this.updateShape_();
      },

      updateShape_: function() {
        if (this.hasFromIndex) this.appendValue();
      },
      plus: function() {
        if (this.hasFromIndex) return;
        this.appendValue();
      },
      minus: function(index) {
        this.removeValue(index);
      },
      appendValue: function() {
        this.hasFromIndex = true;
        this.removeInput('DUM1');
        this.appendValueInput('INDEX').setCheck(null).appendField(Blockly.Msg['TEXT_INDEX_OF_FROM_INDEX']);
        this.appendDummyInput('DUM').appendField(
                createMinusField(), 'MINUS');
      },

      removeValue: function(opt_index) {
        this.hasFromIndex = false;
        this.removeInput('INDEX');
        this.removeInput('DUM');
        this.appendDummyInput('DUM1').appendField(createPlusField(), 'PLUS');
      },
    };

    const textIndexOfMutatorHelper = function() {
      this.appendDummyInput('DUM1').appendField(createPlusField(), 'PLUS');
    };

  Blockly.Extensions.registerMutator('text_indexOf_mutator',
      textIndexOfMutator, textIndexOfMutatorHelper);

  const creaeteInstanceMutator = {
    itemCount_: 0,
    mutationToDom: function() {
      const container = Blockly.utils.xml.createElement('mutation');
      container.setAttribute('items', this.itemCount_);
      return container;
    },
    domToMutation: function(xmlElement) {
      const targetCount = parseInt(xmlElement.getAttribute('items'), 10);
      this.updateShape_(targetCount);
    },
    updateShape_: function(targetCount) {
      while (this.itemCount_ < targetCount) {
        this.addPart_();
      }
      while (this.itemCount_ > targetCount) {
        this.removePart_();
      }
    },
    plus: function() {
      this.addPart_();
    },
    minus: function() {
      if (this.itemCount_ == 0) {
        return;
      }
      this.removePart_();
    },
    addPart_: function() {
      this.topInput_ = this.appendValueInput('ARG' + this.itemCount_);
      this.itemCount_++;
      this.updatePlusMinus();
    },
    removePart_: function() {
      this.itemCount_--;
      this.removeInput('ARG' + this.itemCount_);
      this.updatePlusMinus();
    },
    updatePlusMinus: function() {
      if (this.getInput("WITH_DUM") != null) this.removeInput("WITH_DUM");
      if (this.getInput("DUM") != null) this.removeInput("DUM");
      var tmp = this.appendDummyInput("DUM");
      if (this.itemCount_ != 0) {
        this.appendDummyInput("WITH_DUM").appendField(Blockly.Msg['CREATE_INSTANCE_WITH']);
        try {
          this.moveInputBefore('WITH_DUM', 'ARG0');
        } catch (e) {}
        tmp.appendField(createMinusField(), 'MINUS');
      }
      tmp.appendField(createPlusField(), 'PLUS');
    }
  };
  const createInstanceHelper = function() {
    this.updateShape_(0);
    this.updatePlusMinus();
  };

  Blockly.Extensions.registerMutator('create_instance_mutator',
      creaeteInstanceMutator, createInstanceHelper);

  Blockly.defineBlocksWithJsonArray([
    {
      "type": "create_instance",
      "message0": "%{BKY_CREATE_INSTANCE_OF} %1",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME"
        }
      ],
      "output": null,
      "style": "class_blocks",
      "helpUrl": "%{BKY_CLASS_CREATE_INSTANCE_HELPURL}",
      "tooltip": "%{BKY_CLASS_CREATE_INSTANCE_TOOLTIP}",
      "mutator": "create_instance_mutator",
      "inputsInline": true,
      "extensions": [
        "parent_tooltip_when_inline"
      ]
    }, {
      "type": "class_call_method",
      "message0": "%{BKY_CLASS_CALL_METHOD} %1 %{BKY_CLASS_CALL_METHOD_FROM} %2",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME"
        }, {
          "type": "input_value",
          "name": "INSTANCE"
        }
      ],
      "output": null,
      "style": "class_blocks",
      "helpUrl": "%{BKY_CLASS_CALL_METHOD_HELPURL}",
      "tooltip": "%{BKY_CLASS_CALL_METHOD_TOOLTIP}",
      "mutator": "create_instance_mutator",
      "inputsInline": true,
      "extensions": [
        "parent_tooltip_when_inline"
      ]
    }, {
      "type": "class_call_static_method",
      "message0": "%{BKY_CLASS_CALL_STATIC_METHOD} %1 %{BKY_CLASS_CALL_STATIC_METHOD_FROM} %2",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME"
        }, {
          "type": "field_input",
          "name": "CLASS"
        }
      ],
      "output": null,
      "style": "class_blocks",
      "helpUrl": "%{BKY_CLASS_CALL_METHOD_HELPURL}",
      "tooltip": "%{BKY_CLASS_CALL_METHOD_TOOLTIP}",
      "mutator": "create_instance_mutator",
      "inputsInline": true,
      "extensions": [
        "parent_tooltip_when_inline"
      ]
    }, {
      "type": "class_call_static_method_statement",
      "message0": "%{BKY_CLASS_CALL_STATIC_METHOD} %1 %{BKY_CLASS_CALL_STATIC_METHOD_FROM} %2",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME"
        }, {
          "type": "field_input",
          "name": "CLASS"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": "class_blocks",
      "helpUrl": "%{BKY_CLASS_CALL_METHOD_HELPURL}",
      "tooltip": "%{BKY_CLASS_CALL_METHOD_TOOLTIP}",
      "mutator": "create_instance_mutator",
      "inputsInline": true,
      "extensions": [
        "parent_tooltip_when_inline"
      ]
    }, {
      "type": "class_get_property",
      "message0": "%{BKY_CLASS_GET_PROPERTY} %1 %{BKY_CLASS_GET_PROPERTY_FROM} %2",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME"
        }, {
          "type": "input_value",
          "name": "INSTANCE"
        }
      ],
      "output": null,
      "style": "class_blocks",
      "helpUrl": "%{BKY_CLASS_GET_PROPERTY_HELPURL}",
      "tooltip": "%{BKY_CLASS_GET_PROPERTY_TOOLTIP}",
      "inputsInline": true,
      "extensions": [
        "parent_tooltip_when_inline"
      ]
    }, {
      "type": "class_get_static_property",
      "message0": "%{BKY_CLASS_GET_STATIC_PROPERTY} %1 %{BKY_CLASS_GET_STATIC_PROPERTY_FROM} %2",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME"
        }, {
          "type": "field_input",
          "name": "CLASS"
        }
      ],
      "output": null,
      "style": "class_blocks",
      "helpUrl": "%{BKY_CLASS_GET_STATIC_PROPERTY_HELPURL}",
      "tooltip": "%{BKY_CLASS_GET_STATIC_PROPERTY_TOOLTIP}",
      "inputsInline": true,
      "extensions": [
        "parent_tooltip_when_inline"
      ]
    }, {
      "type": "class_declare_static_property",
      "message0": "%{BKY_CLASS_DECLARE_STATIC_PROPERTY} %1",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": ""
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      // "style": "class_blocks",
      "style": 'variable_blocks',
      "tooltip": "%{BKY_CLASS_DECLARE_STATIC_PROPERTY_TOOLTIP}",
      "helpUrl": "%{BKY_CLASS_DECLARE_STATIC_PROPERTY_HELPURL}",
      "mutator": "variable_set_mutator",
      "inputsInline": true
    }, {
      "type": "class_call_method_statement",
      "message0": "%{BKY_CLASS_CALL_METHOD} %1 %{BKY_CLASS_CALL_METHOD_FROM} %2",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME"
        }, {
          "type": "input_value",
          "name": "INSTANCE"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": "class_blocks",
      "helpUrl": "%{BKY_CLASS_CALL_METHOD_STATEMENT_HELPURL}",
      "tooltip": "%{BKY_CLASS_CALL_METHOD_STATEMENT_TOOLTIP}",
      "mutator": "create_instance_mutator",
      "inputsInline": true,
      "extensions": [
        "parent_tooltip_when_inline"
      ]
    }, {
      "type": "class_set_property",
      "message0": "%{BKY_CLASS_SET_PROPERTY} %1 %{BKY_CLASS_SET_PROPERTY_IN_INSTANCE} %2 %{BKY_CLASS_SET_PROPERTY_TO} %3",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME"
        }, {
          "type": "input_value",
          "name": "INSTANCE"
        }, {
          "type": "input_value",
          "name": "VALUE"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": "class_blocks",
      "helpUrl": "%{BKY_CLASS_SET_PROPERTY_HELPURL}",
      "tooltip": "%{BKY_CLASS_SET_PROPERTY_TOOLTIP}",
      "inputsInline": true,
      "extensions": [
        "parent_tooltip_when_inline"
      ]
    }, {
      "type": "class_set_static_property",
      "message0": "%{BKY_CLASS_SET_STATIC_PROPERTY} %1 %{BKY_CLASS_SET_STATIC_PROPERTY_IN_INSTANCE} %2 %{BKY_CLASS_SET_STATIC_PROPERTY_TO} %3",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME"
        }, {
          "type": "field_input",
          "name": "CLASS"
        }, {
          "type": "input_value",
          "name": "VALUE"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": "class_blocks",
      "helpUrl": "%{BKY_CLASS_SET_STATIC_PROPERTY_HELPURL}",
      "tooltip": "%{BKY_CLASS_SET_STATIC_PROPERTY_TOOLTIP}",
      "inputsInline": true,
      "extensions": [
        "parent_tooltip_when_inline"
      ]
    }, {
      "type": "return_statement",
      "message0": "%{BKY_RETURN_STATEMENT_TEXT} %1",
      "args0": [{
        "type": "input_value",
        "name": "VALUE"
      }],
      "previousStatement": null,
      "style": "procedure_blocks",
      "helpUrl": "%{BKY_RETURN_STATEMENT_HELPURL}",
      "tooltip": "%{BKY_RETURN_STATEMENT_TOOLTIP}",
      "extensions": [
        "parent_tooltip_when_inline"
      ]
    }, {
      "type": "variable_declare",
      "message0": "%{BKY_VARIABLE_DECLARE} %1",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": ""
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": 'variable_blocks',
      "tooltip": "%{BKY_VARIABLE_DECLARE_TOOLTIP}",
      "helpUrl": "%{BKY_VARIABLE_DECLARE_HELPURL}",
      "mutator": "variable_set_mutator",
      "inputsInline": true
    }, {
      "type": "control_break",
      "message0": "%{BKY_CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK}",
      "previousStatement": null,
      "style": 'loop_blocks',
      "tooltip": "%{BKY_CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK_TOOLTIP}",
      "helpUrl": "%{BKY_CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK_HELPURL}",
    }, {
      "type": "control_continue",
      "message0": "%{BKY_CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE}",
      "previousStatement": null,
      "style": 'loop_blocks',
      "tooltip": "%{BKY_CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE_TOOLTIP}",
      "helpUrl": "%{BKY_CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE_HELPURL}",
    }, {
    "type": "main_entry",
    "message0": "%{BKY_MAIN_ENTRY} %1 %2",
    "args0": [
      {
        "type": "input_dummy",
      }, {
        "type": "input_statement",
        "name": "STACK",
      }
    ],
    "style": "procedure_blocks",
    "ADD_START_HATS": true,
    "helpUrl": "%{BKY_MAIN_ENTRY_HELPURL}",
    "tooltip": "%{BKY_MAIN_ENTRY_TOOLTIP}",
  }, ]
  );

  addBlock("lists_getIndex", "List", createShadows([[1, 2, 3], 0]).replace('shadow', 'block').replace("ARG0", "VALUE").replace("ARG1", "AT"));
  addBlock("lists_length", "List", createShadows([[1, 2, 3]]).replace('shadow', 'block').replace("ARG0", "VALUE"));
  addBlock("lists_indexOf", "List");
  addBlock("lists_setIndex", "List", createShadows([undefined, 0, 0]).replace("ARG1", "AT").replace("ARG2", "TO"));

  addBlock("lists_append", "List", '', function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG1',
        Blockly.genCode.ORDER_NONE);
    var data1 = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE);
    return data + '.append(' + data1 + ')\n';
  }, [], [true, true],'', [null, Blockly.Msg['LISTS_APPEND'], null, Blockly.Msg['LISTS_APPEND_TO']], Blockly.Msg['LISTS_APPEND_TOOLTIP'], Blockly.Msg['LISTS_APPEND_HELPURL'], false, true);

  addBlock("lists_insert", "List", '', function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE);
    var data1 = Blockly.genCode.valueToCode(block, 'ARG1',
        Blockly.genCode.ORDER_NONE);
    var data2 = Blockly.genCode.valueToCode(block, 'ARG2',
        Blockly.genCode.ORDER_NONE);
    return data2 + '.insert(' + data1 + ', ' + data + ')\n';
  }, [], [true, true, true],'', [null, Blockly.Msg['LISTS_INSERT'], null, Blockly.Msg['LISTS_INSERT_AT'], null, Blockly.Msg['LISTS_INSERT_OF']], Blockly.Msg['LISTS_INSERT_TOOLTIP'], Blockly.Msg['LISTS_INSERT_HELPURL'], false, true);

  addBlock("lists_reverse", "List", '', function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || 'false';
    return data + '.reverse()\n';
  }, [], [true],'', [null, Blockly.Msg['LISTS_REVERSE']], Blockly.Msg['LISTS_REVERSE_TOOLTIP'], Blockly.Msg['LISTS_REVERSE_HELPURL'], false, true);

  addBlock("lists_sort", "List", '', function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || 'false';
    return data + '.sort()\n';
  }, [], [true],'', [null, Blockly.Msg['LISTS_SORT']], Blockly.Msg['LISTS_SORT_TOOLTIP'], Blockly.Msg['LISTS_SORT_HELPURL'], false, true);

  addBlock("lists_sort_numeric", "List", '', function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || 'false';
    return data + '.numericSort()\n';
  }, [], [true],'', [null, Blockly.Msg['LISTS_SORT_NUMERIC'], undefined, Blockly.Msg['LISTS_SORT_NUMERIC_NUMERICALLY']], Blockly.Msg['LISTS_SORT_NUMERIC_TOOLTIP'], Blockly.Msg['LISTS_SORT_NUMERIC_HELPURL'], false, true);

  Blockly.Blocks['procedures_callnoreturn'] = {
    /**
     * Block for calling a procedure with no return value.
     * @this {Blockly.Block}
     */
    init: function() {
      this.appendDummyInput('TOPROW')
          .appendField('', 'NAME');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setStyle('procedure_blocks');
      // Tooltip is set in renameProcedure.
      this.setHelpUrl(Blockly.Msg['PROCEDURES_CALLNORETURN_HELPURL']);
      this.arguments_ = [];
      this.argumentVarModels_ = [];
      this.quarkConnections_ = {};
      this.quarkIds_ = null;
      this.previousEnabledState_ = true;
    },

    /**
     * Returns the name of the procedure this block calls.
     * @return {string} Procedure name.
     * @this {Blockly.Block}
     */
    getProcedureCall: function() {
      // The NAME field is guaranteed to exist, null will never be returned.
      return /** @type {string} */ (this.getFieldValue('NAME'));
    },
    /**
     * Notification that a procedure is renaming.
     * If the name matches this block's procedure, rename it.
     * @param {string} oldName Previous name of procedure.
     * @param {string} newName Renamed procedure.
     * @this {Blockly.Block}
     */
    renameProcedure: function(oldName, newName) {
      if (Blockly.Names.equals(oldName, this.getProcedureCall())) {
        this.setFieldValue(newName, 'NAME');
        var baseMsg = this.outputConnection ?
            Blockly.Msg['PROCEDURES_CALLRETURN_TOOLTIP'] :
            Blockly.Msg['PROCEDURES_CALLNORETURN_TOOLTIP'];
        this.setTooltip(baseMsg.replace('%1', newName));
      }
    },
    /**
     * Notification that the procedure's parameters have changed.
     * @param {!Array.<string>} paramNames New param names, e.g. ['x', 'y', 'z'].
     * @param {!Array.<string>} paramIds IDs of params (consistent for each
     *     parameter through the life of a mutator, regardless of param renaming),
     *     e.g. ['piua', 'f8b_', 'oi.o'].
     * @private
     * @this {Blockly.Block}
     */
    setProcedureParameters_: function(paramNames, paramIds) {
      // Data structures:
      // this.arguments = ['x', 'y']
      //     Existing param names.
      // this.quarkConnections_ {piua: null, f8b_: Blockly.Connection}
      //     Look-up of paramIds to connections plugged into the call block.
      // this.quarkIds_ = ['piua', 'f8b_']
      //     Existing param IDs.
      // Note that quarkConnections_ may include IDs that no longer exist, but
      // which might reappear if a param is reattached in the mutator.
      var defBlock = Blockly.Procedures.getDefinition(this.getProcedureCall(),
          this.workspace);
      var mutatorOpen = defBlock && defBlock.mutator &&
          defBlock.mutator.isVisible();
      if (!mutatorOpen) {
        this.quarkConnections_ = {};
        this.quarkIds_ = null;
      }
      if (!paramIds) {
        // Reset the quarks (a mutator is about to open).
        return;
      }
      // Test arguments (arrays of strings) for changes. '\n' is not a valid
      // argument name character, so it is a valid delimiter here.
      if (paramNames.join('\n') == this.arguments_.join('\n')) {
        // No change.
        this.quarkIds_ = paramIds;
        return;
      }
      if (paramIds.length != paramNames.length) {
        throw RangeError('paramNames and paramIds must be the same length.');
      }
      this.setCollapsed(false);
      if (!this.quarkIds_) {
        // Initialize tracking for this block.
        this.quarkConnections_ = {};
        this.quarkIds_ = [];
      }
      // Switch off rendering while the block is rebuilt.
      var savedRendered = this.rendered;
      this.rendered = false;
      // Update the quarkConnections_ with existing connections.
      for (var i = 0; i < this.arguments_.length; i++) {
        var input = this.getInput('ARG' + i);
        if (input) {
          var connection = input.connection.targetConnection;
          this.quarkConnections_[this.quarkIds_[i]] = connection;
          if (mutatorOpen && connection &&
              paramIds.indexOf(this.quarkIds_[i]) == -1) {
            // This connection should no longer be attached to this block.
            connection.disconnect();
            connection.getSourceBlock().bumpNeighbours();
          }
        }
      }
      // Rebuild the block's arguments.
      this.arguments_ = [].concat(paramNames);
      // And rebuild the argument model list.
      this.argumentVarModels_ = [];
      for (var i = 0; i < this.arguments_.length; i++) {
        var variable = Blockly.Variables.getOrCreateVariablePackage(
            this.workspace, null, this.arguments_[i], '');
        this.argumentVarModels_.push(variable);
      }

      this.updateShape_();
      this.quarkIds_ = paramIds;
      // Reconnect any child blocks.
      if (this.quarkIds_) {
        for (var i = 0; i < this.arguments_.length; i++) {
          var quarkId = this.quarkIds_[i];
          if (quarkId in this.quarkConnections_) {
            var connection = this.quarkConnections_[quarkId];
            if (!Blockly.Mutator.reconnect(connection, this, 'ARG' + i)) {
              // Block no longer exists or has been attached elsewhere.
              delete this.quarkConnections_[quarkId];
            }
          }
        }
      }
      // Restore rendering and show the changes.
      this.rendered = savedRendered;
      if (this.rendered) {
        this.render();
      }
    },
    /**
     * Modify this block to have the correct number of arguments.
     * @private
     * @this {Blockly.Block}
     */
    updateShape_: function() {
      for (var i = 0; i < this.arguments_.length; i++) {
        var field = this.getField('ARGNAME' + i);
        if (field) {
          // Ensure argument name is up to date.
          // The argument name field is deterministic based on the mutation,
          // no need to fire a change event.
          Blockly.Events.disable();
          try {
            field.setValue(this.arguments_[i]);
          } finally {
            Blockly.Events.enable();
          }
        } else {
          // Add new input.
          field = new Blockly.FieldLabel(this.arguments_[i]);
          var input = this.appendValueInput('ARG' + i)
              .setAlign(Blockly.ALIGN_RIGHT)
              .appendField(field, 'ARGNAME' + i);
          input.init();
        }
      }
      // Remove deleted inputs.
      while (this.getInput('ARG' + i)) {
        this.removeInput('ARG' + i);
        i++;
      }
      // Add 'with:' if there are parameters, remove otherwise.
      var topRow = this.getInput('TOPROW');
      if (topRow) {
        if (this.arguments_.length) {
          if (!this.getField('WITH')) {
            topRow.appendField(Blockly.Msg['PROCEDURES_CALL_BEFORE_PARAMS'], 'WITH');
            topRow.init();
          }
        } else {
          if (this.getField('WITH')) {
            topRow.removeField('WITH');
          }
        }
      }
    },
    /**
     * Create XML to represent the (non-editable) name and arguments.
     * @return {!Element} XML storage element.
     * @this {Blockly.Block}
     */
    mutationToDom: function() {
      var container = Blockly.utils.xml.createElement('mutation');
      container.setAttribute('name', this.getProcedureCall());
      for (var i = 0; i < this.arguments_.length; i++) {
        var parameter = Blockly.utils.xml.createElement('arg');
        parameter.setAttribute('name', this.arguments_[i]);
        container.appendChild(parameter);
      }
      return container;
    },
    /**
     * Parse XML to restore the (non-editable) name and parameters.
     * @param {!Element} xmlElement XML storage element.
     * @this {Blockly.Block}
     */
    domToMutation: function(xmlElement) {
      var name = xmlElement.getAttribute('name');
      this.renameProcedure(this.getProcedureCall(), name);
      var args = [];
      var paramIds = [];
      for (var i = 0, childNode; (childNode = xmlElement.childNodes[i]); i++) {
        if (childNode.nodeName.toLowerCase() == 'arg') {
          args.push(childNode.getAttribute('name'));
          paramIds.push(childNode.getAttribute('paramId'));
        }
      }
      this.setProcedureParameters_(args, paramIds);
    },
    /**
     * Return all variables referenced by this block.
     * @return {!Array.<string>} List of variable names.
     * @this {Blockly.Block}
     */
    getVars: function() {
      return this.arguments_;
    },
    /**
     * Return all variables referenced by this block.
     * @return {!Array.<!Blockly.VariableModel>} List of variable models.
     * @this {Blockly.Block}
     */
    getVarModels: function() {
      return this.argumentVarModels_;
    },
    /**
     * Procedure calls cannot exist without the corresponding procedure
     * definition.  Enforce this link whenever an event is fired.
     * @param {!Blockly.Events.Abstract} event Change event.
     * @this {Blockly.Block}
     */
    onchange: function(event) {
      if (!this.workspace || this.workspace.isFlyout) {
        // Block is deleted or is in a flyout.
        return;
      }
      if (!event.recordUndo) {
        // Events not generated by user. Skip handling.
        return;
      }
      // if (event.type == Blockly.Events.BLOCK_CREATE &&
      //     event.ids.indexOf(this.id) != -1) {
      //   // Look for the case where a procedure call was created (usually through
      //   // paste) and there is no matching definition.  In this case, create
      //   // an empty definition block with the correct signature.
      //   var name = this.getProcedureCall();
      //   var def = Blockly.Procedures.getDefinition(name, this.workspace);
      //   if (def && (def.type != this.defType_ ||
      //       JSON.stringify(def.getVars()) != JSON.stringify(this.arguments_))) {
      //     // The signatures don't match.
      //     def = null;
      //   }
      //   if (!def) {
      //     Blockly.Events.setGroup(event.group);
      //     /**
      //      * Create matching definition block.
      //      * <xml xmlns="https://developers.google.com/blockly/xml">
      //      *   <block type="procedures_defreturn" x="10" y="20">
      //      *     <mutation name="test">
      //      *       <arg name="x"></arg>
      //      *     </mutation>
      //      *     <field name="NAME">test</field>
      //      *   </block>
      //      * </xml>
      //      */
      //     var xml = Blockly.utils.xml.createElement('xml');
      //     var block = Blockly.utils.xml.createElement('block');
      //     block.setAttribute('type', this.defType_);
      //     var xy = this.getRelativeToSurfaceXY();
      //     var x = xy.x + Blockly.SNAP_RADIUS * (this.RTL ? -1 : 1);
      //     var y = xy.y + Blockly.SNAP_RADIUS * 2;
      //     block.setAttribute('x', x);
      //     block.setAttribute('y', y);
      //     var mutation = this.mutationToDom();
      //     block.appendChild(mutation);
      //     var field = Blockly.utils.xml.createElement('field');
      //     field.setAttribute('name', 'NAME');
      //     var callName = this.getProcedureCall();
      //     if (!callName) {
      //       // Rename if name is empty string.
      //       callName = Blockly.Procedures.findLegalName('', this);
      //       this.renameProcedure('', callName);
      //     }
      //     field.appendChild(Blockly.utils.xml.createTextNode(callName));
      //     block.appendChild(field);
      //     xml.appendChild(block);
      //     Blockly.Xml.domToWorkspace(xml, this.workspace);
      //     Blockly.Events.setGroup(false);
      //   }
      //} else
      // if (event.type == Blockly.Events.BLOCK_DELETE) {
      //   // Look for the case where a procedure definition has been deleted,
      //   // leaving this block (a procedure call) orphaned.  In this case, delete
      //   // the orphan.
      //   var name = this.getProcedureCall();
      //   var def = Blockly.Procedures.getDefinition(name, this.workspace);
      //   if (!def) {
      //     Blockly.Events.setGroup(event.group);
      //     this.dispose(true);
      //     Blockly.Events.setGroup(false);
      //   }
      // } else
      if (event.type == Blockly.Events.CHANGE && event.element == 'disabled') {
        var name = this.getProcedureCall();
        var def = Blockly.Procedures.getDefinition(name, this.workspace);
        if (def && def.id == event.blockId) {
          // in most cases the old group should be ''
          var oldGroup = Blockly.Events.getGroup();
          if (oldGroup) {
            // This should only be possible programmatically and may indicate a problem
            // with event grouping. If you see this message please investigate. If the
            // use ends up being valid we may need to reorder events in the undo stack.
            console.log('Saw an existing group while responding to a definition change');
          }
          Blockly.Events.setGroup(event.group);
          if (event.newValue) {
            this.previousEnabledState_ = this.isEnabled();
            this.setEnabled(false);
          } else {
            this.setEnabled(this.previousEnabledState_);
          }
          Blockly.Events.setGroup(oldGroup);
        }
      }
    },
    /**
     * Add menu option to find the definition block for this call.
     * @param {!Array} options List of menu options to add to.
     * @this {Blockly.Block}
     */
    customContextMenu: function(options) {
      if (!this.workspace.isMovable()) {
        // If we center on the block and the workspace isn't movable we could
        // loose blocks at the edges of the workspace.
        return;
      }

      var option = {enabled: true};
      option.text = Blockly.Msg['PROCEDURES_HIGHLIGHT_DEF'];
      var name = this.getProcedureCall();
      var workspace = this.workspace;
      option.callback = function() {
        var def = Blockly.Procedures.getDefinition(name, workspace);
        if (def) {
          workspace.centerOnBlock(def.id);
          def.select();
        }
      };
      options.push(option);
    },
    defType_: 'procedures_defnoreturn'
  };

  Blockly.Blocks['procedures_callreturn'] = {
    /**
     * Block for calling a procedure with a return value.
     * @this {Blockly.Block}
     */
    init: function() {
      this.appendDummyInput('TOPROW')
          .appendField('', 'NAME');
      this.setOutput(true);
      this.setStyle('procedure_blocks');
      // Tooltip is set in domToMutation.
      this.setHelpUrl(Blockly.Msg['PROCEDURES_CALLRETURN_HELPURL']);
      this.arguments_ = [];
      this.argumentVarModels_ = [];
      this.quarkConnections_ = {};
      this.quarkIds_ = null;
      this.previousEnabledState_ = true;
    },

    getProcedureCall: Blockly.Blocks['procedures_callnoreturn'].getProcedureCall,
    renameProcedure: Blockly.Blocks['procedures_callnoreturn'].renameProcedure,
    setProcedureParameters_:
        Blockly.Blocks['procedures_callnoreturn'].setProcedureParameters_,
    updateShape_: Blockly.Blocks['procedures_callnoreturn'].updateShape_,
    mutationToDom: Blockly.Blocks['procedures_callnoreturn'].mutationToDom,
    domToMutation: Blockly.Blocks['procedures_callnoreturn'].domToMutation,
    getVars: Blockly.Blocks['procedures_callnoreturn'].getVars,
    getVarModels: Blockly.Blocks['procedures_callnoreturn'].getVarModels,
    onchange: Blockly.Blocks['procedures_callnoreturn'].onchange,
    customContextMenu:
        Blockly.Blocks['procedures_callnoreturn'].customContextMenu,
    defType_: 'procedures_defreturn'
  };

  Blockly.Blocks['variable_set'] = {
    init: function() {
      let field = new Blockly.FieldDropdown(listVariables);
      let self = this;
      field.onOpenMenu = function() {
        this.menuGenerator_ = [[Blockly.Msg['SELECT_VARIABLE'], '']]
        for (let i of variablesInImportedFiles) {
          this.menuGenerator_.push([i, i])
        }
        var prev = self.getPreviousBlock();
        var prevType = prev && prev.type;
        while (prev != null) {
          if (prevType == 'variable_declare') {
            this.menuGenerator_.push([prev.getField('NAME').getValue(), prev.getField('NAME').getValue()]);
          } else if (prevType == 'procedures_defnoreturn' || prevType == 'procedures_defreturn') {
            for (var i of prev.getVars()) {
              this.menuGenerator_.push([i, i]);
            }
          }
          for (var i_ of Blockly.getMainWorkspace().topBlocks_) {
            if (i_.type == prevType && prevType != 'main_entry') {
              for (var _j of publicVariables) this.menuGenerator_.push([_j, _j]);
            }
          }
          prev = prev.getPreviousBlock();
          prevType = prev && prev.type;
        }
      }
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);

      this.appendValueInput("DATA").appendField(Blockly.Msg['VARIABLES_SET'].split('%1')[0]).appendField(field, 'NAME').appendField(Blockly.Msg['VARIABLES_SET'].split('%1')[1].split('%2')[0]);
      this.setStyle('variable_blocks')
    }
  };

  Blockly.Blocks['variable_get'] = {
    init: function() {
      let field = new Blockly.FieldDropdown(listVariables);
      let self = this;
      field.onOpenMenu = function() {
        this.menuGenerator_ = [[Blockly.Msg['SELECT_VARIABLE'], '']]
        var prev = self.getParent();
        var prevType = prev && prev.type;
        while (prev != null) {
          if (prevType == 'variable_declare') {
            this.menuGenerator_.push([prev.getField('NAME').getValue(), prev.getField('NAME').getValue()]);
          } else if (prevType == 'procedures_defnoreturn' || prevType == 'procedures_defreturn') {
            for (var i of prev.getVars()) {
              this.menuGenerator_.push([i, i]);
            }
          }
          for (var i_ of Blockly.getMainWorkspace().topBlocks_) {
            if (i_.type == prevType && prevType != 'main_entry') {
              for (var _j of publicVariables) this.menuGenerator_.push([_j, _j]);
            }
          }
          prev = prev.getPreviousBlock() || prev.getParent();
          prevType = prev && prev.type;
        }
      }
      this.setOutput(true, null);

      this.appendDummyInput().appendField(Blockly.Msg['VARIABLES_GET']).appendField(field, 'NAME');
      this.setStyle('variable_blocks')
    }
  };

  Blockly.Procedures.flyoutCategory = function(workspace) {
    var xmlList = [];
    // if (Blockly.Blocks['procedures_defnoreturn']) {
    //   // <block type="procedures_defnoreturn" gap="16">
    //   //     <field name="NAME">do something</field>
    //   // </block>
    //   var block = Blockly.utils.xml.createElement('block');
    //   block.setAttribute('type', 'procedures_defnoreturn');
    //   block.setAttribute('gap', 16);
    //   var nameField = Blockly.utils.xml.createElement('field');
    //   nameField.setAttribute('name', 'NAME');
    //   nameField.appendChild(Blockly.utils.xml.createTextNode(
    //       Blockly.Msg['PROCEDURES_DEFNORETURN_PROCEDURE']));
    //   block.appendChild(nameField);
    //   xmlList.push(block);
    // }
    if (Blockly.Blocks['procedures_defreturn']) {
      // <block type="procedures_defreturn" gap="16">
      //     <field name="NAME">do something</field>
      // </block>
      var block = Blockly.utils.xml.createElement('block');
      block.setAttribute('type', 'procedures_defreturn');
      block.setAttribute('gap', 16);
      var nameField = Blockly.utils.xml.createElement('field');
      nameField.setAttribute('name', 'NAME');
      nameField.appendChild(Blockly.utils.xml.createTextNode(
          Blockly.Msg['PROCEDURES_DEFRETURN_PROCEDURE']));
      block.appendChild(nameField);
      xmlList.push(block);
    }
    if (xmlList.length) {
      // Add slightly larger gap between system blocks and user calls.
      xmlList[xmlList.length - 1].setAttribute('gap', 24);
    }

    function populateProcedures(procedureList, templateName) {
      for (var i = 0; i < procedureList.length; i++) {
        var name = procedureList[i][0];
        var args = procedureList[i][1];
        // <block type="procedures_callnoreturn" gap="16">
        //   <mutation name="do something">
        //     <arg name="x"></arg>
        //   </mutation>
        // </block>
        var block = Blockly.utils.xml.createElement('block');
        block.setAttribute('type', templateName);
        block.setAttribute('gap', 16);
        var mutation = Blockly.utils.xml.createElement('mutation');
        mutation.setAttribute('name', name);
        block.appendChild(mutation);
        for (var j = 0; j < args.length; j++) {
          var arg = Blockly.utils.xml.createElement('arg');
          arg.setAttribute('name', args[j]);
          mutation.appendChild(arg);
        }
        xmlList.push(block);
      }
    }

    var tuple = Blockly.Procedures.allProcedures(workspace);
    for (const [i, value] of Object.entries(functionsInImportedFiles)) {
      if (value) tuple[0] = tuple[0].concat([[i.split(":")[0], i.split(":")[1].split(',').slice(1), true]]);
      else tuple[1] = tuple[1].concat([[i.split(":")[0], i.split(":")[1].split(',').slice(1), true]]);
    }
    populateProcedures(tuple[0], 'procedures_callnoreturn');
    // populateProcedures(tuple[1], 'procedures_callreturn');
    populateProcedures(tuple[1], 'procedures_callnoreturn');
    var functionsWithReturn = [];
    var containsReturn = [];
    if (Blockly.getMainWorkspace()) {
      for (var retBlock of Blockly.getMainWorkspace().getBlocksByType('return_statement')) {
        var prev = retBlock.getPreviousBlock();
        var prevType = prev && prev.type;
        while (prev != null) {
          if (prevType == 'procedures_defreturn') {
            containsReturn += prev.getFieldValue("NAME");
          }
          prev = prev.getPreviousBlock();
          prevType = prev && prev.type;
        }
      }
    }
    for (var i = 0; i < tuple[1].length; i++) {
      if (containsReturn.includes(tuple[1][i][0])) {
        functionsWithReturn = functionsWithReturn.concat([tuple[1][i]]);
      }
    }
    populateProcedures(functionsWithReturn, 'procedures_callreturn');
    var block2 = Blockly.utils.xml.createElement('block');
    block2.setAttribute('type', 'return_statement');
    block2.setAttribute('gap', 16);
    xmlList.push(block2);
    return xmlList;
  };
  Blockly.Msg['RETURN_STATEMENT_TEXT'] = 'return';
  Blockly.Msg['SELECT_VARIABLE'] = 'select a variable';
  Blockly.Msg['VARIABLE_DECLARE'] = 'declare';
  Blockly.Msg['MAIN_ENTRY'] = 'on start';
  Blockly.Msg['CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK_TOOLTIP'] = Blockly.Msg['CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK'];
  Blockly.Msg['CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE_TOOLTIP'] = Blockly.Msg['CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE'];
  Blockly.Msg['PROCEDURES_DEFRETURN_TITLE'] = 'define function';
  // Blockly.Msg['PROCEDURES_DEFNORETURN_TITLE'] = Blockly.Msg['PROCEDURES_DEFRETURN_TITLE'];
  Blockly.Msg['PROCEDURES_DEFRETURN_TITLE_METHOD'] = 'define method';
  // Blockly.Msg['PROCEDURES_DEFNORETURN_TITLE_METHOD'] = Blockly.Msg['PROCEDURES_DEFRETURN_TITLE_METHOD'];
  addCategory("Import", "Import", "#8855ff");
  addBlock("import", "Import", "", function(block) {
    Compiler.parseImport(block.getFieldValue('NAME'));
    return 'import \'' + (block.getFieldValue('NAME') || 'unnamed') + '\'\n';
  }, [], [], '', [function(block) {
    block.appendDummyInput().appendField(Blockly.Msg['IMPORT_IMPORT']).appendField(new Blockly.FieldTextInput(), "NAME");
  }], Blockly.Msg['IMPORT_IMPORT_TOOLTIP'], Blockly.Msg['IMPORT_IMPORT_HELPURL']);
  addButton('Import', 'import package', function() {
    document.getElementById('addpkg').click()
  })
  addCategory('Linker', 'Linker', '#DDBB33')
  addBlock("set_random_wallpaper", "Linker", '', "setRandomWallpaper", [], [],
  `declareNativeFunction(".", "runJS_str", 1)
func setRandomWallpaper() {
  runJS_str("Linker.setWallpaper('https://picsum.photos/1600/900')")
}`, [Blockly.Msg['LINKER_SET_RANDOM_WALLPAPER']], Blockly.Msg['LINKER_SET_RANDOM_WALLPAPER_TOOLTIP'], Blockly.Msg['LINKER_SET_RANDOM_WALLPAPER_HELPURL']);
}

export { initBlocks, createShadows, putValue, addBlock, addCategory, addLabel, addButton, clickListeners, createBlocksFromYAML, lighter, darker, icons };
