import * as Blockly from 'blockly/core';

Blockly.genCode = new Blockly.Generator('genCode');

var usedVariables = {};

// Blockly.genCode.addReservedWords(
//     'func,if,return,var,while,null,true,false,class,for,this,init,new,break,continue');

//copied from Blockly python generator
Blockly.genCode.ORDER_ATOMIC = 0;            // 0 "" ...
Blockly.genCode.ORDER_COLLECTION = 1;        // tuples, lists, dictionaries
Blockly.genCode.ORDER_STRING_CONVERSION = 1; // `expression...`
Blockly.genCode.ORDER_MEMBER = 2.1;          // . []
Blockly.genCode.ORDER_FUNCTION_CALL = 2.2;   // ()
Blockly.genCode.ORDER_EXPONENTIATION = 3;    // **
Blockly.genCode.ORDER_UNARY_SIGN = 4;        // + -
Blockly.genCode.ORDER_BITWISE_NOT = 4;       // ~
Blockly.genCode.ORDER_MULTIPLICATIVE = 5;    // * / // %
Blockly.genCode.ORDER_ADDITIVE = 6;          // + -
Blockly.genCode.ORDER_BITWISE_SHIFT = 7;     // << >>
Blockly.genCode.ORDER_BITWISE_AND = 8;       // &
Blockly.genCode.ORDER_BITWISE_XOR = 9;       // ^
Blockly.genCode.ORDER_BITWISE_OR = 10;       // |
Blockly.genCode.ORDER_RELATIONAL = 11;       // in, not in, is, is not,
                                            //     <, <=, >, >=, <>, !=, ==
Blockly.genCode.ORDER_LOGICAL_NOT = 12;      // not
Blockly.genCode.ORDER_LOGICAL_AND = 13;      // and
Blockly.genCode.ORDER_LOGICAL_OR = 14;       // or
Blockly.genCode.ORDER_CONDITIONAL = 15;      // if else
Blockly.genCode.ORDER_LAMBDA = 16;           // lambda
Blockly.genCode.ORDER_NONE = 99;             // (...)

//copied from Blockly javascript generator
/**
 * List of outer-inner pairings that do NOT require parentheses.
 * @type {!Array.<!Array.<number>>}
 */
Blockly.genCode.ORDER_OVERRIDES = [
  // (foo()).bar -> foo().bar
  // (foo())[0] -> foo()[0]
  [Blockly.genCode.ORDER_FUNCTION_CALL, Blockly.genCode.ORDER_MEMBER],
  // (foo())() -> foo()()
  [Blockly.genCode.ORDER_FUNCTION_CALL, Blockly.genCode.ORDER_FUNCTION_CALL],
  // (foo.bar).baz -> foo.bar.baz
  // (foo.bar)[0] -> foo.bar[0]
  // (foo[0]).bar -> foo[0].bar
  // (foo[0])[1] -> foo[0][1]
  [Blockly.genCode.ORDER_MEMBER, Blockly.genCode.ORDER_MEMBER],
  // (foo.bar)() -> foo.bar()
  // (foo[0])() -> foo[0]()
  [Blockly.genCode.ORDER_MEMBER, Blockly.genCode.ORDER_FUNCTION_CALL],

  // !(!foo) -> !!foo
  [Blockly.genCode.ORDER_LOGICAL_NOT, Blockly.genCode.ORDER_LOGICAL_NOT],
  // a * (b * c) -> a * b * c
  [Blockly.genCode.ORDER_MULTIPLICATION, Blockly.genCode.ORDER_MULTIPLICATION],
  // a + (b + c) -> a + b + c
  [Blockly.genCode.ORDER_ADDITIVE, Blockly.genCode.ORDER_ADDITIVE],
  // a && (b && c) -> a && b && c
  [Blockly.genCode.ORDER_LOGICAL_AND, Blockly.genCode.ORDER_LOGICAL_AND],
  // a || (b || c) -> a || b || c
  [Blockly.genCode.ORDER_LOGICAL_OR, Blockly.genCode.ORDER_LOGICAL_OR]
];

