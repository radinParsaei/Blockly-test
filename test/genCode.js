import * as Blockly from 'blockly';

Blockly.genCode = new Blockly.Generator('genCode');

Blockly.genCode.addReservedWords(
    'func,if,return,var,while,null,true,false,',
    Object.getOwnPropertyNames(Blockly.utils.global).join(','));

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
  [Blockly.genCode.ORDER_ADDITION, Blockly.genCode.ORDER_ADDITION],
  // a && (b && c) -> a && b && c
  [Blockly.genCode.ORDER_LOGICAL_AND, Blockly.genCode.ORDER_LOGICAL_AND],
  // a || (b || c) -> a || b || c
  [Blockly.genCode.ORDER_LOGICAL_OR, Blockly.genCode.ORDER_LOGICAL_OR]
];

Blockly.genCode.init = function(workspace) {
  Blockly.genCode.definitions_ = Object.create(null);
  Blockly.genCode.functionNames_ = Object.create(null);

  if (!Blockly.genCode.variableDB_) {
    Blockly.genCode.variableDB_ =
        new Blockly.Names(Blockly.genCode.RESERVED_WORDS_);
  } else {
    Blockly.genCode.variableDB_.reset();
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
  if (defvars.length) {
    Blockly.genCode.definitions_['variables'] =
        'var ' + defvars.join(', ') + ';';
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
  return definitions.join('\n\n') + '\n\n\n' + code;
};

Blockly.genCode.scrubNakedValue = function(line) {
  return line + ';\n';
};

Blockly.genCode.quote_ = function(string) {
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\n')
                 .replace(/'/g, '\\\'');
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
        Blockly.genCode.ORDER_ADDITION) || defaultAtIndex;
  } else if (delta < 0) {
    var at = Blockly.genCode.valueToCode(block, atId,
        Blockly.genCode.ORDER_SUBTRACTION) || defaultAtIndex;
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
      var innerOrder = Blockly.genCode.ORDER_ADDITION;
    } else if (delta < 0) {
      at = at + ' - ' + -delta;
      var innerOrder = Blockly.genCode.ORDER_SUBTRACTION;
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

Blockly.genCode['text'] = function(block) {
  var code = Blockly.genCode.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.genCode.ORDER_ATOMIC];
};

Blockly.genCode['text_print'] = function(block) {
  var msg = Blockly.genCode.valueToCode(block, 'TEXT',
      Blockly.genCode.ORDER_NONE) || '\'\'';
  return 'print ' + msg + '\n';
};

Blockly.genCode['math_number'] = function(block) {
  var code = Number(block.getFieldValue('NUM'));
  var order = code >= 0 ? Blockly.genCode.ORDER_ATOMIC :
              Blockly.genCode.ORDER_UNARY_NEGATION;
  return [code, order];
};

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
