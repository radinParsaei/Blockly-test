import * as Blockly from 'blockly';
import { CodeJar } from 'CodeJar';
import { withLineNumbers } from 'codejar/linenumbers';
import { initBlocks, functions, functionCodes } from './blocks.js';
import {ContinuousToolbox} from '../continuous-toolbox/src/ContinuousToolbox';
import {ContinuousFlyout} from '../continuous-toolbox/src/ContinuousFlyout';
import './procedures.js';
// import html2canvas from 'html2canvas';

// function genPhoto() {
  // html2canvas(document.body, {logging: false}).then(function(canvas) {
      // document.body.appendChild(canvas);
  // });
// }

var isDark = false;
var isFirst = true;
let workspace;

function createWorkspace(blocklyDiv, options) {
  workspace = Blockly.inject(blocklyDiv, options);
  workspace.addChangeListener(function(event) {
    if (localStorage.getItem('mode') == 'block') {
      runCode();
    }
  });
  return workspace;
}

export { Blockly };

import './genCode.js';
import { DarkTheme, LightTheme } from './themes.js';
import './toolbox.js'

function injectBlockly() {
  var xml;
  if (!isFirst) {
    xml = Blockly.Xml.workspaceToDom(workspace);
  }
  const options = {
    toolbox: document.getElementById('toolbox'),
    theme: isDark? DarkTheme : LightTheme,
    renderer: 'zelos',
    collapse : true,
    comments : false,
    disable : true,
    maxBlocks : Infinity,
    trashcan : true,
    css : true,
    // media : 'http://localhost:3000',
    rtl : false,
    scrollbars : true,
    sounds : false,
    oneBasedIndex : true,
    grid : {
      spacing : 20,
      length : 2,
      colour : isDark? '#fff2':'#7772',
      snap : true
    },
    zoom : {
      controls : true,
      wheel : true,
      startScale : 1,
      maxScale : 2,
      minScale : 0.5,
      scaleSpeed : 1.2,
      controls: true,
    },
    scrollbars: true,
    move: {
        drag: true,
        wheel: true
    }
  };
  let element = document.getElementById('style');
  if (element != null) element.remove();
  let sheet = document.createElement('style');
  sheet.setAttribute('id', 'style');
  if(window.innerHeight > window.innerWidth){
    options['horizontalLayout'] = true;
    options['toolboxPosition'] = 'end';
    sheet.innerHTML = ".blocklyTreeRowContentContainer{padding: 5px !important;}";
  } else {
    options['plugins'] = {
      'toolbox': ContinuousToolbox,
      'flyoutsVerticalToolbox': ContinuousFlyout,
    }
    sheet.innerHTML = "";
  }
  document.body.appendChild(sheet);
  createWorkspace(document.getElementById('root'), options);
  if (isFirst) {
    isFirst = false;
    try {
      const xml = Blockly.Xml.textToDom(sessionStorage.getItem("blocks"));
      Blockly.Xml.domToWorkspace(xml, workspace);
    } catch (e) {}
  } else {
    Blockly.Xml.domToWorkspace(xml, workspace);
  }
}

window.onresize = function(event) {
  changeViewWithoutSwap();
  changeViewWithoutSwap();
}

document.addEventListener('DOMContentLoaded', function() {
  initBlocks();
  Blockly.Msg["MATH_POWER_SYMBOL"] = "**";
  injectBlockly();
});

function runCode() {
  const code = Blockly.genCode.workspaceToCode(workspace);
  jar.updateCode(code);
  localStorage.setItem('code', code);
  if (localStorage.getItem("mode") == "code") {
    document.getElementById("callColor").click();
  }
}

window.onbeforeunload = function (e) {
  const xml = Blockly.Xml.workspaceToDom(workspace);
  sessionStorage.setItem("blocks", Blockly.Xml.domToPrettyText(xml));
};

const highlight = (editor) => {
  if (localStorage.getItem("mode") == "code") {
    document.getElementById("callColor").click();
  }
}
let jar = CodeJar(document.querySelector('#editor'), withLineNumbers(highlight));

function changeThemeWithoutSwap() {
  document.getElementById("editor").classList.toggle('dark');
  document.getElementById("console").classList.toggle('dark');
  document.getElementById("console2").classList.toggle('dark');
  isDark = !isDark;
}

function changeTheme() {
  changeThemeWithoutSwap();
  var tmp = localStorage.getItem('theme');
  if (tmp == "light")
      localStorage.setItem('theme', 'dark');
  else
      localStorage.setItem('theme', 'light');
}

jar.updateCode(localStorage.getItem('code'))
jar.onUpdate(code => {
  localStorage.setItem('code', code)
});

if (!(localStorage.getItem('mode') == "block" || localStorage.getItem('mode') == "code")) {
  localStorage.setItem('mode', "code");
}
if (localStorage.getItem('mode') == "block") {
  changeViewWithoutSwap();
}
if (!(localStorage.getItem('theme') == "dark" || localStorage.getItem('theme') == "light")) {
  localStorage.setItem('theme', "dark");
}
if (localStorage.getItem('theme') == "light") {
  changeThemeWithoutSwap();
}

function changeViewWithoutSwap() {
  try {
    document.getElementById("editor2").hidden = !document.getElementById("editor2").hidden;
    document.getElementById("root").hidden = !document.getElementById("root").hidden;
    isDark = !isDark;
    document.getElementById('root').removeChild(Blockly.getMainWorkspace().injectionDiv_);
    injectBlockly();
    document.getElementById("callColor").click();
  } catch(e) {}
  document.getElementById("gotocode").classList.toggle('selected');
  document.getElementById("gotoblock").classList.toggle('selected');
}

function changeView() {
  changeViewWithoutSwap();
  var tmp = localStorage.getItem('mode');
  if (tmp == "code")
      localStorage.setItem('mode', 'block');
  else
      localStorage.setItem('mode', 'code');
  workspace.trashcan.emptyContents();
  Blockly.getMainWorkspace().cleanUp();
}

if (localStorage.getItem('theme') == 'dark') document.getElementById('theme').checked = true;
else document.getElementById('theme').checked = false;

export { workspace, changeTheme, changeView, /*genPhoto,*/ injectBlockly, runCode };