Blockly.genCode.init = function(workspace) {
  onStartUsed = 0;
  allVariables = [];
  Blockly.genCode.RESERVED_WORDS_ = 'func,if,return,var,while,null,true,false,class,for,this,init,new,break,continue';
  Blockly.genCode.definitions_ = Object.create(null);
  Blockly.genCode.functionNames_ = Object.create(null);

  if (!Blockly.genCode.variableDB_) {
    Blockly.genCode.variableDB_ =
        new Blockly.Names(Blockly.genCode.RESERVED_WORDS_);
  } else {
    Blockly.genCode.variableDB_.reset();
  }

  if (!Blockly.genCode.functionsDB_) {
    Blockly.genCode.functionsDB_ =
        new Blockly.Names(Blockly.genCode.RESERVED_WORDS_);
  } else {
    Blockly.genCode.functionsDB_.reset();
  }

  Blockly.genCode.variableDB_.setVariableMap(workspace.getVariableMap());

  var defvars = [];
  // Add developer variables (not created or named by the user).
  var devVarList = Blockly.Variables.allDeveloperVariables(workspace);
  for (var i = 0; i < devVarList.length; i++) {
    defvars.push(Blockly.genCode.variableDB_.getName(devVarList[i],
        Blockly.Names.DEVELOPER_VARIABLE_TYPE));
  }

  // Add user variables, but only ones that are being used.
  var variables = Blockly.Variables.allUsedVarModels(workspace);
  for (var i = 0; i < variables.length; i++) {
    defvars.push(Blockly.genCode.variableDB_.getName(variables[i].getId(),
        Blockly.VARIABLE_CATEGORY_NAME));
  }

  // Declare all of the variables.
  // if (defvars.length) {
  //   Blockly.genCode.definitions_['variables'] =
  //       'var ' + defvars.join(';\nvar ') + ';';
  // }
  for (var i of defvars) {
    usedVariables[i] = false;
  }
};

Blockly.genCode.finish = function(code) {
  // Convert the definitions dictionary into a list.
  var definitions = [];
  for (var name in Blockly.genCode.definitions_) {
    definitions.push(Blockly.genCode.definitions_[name]);
  }
  // Clean up temporary data.
  delete Blockly.genCode.definitions_;
  delete Blockly.genCode.functionNames_;
  Blockly.genCode.variableDB_.reset();
  Blockly.genCode.functionsDB_.reset();
  var vars = '';
  for (var i = 0; i < Object.keys(usedVariables).length; i++) {
    if (usedVariables[Object.keys(usedVariables)[i]]) {
      vars += "var " + Object.keys(usedVariables)[i] + "\n";
    }
  }
  let code_ = (vars + '\n' + definitions.join('\n\n') + '\n' + code + "\n").trim();
  let re = new RegExp(/^var +([A-Za-z]*\d*_*)+ *=.*$/, 'gm');
  let match = code_.match(re);
  code_ = code_.replace(re, '');
  if (match) {
    match.reverse();
    let c = 0
    for (var i of match) {
      code_ = i + ((c++ == match.length - 1)? '\n\n':'\n') + code_;
    }
  }
  return code_;
};

Blockly.genCode.scrubNakedValue = function(line) {
  return line + '\n';
};

Blockly.genCode.quote_ = function(string) {
  return '"' + string + '"';
};

Blockly.genCode.multiline_quote_ = function(string) {
  var lines = string.split(/\n/g).map(Blockly.genCode.quote_);
  return lines.join(' + \'\\n\' +\n');
};

Blockly.genCode.scrub_ = function(block, code, opt_thisOnly) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      comment = Blockly.utils.string.wrap(comment,
          Blockly.genCode.COMMENT_WRAP - 3);
      commentCode += Blockly.genCode.prefixLines(comment + '\n', '// ');
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[i].connection.targetBlock();
        if (childBlock) {
          comment = Blockly.genCode.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.genCode.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = opt_thisOnly ? '' : Blockly.genCode.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};

