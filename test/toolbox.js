import * as Blockly from 'blockly/core';

var icons = {}

class CustomCategory extends Blockly.ToolboxCategory {
  constructor(a, b, c) {
    super(a, b, c);
    this.name = a.name;
  }

  addColourBorder_(colour){
    this.rowDiv_.style.backgroundColor = colour;
  }

  setSelected(isSelected){
    if (Editor.blocksSearchQuery && isSelected) return
    var label = this.rowDiv_.getElementsByClassName('blocklyTreeLabel')[0];
    if (isSelected) {
      this.rowDiv_.firstChild.childNodes[0].setAttribute('style', this.rowDiv_.firstChild.childNodes[0].getAttribute('style').replace('background:white', 'background:' + this.colour_).replace('background: white', 'background:' + this.colour_));
      this.rowDiv_.style.backgroundColor = 'white';
      label.style.color = this.colour_;
      this.iconDom_.style.color = this.colour_;
    } else {
      this.rowDiv_.firstChild.childNodes[0].setAttribute('style', this.rowDiv_.firstChild.childNodes[0].getAttribute('style').replace(/background:.*\d+\)( none repeat scroll 0% 0%)?; margin/, 'background:white; margin').replace(/background:.*\d+\); color/, 'background:white; color'));
      this.rowDiv_.style.backgroundColor = this.colour_;
      label.style.color = 'white';
      this.iconDom_.style.color = 'white';
    }
    Blockly.utils.aria.setState((this.htmlDiv_), Blockly.utils.aria.State.SELECTED, isSelected);
  }

  createIconDom_() {
    const icon = document.createElement('img');
    // icon.src = this.name.substring(0, this.name.length - 1).replace('%{BKY_CATEGORY_', '').toLowerCase() + '.svg';
    let url = Object.keys(icons).includes(this.name.substring(0, this.name.length - 1).replace('%{BKY_CATEGORY_', '').toLowerCase())? icons[this.name.substring(0, this.name.length - 1).replace('%{BKY_CATEGORY_', '').toLowerCase()] : this.name.substring(0, this.name.length - 1).replace('%{BKY_CATEGORY_', '').toLowerCase() + '.svg';
    icon.setAttribute('style', '-webkit-mask:url("' + url + '") center/contain;mask:url("' + url + '") center/contain;display:inline-block;background:white')
    // console.log(icon.src);
    // icon.src = 'https://developers.google.com/blockly/images/logos/logo_only.svg';
    var label = this.rowDiv_;
    if (window.innerHeight > window.innerWidth) {
      if (label != null) label.classList.add('horizontal');
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

export { icons }