import * as Blockly from 'blockly';

Blockly.genCode = new Blockly.Generator('genCode');

Blockly.genCode.addReservedWords(
    'func,if,return,var,while,null,true,false,',
    Object.getOwnPropertyNames(Blockly.utils.global).join(','));

//copied from Blockly javascript generator
Blockly.genCode.ORDER_ATOMIC = 0;           // 0 "" ...
Blockly.genCode.ORDER_NEW = 1.1;            // new
Blockly.genCode.ORDER_MEMBER = 1.2;         // . []
Blockly.genCode.ORDER_FUNCTION_CALL = 2;    // ()
Blockly.genCode.ORDER_INCREMENT = 3;        // ++
Blockly.genCode.ORDER_DECREMENT = 3;        // --
Blockly.genCode.ORDER_BITWISE_NOT = 4.1;    // ~
Blockly.genCode.ORDER_UNARY_PLUS = 4.2;     // +
Blockly.genCode.ORDER_UNARY_NEGATION = 4.3; // -
Blockly.genCode.ORDER_LOGICAL_NOT = 4.4;    // !
Blockly.genCode.ORDER_TYPEOF = 4.5;         // typeof
Blockly.genCode.ORDER_VOID = 4.6;           // void
Blockly.genCode.ORDER_DELETE = 4.7;         // delete
Blockly.genCode.ORDER_AWAIT = 4.8;          // await
Blockly.genCode.ORDER_EXPONENTIATION = 5.0; // **
Blockly.genCode.ORDER_MULTIPLICATION = 5.1; // *
Blockly.genCode.ORDER_DIVISION = 5.2;       // /
Blockly.genCode.ORDER_MODULUS = 5.3;        // %
Blockly.genCode.ORDER_SUBTRACTION = 6.1;    // -
Blockly.genCode.ORDER_ADDITION = 6.2;       // +
Blockly.genCode.ORDER_BITWISE_SHIFT = 7;    // << >> >>>
Blockly.genCode.ORDER_RELATIONAL = 8;       // < <= > >=
Blockly.genCode.ORDER_IN = 8;               // in
Blockly.genCode.ORDER_INSTANCEOF = 8;       // instanceof
Blockly.genCode.ORDER_EQUALITY = 9;         // == != === !==
Blockly.genCode.ORDER_BITWISE_AND = 10;     // &
Blockly.genCode.ORDER_BITWISE_XOR = 11;     // ^
Blockly.genCode.ORDER_BITWISE_OR = 12;      // |
Blockly.genCode.ORDER_LOGICAL_AND = 13;     // &&
Blockly.genCode.ORDER_LOGICAL_OR = 14;      // ||
Blockly.genCode.ORDER_CONDITIONAL = 15;     // ?:
Blockly.genCode.ORDER_ASSIGNMENT = 16;      // = += -= **= *= /= %= <<= >>= ...
Blockly.genCode.ORDER_YIELD = 17;           // yield
Blockly.genCode.ORDER_COMMA = 18;           // ,
Blockly.genCode.ORDER_NONE = 99;            // (...)

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
