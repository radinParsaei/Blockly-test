import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
Blockly.setLocale(En);
import {DisableTopBlocks} from '@blockly/disable-top-blocks';
import { initBlocks, functions, functionCodes } from './blocks.js';
import {ContinuousToolbox} from '../continuous-toolbox/src/ContinuousToolbox';
import {ContinuousFlyout} from '../continuous-toolbox/src/ContinuousFlyout';
import './procedures.js';
import html2canvas from 'html2canvas';

Blockly.Flyout.prototype.MARGIN = 70;

function genPhoto() {
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  let bbox = document.getElementsByClassName("blocklyBlockCanvas")[0].getBBox();
  svg.setAttribute('class', "zelos-renderer DarkTheme-theme");
  svg.setAttribute('width', bbox.width);
  svg.setAttribute('height', bbox.height);
  svg.setAttribute('viewBox', bbox.x + ' ' + bbox.y + ' ' + bbox.width + ' ' + bbox.height);
  let child = Blockly.mainWorkspace.svgBlockCanvas_.cloneNode(true);
  child.removeAttribute("transform");
  svg.appendChild(child);
  let div = document.createElement("div");
  div.setAttribute('width', bbox.width);
  div.setAttribute('height', bbox.height);
  div.setAttribute('style', 'width: min-content;position: absolute;right: 5000px;top:-5000px;');
  div.appendChild(svg);
  document.body.appendChild(div);
  loadFont(div);
  setTimeout(function() {
    try {
      html2canvas(div, {logging: false}).then(function(canvas) {
        let DOMURL = self.URL || self.webkitURL || self;
        let img = canvas.toDataURL("image/png");
        let element = document.createElement('a');
        element.href = img;
        element.download = 'capture.png';
        element.click();
        DOMURL.revokeObjectURL(element.href);
        document.body.removeChild(div);
      });
    } catch(e) {
      alert(e);
    }
  }, 1000);
}

function loadFont(target) {
    const request = new XMLHttpRequest();
    request.open("get", "https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap");
    request.responseType = "text";
    request.send();
    request.onloadend = () => {
        let css = request.response;
        const fontURLs = css.match(/https?:\/\/[^ \)]+/g);
        let loaded = 0;
        fontURLs.forEach(url => {
            const request = new XMLHttpRequest();
            request.open("get", url);
            request.responseType = "blob";
            request.onloadend = () => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    css = css.replace(new RegExp(url), reader.result);
                    loaded++;
                    if (loaded === fontURLs.length){
                        const styleEl = document.createElement('style');
                        styleEl.appendChild(document.createTextNode(css));
                        target.querySelector('svg').appendChild(styleEl)
                    }
                };
                reader.readAsDataURL(request.response);
            };
            request.send();
        });
    };
}

var isDark = true;
var isFirst = true;
var editorCodeChanged1 = false;
let workspace;
var editorCodeChanged = false;
var landscape;
var injecting = false;

const disableTopBlocksPlugin = new DisableTopBlocks();
disableTopBlocksPlugin.init();

