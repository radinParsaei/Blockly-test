import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
Blockly.setLocale(En);
import {DisableTopBlocks} from '@blockly/disable-top-blocks';
import { initBlocks, addCategory, addBlock, addButton, clickListeners, createShadows, createBlocksFromYAML, lighter, darker, icons } from './blocks.js';
import {ContinuousToolbox} from '../continuous-toolbox/src/ContinuousToolbox';
import {ContinuousFlyout} from '../continuous-toolbox/src/ContinuousFlyout';
import './procedures.js';
import html2canvas from 'html2canvas';
// import Swal from 'sweetalert2';
import './toolbox.js';
import Swal from 'sweetalert2/dist/sweetalert2.js'
import * as OfflinePluginRuntime from 'offline-plugin/runtime';
OfflinePluginRuntime.install();

Blockly.Flyout.prototype.MARGIN = 70;

import { DarkTheme, LightTheme } from './themes.js';

Blockly.Themes['DarkTheme'] = DarkTheme
Blockly.Themes['LightTheme'] = LightTheme

var Messages = Blockly.Msg;
let defaultMessages = Blockly.Msg
let langs = {}
let lastLang = '0'

var BlocklyOptions = {
  toolbox: document.getElementById('toolbox'),
  theme: isDark? Blockly.Themes['DarkTheme'] : Blockly.Themes['LightTheme'],
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
  },
  scrollbars: true,
  move: {
    drag: true,
    wheel: true
  }
}

