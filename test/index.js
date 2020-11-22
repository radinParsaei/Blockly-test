import * as Blockly from 'blockly';
import { CodeJar } from 'CodeJar';
// import html2canvas from 'html2canvas';

// function genPhoto() {
  // html2canvas(document.body, {logging: false}).then(function(canvas) {
      // document.body.appendChild(canvas);
  // });
// }

var isDark = true;
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

function injectBlockly() {
  var xml;
  if (!isFirst) {
    xml = Blockly.Xml.workspaceToDom(workspace);
  }
  const options = {
    toolbox: document.getElementById('toolbox'),
    theme: isDark? Blockly.Themes.Dark : Blockly.Themes.Classic,
    renderer: 'zelos',
    collapse : true,
    comments : false,
    disable : true,
    maxBlocks : Infinity,
    trashcan : true,
    // horizontalLayout : true,
    toolboxPosition : 'start',
    css : true,
    // media : 'http://localhost:3000',
    rtl : false,
    scrollbars : true,
    sounds : false,
    oneBasedIndex : true,
    // grid : {
    //   spacing : 21,
    //   length : 3,
    //   colour : '#f00',
    //   snap : true
    // },
    zoom : {
      controls : true,
      wheel : false,
      startScale : 1,
      maxScale : 3,
      minScale : 0.3,
      scaleSpeed : 1.2
    }
  };
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

document.addEventListener('DOMContentLoaded', injectBlockly);

function runCode() {
  const code = Blockly.genCode.workspaceToCode(workspace);
  document.getElementById('editor').textContent = code;
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
let jar = CodeJar(document.querySelector('#editor'), highlight);

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
if (!(localStorage.getItem('theme') == "dark" || localStorage.getItem('theme') == "light")) {
  localStorage.setItem('theme', "dark");
}
if (localStorage.getItem('theme') == "light") {
  changeThemeWithoutSwap();
}
if (!(localStorage.getItem('mode') == "block" || localStorage.getItem('mode') == "code")) {
  localStorage.setItem('mode', "block");
}
if (localStorage.getItem('mode') == "code") {
  changeViewWithoutSwap();
}

function changeViewWithoutSwap() {
  try {
    document.getElementById("editor").hidden = !document.getElementById("editor").hidden;
    document.getElementById("root").hidden = !document.getElementById("root").hidden;
    isDark = !isDark;
    document.getElementById('root').removeChild(document.getElementsByClassName('zelos-renderer')[0]);
    injectBlockly();
    document.getElementById("callColor").click();
  } catch(e) {}
}

function changeView() {
  changeViewWithoutSwap();
  var tmp = localStorage.getItem('mode');
  if (tmp == "code")
      localStorage.setItem('mode', 'block');
  else
      localStorage.setItem('mode', 'code');
}

export { workspace, changeTheme, changeView, /*genPhoto,*/ injectBlockly, runCode };