Blockly.genCode.getAdjusted = function(block, atId, opt_delta, opt_negate,
    opt_order) {
  var delta = opt_delta || 0;
  var order = opt_order || Blockly.genCode.ORDER_NONE;
  if (block.workspace.options.oneBasedIndex) {
    delta--;
  }
  var defaultAtIndex = block.workspace.options.oneBasedIndex ? '1' : '0';
  if (delta > 0) {
    var at = Blockly.genCode.valueToCode(block, atId,
        Blockly.genCode.ORDER_ADDITIVE) || defaultAtIndex;
  } else if (delta < 0) {
    var at = Blockly.genCode.valueToCode(block, atId,
        Blockly.genCode.ORDER_ADDITIVE) || defaultAtIndex;
  } else if (opt_negate) {
    var at = Blockly.genCode.valueToCode(block, atId,
        Blockly.genCode.ORDER_UNARY_NEGATION) || defaultAtIndex;
  } else {
    var at = Blockly.genCode.valueToCode(block, atId, order) ||
        defaultAtIndex;
  }

  if (Blockly.isNumber(at)) {
    // If the index is a naked number, adjust it right now.
    at = Number(at) + delta;
    if (opt_negate) {
      at = -at;
    }
  } else {
    // If the index is dynamic, adjust it in code.
    if (delta > 0) {
      at = at + ' + ' + delta;
      var innerOrder = Blockly.genCode.ORDER_ADDITIVE;
    } else if (delta < 0) {
      at = at + ' - ' + -delta;
      var innerOrder = Blockly.genCode.ORDER_ADDITIVE;
    }
    if (opt_negate) {
      if (delta) {
        at = '-(' + at + ')';
      } else {
        at = '-' + at;
      }
      var innerOrder = Blockly.genCode.ORDER_UNARY_NEGATION;
    }
    innerOrder = Math.floor(innerOrder);
    order = Math.floor(order);
    if (innerOrder && order >= innerOrder) {
      at = '(' + at + ')';
    }
  }
  return at;
};

Blockly.genCode['text_charAt'] = function(block) {
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var text = Blockly.genCode.valueToCode(block, 'VALUE',
      Blockly.genCode.ORDER_MEMBER) || '\'\'';
  switch (where) {
    case 'FIRST':
      var code = text + '.getFirstCharacter()';
      return [code, Blockly.genCode.ORDER_FUNCTION_CALL];
    case 'LAST':
      var code = text + '.getLastCharacter()';
      return [code, Blockly.genCode.ORDER_FUNCTION_CALL];
    case 'FROM_START':
      var at = Blockly.genCode.getAdjusted(block, 'AT');
      var code = text + '.charAt(' + at + ')';
      return [code, Blockly.genCode.ORDER_FUNCTION_CALL];
    case 'FROM_END':
      var at = Blockly.genCode.getAdjusted(block, 'AT');
      var code = text + '.charAtFromEnd(' + at + ')';
      return [code, Blockly.genCode.ORDER_FUNCTION_CALL];
    case 'RANDOM':
      var code = text + '.getRandomCharacter()';
      return [code, Blockly.genCode.ORDER_FUNCTION_CALL];
  }
  throw Error('Unhandled option (text_charAt).');
};

Blockly.genCode['text'] = function(block) {
  var code = Blockly.genCode.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.genCode.ORDER_ATOMIC];
};

Blockly.genCode['lists_create_with'] = function(block) {
  var elements = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    elements[i] = Blockly.genCode.valueToCode(block, 'ADD' + i,
        Blockly.genCode.ORDER_NONE) || 'null';
  }
  var code = '[' + elements.join(', ') + ']';
  return [code, Blockly.genCode.ORDER_ATOMIC];
};

Blockly.genCode['text_println'] = function(block) {
  var msg = Blockly.genCode.valueToCode(block, 'TEXT',
      Blockly.genCode.ORDER_NONE) || '\'\'';
  return 'print(' + msg + ')\n';
};

Blockly.genCode['text_print'] = function(block) {
  var msg = Blockly.genCode.valueToCode(block, 'TEXT',
      Blockly.genCode.ORDER_NONE) || '\'\'';
  return 'write(' + msg + ')\n';
};

Blockly.genCode['math_number'] = function(block) {
  var code = Number(block.getFieldValue('NUM'));
  var order = code >= 0 ? Blockly.genCode.ORDER_ATOMIC :
              Blockly.genCode.ORDER_UNARY_SIGN;
  return [code, order];
};

Blockly.genCode['text_indexOf'] = function(block) {
  var operator = block.getFieldValue('END') == 'FIRST' ?
      'indexOf' : 'lastIndexOf';
  var substring = Blockly.genCode.valueToCode(block, 'FIND',
      Blockly.genCode.ORDER_NONE) || '\'\'';
  var text = Blockly.genCode.valueToCode(block, 'VALUE',
      Blockly.genCode.ORDER_MEMBER) || '\'\'';
  var index = Blockly.genCode.valueToCode(block, 'INDEX',
      Blockly.genCode.ORDER_MEMBER);
  var code = text + '.' + operator + '(' + substring + (index? (", " + index) : "") + ')';
  if (block.workspace.options.oneBasedIndex) {
    return [code + ' + 1', Blockly.genCode.ORDER_ADDITION];
  }
  return [code, Blockly.genCode.ORDER_FUNCTION_CALL];
};