class Editor {
  static _resetTranslations() {
    Blockly.Msg = defaultMessages
    Messages = defaultMessages
  }
// you can test this function using this code
// Editor.addLang('Java Script', function() {
//     Editor.getAceEditor().session.setMode("ace/mode/javascript0")
// }, function() {
//     return Editor.getCode().replace('print', 'console.log')
// }, function() {
//     return Editor.getCode().replace('console.log', 'print')
// })
  static _changeLang() {
    if (lastLang == '0' && document.getElementById('langs').value != '0') {
      langs[document.getElementById('langs').value][0]()
      editor.session.setValue(langs[document.getElementById('langs').value][1]())
    } else if (lastLang != '0' && document.getElementById('langs').value == '0') {
      editor.session.setMode("ace/mode/javascript");
      editor.session.setValue(langs[lastLang][2]())
    } else if (lastLang != '0' && document.getElementById('langs').value != '0') {
      editor.session.setMode("ace/mode/javascript");
      editor.session.setValue(langs[lastLang][2]())
      langs[document.getElementById('langs').value][0]()
      editor.session.setValue(langs[document.getElementById('langs').value][1]())
    }
    lastLang = document.getElementById('langs').value
  }
  static addLang(langName, initEditor, from, to) {
    langs[langName] = [initEditor, from, to]
    let tmp = '<option value="0">Default</option>'
    for (let i of Object.keys(langs)) {
      tmp += `<option value="${i}">${i}</option>`
    }
    document.getElementById('langs').innerHTML = tmp
    document.getElementById('langs').hidden = !(!document.getElementById("editor2").hidden && Object.keys(langs).length > 0)
  }
  static setBlocksEditorRTL(rtl) {
    BlocklyOptions['rtl'] = rtl
    Editor.isRTL = rtl
  }
  static getSwal() {
    return Swal
  }
  static getCode() {
    return this.codeInDefaultLang? this.codeInDefaultLang:editor.getValue()
  }
  static getBlockly() {
    return Blockly
  }
  static getAceEditor() {
    return editor
  }
  static registerSnippet(snippet) {
    const createSnippets = snippets =>
      (Array.isArray(snippets) ? snippets : [snippets])
          .map(({ name, code }) =>
              [
                  'snippet ' + name,
                  code
                      .split('\n')
                      .map(c => '\t' + c)
                      .join('\n'),
              ].join('\n')
          )
          .join('\n')
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
    })
    var snippetManager = ace.require('ace/snippets').snippetManager
    var id = editor.session.$mode.$id || ''
    var m = snippetManager.files[id]
    m.scope = 'javascript'
    let snippetText = createSnippets(snippet)
    m.snippetText = snippetText
    m.snippet = snippetManager.parseSnippetFile(snippetText, m.scope)
    snippetManager.register(m.snippet, m.scope)
  }
  static addOnCodeExecutedEvent(event) {
    this.onCodeExecutedCallbacks.push(event)
  }
  static isPluginInstalled(pluginName) {
    return Object.keys(localStorage).includes('plugin_' + pluginName + '_code')
  }
  static requirePlugin(pluginName, callback) {
    if (!this.isPluginInstalled(pluginName)) {
      fetch(`https://api.github.com/repos/${pluginName}/branches`).then(response => response.json())
      .then(data => fetch(`https://raw.githubusercontent.com/${pluginName}/${data[0].name}/${pluginName.split('/')[1]}.js`).then(response => response.text()).then(code => {
        eval(code)
        localStorage.setItem('plugin_' + pluginName + '_code', code)
        refreshBlockly()
        if (callback) callback()
      }).catch(a => {if (callback) callback(a)}))
      .catch(a => {if (callback) callback(a)})
    }
  }
  static isDark() {
    return isDark
  }
  static setIconForCategory(cat, icon) {
    icons[cat] = icon
  }
  static setFont(font) {
    injectCss(`:root {--font: ${font};}`)
  }
  static setFonts(font) {
    this.setFont(font)
    this.setToolBoxFont(font)
    this.setBlocksFont(font)
  }
  static setToolBoxFont(font) {
    injectCss(`:root {--toolbox-font: ${font};}`)
  }
  static setBlocksFont(font) {
    Blockly.Themes['DarkTheme']['fontStyle']["family"] = font
    Blockly.Themes['LightTheme']['fontStyle']["family"] = Blockly.Themes['DarkTheme']['fontStyle']["family"]
  }
  static setTextEditorColorDark(key, color) {
    this.stylesToClear.push(injectCss(`:root {--text-editor-dark-color-${key}: ${color};}`))
  }
  static setTextEditorColorLight(key, color) {
    this.stylesToClear.push(injectCss(`:root {--text-editor-light-color-${key}: ${color};}`))
  }
  static setTextEditorColor(key, color) {
    this.setTextEditorColorLight(key, color)
    this.setTextEditorColorDark(key, color)
  }
  static setEditorColor(color) {
    if (this.lastCssColor) revertCss(this.lastCssColor)
    this.lastCssColor = injectCss(`:root {--editor-color: ${color};}`)
  }
  static setEditorCancelColor(color) {
    if (this.lastCssColor1) revertCss(this.lastCssColor1)
    this.lastCssColor1 = injectCss(`:root {--cancel-color: ${color};}`)
  }
  static resetThemes() {
    this.setBlocksEditorRTL(false)
    if (!this.stylesToClear) this.stylesToClear = []
    for (var i of this.stylesToClear) {
      revertCss(i)
    }
    Blockly.Themes['DarkTheme']['fontStyle'] = {
      "family": "Source Code Pro, monospace",
      "weight": "bold",
      "size": 12
    }
    Blockly.Themes['LightTheme']['fontStyle'] = Blockly.Themes['DarkTheme']['fontStyle']
    Blockly.Themes['DarkTheme']['blockStyles'] = {
      'colour_blocks': {
        'colourPrimary': '#a5745b',
        'colourSecondary': '#dbc7bd',
        'colourTertiary': '#845d49',
      },
      'list_blocks': {
        'colourPrimary': '#9FBD48',
        'colourSecondary': '#AFCE59',
        'colourTertiary': '#8EAC37',
      },
      'loop_blocks': {
        'colourPrimary': '#48BD4D',
        'colourSecondary': '#59CE5E',
        'colourTertiary': '#37AC3C'
      },
      'logic_blocks': {
        'colourPrimary': '#48A1BD',
        'colourSecondary': '#59B2CE',
        'colourTertiary': '#3790AC',
      },
      'loop_blocks': {
        'colourPrimary': '#48BD4D',
        'colourSecondary': '#59CE5E',
        'colourTertiary': '#37AC3C',
      },
      'math_blocks': {
        'colourPrimary': '#BD48A3',
        'colourSecondary': '#CE59B4',
        'colourTertiary': '#AC3792',
      },
      'procedure_blocks': {
        'colourPrimary': '#9848BD',
        'colourSecondary': '#F959CE',
        'colourTertiary': '#8737AC',
      },
      'class_blocks': {
        'colourPrimary': '#BD488E',
        'colourSecondary': '#CE599F',
        'colourTertiary': '#AC377D',
      },
      'text_blocks': {
        'colourPrimary': '#DC771B',
        'colourSecondary': '#ED882C',
        'colourTertiary': '#CB660A',
      },
      'variable_blocks': {
        'colourPrimary': '#7815F5',
        'colourSecondary': '#8926F6',
        'colourTertiary': '#6704E4',
      },
      'variable_dynamic_blocks': {
        'colourPrimary': '#a55b99',
        'colourSecondary': '#dbbdd6',
        'colourTertiary': '#84497a',
      },
      'hat_blocks': {
        'colourPrimary': '#a55b99',
        'colourSecondary': '#dbbdd6',
        'colourTertiary': '#84497a',
        'hat': 'cap',
      }
    }
    Blockly.Themes['LightTheme']['blockStyles'] = Blockly.Themes['DarkTheme']['blockStyles']
  }
  static setBlocksEditorGrid(grid) {
    if (grid && grid['colour'] == null && grid['color']) grid['colour'] = grid['color']
    BlocklyOptions['grid'] = grid
  }
  static setTheme(theme) {
    if (theme != (isDark? 'dark':'light')) {
      changeTheme()
    }
  }
  static setLightThemeColorsOfBlocksOfCategory(cat, a, b, c) {
    cat = cat.toLowerCase()
    a = a.replace('#', '')
    if (!b) b = lighter(a)
    if (!c) c = darker(a)
    b = b.replace('#', '')
    c = c.replace('#', '')
    Blockly.Themes['LightTheme']['blockStyles'][cat + "_blocks"] = {
      'colourPrimary': a,
      'colourSecondary': b,
      'colourTertiary': c
    }
  }
  static setDarkThemeColorsOfBlocksOfCategory(cat, a, b, c) {
    cat = cat.toLowerCase()
    a = a.replace('#', '')
    if (!b) b = lighter(a)
    if (!c) c = darker(a)
    b = b.replace('#', '')
    c = c.replace('#', '')
    Blockly.Themes['DarkTheme']['blockStyles'][cat + "_blocks"] = {
      'colourPrimary': a,
      'colourSecondary': b,
      'colourTertiary': c
    }
  }
  static setColorsOfBlocksOfCategory(cat, a, b, c) {
    a = a.replace('#', '')
    if (!b) b = lighter(a)
    if (!c) c = darker(a)
    b = b.replace('#', '')
    c = c.replace('#', '')
    this.setDarkThemeColorsOfBlocksOfCategory(cat, a, b, c)
    this.setLightThemeColorsOfBlocksOfCategory(cat, a, b, c)
  }
  static setCategoryColor(cat, color) {
    Blockly.Msg[cat.toUpperCase() + '_CATEGORY_COLOR'] = color
  }
  static setCategoryAndItsBlocksColor(cat, color) {
    this.setCategoryColor(cat, color)
    this.setColorsOfBlocksOfCategory(cat, color)
  }
}

