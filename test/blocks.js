function initBlocks() {
  function addBlock(blockName, blockCategory, blockDefaultValues, blockFunctionName,
    blockFunctionParameters, paramTypes, functionCode, blockUI, tooltip, helpUrl) {
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
        for (var tmp of blockUI) {
          if (tmp == null) {
            if (paramTypes[i]) {
              this.appendValueInput("ARG" + i)
                  .setCheck(null);
            } else {
              this.appendStatementInput("ARG" + i)
                  .setCheck(null);
            }
            i++;
          } else if (typeof tmp == 'string') {
            this.appendDummyInput()
                  .appendField(tmp);
          } else if (typeof tmp == 'function') {
            tmp(this);
          }
        }
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(document.getElementById(blockCategory + "Category").getAttribute('colour'));
      }
    };
    Blockly.genCode[blockName] = function(block) {
      var code = blockFunctionName + "(";
      for (var i = 0; i < paramTypes.length; i++) {
        if (paramTypes[i])
          code += Blockly.genCode.valueToCode(block, 'ARG' + i, Blockly.genCode.ORDER_ATOMIC);
        else
          code += "() -> {\n" + Blockly.genCode.statementToCode(block, 'ARG' + i) + "}";
        if (i != paramTypes.length - 1) code += ', ';
      }
      return code + ')\n';
    };
    functionCodes += functionCode;
  }

  function createShadows(values) {
    var counter = 0;
    for (var i of values) {
      if (typeof i == 'number') {
        out += '<value name="ARG' + counter++ + '"><shadow type="math_number"><field name="NUM">' + i + '</field></shadow></value>';
      } else if (typeof i == 'string') {
        out += '<value name="ARG' + counter++ + '"><shadow type="text"><field name="TEXT">' + i + '</field></shadow></value>';
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

  addBlock("test", "Math", createShadows(["10"]), "test", ['v', 'f'], [true, false],
    `func test(v, f) {
      print v
      print "\\n"
      f!()
    }`, ['text 1', null, "text 2", null, function(block) { //image field
      block.appendDummyInput().appendField(new Blockly.FieldImage("https://www.gstatic.com/codesite/ph/images/star_on.gif", 15, 15, { alt: "*", flipRtl: "FALSE" }));
    }], 'tooltip', 'helpUrl'
  );

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
    }]
  );
}

export { initBlocks };