Blockly.genCode['lists_indexOf'] = Blockly.genCode['text_indexOf'];

Blockly.genCode['math_arithmetic'] = function(block) {
  var OPERATORS = {
    'ADD': [' + ', Blockly.genCode.ORDER_ADDITIVE],
    'MINUS': [' - ', Blockly.genCode.ORDER_ADDITIVE],
    'MULTIPLY': [' * ', Blockly.genCode.ORDER_MULTIPLICATIVE],
    'DIVIDE': [' / ', Blockly.genCode.ORDER_MULTIPLICATIVE],
    'POWER': [' ** ', Blockly.genCode.ORDER_EXPONENTIATION]
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.genCode.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.genCode.valueToCode(block, 'B', order) || '0';
  var code;
  code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.genCode['math_modulo'] = function(block) {
  var argument0 = Blockly.genCode.valueToCode(block, 'DIVIDEND',
      Blockly.genCode.ORDER_MULTIPLICATIVE) || '0';
  var argument1 = Blockly.genCode.valueToCode(block, 'DIVISOR',
      Blockly.genCode.ORDER_MULTIPLICATIVE) || '0';
  var code = argument0 + ' % ' + argument1;
  return [code, Blockly.genCode.ORDER_MULTIPLICATIVE];
};

Blockly.genCode['text_isEmpty'] = function(block) {
  var text = Blockly.genCode.valueToCode(block, 'VALUE',
      Blockly.genCode.ORDER_MEMBER) || '\'\'';
  return [text + '.isEmpty()', Blockly.genCode.ORDER_FUNCTION_CALL];
};

Blockly.genCode['lists_isEmpty'] = Blockly.genCode['text_isEmpty'];

Blockly.genCode['variables_get'] = function(block) {
  var code = Blockly.genCode.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.VARIABLE_CATEGORY_NAME);
  parent = block.parentBlock_;
  var markAsUsed = true;
  while (parent) {
    parent = parent.parentBlock_ || parent.previousConnection;
    if (parent && parent.callType_ && parent.callType_.startsWith('procedures')) {
      if (parent.getVars().includes(code)) {
        markAsUsed = false;
      }
    }
  }
  if (markAsUsed) usedVariables[code] = true;
  return [code, Blockly.genCode.ORDER_ATOMIC];
};

Blockly.genCode['variables_set'] = function(block) {
  var argument0 = Blockly.genCode.valueToCode(block, 'VALUE',
      Blockly.genCode.ORDER_NONE) || '0';
  var varName = Blockly.genCode.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  return varName + ' = ' + argument0 + '\n';
};

Blockly.genCode['math_change'] = function(block) {
  var argument0 = Blockly.genCode.valueToCode(block, 'DELTA',
      Blockly.genCode.ORDER_ADDITIVE) || '0';
  var varName = Blockly.genCode.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  return varName + ' += ' + argument0 + '\n';
};

Blockly.genCode['text_changeCase'] = function(block) {
  var OPERATORS = {
    'UPPERCASE': '.toUpperCase()',
    'LOWERCASE': '.toLowerCase()',
    'TITLECASE': '.toTitleCase()'
  };
  var operator = OPERATORS[block.getFieldValue('CASE')];
  var text = Blockly.genCode.valueToCode(block, 'TEXT',
      Blockly.genCode.ORDER_MEMBER) || '\'\'';
  var code = text + operator;
  return [code, Blockly.genCode.ORDER_FUNCTION_CALL];
};

Blockly.genCode['text_trim'] = function(block) {
  var OPERATORS = {
    'LEFT': '.trimLeft()',
    'RIGHT': '.trimRight()',
    'BOTH': '.trim()'
  };
  var operator = OPERATORS[block.getFieldValue('MODE')];
  var text = Blockly.genCode.valueToCode(block, 'TEXT',
      Blockly.genCode.ORDER_MEMBER) || '\'\'';
  var code = text + operator;
  return [code, Blockly.genCode.ORDER_FUNCTION_CALL];
};

Blockly.genCode['procedures_defreturn'] = function(block) {
  var workspace = block.workspace;
  var variables = Blockly.Variables.allUsedVarModels(workspace) || [];
  // var funcName = Blockly.genCode.functionsDB_.getName(
      // block.getFieldValue('NAME'), Blockly.PROCEDURE_CATEGORY_NAME);
  var funcName = block.getFieldValue('NAME').replace(/[^A-Za-z0-9_]/g, '_')
  var xfix1 = '';
  if (Blockly.genCode.STATEMENT_PREFIX) {
    xfix1 += Blockly.genCode.injectId(Blockly.genCode.STATEMENT_PREFIX, block);
  }
  if (Blockly.genCode.STATEMENT_SUFFIX) {
    xfix1 += Blockly.genCode.injectId(Blockly.genCode.STATEMENT_SUFFIX, block);
  }
  if (xfix1) {
    xfix1 = Blockly.genCode.prefixLines(xfix1, Blockly.genCode.INDENT);
  }
  var loopTrap = '';
  if (Blockly.genCode.INFINITE_LOOP_TRAP) {
    loopTrap = Blockly.genCode.prefixLines(
        Blockly.genCode.injectId(Blockly.genCode.INFINITE_LOOP_TRAP, block),
        Blockly.genCode.INDENT);
  }
  var branch = Blockly.genCode.statementToCode(block, 'STACK');
  var returnValue = Blockly.genCode.valueToCode(block, 'RETURN',
      Blockly.genCode.ORDER_NONE) || '';
  var xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = Blockly.genCode.INDENT + 'return ' + returnValue + '\n';
  }
  var args = [];
  var variables = block.getVars();
  for (var i = 0; i < variables.length; i++) {
    args[i] = Blockly.genCode.variableDB_.getName(variables[i],
        Blockly.VARIABLE_CATEGORY_NAME);
        allVariables.push([variables[i], variables[i]]);
  }
  var code = 'func ' + funcName + '(' + args.join(', ') + ') {\n' +
     xfix1 + loopTrap + branch + xfix2 + returnValue + '}\n';
  code = Blockly.genCode.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  while (Blockly.genCode.definitions_['%' + funcName]) funcName = '%' + funcName
  Blockly.genCode.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.genCode['procedures_defnoreturn'] =
    Blockly.genCode['procedures_defreturn'];

Blockly.genCode['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  // var funcName = Blockly.genCode.functionsDB_.getName(block.getFieldValue('NAME'),
  //     Blockly.PROCEDURE_CATEGORY_NAME);
  var funcName = block.getFieldValue('NAME').replace(/[^A-Za-z0-9_]/g, '_')
  var args = [];
  var variables = block.getVars();
  for (var i = 0; i < variables.length; i++) {
    args[i] = Blockly.genCode.valueToCode(block, 'ARG' + i,
        Blockly.genCode.ORDER_NONE) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.genCode.ORDER_FUNCTION_CALL];
};

Blockly.genCode['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  // Generated code is for a function call as a statement is the same as a
  // function call as a value, with the addition of line ending.
  var tuple = Blockly.genCode['procedures_callreturn'](block);
  return tuple[0] + '\n';
};

Blockly.genCode['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.genCode.valueToCode(block, 'CONDITION',
      Blockly.genCode.ORDER_NONE) || 'false';
  var code = 'if ' + condition + '{\n';
  if (Blockly.genCode.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the return is triggered.
    code += Blockly.genCode.prefixLines(
        Blockly.genCode.injectId(Blockly.genCode.STATEMENT_SUFFIX, block),
        Blockly.genCode.INDENT);
  }
  if (block.hasReturnValue_) {
    var value = Blockly.genCode.valueToCode(block, 'VALUE',
        Blockly.genCode.ORDER_NONE) || 'null';
    code += Blockly.genCode.INDENT + 'return ' + value + '\n}\n';
  } else {
    code += Blockly.genCode.INDENT + 'return\n}\n';
  }
  return code;
};