function createWorkspace(blocklyDiv, options) {
  workspace = Blockly.inject(blocklyDiv, options);
  workspace.addChangeListener(function(event) {
    Blockly.Events.disableOrphans(event);
    if (event.element == undefined && event.recordUndo && event.oldXml && event.oldXml.attributes.type.value == 'main_entry') {
      onStartUsed--;
    }
    if (event.element == 'category' && event.newValue == null) {
      Blockly.hideFlyOut();
    }
    if (!injecting) runCode();
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
    disable : false,
    maxBlocks : Infinity,
    trashcan : true,
    css : true,
    // media : 'http://localhost:3000',
    rtl : false,
    scrollbars : true,
    sounds : false,
    oneBasedIndex : false,
    grid : {
      spacing : 20,
      length : 2,
      colour : isDark? 'rgba(255, 255, 255, 0.12)':'rgba(150, 150, 150, 0.3)',
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
  injecting = true;
  let element = document.getElementById('style');
  if (element != null) element.remove();
  let sheet = document.createElement('style');
  sheet.setAttribute('id', 'style');
  if (window.innerHeight > window.innerWidth) {
    options['horizontalLayout'] = true;
    options['toolboxPosition'] = 'end';
    sheet.innerHTML = ".blocklyTreeRowContentContainer{padding: 5px !important;}";
    Blockly.Flyout.prototype.MARGIN = 70;
    landscape = false;
  } else {
    options['plugins'] = {
      'toolbox': ContinuousToolbox,
      'flyoutsVerticalToolbox': ContinuousFlyout,
    }
    sheet.innerHTML = "";
    Blockly.Flyout.prototype.MARGIN = 8;
    landscape = true;
  }
  document.body.appendChild(sheet);
  createWorkspace(document.getElementById('root'), options);
  if (isFirst) {
    isFirst = false;
  } else {
    Blockly.Xml.domToWorkspace(xml, workspace);
  }
  setTimeout(() => injecting = false, 100);
}

document.addEventListener('DOMContentLoaded', function() {
  initBlocks();
  Blockly.Msg["MATH_POWER_SYMBOL"] = "**";
  Blockly.Msg["CATEGORY_LOGIC"] = "Logic";
  Blockly.Msg["CATEGORY_EVENTS"] = "Events";
  Blockly.Msg["CATEGORY_LOOPS"] = "Loops";
  Blockly.Msg["CATEGORY_MATH"] = "Math";
  Blockly.Msg["CATEGORY_TEXT"] = "Text";
  Blockly.Msg["CATEGORY_VARIABLE"] = "Variables";
  Blockly.Msg["CATEGORY_FUNCTIONS"] = "Functions";
  Blockly.Msg["CATEGORY_LIST"] = "List";
  injectBlockly();
});

function runCode() {
  if (genBlocksCalled) {return;}
  let code = Blockly.genCode.workspaceToCode(workspace);
  editor.setValue(code);
  editor.session.selection.moveTo(0, 0);
  editorCodeChanged1 = false;
}

window.onbeforeunload = function (e) {
  localStorage.setItem('allVariables', allVariables);
  const xml = Blockly.Xml.workspaceToDom(workspace);
  localStorage.setItem("blocks", Blockly.Xml.domToPrettyText(xml));
};

if (localStorage.getItem('allVariables') != null) {
  allVariables = localStorage.getItem('allVariables');
  var tmp = [];
  let data = allVariables.split(',');
  allVariables = [];
  for (var i of data) {
    tmp.push(i);
    if (tmp.length == 2) {
      allVariables.push(tmp);
      tmp = [];
    }
  }
}
var langTools = ace.require("ace/ext/language_tools");
var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai0");
editor.session.setMode("ace/mode/javascript");
//Javascript moved to javascript0. javascript highlighting rules changed for github.com/radinParsaei/Compiler
editor.setHighlightActiveLine(false);
editor.renderer.setShowGutter(true);
editor.getSession().setUseWorker(false);
editor.session.setTabSize(2);
editor.renderer.setAnimatedScroll(true);
editor.setFontSize(18);
editor.setShowPrintMargin(false);
editor.setOptions({
    enableSnippets: true,
    enableLiveAutocompletion: true,
    enableBasicAutocompletion: true,
    copyWithEmptySelection: true,
    cursorStyle: 'smooth',
    fadeFoldWidgets: true
});

langTools.setCompleters([langTools.snippetCompleter])

var config = ace.require("ace/config");
var event = ace.require("ace/lib/event");
event.addListener(editor.container, "dragover", function(e) {
    var types = e.dataTransfer.types;
    if (types && Array.prototype.indexOf.call(types, 'Files') !== -1)
        return event.preventDefault(e);
});

event.addListener(editor.container, "drop", function(e) {
    var file;
    try {
        file = e.dataTransfer.files[0];
        if (window.FileReader) {
            var reader = new FileReader();
            reader.onload = function() {
                editor.session.doc.setValue(reader.result);
            };
            reader.readAsText(file);
        }
        return event.preventDefault(e);
    } catch(err) {
        return event.stopEvent(e);
    }
});

window.onresize = function() {
  if (((window.innerHeight > window.innerWidth) && landscape) || ((window.innerHeight <= window.innerWidth) && !landscape)) {
    document.getElementById('root').removeChild(Blockly.getMainWorkspace().injectionDiv_);
    injectBlockly();
  }
}

editor.setKeyboardHandler('ace/keyboard/sublime')
editor.commands.addCommands([{
//     name: "showKeyboardShortcuts",
//     bindKey: {win: "Ctrl-Alt-h", mac: "Command-Alt-h"},
//     exec: function(editor) {
//         config.loadModule("ace/ext/keybinding_menu", function(module) {
//             module.init(editor);
//             editor.showKeyboardShortcuts();
//         });
//     }
// }, {
    name: "increaseFontSize",
    bindKey: "Ctrl-=|Ctrl-+",
    exec: function(editor) {
        var size = parseInt(editor.getFontSize(), 10) || 18;
        editor.setFontSize(size + 1);
    }
}, {
    name: "decreaseFontSize",
    bindKey: "Ctrl+-|Ctrl-_",
    exec: function(editor) {
        var size = parseInt(editor.getFontSize(), 10) || 18;
        editor.setFontSize(Math.max(size - 1 || 1));
    }
}, {
    name: "resetFontSize",
    bindKey: "Ctrl+0|Ctrl-Numpad0",
    exec: function(editor) {
        editor.setFontSize(18);
    }
}]);
editor.commands.removeCommands(['showSettingsMenu', 'goToNextError', 'goToPreviousError',
                                'centerselection', 'fold', 'unfold', 'toggleFoldWidget',
                                'toggleParentFoldWidget', 'foldall', 'foldAllComments',
                                'foldOther', 'unfoldall', 'overwrite'])

editor.commands.removeCommand('openCommandPallete');

editor.session.on('change', function(delta) {
  editorCodeChanged = true;
  editorCodeChanged1 = true;
});

setInterval(function() {
  if (editorCodeChanged) {
    editorCodeChanged = false;
    fs.writeFile(localStorage.getItem('currentDir') + editingFile, editor.getValue(), function(){});
  }
}, 2000);

function changeThemeWithoutSwap() {
  if (isDark) editor.setTheme("ace/theme/xcode0");
  else editor.setTheme("ace/theme/monokai0");
  document.getElementById("editor").classList.toggle('dark');
  document.getElementById("grid").classList.toggle('dark');
  document.getElementById("light_svg").classList.toggle('enabled');
  document.getElementById("dark_svg").classList.toggle('enabled');
  document.getElementById("theme_div").classList.toggle('dark');
  document.body.classList.toggle('dark');
  document.getElementById('filepath').classList.toggle('dark');
  document.getElementById("buttom_sheet_title").classList.toggle('dark');
  document.getElementById("buttom_sheet").classList.toggle('dark');
  document.getElementById("menu").classList.toggle('dark');
  isDark = !isDark;
}

function changeTheme() {
  changeThemeWithoutSwap();
  var tmp = localStorage.getItem('theme');
  if (tmp == "light")
      localStorage.setItem('theme', 'dark');
  else
      localStorage.setItem('theme', 'light');
  if (localStorage.getItem('theme') == 'dark') document.getElementById('theme').checked = true;
  else document.getElementById('theme').checked = false;
}

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
    if (isDark) editor.setTheme("ace/theme/monokai0");
    else editor.setTheme("ace/theme/xcode0");
    // document.getElementById('root').removeChild(Blockly.getMainWorkspace().injectionDiv_);
    // injectBlockly();
    Blockly.svgResize(Blockly.mainWorkspace);
    if (editorCodeChanged1 && document.getElementById("editor2").hidden) {
      document.getElementById("genBlocks").click();
    }
    Blockly.mainWorkspace.scroll(0, 0);
    document.getElementsByClassName('blocklyMenuItem')[0].click();
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

Blockly.Msg['screenshot'] = 'Save blocks as image';

var screenshot = {
  displayText: function() {
    return Blockly.Msg['screenshot'];
  },
  preconditionFn: function(scope) {
    return 'enabled';
  },
  callback: function(scope) {
    genPhoto();
  },
  scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
  id: 'screenshot',
  weight: 1,
};
Blockly.ContextMenuRegistry.registry.register(screenshot);

if (localStorage.getItem('currentDir') == null)
    localStorage.setItem('currentDir', '/');
  loadFiles();

export { workspace, changeTheme, changeView, genPhoto, injectBlockly, runCode, editor };
