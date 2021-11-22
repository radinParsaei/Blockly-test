/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Toolbox that uses a continuous scrolling flyout.
 */

import * as Blockly from 'blockly/core';
import { Editor } from '../../test';
import {ContinuousFlyout} from './ContinuousFlyout';
import 'lodash';
import _ from 'lodash';

var swap = false;

/**
 * Class for continuous toolbox.
 */
export class ContinuousToolbox extends Blockly.Toolbox {
  /** @override */
  constructor(workspace) {
    super(workspace);
  }

  /** @override */
  init() {
    super.init();

    // Populate the flyout with all blocks and show it immediately.
    const flyout = this.getFlyout();
    flyout.show(this.getInitialFlyoutContents_());
    flyout.recordScrollPositions();
    flyout.hide(this.getInitialFlyoutContents_());

    // Replace workspace.getMetrics with a version that measures the flyout.
    // Ideally this would be set using the workspace options struct but that
    // is not currently possible.
    // TODO(https://github.com/google/blockly/issues/4377): Replace via
    // options struct when possible.
    this.workspace_.getMetrics =
        this.workspaceGetMetrics_.bind(this.workspace_)
    let self = this;
    Blockly.hideFlyOut = () => {
      if (Editor.blocksSearchQuery == null) self.getFlyout().hide(self.getInitialFlyoutContents_())
    }
    Blockly.deselectItem = (name) => {
      var item = self.getCategoryByName(name);
      if (!item) {
        return;
      }
      self.deselectItem_(item);
    }
    Blockly.refreshFlyout = () => {
      self.getFlyout().hide(self.getInitialFlyoutContents_())
      self.getFlyout().show(self.getInitialFlyoutContents_())
    }
    Blockly.isFlyoutOpen = () => {
      return this.getFlyout().isVisible()
    }
    Blockly.gotoStartOfFlyout = () => {
      self.getFlyout().scrollTo(1)
    }
  }

  /** @override */
  getFlyout() {
    return /** @type {ContinuousFlyout} */ (super.getFlyout());
  }