Editor.resetThemes()
Editor.addButton = addButton
Editor.codeInDefaultLang = null
Editor.onCodeExecutedCallbacks = []
Editor.changeView = changeView
Editor.changeTheme = changeTheme

function populateDefaultBlocks() {
  Blockly.Msg['LOGIC_CATEGORY_COLOR'] = '#48A1BD'
  Blockly.Msg['LOOPS_CATEGORY_COLOR'] = '#48BD4D'
  Blockly.Msg['MATH_CATEGORY_COLOR'] = '#BD48A3'
  Blockly.Msg['TEXT_CATEGORY_COLOR'] = '#CB660A'
  Blockly.Msg['LIST_CATEGORY_COLOR'] = '#9FBD48'
  Blockly.Msg['VARIABLE_CATEGORY_COLOR'] = '#7815F5'
  Blockly.Msg['FUNCTIONS_CATEGORY_COLOR'] = '#9848BD'
  document.getElementById('toolbox').innerHTML = '<category id="LogicCategory" name="%{BKY_CATEGORY_LOGIC}" colour="%{BKY_LOGIC_CATEGORY_COLOR}"><block type="logic_boolean"><field name="BOOL">TRUE</field></block><block type="logic_null"></block><block type="logic_compare"></block><block type="logic_operation"></block><block type="logic_negate"></block></category><category id="LoopsCategory" name="%{BKY_CATEGORY_LOOPS}" colour="%{BKY_LOOPS_CATEGORY_COLOR}"></category><category id="MathCategory" name="%{BKY_CATEGORY_MATH}" colour="%{BKY_MATH_CATEGORY_COLOR}"><block type="math_number"><field name="NUM">0</field></block><block type="math_arithmetic" gap="10"><field name="OP">ADD</field><value name="A"><shadow type="math_number"><field name="NUM">1</field></shadow></value><value name="B"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block><block type="math_arithmetic" gap="10"><field name="OP">MINUS</field><value name="A"><shadow type="math_number"><field name="NUM">1</field></shadow></value><value name="B"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block><block type="math_arithmetic" gap="10"><field name="OP">MULTIPLY</field><value name="A"><shadow type="math_number"><field name="NUM">1</field></shadow></value><value name="B"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block><block type="math_arithmetic" gap="10"><field name="OP">DIVIDE</field><value name="A"><shadow type="math_number"><field name="NUM">1</field></shadow></value><value name="B"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block><block type="math_arithmetic"><field name="OP">POWER</field><value name="A"><shadow type="math_number"><field name="NUM">1</field></shadow></value><value name="B"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block><block type="math_modulo"><value name="DIVIDEND"><shadow type="math_number"><field name="NUM">64</field></shadow></value><value name="DIVISOR"><shadow type="math_number"><field name="NUM">10</field></shadow></value></block></category><category id="TextCategory" name="%{BKY_CATEGORY_TEXT}" colour="%{BKY_TEXT_CATEGORY_COLOR}"><block type="text"><field name="TEXT"></field></block><block type="text_changeCase"><value name="TEXT"><shadow type="text"><field name="TEXT">abc</field></shadow></value></block><block type="text_trim"><field name="MODE">BOTH</field><value name="TEXT"><shadow type="text"><field name="TEXT">abc</field></shadow></value></block><block type="text_charAt"><mutation at="true"></mutation><field name="WHERE">FROM_START</field><value name="VALUE"><shadow type="text"><field name="TEXT">abc</field></shadow></value></block></category><category id="ListCategory" name="%{BKY_CATEGORY_LIST}" colour="%{BKY_LIST_CATEGORY_COLOR}"><block type="lists_create_with" gap="10"><mutation items="0" ></mutation></block><block type="lists_create_with"></block></category><category name="%{BKY_CATEGORY_VARIABLE}" colour="%{BKY_VARIABLE_CATEGORY_COLOR}" id="VariablesCategory"><block type="variable_declare"></block><block type="variable_set"></block><block type="variable_get"></block></category><category name="%{BKY_CATEGORY_FUNCTIONS}" colour="%{BKY_FUNCTIONS_CATEGORY_COLOR}" custom="PROCEDURE"></category>'
}

