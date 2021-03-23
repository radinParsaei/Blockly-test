import './field_dropdown.js'
import './variables_mutator.js';

function listVariables() {
  var res = [[Blockly.Msg['SELECT_VARIABLE'], '']];
  for (var i of allVariables) {
    res.push(i);
  }
  return res;
}

Blockly.Msg['TEXT_REPLACE_REPLACE'] = 'replace';
Blockly.Msg['TEXT_REPLACE_WITH'] = 'with';
Blockly.Msg['TEXT_REPLACE_IN'] = 'in';

function initBlocks() {
  function addBlock(blockName, blockCategory, blockDefaultValues, blockFunctionName,
    blockFunctionParameters, paramTypes, functionCode, blockUI, tooltip, helpUrl, output, inline) {
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

  addBlock("text_replace", "Text", createShadows(['Hello', 'H', 'h']), function(block) {
    var data = Blockly.genCode.valueToCode(block, 'ARG0',
        Blockly.genCode.ORDER_NONE) || "'text'";
    var data1 = Blockly.genCode.valueToCode(block, 'ARG1',
        Blockly.genCode.ORDER_NONE) || "'text'";
    var data2 = Blockly.genCode.valueToCode(block, 'ARG2',
        Blockly.genCode.ORDER_NONE) || "'text'";
    return [data2 + '.replace(' + data + ', ' + data1 + ')', Blockly.genCode.ORDER_ATOMIC];
  }, [], [true, true, true], '', [null, Blockly.Msg['TEXT_REPLACE_REPLACE'], null, Blockly.Msg['TEXT_REPLACE_WITH'], null, Blockly.Msg['TEXT_REPLACE_IN']], Blockly.Msg['TEXT_REPLACE_TOOLTIP'], Blockly.Msg['TEXT_REPLACE_HELPURL'], true, true);

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
    if (event.type == Blockly.Events.BLOCK_DELETE) {
      // Look for the case where a procedure definition has been deleted,
      // leaving this block (a procedure call) orphaned.  In this case, delete
      // the orphan.
      var name = this.getProcedureCall();
      var def = Blockly.Procedures.getDefinition(name, this.workspace);
      if (!def) {
        Blockly.Events.setGroup(event.group);
        this.dispose(true);
        Blockly.Events.setGroup(false);
      }
    } else if (event.type == Blockly.Events.CHANGE && event.element == 'disabled') {
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
    populateProcedures(tuple[1], 'procedures_callnoreturn');
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
