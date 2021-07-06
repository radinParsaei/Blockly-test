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
      this.rowDiv_.firstChild.childNodes[0].setAttribute('style', this.rowDiv_.firstChild.childNodes[0].getAttribute('style').replace('background:white', 'background:' + this.colour_).replace('background: white', 'background:' + this.colour_));
      this.rowDiv_.style.backgroundColor = 'white';
      label.style.color = this.colour_;
      this.iconDom_.style.color = this.colour_;
    } else {
      this.rowDiv_.firstChild.childNodes[0].setAttribute('style', this.rowDiv_.firstChild.childNodes[0].getAttribute('style').replace(/background:.*\d+\); margin/, 'background:white; margin'));
      this.rowDiv_.style.backgroundColor = this.colour_;
      label.style.color = 'white';
      this.iconDom_.style.color = 'white';
    }
    Blockly.utils.aria.setState((this.htmlDiv_), Blockly.utils.aria.State.SELECTED, isSelected);
  }

  createIconDom_() {
    const icon = document.createElement('img');
    // icon.src = this.name.substring(0, this.name.length - 1).replace('%{BKY_CATEGORY_', '').toLowerCase() + '.svg';
    icon.setAttribute('style', '-webkit-mask:url("' + this.name.substring(0, this.name.length - 1).replace('%{BKY_CATEGORY_', '').toLowerCase() + '.svg") center/contain;mask:url("' + '") center/contain;display:inline-block;background:white')
    // console.log(icon.src);
    // icon.src = 'https://developers.google.com/blockly/images/logos/logo_only.svg';
    if(window.innerHeight > window.innerWidth){
      icon.width = '25';
      icon.height = '25';
    } else {
      icon.width = '31.5';
      icon.height = '31.5';
      icon.setAttribute('style', icon.getAttribute('style') + ';' + 'margin: 8px');
    }
    return icon;
  }
}

Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    CustomCategory, true);