populateDefaultBlocks()

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
var swalTheme;

const disableTopBlocksPlugin = new DisableTopBlocks();
disableTopBlocksPlugin.init();

function createWorkspace(blocklyDiv, options) {
  workspace = Blockly.inject(blocklyDiv, options)
  if (BlocklyOptions['toolboxPosition'] != 'end') {
    let searchBox = document.createElement('input')
    searchBox.style = 'background: none; font-size: 18px; padding-bottom: 7px; margin-top: 10px; margin-bottom: 5px; width: 133.5px; margin-left: 6px'
    searchBox.classList.add('input')
    searchBox.id = 'blocks_search_box'
    searchBox.addEventListener('keyup', () => {
      Editor.blocksSearchQuery = searchBox.value.trim() == ''? null:searchBox.value
      Blockly.refreshFlyout()
      Blockly.gotoStartOfFlyout()
    })
    searchBox.placeholder = 'Search...'
    let container = document.querySelector("#root > div > div")
    container.insertBefore(searchBox, container.firstChild)
  }
  workspace.addChangeListener(function(event) {
    if (event instanceof Blockly.Events.Create && Editor.blocksSearchQuery) {
      document.getElementById('blocks_search_box').value = ''
      document.getElementById('blocks_search_box').dispatchEvent(new Event('keyup'))
      document.getElementById('blocks_search_box').blur()
      Blockly.hideFlyOut()
      Blockly.deselectItem("Logic")
    }
    Blockly.Events.disableOrphans(event);
    if (event.element == undefined && event.recordUndo && event.oldXml && event.oldXml.attributes.type.value == 'main_entry') {
      onStartUsed--;
    }
    if (event.element == 'category' && event.newValue == null) {
      if (Blockly.hideFlyOut) Blockly.hideFlyOut();
    }
    if (!injecting) runCode();
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
  BlocklyOptions['theme'] = isDark? Blockly.Themes['DarkTheme'] : Blockly.Themes['LightTheme'];
  if (BlocklyOptions['grid'] == {
    spacing : 20,
    length : 2,
    colour : !isDark? 'rgba(255, 255, 255, 0.12)':'rgba(150, 150, 150, 0.3)',
    snap : true
  } || BlocklyOptions['grid'] == {
    spacing : 20,
    length : 2,
    colour : isDark? 'rgba(255, 255, 255, 0.12)':'rgba(150, 150, 150, 0.3)',
    snap : true
  }) {
    BlocklyOptions['grid']['colour'] = isDark? 'rgba(255, 255, 255, 0.12)':'rgba(150, 150, 150, 0.3)'
  }
  injecting = true;
  let element = document.getElementById('style');
  if (element != null) element.remove();
  let sheet = document.createElement('style');
  sheet.setAttribute('id', 'style');
  if (window.innerHeight > window.innerWidth) {
    BlocklyOptions['horizontalLayout'] = true;
    BlocklyOptions['toolboxPosition'] = 'end';
    if (document.getElementById('blocks_search_box')) document.getElementById('blocks_search_box').hidden = true
    Editor.blocksSearchQuery = null
    sheet.innerHTML = ".blocklyTreeRowContentContainer{padding: 5px !important;}";
    Blockly.Flyout.prototype.MARGIN = 70;
    landscape = false;
    BlocklyOptions['plugins'] = {
      'toolbox': null,
      'flyoutsVerticalToolbox': null,
    }
  } else {
    BlocklyOptions['horizontalLayout'] = false;
    BlocklyOptions['toolboxPosition'] = 'right';
    if (document.getElementById('blocks_search_box')) document.getElementById('blocks_search_box').hidden = false
    BlocklyOptions['plugins'] = {
      'toolbox': ContinuousToolbox,
      'flyoutsVerticalToolbox': ContinuousFlyout,
    }
    sheet.innerHTML = "";
    Blockly.Flyout.prototype.MARGIN = 8;
    landscape = true;
  }
  document.body.appendChild(sheet);
  createWorkspace(document.getElementById('root'), BlocklyOptions);
  for (var i of clickListeners) {
    i(workspace)
  }
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
  Blockly.Msg["CATEGORY_LOOPS"] = "Loops";
  Blockly.Msg["CATEGORY_MATH"] = "Math";
  Blockly.Msg["CATEGORY_TEXT"] = "Text";
  Blockly.Msg["CATEGORY_VARIABLE"] = "Variables";
  Blockly.Msg["CATEGORY_FUNCTIONS"] = "Functions";
  Blockly.Msg["CATEGORY_LIST"] = "List";
  Blockly.Msg['IMPORT_IMPORT'] = "import";
  injectBlockly();
  setTimeout(runCode, 30);
});

function runCode() {
  if (genBlocksCalled) {return;}
  functionsInImportedFiles = {};
  variablesInImportedFiles = [];
  try { Compiler.clearImports(); } catch (e) {}
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
let langTools = ace.require("ace/ext/language_tools");
let lang = ace.require("ace/lib/lang");
var editor = ace.edit("editor");
new AceScrollbars(editor);
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

let IDCompleter = {
  getCompletions: function(editor, session, pos, prefix, callback) {
    let code = editor.getValue();
    let importRegexp =  /import '(\w+)'/gm;
    let match = importRegexp.exec(code);
    do {
      try {
        fs.readFile(match[1], function(e, res) {
          res = (res + '').replace(/"(.*?(\\")*)*(")|'(.*?(\\')*)*(')/gm, '');
          var wordList = []
          const regexp = /(class|func|var) +([A-Za-z]+\d*_*)+/gm;
          const array = [...res.matchAll(regexp)];
          for (var i of array) {
            if (i[0].trim().startsWith('func')) i[0] += ':';
            i[0] = i[0].replace(/class|func|var/, '').trim();
            if (!/if|else|for|break|import|continue|class|init|while|var|static|this|new|func|return|null|true|false/.test(i[0])) wordList.push(i[0]);
          }
          callback(null, [...wordList.map(function(word) {
            let isFunc = word.endsWith(':');
            word = word.replace(':', '');
            return {
              caption: word,
              value: isFunc? word + '()' : word,
              type: 'userDefined',
              file: match[1]
            };
          })]);
        });
      } catch (e) {}
    } while((match = importRegexp.exec(code)) !== null);
    code = code.replace(/"(.*?(\\")*)*(")|'(.*?(\\')*)*(')/gm, '');
    var wordList = []
    const regexp = /(class|func|var) +([A-Za-z]+\d*_*)+/gm;
    const array = [...code.matchAll(regexp)];
    for (var i of array) {
      if (i[0].trim().startsWith('func')) i[0] += ':';
      i[0] = i[0].replace(/class|func|var/, '').trim();
      if (!/if|else|for|break|import|continue|class|init|while|var|static|this|new|func|return|null|true|false/.test(i[0])) wordList.push(i[0]);
    }
    callback(null, [...wordList.map(function(word) {
      let isFunc = word.endsWith(':');
      word = word.replace(':', '');
      return {
        caption: word,
        value: isFunc? word + '()' : word,
        type: 'userDefined'
      };
    })]);
  }, getDocTooltip: function(item) {
    if (item.type == "userDefined" && !item.docHTML) {
      item.docHTML = [
          "<b>", lang.escapeHTML(item.caption), "</b>", "<hr/>",
          "something you defined",
          item.file != null? " in file " + item.file : ""
      ].join("");
    }
  }
}

langTools.setCompleters([langTools.snippetCompleter, IDCompleter])

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
    localStorage.setItem('langOfFile_' + localStorage.getItem('currentDir') + editingFile, document.getElementById('langs').value)
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
  let head = document.getElementsByTagName("head")[0];
  if (swalTheme) head.removeChild(swalTheme);
  else swalTheme = document.createElement("link");
  swalTheme.href = isDark? "//cdn.jsdelivr.net/npm/sweetalert2@11.0.11/dist/sweetalert2.css":"//cdn.jsdelivr.net/npm/@sweetalert2/theme-dark@4/dark.css";
  swalTheme.type = "text/css";
  swalTheme.rel = "stylesheet";
  head.appendChild(swalTheme);
  isDark = !isDark;
}

let head = document.getElementsByTagName("head")[0];
if (swalTheme) head.removeChild(swalTheme);
else swalTheme = document.createElement("link");
swalTheme.href = "//cdn.jsdelivr.net/npm/@sweetalert2/theme-dark@4/dark.css"
swalTheme.type = "text/css";
swalTheme.rel = "stylesheet";
head.appendChild(swalTheme);

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

document.getElementById('langs').hidden = !(!document.getElementById("editor2").hidden && Object.keys(langs).length > 0)

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
      if (document.getElementById('langs').value != '0') {
        Editor.codeInDefaultLang = langs[document.getElementById('langs').value][2]()
      }
      Compiler.genBlocks()
      Editor.codeInDefaultLang = null
    }
    document.getElementById('langs').hidden = !(!document.getElementById("editor2").hidden && Object.keys(langs).length > 0)
    Blockly.mainWorkspace.scroll(0, 0);
    document.getElementsByClassName('blocklyMenuItem')[0].clsick();
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