Blockly.genCode['return_statement'] = function(block) {
  var msg = Blockly.genCode.valueToCode(block, 'VALUE',
      Blockly.genCode.ORDER_NONE) || 'null';
  return 'return ' + msg + '\n';
};

Blockly.genCode['logic_boolean'] = function(block) {
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.genCode.ORDER_ATOMIC];
};

Blockly.genCode['logic_null'] = function(block) {
  return ['null', Blockly.genCode.ORDER_ATOMIC];
};

Blockly.genCode['variable_get'] = function(block) {
  var code = Blockly.genCode.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.VARIABLE_CATEGORY_NAME);
  return [code, Blockly.genCode.ORDER_ATOMIC];
};

Blockly.genCode['variable_set'] = function(block) {
  var argument0 = Blockly.genCode.valueToCode(block, 'DATA',
      Blockly.genCode.ORDER_NONE) || '0';
  var varName = Blockly.genCode.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.VARIABLE_CATEGORY_NAME);
  return varName + ' = ' + argument0 + '\n';
};

Blockly.genCode['variable_declare'] = function(block) {
  var argument0 = Blockly.genCode.valueToCode(block, 'VALUE',
      Blockly.genCode.ORDER_NONE);
  var varName = Blockly.genCode.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.VARIABLE_CATEGORY_NAME);
  allVariables.push([varName, varName]);
  var code = 'var ' + varName;
  if (argument0) code += " = " + argument0;
  return code + "\n";
};

