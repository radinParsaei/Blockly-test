import './field_dropdown.js'
import './variables_mutator.js';

function listVariables() {
  var res = [[Blockly.Msg['SELECT_VARIABLE'], '']];
  for (var i of allVariables) {
    res.push(i);
  }
  return res;
}

function initBlocks() {
  function addBlock(blockName, blockCategory, blockDefaultValues, blockFunctionName,
    blockFunctionParameters, paramTypes, functionCode, blockUI, tooltip, helpUrl, output) {
    var element = document.createElement("block");
    element.setAttribute('type', blockName);
    document.getElementById(blockCategory + "Category").appendChild(element);
    element.innerHTML = blockDefaultValues;
    if (blockFunctionName != undefined) {
      var functionNameInBackend = blockFunctionName + ":";
      for (var tmp of blockFunctionParameters) {
        functionNameInBackend += "," + tmp;
      }
      functions[functionNameInBackend] = blockName;
    } else return;
    Blockly.Blocks[blockName] = {
      init: function() {
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
          } else if (typeof tmp == 'function') {
            tmp(this, blockToAddField);
          } else if (tmp === undefined) {
            blockToAddField = undefined;
          }
        }
        if (output) {
          if (typeof output == 'string')
            this.setOutput(true, output);
          else
            this.setOutput(true, null);
        } else {
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
        }
        this.setColour(document.getElementById(blockCategory + "Category").getAttribute('colour'));
      }
    };
    if (typeof blockFunctionName == "function") {
      Blockly.genCode[blockName] = blockFunctionName;
    } else {
      Blockly.genCode[blockName] = function(block) {
        var code = blockFunctionName + "(";
        for (var i = 0; i < paramTypes.length; i++) {
          if (paramTypes[i])
            code += Blockly.genCode.valueToCode(block, 'ARG' + i, Blockly.genCode.ORDER_ATOMIC);
          else
            code += "() -> {\n" + Blockly.genCode.statementToCode(block, 'ARG' + i) + "}";
          if (i != paramTypes.length - 1) code += ', ';
        }
        if (output) return [code + ')\n', Blockly.genCode.ORDER_FUNCTION_CALL];
        else return code + ')\n';
      };
      functionCodes += functionCode;
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

  function createShadows(values) {
    var counter = 0;
    for (var i of values) {
      if (typeof i == 'number') {
        out += '<value name="ARG' + counter++ + '"><shadow type="math_number"><field name="NUM">' + i + '</field></shadow></value>';
      } else if (typeof i == 'string') {
        out += '<value name="ARG' + counter++ + '"><shadow type="text"><field name="TEXT">' + i + '</field></shadow></value>';
      } else if (typeof i == 'boolean') {
        out += '<value name="ARG' + counter++ + '"><shadow type="logic_boolean"><field name="BOOL">' + (i? "TRUE":"FALSE") + '</field></shadow></value>';
      }
    }
    return out;
  }

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
  }, null,Blockly.Msg['CONTROLS_IF_MSG_THEN']], Blockly.Msg['CONTROLS_IF_TOOLTIP'],
    Blockly.Msg['CONTROLS_IF_HELPURL']
  );

  addBlock("logic_else", "Logic", '', function(block) {
    var code = Blockly.genCode.statementToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || '';
        if (block.getPreviousBlock() == null || (block.getPreviousBlock().type != "logic_if" && block.getPreviousBlock().type != "logic_elseif")) {
          throw 'else only can attach to if or else if block';
        }
    return ' else {\n' + code + '}\n';
  }, [], [false],'', [Blockly.Msg['CONTROLS_IF_MSG_ELSE'], null, Blockly.Msg['CONTROLS_IF_MSG_THEN']],
    Blockly.Msg['CONTROLS_IF_ELSE_TOOLTIP'],
    Blockly.Msg['CONTROLS_ELSE_HELPURL'] || Blockly.Msg['CONTROLS_IF_HELPURL']
  );

  addBlock("loops_while", "Loops", '', function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || 'false';
    var code = Blockly.genCode.statementToCode(block, 'ARG1',
        Blockly.genCode.ORDER_NONE) || '';
    return 'while ' + data + ' {\n' + code + '}\n';
  }, [], [true, false],'', [null, Blockly.Msg['CONTROLS_WHILEUNTIL_OPERATOR_WHILE'], function(self, blockToAddField) {
    blockToAddField.setCheck(["Number", "Boolean"]);
  }, null, Blockly.Msg['CONTROLS_WHILEUNTIL_INPUT_DO']], Blockly.Msg['CONTROLS_WHILEUNTIL_TOOLTIP_WHILE'],
    Blockly.Msg['CONTROLS_WHILEUNTIL_HELPURL']
  );

  addBlock("control_break", "Loops");
  addBlock("control_continue", "Loops");

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


  addLabel("Advanced", "Logic", "smaller-title");

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

  Blockly.defineBlocksWithJsonArray([
    {
      "type": "text",
      "message0": "\"%1\"",
      "args0": [{
        "type": "field_input",
        "name": "TEXT",
        "text": ""
      }],
      "output": "String",
      "style": "text_blocks",
      "helpUrl": "%{BKY_TEXT_TEXT_HELPURL}",
      "tooltip": "%{BKY_TEXT_TEXT_TOOLTIP}",
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
      "type": "math_arithmetic",
      "message0": "%1 %2 %3",
      "args0": [
        {
          "type": "input_value",
          "name": "A",
          // "check": "Number"
        },
        {
          "type": "field_dropdown",
          "name": "OP",
          "options": [
            ["%{BKY_MATH_ADDITION_SYMBOL}", "ADD"],
            ["%{BKY_MATH_SUBTRACTION_SYMBOL}", "MINUS"],
            ["%{BKY_MATH_MULTIPLICATION_SYMBOL}", "MULTIPLY"],
            ["%{BKY_MATH_DIVISION_SYMBOL}", "DIVIDE"],
            ["%{BKY_MATH_POWER_SYMBOL}", "POWER"]
          ]
        },
        {
          "type": "input_value",
          "name": "B",
          // "check": "Number"
        }
      ],
      "inputsInline": true,
      "output": "Number",
      "style": "math_blocks",
      "helpUrl": "%{BKY_MATH_ARITHMETIC_HELPURL}",
      "extensions": ["math_op_tooltip"]
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
    "type": "logic_compare",
    "message0": "%1 %2 %3",
    "args0": [
      {
        "type": "input_value",
        "name": "A"
      },
      {
        "type": "field_dropdown",
        "name": "OP",
        "options": [
          ["=", "EQ"],
          ["\u2260", "NEQ"],
          ["\u200F<", "LT"],
          ["\u200F\u2264", "LTE"],
          ["\u200F>", "GT"],
          ["\u200F\u2265", "GTE"]
        ]
      },
      {
        "type": "input_value",
        "name": "B"
      }
    ],
    "inputsInline": true,
    "output": "Boolean",
    "style": "logic_blocks",
    "helpUrl": "%{BKY_LOGIC_COMPARE_HELPURL}",
    "extensions": ["logic_op_tooltip"]
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
  }, {
    "type": "logic_negate",
    "message0": "%{BKY_LOGIC_NEGATE_TITLE}",
    "args0": [
      {
        "type": "input_value",
        "name": "BOOL",
        "check": [
          "Number",
          "Boolean"
        ]
      }
    ],
    "output": "Boolean",
    "style": "logic_blocks",
    "tooltip": "%{BKY_LOGIC_NEGATE_TOOLTIP}",
    "helpUrl": "%{BKY_LOGIC_NEGATE_HELPURL}"
  }]
  );

  Blockly.Blocks['variable_set'] = {
    init: function() {
      let field = new Blockly.FieldDropdown(listVariables);
      let self = this;
      field.onOpenMenu = function() {
        this.menuGenerator_ = [[Blockly.Msg['SELECT_VARIABLE'], '']]
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
          prev = prev.getPreviousBlock();
          prevType = prev && prev.type;
        }
      }
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);

      this.appendValueInput("DATA").appendField(Blockly.Msg['VARIABLES_SET'].split('%1')[0]).appendField(field, 'NAME').appendField(Blockly.Msg['VARIABLES_SET'].split('%1')[1].split('%2')[0]);
      this.setColour(document.getElementById("VariablesCategory").getAttribute('colour'));
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
          prev = prev.getPreviousBlock() || prev.getParent();
          prevType = prev && prev.type;
        }
      }
      this.setOutput(true, null);

      this.appendDummyInput().appendField(Blockly.Msg['VARIABLES_GET']).appendField(field, 'NAME');
      this.setColour(document.getElementById("VariablesCategory").getAttribute('colour'));
    }
  };

  Blockly.Procedures.flyoutCategory = function(workspace) {
    var xmlList = [];
    if (Blockly.Blocks['procedures_defnoreturn']) {
      // <block type="procedures_defnoreturn" gap="16">
      //     <field name="NAME">do something</field>
      // </block>
      var block = Blockly.utils.xml.createElement('block');
      block.setAttribute('type', 'procedures_defnoreturn');
      block.setAttribute('gap', 16);
      var nameField = Blockly.utils.xml.createElement('field');
      nameField.setAttribute('name', 'NAME');
      nameField.appendChild(Blockly.utils.xml.createTextNode(
          Blockly.Msg['PROCEDURES_DEFNORETURN_PROCEDURE']));
      block.appendChild(nameField);
      xmlList.push(block);
    }
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
    populateProcedures(tuple[0], 'procedures_callnoreturn');
    populateProcedures(tuple[1], 'procedures_callreturn');
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
}

export { initBlocks };