function shareCode() {
  let name = editingFile
  if (name == '') name = 'unnamed'
  let url = new URL(window.location.href)
  let main = `${url.host + url.pathname}/?name=${name}&url=`
  let host = 'https://radinparsaei.pythonanywhere.com/'
  fetch(host, {
    body: Editor.getCode(),
    method: "POST"
  }).then(response => response.text()).then(function(res) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: true,
    })

    Toast.fire({
      icon: 'success',
      title: `share link copied to clipboard!\n<a style="color: inherit" href="${main}${host}${res}">${main}${host}${res}</a>`
    })
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(`${main}${host}${res}`)
    }
    if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = `${main}${host}${res}`
        textarea.style.position = "fixed"
        document.body.appendChild(textarea)
        textarea.select()
        try {
            return document.execCommand("copy")
        }
        catch (ex) {
            console.warn("Copy to clipboard failed", ex)
        }
        finally {
            document.body.removeChild(textarea)
        }
    }
  }).catch(function(e) {
    console.error(e)
  })
}

Blockly.Msg['sharecode'] = 'Share'

Blockly.ContextMenuRegistry.registry.register({
  displayText: function() {
    return Blockly.Msg['sharecode'];
  },
  preconditionFn: function(scope) {
    return 'enabled';
  },
  callback: function(scope) {
    shareCode();
  },
  scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
  id: 'share-code',
  weight: 1,
});