Blockly.genCode['control_break'] = function(block) {
  return 'break\n';
};

Blockly.genCode['control_continue'] = function(block) {
  return 'continue\n';
};

Blockly.genCode['main_entry'] = function(block) {
  block.disabled = onStartUsed != 0;
  onStartUsed++;
  publicVariables = [];
  for (var i of block.childBlocks_) {
    if (i.type == 'variable_declare' && i.getField('NAME').getValue() != '') {
      publicVariables.push(i.getField('NAME').getValue());
    }
  }
  return Blockly.genCode.statementToCode(block, 'STACK').replace(/^(\t|  )/gm, '');
};

Blockly.genCode['logic_compare'] = function(block) {
  var OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var argument0 = Blockly.genCode.valueToCode(block, 'A', Blockly.genCode.ORDER_RELATIONAL) || '0';
  var argument1 = Blockly.genCode.valueToCode(block, 'B', Blockly.genCode.ORDER_RELATIONAL) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, Blockly.genCode.ORDER_RELATIONAL];
};

Blockly.genCode['logic_operation'] = function(block) {
  var operator = (block.getFieldValue('OP') == 'AND') ? 'and' : 'or';
  var order = (operator == 'and') ? Blockly.genCode.ORDER_LOGICAL_AND : Blockly.genCode.ORDER_LOGICAL_OR;
  var argument0 = Blockly.genCode.valueToCode(block, 'A', order);
  var argument1 = Blockly.genCode.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    argument0 = 'false';
    argument1 = 'false';
  } else {
    var defaultArgument = (operator == 'and') ? 'true' : 'false';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.genCode['logic_negate'] = function(block) {
  var argument0 = Blockly.genCode.valueToCode(block, 'BOOL',
      Blockly.genCode.ORDER_LOGICAL_NOT) || 'true';
  var code = '!' + argument0;
  return [code, Blockly.genCode.ORDER_LOGICAL_NOT];
};

Blockly.genCode['text_length'] = function(block) {
  var text = Blockly.genCode.valueToCode(block, 'VALUE',
      Blockly.genCode.ORDER_NONE) || '\'\'';
  return [text + '.length()', Blockly.genCode.ORDER_FUNCTION_CALL];
};

Blockly.genCode['lists_getIndex'] = function(block) {
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var listOrder = (where == 'RANDOM') ? Blockly.genCode.ORDER_NONE :
      Blockly.genCode.ORDER_MEMBER;
  var list = Blockly.genCode.valueToCode(block, 'VALUE', listOrder) || '[]';

  switch (where) {
    case ('FIRST'):
      if (mode == 'GET') {
        var code = list + '.getFirstItem()';
        return [code, Blockly.genCode.ORDER_MEMBER];
      }
      break;
    case ('LAST'):
      if (mode == 'GET') {
        var code = list + '.getLastItem()';
        return [code, Blockly.genCode.ORDER_MEMBER];
      }
      break;
    case ('FROM_START'):
      var at = Blockly.genCode.getAdjusted(block, 'AT');
      if (mode == 'GET') {
        var code = list + '[' + at + ']';
        return [code, Blockly.genCode.ORDER_MEMBER];
      }
      break;
    case ('FROM_END'):
      var at = Blockly.genCode.getAdjusted(block, 'AT');
      if (mode == 'GET') {
        var code = list + '.getFromEnd(' + at + ')';
        return [code, Blockly.genCode.ORDER_FUNCTION_CALL];
      }
      break;
    case ('RANDOM'):
      if (mode == 'GET') {
        var code = list + '.getRandomItem()';
        return [code, Blockly.genCode.ORDER_MEMBER];
      }
      break;
  }
  throw Error('Unhandled combination (lists_getIndex).');
};

Blockly.genCode['lists_length'] = function(block) {
  var list = Blockly.genCode.valueToCode(block, 'VALUE',
      Blockly.genCode.ORDER_MEMBER) || '[]';
  return [list + '.length()', Blockly.genCode.ORDER_MEMBER];
};

Blockly.genCode['lists_setIndex'] = function(block) {
  var list = Blockly.genCode.valueToCode(block, 'LIST',
      Blockly.genCode.ORDER_MEMBER) || '[]';
  var mode = block.getFieldValue('MODE') || 'SET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var value = Blockly.genCode.valueToCode(block, 'TO',
      Blockly.genCode.ORDER_NONE) || 'null';
  // function cacheList() {
  //   if (list.match(/^\w+$/)) {
  //     return '';
  //   }
  //   var listVar = Blockly.genCode.variableDB_.getDistinctName(
  //       'tmp_list', Blockly.VARIABLE_CATEGORY_NAME);
  //   var code = listVar + ' = ' + list + '\n';
  //   list = listVar;
  //   return code;
  // }

  switch (where) {
    // case 'FIRST':
    //   if (mode == 'SET') {
    //     return list + '[0] = ' + value + '\n';
    //   } else if (mode == 'INSERT') {
    //     return list + '.insert(0, ' + value + ')\n';
    //   }
    //   break;
    // case 'LAST':
    //     if (mode == 'SET') {
    //       return list + '[-1] = ' + value + '\n';
    //     } else if (mode == 'INSERT') {
    //       return list + '.append(' + value + ')\n';
    //     }
    //   break;
    case 'FROM_START':
      var at = Blockly.genCode.getAdjusted(block, 'AT');
        if (mode == 'SET') {
          return list + '[' + at + '] = ' + value + '\n';
        // } else if (mode == 'INSERT') {
        //   return list + '.insert(' + at + ', ' + value + ')\n';
        }
      break;
    // case 'FROM_END':
    //   var at = Blockly.genCode.getAdjusted(block, 'AT', 1, true);
    //     if (mode == 'SET') {
    //       return list + '[' + at + '] = ' + value + '\n';
    //     } else if (mode == 'INSERT') {
    //       return list + '.insert(' + at + ', ' + value + ')\n';
    //     }
    //   break;
    // case 'RANDOM':
    //     Blockly.genCode.definitions_['import_random'] = 'import random';
    //     var code = cacheList();
    //     var xVar = Blockly.genCode.variableDB_.getDistinctName(
    //         'tmp_x', Blockly.VARIABLE_CATEGORY_NAME);
    //     code += xVar + ' = int(random.random() * len(' + list + '))\n';
    //     if (mode == 'SET') {
    //       code += list + '[' + xVar + '] = ' + value + '\n';
    //       return code;
    //     } else if (mode == 'INSERT') {
    //       code += list + '.insert(' + xVar + ', ' + value + ')\n';
    //       return code;
    //     }
    //   break;
  }
  throw Error('Unhandled combination (lists_setIndex).');
};

