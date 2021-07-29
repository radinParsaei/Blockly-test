import * as Blockly from 'blockly/core';

let DarkTheme = Blockly.Theme.defineTheme('DarkTheme', {
  'base': Blockly.Themes.Dark,
  'blockStyles': {
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
    },
  },
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
  'blockStyles': {
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
    },
  },
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