if (localStorage.getItem('currentDir') == null)
    localStorage.setItem('currentDir', '/');
  loadFiles();

function refreshBlockly() {
  document.getElementById('root').removeChild(Blockly.getMainWorkspace().injectionDiv_);
  injectBlockly();
}

document.getElementById('run').addEventListener('click', function() {
  if (document.getElementById('langs').value != '0') {
    Editor.codeInDefaultLang = langs[document.getElementById('langs').value][2]()
  }
  setTimeout(function() {
    Editor.codeInDefaultLang = null
  }, 100)
})

document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key === 'r' && !document.getElementById('main_editor').hidden) {
    e.preventDefault()
    e.stopPropagation()
    document.getElementById('run').click()
  } else if ((navigator.userAgent.indexOf("Mac OS X") != -1? e.metaKey:e.ctrlKey) && e.key == 'f') {
    e.preventDefault()
    e.stopPropagation()
    document.getElementById('blocks_search_box').focus()
  } else if (e.key == 'Escape') {
    if (Editor.blocksSearchQuery) {
      document.getElementById('blocks_search_box').value = ''
      document.getElementById('blocks_search_box').dispatchEvent(new Event('keyup'))
      document.getElementById('blocks_search_box').blur()
    } else if (localStorage.getItem('mode') == 'block' && Blockly.isFlyoutOpen()) {
      document.getElementById('blocks_search_box').blur()
      Blockly.hideFlyOut()
    }
  }
}, false);
Blockly.Procedures.isLegalName_ = function() { return true; }
Messages['_lang_'] = 'EN'
export { Messages, createBlocksFromYAML, refreshBlockly, initBlocks, populateDefaultBlocks, Editor};