Blockly.genCode['procedures_defreturn_method'] = function(block) {
  var varName;
  var workspace = block.workspace;
  var variables = Blockly.Variables.allUsedVarModels(workspace) || [];
  var funcName = Blockly.genCode.functionsDB_.getName(
      block.getFieldValue('NAME'), Blockly.PROCEDURE_CATEGORY_NAME);
  var xfix1 = '';
  if (Blockly.genCode.STATEMENT_PREFIX) {
    xfix1 += Blockly.genCode.injectId(Blockly.genCode.STATEMENT_PREFIX, block);
  }
  if (Blockly.genCode.STATEMENT_SUFFIX) {
    xfix1 += Blockly.genCode.injectId(Blockly.genCode.STATEMENT_SUFFIX, block);
  }
  if (xfix1) {
    xfix1 = Blockly.genCode.prefixLines(xfix1, Blockly.genCode.INDENT);
  }
  var loopTrap = '';
  if (Blockly.genCode.INFINITE_LOOP_TRAP) {
    loopTrap = Blockly.genCode.prefixLines(
        Blockly.genCode.injectId(Blockly.genCode.INFINITE_LOOP_TRAP, block),
        Blockly.genCode.INDENT);
  }
  var branch = Blockly.genCode.statementToCode(block, 'STACK');
  var returnValue = Blockly.genCode.valueToCode(block, 'RETURN',
      Blockly.genCode.ORDER_NONE) || '';
  var xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = Blockly.genCode.INDENT + 'return ' + returnValue + '\n';
  }
  var args = [];
  var variables = block.getVars();
  for (var i = 0; i < variables.length; i++) {
    args[i] = Blockly.genCode.variableDB_.getName(variables[i],
        Blockly.VARIABLE_CATEGORY_NAME);
        allVariables.push([variables[i], variables[i]]);
  }
  var code = 'func ' + funcName + '(' + args.join(', ') + ') {\n' +
     xfix1 + loopTrap + branch + xfix2 + returnValue + '}\n';
  return code;
};

