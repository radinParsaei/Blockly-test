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
let QRCode = require('qrcode')

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
Editor._langs = langs
Editor.utils = class {
  static isOverflown(element) {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
  }
}

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

let Linker = class {
  static setWallpaper(path) {
    this.socket.send(`{"set-wallpaper": "${path}"}`)
  }

  static _initPortList() {
    this._ports = []
    this.socket.send('{"list-serial-ports": ""}')
  }

  static _connectSerial(port, confs = {}) {
    this.socket.send(`{"connect-to-serial-port": "${port}", "confs": ${JSON.stringify(confs)}}`)
  }

  static waitForSuccess() {
    return new Promise((resolve, reject) => {
      this._resolves.push(resolve)
    })
  }

  static _writeToPort(port, data) {
    this.socket.send(`{"write-ser": "${port}", "d": ${JSON.stringify(data)}}`)
  }

  static _closePort(port) {
    this.socket.send(`{"close-port": "${port}"}`)
  }

  static _setDTR(port, value) {
    this.socket.send(`{"set-dtr": "${port}", "v": ${value}}`)
  }

  static _setRTS(port, value) {
    this.socket.send(`{"set-rts": "${port}", "v": ${value}}`)
  }

  static _setBreak(port, value) {
    this.socket.send(`{"set-br": "${port}", "v": ${value}}`)
  }
}

Linker._ports = []
Linker._resolves = []
Linker._portsCallbacks = {}

Linker.available = false
function initLinker() {
  Linker.socket = new WebSocket('ws://localhost:8443/')
  Linker.socket.addEventListener('open', function (event) {
    Linker.available = true
    Linker.socket.addEventListener('message', function (event) {
      if (event.data.startsWith('serial-port: ')) {
        Linker._ports.push(event.data.split(':')[1].trim())
      } else if (event.data.startsWith('sermsg:')) {
        let callback = Linker._portsCallbacks[event.data.split(':')[1]]
        if (callback) callback(String.fromCharCode(event.data.split(':')[2]))
      } else if (event.data == '1') {
        if (Linker._resolves[0]) {
          Linker._resolves[0]()
          Linker._resolves.pop()
        }
      }
    });
  })
  Linker.socket.addEventListener('close', function (event) {
    Linker.available = false
    setTimeout(initLinker, 5000)
  })
}
initLinker()

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
  div.setAttribute('style', 'width: min-content;position: absolute;right: 5000px;top:-5000px');
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

Blockly.Msg['openineditor'] = 'Open In Editor'