  /**
   * Gets the contents that should be shown in the flyout immediately.
   * This includes all blocks and labels for each category of block.
   * @return {!Blockly.utils.toolbox.FlyoutItemInfoArray} Flyout contents.
   * @private
   */
  getInitialFlyoutContents_() {
    /** @type {!Blockly.utils.toolbox.FlyoutItemInfoArray} */
    let contents = [];
    for (const toolboxItem of this.contents_) {
      if (toolboxItem instanceof Blockly.ToolboxCategory) {
        // Create a label node to go at the top of the category
        contents.push({kind: 'LABEL', text: toolboxItem.getName()});
        /**
         * @type {string|Blockly.utils.toolbox.FlyoutItemInfoArray|
         *    Blockly.utils.toolbox.FlyoutItemInfo}
         */
        let itemContents = toolboxItem.getContents();

        // Handle custom categories (e.g. variables and functions)
        if (typeof itemContents === 'string') {
          itemContents =
            /** @type {!Blockly.utils.toolbox.DynamicCategoryInfo} */ ({
              custom: itemContents,
              kind: 'CATEGORY',
            });
        }
        contents = contents.concat(itemContents);
      }
    }
    if (Editor.blocksSearchQuery) {
      Editor.blocksSearchQuery = Editor.blocksSearchQuery.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)')
      .replaceAll('[', '\\[').replaceAll(']', '\\]').replaceAll('.', '\\.').replaceAll('?', '\\?').replaceAll('*', '\\*').replaceAll('+', '\\+')
      let message = ''
      let blocks = _.cloneDeep(Blockly.Blocks)
      for (let c of Object.keys(blocks)) {
        if (blocks[c] && !blocks[c]['block_message']) {
          blocks[c].jsonInit = function(a) {
            for (let j of Object.keys(a)) {
              if (j.startsWith('message')) {
                let messageOfBlock = a[j].replace(/%\d+/g, '')
                message = messageOfBlock
              }
            }
          }
          blocks[c].appendDummyInput = function() {
            return class {
              static appendField(a) {
                if (typeof a == 'string') {
                  message += a + ' '
                }
                return this
              }
            }
          }
          blocks[c].appendValueInput = function() {
            return class {
              static appendField(a) {
                if (typeof a == 'string') {
                  message += a + ' '
                }
                return this
              }
              static setCheck() {return this}
              static setAlign() {return this}
            }
          }
          blocks[c].appendStatementInput = function() {
            return class {
              static appendField(a) {
                if (typeof a == 'string') {
                  message += a + ' '
                }
                return this
              }
              static setCheck() {return this}
              static setAlign() {return this}
            }
          }
          blocks[c].setOutput = function() {}
          blocks[c].setStyle = function() {}
          blocks[c].setColour = function() {}
          blocks[c].setHelpUrl = function() {}
          blocks[c].setTooltip = function() {}
          blocks[c].setPreviousStatement = function() {}
          blocks[c].setNextStatement = function() {}
          blocks[c].setInputsInline = function() {}
          blocks[c].removeInput = function() {}
          blocks[c].moveInputBefore = function() {}
          blocks[c].mixin = function() {}
          blocks[c].newQuote_ = function() {}
          blocks[c].getInput = function() {
            return class {
              static appendField(a) {
                if (typeof a == 'string') {
                  message += a + ' '
                }
              }
              static setCheck() {return this}
            }
          }
          message = ''
          try {
            blocks[c].init()
          } catch (e) {}
          while (message.includes('%{BKY_')) {
            let indexOfVariable = message.indexOf('%{BKY_')
            if (indexOfVariable != -1) {
              let var_ = message.substring(indexOfVariable + 6, message.indexOf('}', indexOfVariable))
              message = message.replace(`%{BKY_${var_}}`, Blockly.Msg[var_])
            }
          }
          Blockly.Blocks[c]['block_message'] = message
        }
      }
      let searchRes_ = [{kind: 'LABEL', text: Blockly.Msg['SEARCH_RESULTS'] || 'Search Results'}]
      for (let i of contents) {
        if (i.kind == 'CATEGORY' && i.custom == 'PROCEDURE') {
          i = []
          for (var x of Blockly.Procedures.flyoutCategory(Blockly.getMainWorkspace())) {
            i.push({kind: 'BLOCK', type: x.attributes[0].value, blockxml: x})
          }
        }
        if (i instanceof Array) {
          for (let j of i) {
            if (j.kind == 'BLOCK' && j.type.includes('def') && (Blockly.Msg['PROCEDURES_DEFRETURN_TITLE'] + Blockly.Msg['PROCEDURES_DEFRETURN_TITLE_METHOD'] + Blockly.Msg['PROCEDURES_DEFRETURN_TITLE_STATIC_METHOD']).toLowerCase().match(Editor.blocksSearchQuery.replace(' ', '.').toLowerCase())) {
              searchRes_.push(j)
              continue
            }
            if (j.kind == 'BLOCK' && j.type.startsWith('procedures_call') && j.blockxml.firstChild.attributes[0].value.toLowerCase().match(Editor.blocksSearchQuery.replace(' ', '.').toLowerCase())) {
              searchRes_.push(j)
            } else {
              if (j.kind == 'BLOCK' && (Blockly.Blocks[j.type]['block_message'] && Blockly.Blocks[j.type]['block_message'].trim() != ''? Blockly.Blocks[j.type]['block_message'] : j.type).toLowerCase().match(Editor.blocksSearchQuery.replace(' ', '.').toLowerCase())) { 
                searchRes_.push(j)
              }
            }
          }
        } else {
          if (i.kind == 'BLOCK' && i.type.includes('def') && (Blockly.Msg['PROCEDURES_DEFRETURN_TITLE'] + Blockly.Msg['PROCEDURES_DEFRETURN_TITLE_METHOD'] + Blockly.Msg['PROCEDURES_DEFRETURN_TITLE_STATIC_METHOD']).toLowerCase().match(Editor.blocksSearchQuery.replace(' ', '.').toLowerCase())) {
            searchRes_.push(i)
            continue
          }
          if (i.kind == 'BLOCK' && (Blockly.Blocks[i.type]['block_message'] && Blockly.Blocks[i.type]['block_message'].trim() != ''? Blockly.Blocks[i.type]['block_message'] : i.type).toLowerCase().match(Editor.blocksSearchQuery.replace(' ', '.').toLowerCase())) { 
            searchRes_.push(i)
          }
        }
      }
      return searchRes_
    }
    return contents;
  }

  /** @override */
  refreshSelection() {
    if (localStorage.getItem('mode') == 'block' && this.getFlyout().isVisible())
      this.getFlyout().show(this.getInitialFlyoutContents_());
  }

  /** @override */
  updateFlyout_(_oldItem, newItem) {
    if (Editor.blocksSearchQuery) return
    if (_oldItem == newItem) {
      this.getFlyout().hide(this.getInitialFlyoutContents_());
      this.deselectItem_(_oldItem);
      return;
    }
    if (_oldItem == null) {
      swap = true;
    }
    if (newItem) {
      if (!this.getFlyout().isVisible())
        this.getFlyout().show(this.getInitialFlyoutContents_());
      try {
        const target = this.getFlyout()
            .getCategoryScrollPosition(newItem.name_).y;
        this.getFlyout().scrollTo(target);
      } catch (e) {}
    }
  }

  /** @override */
  onClick_(a) {
    Blockly.Touch.clearTouchIdentifier()
    if (a.target.tagName != 'INPUT') super.onClick_(a)
  }

  /** @override */
  shouldDeselectItem_(oldItem, newItem) {
    // Should not deselect if the same category is clicked again.
    return (oldItem && oldItem !== newItem);
  }

  /**
   * Gets a category by name.
   * @param {string} name Name of category to get.
   * @return {?Blockly.ToolboxCategory} Category, or null if not
   *    found.
   * @package
   */
  getCategoryByName(name) {
    const category = this.contents_.find(
        (item) => item instanceof Blockly.ToolboxCategory &&
            item.isSelectable() && name === item.getName());
    if (category) {
      return /** @type {!Blockly.ToolboxCategory} */ (category);
    }
    return null;
  }

  /**
   * Selects the category with the given name.
   * Similar to setSelectedItem, but importantly, does not call updateFlyout
   * because this is called while the flyout is being scrolled.
   * @param {string} name Name of category to select.
   * @package
   */
  // selectCategoryByName(name) {
  //   const newItem = this.getCategoryByName(name);
  //   // if (!newItem) {
  //   //   return;
  //   // }
  //   const oldItem = this.selectedItem_;
  //
  //   // if (this.shouldDeselectItem_(oldItem, newItem)) {
  //     this.deselectItem_(oldItem);
  //   // }
  //
  //   // if (this.shouldSelectItem_(oldItem, newItem)) {
  //   this.selectItem_(newItem, oldItem);
  //   // }
  // }

  selectCategoryByName(name) {
    var newItem = this.getCategoryByName(name);
    if (!newItem) {
      return;
    }
    var oldItem = this.selectedItem_;

    if (swap) {
      swap = false;
      var tmp = oldItem;
      oldItem = newItem;
      newItem = tmp;
    }

    if (this.shouldDeselectItem_(oldItem, newItem)) {
      this.deselectItem_(oldItem);
    }

    if (this.shouldSelectItem_(oldItem, newItem)) {
      this.selectItem_(oldItem, newItem);
    }
  }

  /** @override */
  getClientRect() {
    // If the flyout never closes, it should be the deletable area.
    const flyout = this.getFlyout();
    if (flyout && !flyout.autoClose) {
      return flyout.getClientRect();
    }
    return super.getClientRect();
  }

  /**
   * Gets adjusted metrics for the workspace, accounting for the flyout width.
   * This will be set as the WorkspaceSvg's getMetrics function, as there
   * is currently no way to set this using the options struct.
   * TODO(https://github.com/google/blockly/issues/4377): Replace via options.
   * @return {!Blockly.utils.Metrics} Contains size and position metrics of a
   *     top level workspace.
   * @private
   * @this {Blockly.WorkspaceSvg}
   */
  workspaceGetMetrics_() {
    const toolboxDimensions =
      Blockly.WorkspaceSvg.getDimensionsPx_(this.toolbox_);
    const flyoutDimensions =
      Blockly.WorkspaceSvg.getDimensionsPx_(this.toolbox_.getFlyout());


    // Contains height and width in CSS pixels.
    // svgSize is equivalent to the size of the injectionDiv at this point.
    const svgSize = Blockly.svgSize(this.getParentSvg());
    const viewSize = {height: svgSize.height, width: svgSize.width};
    if (this.toolbox_) {
    // Note: Not actually supported at this time due to ContinunousToolbox
    // only supporting a vertical flyout. But included for completeness.
      if (this.toolboxPosition == Blockly.TOOLBOX_AT_TOP ||
          this.toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
        viewSize.height -= (toolboxDimensions.height + flyoutDimensions.height);
      } else if (this.toolboxPosition == Blockly.TOOLBOX_AT_LEFT ||
          this.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
        viewSize.width -= (toolboxDimensions.width + flyoutDimensions.width);
      }
    }

    // svgSize is now the space taken up by the Blockly workspace, not including
    // the toolbox.
    const contentDimensions =
      Blockly.WorkspaceSvg.getContentDimensions_(this, viewSize);

    let absoluteLeft = 0;
    if (this.toolbox_ && this.toolboxPosition == Blockly.TOOLBOX_AT_LEFT) {
      absoluteLeft = toolboxDimensions.width + flyoutDimensions.width;
    }
    let absoluteTop = 0;
    if (this.toolbox_ && this.toolboxPosition == Blockly.TOOLBOX_AT_TOP) {
      absoluteTop = toolboxDimensions.height + flyoutDimensions.height;
    }

    const metrics = {
      contentHeight: contentDimensions.height,
      contentWidth: contentDimensions.width + flyoutDimensions.width + flyoutDimensions.width,
      contentTop: contentDimensions.top,
      contentLeft: contentDimensions.left - flyoutDimensions.width,

      viewHeight: viewSize.height,
      viewWidth: viewSize.width + flyoutDimensions.width,
      viewTop: -this.scrollY,
      viewLeft: -this.scrollX, //+ (flyoutDimensions.width * 10),

      absoluteTop: absoluteTop,
      absoluteLeft: absoluteLeft - (Editor.isRTL? 0:flyoutDimensions.width),

      // svgHeight: svgSize.height,
      // svgWidth: svgSize.width,

      toolboxWidth: toolboxDimensions.width,
      toolboxHeight: toolboxDimensions.height,
      toolboxPosition: this.toolboxPosition,

      flyoutWidth: flyoutDimensions.width,
      flyoutHeight: flyoutDimensions.height,
    };
    return metrics;
  }
}
