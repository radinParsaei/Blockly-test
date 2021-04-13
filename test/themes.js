import * as Blockly from 'blockly/core';

let DarkTheme = Blockly.Theme.defineTheme('DarkTheme', {
  'base': Blockly.Themes.Dark,
  // 'componentStyles': {
    // "workspaceBackgroundColour": "#1e1e1e",
    // "toolboxBackgroundColour": "#333"
  // },
  'fontStyle': {
    "family": "Source Code Pro, monospace",
    "weight": "bold",
    "size": 12
  },
});

let LightTheme = Blockly.Theme.defineTheme('LightTheme', {
  'base': Blockly.Themes.Classic,
  'componentStyles': {
    "workspaceBackgroundColour": "#EEE",
    // "toolboxBackgroundColour": "#333"
  },
  'fontStyle': {
    "family": "Source Code Pro, monospace",
    "weight": "bold",
    "size": 12
  },
});

export { DarkTheme, LightTheme };
