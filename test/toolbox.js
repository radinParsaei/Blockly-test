import * as Blockly from 'blockly/core';

class CustomCategory extends Blockly.ToolboxCategory {
  constructor(a, b, c) {
    super(a, b, c);
    this.name = a.name;
  }

  addColourBorder_(colour){
    this.rowDiv_.style.backgroundColor = colour;
  }

  setSelected(isSelected){
    var label = this.rowDiv_.getElementsByClassName('blocklyTreeLabel')[0];
    if (isSelected) {
      this.rowDiv_.style.backgroundColor = 'white';
      label.style.color = this.colour_;
      this.iconDom_.style.color = this.colour_;
    } else {
      this.rowDiv_.style.backgroundColor = this.colour_;
      label.style.color = 'white';
      this.iconDom_.style.color = 'white';
    }
    Blockly.utils.aria.setState((this.htmlDiv_), Blockly.utils.aria.State.SELECTED, isSelected);
  }

  createIconDom_() {
    const icon = document.createElement('img');
    // icon.src = './' + this.name + '.svg';
    icon.src = 'https://developers.google.com/blockly/images/logos/logo_only.svg';
    if(window.innerHeight > window.innerWidth){
      icon.width = '25';
      icon.height = '25';
    } else {
      icon.width = '40';
      icon.height = '40';
      icon.setAttribute('style', 'margin: 0;margin-top: 6px;margin-bottom: 6px');
    }
    return icon;
  }
}

Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    CustomCategory, true);