function createCard() {
  let viewChanged = localStorage.getItem('mode') != 'block'
  if (viewChanged) changeView()
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
  div.setAttribute('style', `width: min-content;position: absolute;right: 5000px;top:-5000px; background: ${Editor.isDark()? '#343434':'#FFFFFF'}`);
  div.appendChild(svg);
  document.body.appendChild(div);
  loadFont(div);
  setTimeout(() => {
    let camClickDiv = document.createElement('div')
    camClickDiv.style = 'position: absolute; top: 0; z-index: 1001; background: white; height: 100%; width: 100%' //1001 to cover ace editor's map row
    document.body.appendChild(camClickDiv)
    try {
      html2canvas(div, {logging: false}).then(function(canvas) {
        let DOMURL = self.URL || self.webkitURL || self;
        let img = canvas.toDataURL("image/png");
        let element = document.createElement('img');
        element.src = img;
        document.body.removeChild(div);
        if (localStorage.getItem('mode') != 'code') changeView(true)
        let a = editor.getValue().split('\n')
        editor.session.selection.moveTo(a.length, a[a.length - 1].length) // to make last line selected in gutter
        setTimeout(() => {
          let tmp = document.getElementById('editor').getAttribute('style')
          document.getElementById('editor').setAttribute('style', tmp + `;height: ${editor.getSession().getDocument().getLength() * editor.renderer.lineHeight + editor.renderer.scrollBar.getWidth() + 10}px; width: ${
            editor.renderer.gutterWidth + editor.getValue().split('\n').sort(
              function (a, b) {
                  return b.length - a.length;
              }
            )[0].length * editor.renderer.characterWidth + 20
          }px`)
          document.getElementById('ace_map-row').hidden = true
          document.getElementById('ace_bar-v').hidden = true
          document.getElementById('ace_pre-v').hidden = true
          document.getElementById('ace_bar-h').hidden = true
          document.getElementById('ace_pre-h').hidden = true
          document.querySelector('.ace_marker-layer').hidden = true
          document.querySelector('.ace_cursor-layer').hidden = true
          html2canvas(editor.container, {logging: false}).then(function(canvas_) {
            document.getElementById('ace_map-row').hidden = false
            document.getElementById('ace_bar-v').hidden = false
            document.getElementById('ace_pre-v').hidden = false
            document.getElementById('ace_bar-h').hidden = false
            document.getElementById('ace_pre-h').hidden = false
            document.querySelector('.ace_marker-layer').hidden = false
            document.querySelector('.ace_cursor-layer').hidden = false
            if (!viewChanged) changeView()
            $(camClickDiv).fadeOut(150)
            document.getElementById('editor').setAttribute('style', tmp)
            let img_ = canvas_.toDataURL("image/png");
            let element_ = document.createElement('img');
            element_.src = img_;
            element.setAttribute('style', 'max-width: 100%;max-height: 50%')
            element_.setAttribute('style', 'max-width: 100%;max-height: 50%')
            let popup_ = openPopUp()
            let popup = createPopUpBody(popup_)
            popup.style.textAlign = ''
            popup.style.width = '90%'
            popup.style.left = '5%'
            popup.setAttribute('style', 'overflow: scroll')
            let imageDiv = document.createElement('div')
            let descDiv = document.createElement('div')
            let desc = document.createElement('div')
            let title = document.createElement('div')
            descDiv.setAttribute('style', 'background: var(--editor-color, #1A9FFF); min-height: 146px')
            descDiv.appendChild(title)
            descDiv.appendChild(desc)
            desc.setAttribute('style', 'margin-left: 5px; font-size: 18px')
            title.setAttribute('style', 'font-size: 26px; margin: 10px; margin-left: 5px; padding-bottom: 5px')
            imageDiv.setAttribute('style', 'color: white; width: 460px; height: 460px; margin-left: 5px; background: ' + (Editor.isDark()? '#343434':'#FFFFFF'))
            imageDiv.appendChild(element)
            imageDiv.appendChild(document.createElement('br'))
            imageDiv.appendChild(element_)
            imageDiv.appendChild(descDiv)
            let size = '460px'
            if (window.screen.width < 1000) {
              imageDiv.style.transform = 'scale(0.5)'
              imageDiv.style.margin = '-100px'
              size = '250px'
            }
            let textArea = document.createElement('textarea')
            textArea.placeholder = 'Write some description...'
            textArea.setAttribute('style', 'width: calc(100% - ' + size + '); min-width: 100px; position: absolute; font-size: 18px; right: 0; top: 10%; height: 75%; resize: none; outline: none; background: transparent; padding-left: 5px; border: none;' + (Editor.isDark()? 'color: white':''))
            textArea.addEventListener('keyup', () => {
              desc.innerText = textArea.value
              descDiv.hidden = textArea.value.trim() == '' && titleInput.value.trim() == ''
            })
            let titleInput = document.createElement('input')
            titleInput.placeholder = 'Title'
            titleInput.setAttribute('style', 'width: calc(100% - ' + size + '); min-width: 100px; font-size: 26px; position: absolute; right: 0; top: 0; height: 10%; resize: none; outline: none; background: transparent; padding-left: 5px; border: none;' + (Editor.isDark()? 'color: white':''))
            titleInput.addEventListener('keyup', () => {
              title.innerText = titleInput.value
              descDiv.hidden = textArea.value.trim() == '' && titleInput.value.trim() == ''
            })
            descDiv.hidden = true
            popup.appendChild(imageDiv)
            popup.appendChild(titleInput)
            popup.appendChild(textArea)
            let shareCheckDiv = document.createElement('div')
            shareCheckDiv.setAttribute('style', `position: absolute; right: 0; top: 85%${Editor.isDark()? ";color: white":""}`)
            shareCheckDiv.innerHTML = 'Add QRCode'
            let colorLabel = document.createElement('span')
            colorLabel.innerHTML = 'Color: '
            let foregroundColorLabel = document.createElement('span')
            foregroundColorLabel.innerHTML = 'Foreground Color: '
            let addQr = document.createElement('input')
            addQr.type = 'checkbox'
            addQr.checked = true
            addQr.setAttribute('style', 'margin: 7px')
            shareCheckDiv.appendChild(addQr)
            let cardColor = document.createElement('input')
            cardColor.type = 'color'
            cardColor.value = getComputedStyle(document.body).getPropertyValue('--editor-color') || '#1A9FFF'
            cardColor.setAttribute('style', 'margin: 5px')
            cardColor.addEventListener('input', function() {
              descDiv.style.backgroundColor = cardColor.value
            })
            shareCheckDiv.appendChild(document.createElement('br'))
            shareCheckDiv.appendChild(colorLabel)
            shareCheckDiv.appendChild(cardColor)
            shareCheckDiv.appendChild(document.createElement('br'))
            let foregroundCardColor = document.createElement('input')
            foregroundCardColor.type = 'color'
            foregroundCardColor.value = '#FFFFFF'
            foregroundCardColor.setAttribute('style', 'margin: 5px')
            foregroundCardColor.addEventListener('input', function() {
              descDiv.style.color = foregroundCardColor.value
            })
            shareCheckDiv.appendChild(foregroundColorLabel)
            shareCheckDiv.appendChild(foregroundCardColor)
            shareCheckDiv.appendChild(document.createElement('br'))
            popup.appendChild(shareCheckDiv)
            let saveButton = document.createElement('button')
            // saveButton.setAttribute('style', 'position: absolute; right: 0; bottom: 95%')
            saveButton.addEventListener('click', function() {
              element.style.height = getComputedStyle(element).height
              element_.style.height = getComputedStyle(element_).height
              imageDiv.style.height = 'auto'
              if (addQr.checked) {
                let name = editingFile.replace(' ', '_')
                if (name == '') name = 'unnamed'
                let url = new URL(window.location.href)
                let main = `${url.protocol}//${url.host}${url.pathname}?name=${name}&url=`
                let host = 'https://radinparsaei.pythonanywhere.com/'
                // let host = 'http://0.0.0.0:8088/'
                fetch(host, {
                  body: Editor.getCode(),
                  method: "POST"
                }).then(response => response.text()).then(function(res) {
                  let canvas = document.createElement('canvas')
                  QRCode.toCanvas(canvas, `${main}${host}${res}`, function (error) {
                    if (error) console.error(error)
                  })
                  canvas.setAttribute('style', 'height: 75px; width: 75px; margin: 7px')
                  imageDiv.insertBefore(canvas, imageDiv.firstChild)
                  let openInEditor = document.createElement('span')
                  openInEditor.setAttribute('style', 'position: relative; bottom: 10px')
                  openInEditor.innerHTML = Blockly.Msg['openineditor']
                  imageDiv.insertBefore(openInEditor, imageDiv.childNodes[1])
                  let br = document.createElement('br')
                  imageDiv.insertBefore(br, imageDiv.childNodes[2])
                  html2canvas(imageDiv, {logging: false}).then(function(canvas__) {
                    let DOMURL = self.URL || self.webkitURL || self;
                    let img = canvas__.toDataURL("image/png");
                    let element = document.createElement('a');
                    element.href = img;
                    element.download = 'capture.png';
                    element.click();
                    DOMURL.revokeObjectURL(element.href);
                    imageDiv.removeChild(canvas)
                    imageDiv.removeChild(openInEditor)
                  })
                })
              } else {
                html2canvas(imageDiv, {logging: false}).then(function(canvas__) {
                  let DOMURL = self.URL || self.webkitURL || self;
                  let img = canvas__.toDataURL("image/png");
                  let element = document.createElement('a');
                  element.href = img;
                  element.download = 'capture.png';
                  element.click();
                  DOMURL.revokeObjectURL(element.href);
                })
              }
            })
            saveButton.setAttribute('class', 'swal2-confirm swal2-styled')
            saveButton.setAttribute('style', 'position: relative; top: 88%; left: 15%')
            saveButton.innerHTML = 'Save'
            popup_.appendChild(saveButton)
            DOMURL.revokeObjectURL(element.src);
            DOMURL.revokeObjectURL(element_.src);
          });
        }, 100)
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
  if (document.getElementById('langs').value != '0') {
    editor.setValue(code)
    code = langs[document.getElementById('langs').value][1]()
  }
  editor.setValue(code);
  editor.session.selection.moveTo(0, 0);
  editorCodeChanged1 = false;
}

window.onbeforeunload = function (e) {
  localStorage.setItem('allVariables', allVariables);
  if (editorCodeChanged) {
    editorCodeChanged = false
    if (document.getElementById('langs').value != '0') {
      Editor.codeInDefaultLang = langs[document.getElementById('langs').value][2]()
    }
    fs.writeFile(localStorage.getItem('currentDir') + editingFile, Editor.getCode(), function(){})
    Editor.codeInDefaultLang = null
    localStorage.setItem('langOfFile_' + localStorage.getItem('currentDir') + editingFile, document.getElementById('langs').value)
  }
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
  checkMenuOverflow()
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
    editorCodeChanged = false
    if (document.getElementById('langs').value != '0') {
      Editor.codeInDefaultLang = langs[document.getElementById('langs').value][2]()
    }
    fs.writeFile(localStorage.getItem('currentDir') + editingFile, Editor.getCode(), function(){})
    Editor.codeInDefaultLang = null
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

function checkMenuOverflow() {
  document.getElementById('langs').hidden = !(!document.getElementById("editor2").hidden && Object.keys(langs).length > 0)
  checkingOverflow = true
  let menu = document.getElementById('menu')
  if (!rebuildingMenu) {
    while (document.getElementById('overflowedMenu').firstChild) {
      menu.appendChild(document.getElementById('overflowedMenu').firstChild)
    }
  }
  if (document.getElementById('openOverflowedMenu')) document.getElementById('openOverflowedMenu').remove()
  document.getElementById('overflowedMenu').innerHTML = ''
  if (Editor.utils.isOverflown(menu)) {
    var element = document.createElement("p");
    element.innerHTML = "&#9658;";
    element.setAttribute('style', "font-size: 28px; margin: 0; margin-bottom: -5px; padding: 0; font-family: Roboto, sans-serif !important; transform: rotate(270deg)");
    addMenuOptionWithCustomImageElement(element, '', function() {
      let popup = openPopUp()
      let clone = $(document.getElementById('overflowedMenu')).clone(true, true)
      clone.removeAttr('hidden')
      clone.css("margin", '20px')
      clone.appendTo($(popup))
      popup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
    }, 'openOverflowedMenu')
    while (Editor.utils.isOverflown(menu)) {
      document.getElementById('overflowedMenu').insertBefore(menu.lastChild.previousSibling, document.getElementById('overflowedMenu').firstChild)
    }
  }
  checkingOverflow = false
}

function changeViewWithoutSwap(emidiately) {
  try {
    if (emidiately) {
      document.getElementById("editor2").hidden = !document.getElementById("editor2").hidden;
      document.getElementById("root").hidden = !document.getElementById("root").hidden;
    } else {
      document.getElementById('main_editor').style.opacity = 0
      document.getElementById('langs').style.opacity = 0
      setTimeout(() => {
        document.getElementById('langs').hidden = Object.keys(langs).length > 0? !(document.getElementById("editor2").hidden):true
        document.getElementById("editor2").hidden = !document.getElementById("editor2").hidden;
        document.getElementById("root").hidden = !document.getElementById("root").hidden;
        Blockly.svgResize(Blockly.mainWorkspace);
        document.getElementById('main_editor').style.opacity = 1
        if (!document.getElementById('langs').hidden) {
          document.getElementById('langs').style.opacity = 1
        } else {
          document.getElementById('langs').style.opacity = 0
        }
      }, 200)
    }
    if (isDark) editor.setTheme("ace/theme/monokai0");
    else editor.setTheme("ace/theme/xcode0");
    if (editorCodeChanged1 && document.getElementById("editor2").hidden || (document.getElementById("main_editor").style.opacity == 0)) {
      if (document.getElementById('langs').value != '0') {
        Editor.codeInDefaultLang = langs[document.getElementById('langs').value][2]()
      }
      Compiler.genBlocks()
      Editor.codeInDefaultLang = null
    }
    Blockly.mainWorkspace.scroll(0, 0);
    document.getElementsByClassName('blocklyMenuItem')[0].click();
  } catch(e) {}
  document.getElementById("gotocode").classList.toggle('selected');
  document.getElementById("gotoblock").classList.toggle('selected');
}

function changeView(emidiately) {
  changeViewWithoutSwap(emidiately);
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
  let name = editingFile.replace(' ', '_')
  if (name == '') name = 'unnamed'
  let url = new URL(window.location.href)
  let main = `${url.protocol}//${url.host}${url.pathname}?name=${name}&url=`
  let host = 'https://radinparsaei.pythonanywhere.com/'
  // let host = 'http://0.0.0.0:8088/'
  fetch(host, {
    body: Editor.getCode(),
    method: "POST",
  }).then(response => response.text()).then(function(res) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: true,
    })

    Toast.fire({
      icon: 'success',
      title: `share link copied to clipboard!\n<a style="color: inherit" href="${main}${host}${res}">${main}${host}${res}</a>`,
      html: `<center><button class="swal2-confirm swal2-styled" id="genQRButton">${Blockly.Msg['genqrcode'] || 'Generate QR Code'}</button></center>`
    })
    document.getElementById('genQRButton').addEventListener('click', function() {
      let canvas = document.createElement('canvas')
      QRCode.toCanvas(canvas, `${main}${host}${res}`, function (error) {
        if (error) console.error(error)
        canvas.setAttribute('style', 'position: absolute; top: 50%; margin-top: -22%; width: 30%; left: 50%; margin-left: -15%')
        let popup = openPopUp()
        popup.style['z-index'] = 1100
        popup.appendChild(canvas)
        let downloadButton = document.createElement('button')
        downloadButton.classList.add("swal2-confirm")
        downloadButton.classList.add("swal2-styled")
        setTimeout(function() {
          let canvasCalculatedStyles = getComputedStyle(canvas)
          downloadButton.setAttribute('style', `position: absolute; top: ${Number(canvasCalculatedStyles.height.replace('px', '')) + Number(canvasCalculatedStyles.top.replace('px', '')) +  + Number(canvasCalculatedStyles.marginTop.replace('px', '')) + 10}px; color: white; background: rgb(2 171 41); margin-left: -${Number(getComputedStyle(downloadButton).width.replace('px', '')) / 2}px`)
        }, 1)
        downloadButton.innerHTML = Blockly.Msg['qrdownload'] || 'Download'
        downloadButton.addEventListener('click', function() {
          html2canvas(canvas, {logging: false}).then(function(canvas) {
            let DOMURL = self.URL || self.webkitURL || self;
            let img = canvas.toDataURL("image/png");
            let element = document.createElement('a');
            element.href = img;
            element.download = 'capture.png';
            element.click();
            DOMURL.revokeObjectURL(element.href);
            document.body.removeChild(div);
          });
        })
        popup.appendChild(downloadButton)
        popup.style.textAlign = 'center'
      })
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

Blockly.Msg['createcard'] = 'Create Flashcard'

Blockly.ContextMenuRegistry.registry.register({
  displayText: function() {
    return Blockly.Msg['createcard'];
  },
  preconditionFn: function(scope) {
    return 'enabled';
  },
  callback: function(scope) {
    createCard();
  },
  scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
  id: 'create-card',
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
export { Messages, createBlocksFromYAML, refreshBlockly, initBlocks, populateDefaultBlocks, Editor, checkMenuOverflow, Linker};
