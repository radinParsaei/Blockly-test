import Blockly from 'blockly/core';
import {createMinusField} from './field_minus';
import {createPlusField} from './field_plus';

const controlsIfMutator = {
  suppressPrefixSuffix: true,
  hasValue: false,
  mutationToDom: function() {
    if (!this.hasValue) {
      return null;
    }
    const container = Blockly.utils.xml.createElement('mutation');
    if (this.hasValue) {
      container.setAttribute('hasValue', 1);
    }
    return container;
  },

  domToMutation: function(xmlElement) {
    this.hasValue = !!parseInt(xmlElement.getAttribute('hasValue')) || 0;
    this.updateShape_();
  },

  updateShape_: function() {
    if (this.hasValue) this.appendValue();
  },
  plus: function() {
    if (this.hasValue) return;
    this.appendValue();
  },
  minus: function(index) {
    this.removeValue(index);
  },
  appendValue: function() {
    this.hasValue = true;
    this.removeInput('DUM1');
    this.appendValueInput('VALUE').setCheck(null).appendField('=');
    this.appendDummyInput('DUM').appendField(
            createMinusField(), 'MINUS');
  },

  removeValue: function(opt_index) {
    this.hasValue = false;
    this.removeInput('VALUE');
    this.removeInput('DUM');
    this.appendDummyInput('DUM1').appendField(createPlusField(), 'PLUS');
  },
};

const controlsIfHelper = function() {
  this.appendDummyInput('DUM1').appendField(createPlusField(), 'PLUS');
};

Blockly.Extensions.registerMutator('variable_set_mutator',
    controlsIfMutator, controlsIfHelper);