Blockly.genCode['create_instance'] = function(block) {
  var elements = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    elements[i] = Blockly.genCode.valueToCode(block, 'ARG' + i,
        Blockly.genCode.ORDER_NONE) || 'null';
  }
  var code = 'new ' + block.getFieldValue("NAME") + '(' + elements.join(', ') + ')';
  return [code, Blockly.genCode.ORDER_ATOMIC];
};

Blockly.genCode['class_call_method'] = function(block) {
  var elements = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    elements[i] = Blockly.genCode.valueToCode(block, 'ARG' + i,
        Blockly.genCode.ORDER_NONE) || 'null';
  }
  var code = Blockly.genCode.valueToCode(block, 'INSTANCE', Blockly.genCode.ORDER_NONE) + '.' + block.getFieldValue("NAME") + '(' + elements.join(', ') + ')';
  return [code, Blockly.genCode.ORDER_ATOMIC];
};

Blockly.genCode['class_call_static_method'] = function(block) {
  var elements = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    elements[i] = Blockly.genCode.valueToCode(block, 'ARG' + i,
        Blockly.genCode.ORDER_NONE) || 'null';
  }
  var code = block.getFieldValue("CLASS") + '.' + block.getFieldValue("NAME") + '(' + elements.join(', ') + ')';
  return [code, Blockly.genCode.ORDER_ATOMIC];
};

Blockly.genCode['class_call_static_method_statement'] = function(block) {
  // var elements = new Array(block.itemCount_);
  // for (var i = 0; i < block.itemCount_; i++) {
    // elements[i] = Blockly.genCode.valueToCode(block, 'ARG' + i,
        // Blockly.genCode.ORDER_NONE) || 'null';
  // }
  // var code = Blockly.genCode.valueToCode(block, 'INSTANCE', Blockly.genCode.ORDER_NONE) + '.' + block.getFieldValue("NAME") + '(' + elements.join(', ') + ')';
  let code = Blockly.genCode['class_call_static_method'](block)[0];
  return code + '\n';
};

Blockly.genCode['class_call_method_statement'] = function(block) {
  // var elements = new Array(block.itemCount_);
  // for (var i = 0; i < block.itemCount_; i++) {
    // elements[i] = Blockly.genCode.valueToCode(block, 'ARG' + i,
        // Blockly.genCode.ORDER_NONE) || 'null';
  // }
  // var code = Blockly.genCode.valueToCode(block, 'INSTANCE', Blockly.genCode.ORDER_NONE) + '.' + block.getFieldValue("NAME") + '(' + elements.join(', ') + ')';
  let code = Blockly.genCode['class_call_method'](block)[0];
  return code + '\n';
};

Blockly.genCode['class_get_property'] = function(block) {
  let code = Blockly.genCode.valueToCode(block, 'INSTANCE', Blockly.genCode.ORDER_NONE) + '.' + block.getFieldValue("NAME");
  return [code, Blockly.genCode.ORDER_MEMBER];
};

Blockly.genCode['class_get_static_property'] = function(block) {
  let code = block.getFieldValue('CLASS') + '.' + block.getFieldValue("NAME");
  return [code, Blockly.genCode.ORDER_MEMBER];
};

Blockly.genCode['class_set_property'] = function(block) {
  let code = Blockly.genCode.valueToCode(block, 'INSTANCE', Blockly.genCode.ORDER_NONE) +
        '.' + block.getFieldValue("NAME") + ' = ' + Blockly.genCode.valueToCode(block, 'VALUE', Blockly.genCode.ORDER_NONE);
  return code + '\n';
};

Blockly.genCode['class_set_static_property'] = function(block) {
  let code = block.getFieldValue('CLASS') + '.' + block.getFieldValue("NAME") +
        ' = ' + Blockly.genCode.valueToCode(block, 'VALUE', Blockly.genCode.ORDER_NONE);
  return code + '\n';
};

// Blockly.genCode['procedures_defnoreturn_method'] = Blockly.genCode['procedures_defreturn_method'];
Blockly.genCode['procedures_defreturn_static_method'] = function(block) {
  return 'static ' + Blockly.genCode['procedures_defreturn_method'](block);
}

Blockly.genCode['class_declare_static_property'] = function(block) {
  return 'static ' + Blockly.genCode['variable_declare'](block);
}
