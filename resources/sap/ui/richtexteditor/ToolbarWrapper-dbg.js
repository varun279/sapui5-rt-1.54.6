/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2018 SAP SE. All rights reserved
 */

/*global Promise */

// Provides control sap.ui.richtexteditor.ToolbarWrapper.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', './library', 'sap/ui/core/IconPool', 'sap/ui/core/Item'],
	function (jQuery, Control, library, IconPool, Item) {
		"use strict";


		/**
		 * Constructor for a new RichTextEditor's Custom Toolbar.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The toolbar control is used to replace the default TinyMCE toolbar, with a custom one, built with SAPUI5 controls.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 *
		 * @constructor
		 * @private
		 * @alias sap.ui.richtexteditor.ToolbarWrapper
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 * @since 1.48
		 */
		var ToolbarWrapper = Control.extend("sap.ui.richtexteditor.ToolbarWrapper", /** @lends sap.ui.richtexteditor.ToolbarWrapper.prototype */ {
			metadata: {
				interfaces: [
					"sap.ui.richtexteditor.IToolbar"
				],
				library: "sap.ui.richtexteditor",
				aggregations: {
					/**
					 *  The Custom Toolbar control instance
					 */
					_toolbar: {type: "sap.m.OverflowToolbar", multiple: false, visibility: "hidden"},
					/**
					 * The custom insert image dialog for the Rich Text Editor
					 */
					_customInsertImageDialog: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},
					/**
					 * The custom insert link dialog for the Rich Text Editor
					 */
					_customInsertLinkDialog: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},
					/**
					 * The custom text color dialog for the Rich Text Editor
					 */
					_customTextColorDialog: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},
					/**
					 * The custom background color dialog for the Rich Text Editor
					 */
					_customBackgroundColorDialog: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},
					/**
					 * The custom insert table dialog for the Rich Text Editor
					 */
					_customInsertTableDialog: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"}
				},
				associations: {
					/**
					 * The RichTextEditor control to be linked to the Toolbar control.
					 */
					editor: {type: "sap.ui.richtexteditor.RichTextEditor", multiple: false}
				}
			}
		});

		ToolbarWrapper.prototype.init = function () {
			// This helper is defined within richtexteditor's library.js to provide loose coupling
			// with the controls in sap.m library
			this._helper = library.RichTextEditorHelper;
			this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.richtexteditor");
			this._oAccessibilityTexts = {};
			this._sTextColor = library.EditorCommands.TextColor.defaultValue;
			this._sBackgroundColor = library.EditorCommands.BackgroundColor.defaultValue;
		};

		ToolbarWrapper.prototype.onBeforeRendering = function () {
			if (!this.getAggregation("_toolbar")) {
				this.setAggregation("_toolbar", this._createCustomToolbar());
				this.setAggregation("_customInsertImageDialog",
					this._helper.createDialog(this._createInsertImageConfig("InsertImage")));
				this.setAggregation("_customInsertLinkDialog",
					this._helper.createDialog(this._createInsertLinkConfig("InsertLink")));
				this.setAggregation("_customTextColorDialog",
					this._helper.createColorPalettePopover(this._createColorPalettePopoverConfig("TextColor")));
				this.setAggregation("_customBackgroundColorDialog",
					this._helper.createColorPalettePopover(this._createColorPalettePopoverConfig("BackgroundColor")));
				this.setAggregation("_customInsertTableDialog",
					this._helper.createDialog(this._createInsertTableConfig("InsertTable")));
			}
		};

		ToolbarWrapper.prototype.onAfterRendering = function () {
			var oEditor = this.getEditor();
			// create an array of deep copies with the initia setupof the button groups
			this._initialButtonGroupsState = oEditor && oEditor.getButtonGroups().map(function(oObject){
				 return jQuery.extend(true, {}, oObject);
			});

			this._syncPopoverOpeningArrows();
			this._syncColors("TextColor", this._sTextColor);
			this._syncColors("BackgroundColor", this._sBackgroundColor);
		};

		ToolbarWrapper.prototype.exit = function () {
			// destroy InvisibleTexts
			for (var sGroupName in this._oAccessibilityTexts) {
				this._destroyAssociatedInvisibleTexts(sGroupName);
			}

			this._customButtons = null;
			this._oAccessibilityTexts = null;
		};

		/**
		 * Helper function for synchronising the arrow button of the color selection SplitButtons
		 * The arrow button should be displayed as active, while the corresponding color popover is open
		 *
		 * @private
		 */
		ToolbarWrapper.prototype._syncPopoverOpeningArrows = function () {
			var aFontButtons = this._findGroupedControls("font"),
				oTextColorArrowButton = aFontButtons[2] && aFontButtons[2]._getArrowButton(),
				oBackgroundColorArrowButton =  aFontButtons[3] && aFontButtons[3]._getArrowButton();

			this.getAggregation("_customTextColorDialog")._ensurePopover()
				.attachAfterOpen(function () { oTextColorArrowButton._activeButton();})
				.attachAfterClose(function () { oTextColorArrowButton._inactiveButton();});
			this.getAggregation("_customBackgroundColorDialog")._ensurePopover()
				.attachAfterOpen(function () { oBackgroundColorArrowButton._activeButton();})
				.attachAfterClose(function () { oBackgroundColorArrowButton._inactiveButton();});
		};

		/**
		 * As the toolbar is not direct aggregation of RTE
		 * we should construct a stable ID for the "ancestor" elements.
		 * @param {string} [sExtension] Name of the command / element for which a new ID should be generated
		 * @returns {string} The newly constructed ID
		 *
		 * @private
		 */
		ToolbarWrapper.prototype._getId = function (sExtension) {
			this._getId.counter = this._getId.counter ? this._getId.counter + 1 : 1;

			var sRTEId = this.getEditor() ? this.getEditor().getId() : "_rte" + this._getId.counter,
				sToolbarId = this.getId(),
				aBuilder = [sRTEId + sToolbarId];

			if (sExtension || sExtension === 0) {
				aBuilder.push(sExtension);
			}

			return aBuilder.join("-");
		};

		/**
		 * Gets the RichTextEditor instance
		 *
		 * @returns {(object|null)} Either the editor instance or null
		 */
		ToolbarWrapper.prototype.getEditor = function () {
			var sId = this.getAssociation("editor"),
				oEditor = sap.ui.getCore().byId(sId);

			return oEditor || null;
		};

		/**
		 * Helper function for extending the configuration of the TinyMCE for the Custom Toolbar
		 *
		 * @param {object} [oConfig] Configuration object to be extended
		 * @returns {object} The modified configuration object
		 * @public
		 */
		ToolbarWrapper.prototype.modifyRTEToolbarConfig = function (oConfig) {
			var oToolbar = this;

			// Remove the native toolbar. From now on the sap.ui.richtexteditor.ToolbarWrapper will be used
			oConfig.toolbar = false;

			oConfig.setup = function (editor) {
				editor.on('init', function () {
					var oEditorCommands = library.EditorCommands;

					// execute the default font styles to ensure right synchronizing of the custom toolbar
					editor.execCommand("FontName", false, oEditorCommands["FontFamily"]["Verdana"].commandValue);
					editor.execCommand("FormatBlock", false, oEditorCommands["FormatBlock"]["Paragraph"].commandValue);
					editor.execCommand("FontSize", false, "8");
					editor.execCommand("JustifyLeft", false);
				});

				// Sync sap.ui.richtexteditor.ToolbarWrapper buttons with the editor
				editor.on('NodeChange', function () {
					oToolbar._syncToolbarStates(this);
				});
			};

			return oConfig;
		};

		/**
		 * Helper function for applying text color or background color to a text node
		 *
		 * @param {string} [sCommand] Command type
		 * @param {string} [sCommandName] Editors command name
		 * @param {string} [sColor] Color parameter
		 * @param {boolean} [bDefaultColor] True if the color param is the default color for the command
		 * @private
		 */
		ToolbarWrapper.prototype._applyColor = function (sCommand, sCommandName, sColor, bDefaultColor) {
			if (bDefaultColor || this._getColor(sCommand).replace(/,\s/g, ',') !== sColor) {
				this.getEditor().getNativeApi().execCommand(sCommandName, false, sColor);
			}
		};

		/**
		 * Helper function for synchronizing the color of the SplitButtons for TextColor and TextBackground
		 *
		 * @param {string} [sCommand] Editors command
		 * @param {string} [sColor] Color parameter
		 * @private
		 */
		ToolbarWrapper.prototype._syncColors = function (sCommand, sColor) {
			var aControls = this._findGroupedControls("font"),
				oSplitButton;

			if (!sColor) {
				return;
			}

			switch (sCommand) {
				case "TextColor":
					// SplitButton for TextColor
					oSplitButton = aControls[2];
					break;
				case "BackgroundColor":
					// SplitButton for BackgroundColor
					oSplitButton = aControls[3];
					break;
			}

			// get the text icon instance of the SplitButton and set its color
			if (oSplitButton && oSplitButton._getTextButton().getDomRef("img")) {
				sap.ui.getCore().byId(oSplitButton._getTextButton().getDomRef("img").id).setColor(sColor);
			}
		};
		/**
		 * Helper function for synchronizing the button states or selected items with the styles applied on the editor
		 * @param {object} [oNativeEditor] Editor Object
		 * @private
		 */
		ToolbarWrapper.prototype._syncToolbarStates = function (oNativeEditor) {
			var oEditorCommand, oControl, sEditorCommand,
				oEditorCommands = library.EditorCommands,
				oFormatter = oNativeEditor.formatter,
				_syncTextAlign = function (oTextAlignCommand, oEditorFormatter, oControl) {
					var sAlignCommand, sIconUri;

					for (sAlignCommand in oTextAlignCommand) {
						sIconUri = IconPool.getIconURI(oEditorCommand[sAlignCommand].icon);
						if (oTextAlignCommand.hasOwnProperty(sAlignCommand) &&
							oEditorFormatter.match(oTextAlignCommand[sAlignCommand].style) &&
							oControl.getIcon() !== sIconUri) {
								oControl.setIcon(sIconUri);
								break;
						}
					}
				},
				_syncTextFormatBlock = function (oEditor, oFormatBlockCommand, oControl) {
					var sFormatStyle,
						sFormatBlockCommandValue = oEditor.getDoc().queryCommandValue("FormatBlock");

					// Synchronize the selected item of the Font Family Select with the applied font family style
					for (sFormatStyle in oFormatBlockCommand) {
						if (!oFormatBlockCommand.hasOwnProperty(sFormatStyle)) {
							continue;
						}
						// in IE the queryCommandValue function returns the text and in Chrome return the key
						if ((sFormatBlockCommandValue === oFormatBlockCommand[sFormatStyle].commandValue) || (sFormatBlockCommandValue === oFormatBlockCommand[sFormatStyle].text)) {
							oControl.setSelectedItemId(oControl.getId() + sFormatStyle);
							break;
						}
					}
				},
				_syncTextFontFamily = function (oEditor, oFontFamilyCommand, oControl) {
					var sFontName, sCommandValue, sText,
						sFontNameCommandValue = oEditor.getDoc().queryCommandValue("FontName");

					// Synchronize the selected item of the Font Family Select with the applied font family style
					for (sFontName in oFontFamilyCommand) {
						if (!oFontFamilyCommand.hasOwnProperty(sFontName)) {
							continue;
						}

						sCommandValue = oFontFamilyCommand[sFontName].commandValue.match(/\w+/g).join("").toLowerCase();
						sFontNameCommandValue = sFontNameCommandValue && sFontNameCommandValue.match(/\w+/g).join("").toLowerCase();
						sText = oFontFamilyCommand[sFontName].text.match(/\w+/g).join("").toLowerCase();

						if (sCommandValue === sFontNameCommandValue || sFontNameCommandValue === sText) {
							oControl.setSelectedItemId(oControl.getId() + sFontName);
							break;
						}
					}
				},
				_syncImage = function (oEditor, oControl) {
					var oSelection = oEditor.selection.getNode(),
						bImage = oSelection && oSelection.tagName.toLowerCase() === "img" || oSelection.parentElement.tagName.toLowerCase() === "img";

					oControl.setPressed(!!bImage);
				},
				_syncLink = function (oEditor, oControl, bToggleButton) {
					var oSelection = oEditor.selection.getNode(),
						bLink = oSelection && oSelection.tagName.toLowerCase() === "a" || oSelection.parentElement.tagName.toLowerCase() === "a";

					if (bToggleButton) {
						oControl.setPressed(!!bLink);
					} else {
						oControl.setEnabled(!!bLink);
					}
				};

			for (sEditorCommand in oEditorCommands) {
				if (!oEditorCommands.hasOwnProperty(sEditorCommand)) {
					continue;
				}

				oEditorCommand = oEditorCommands[sEditorCommand];
				// TODO: Probably there's a better way to handle this
				oControl = sap.ui.getCore().byId(this._getId(sEditorCommand));

				if (!oControl) {
					continue;
				}

				switch (sEditorCommand) {
					case "TextAlign":
						_syncTextAlign(oEditorCommand, oFormatter, oControl);
						break;
					case "FontFamily":
						_syncTextFontFamily(oNativeEditor, oEditorCommand, oControl);
						break;
					case "FormatBlock":
						_syncTextFormatBlock(oNativeEditor, oEditorCommand, oControl);
						break;
					case "InsertImage":
						_syncImage(oNativeEditor, oControl);
						break;
					case "InsertLink":
						_syncLink(oNativeEditor, oControl, true);
						break;
					case "Unlink":
						_syncLink(oNativeEditor, oControl, false);
						break;
					case "FontSize":
						// queryCommandValue("FontSize") always returns empty string in FireFox - to be fixed
						// Synchronize the selected item of the Font Name Select with the applied font size style
						oNativeEditor.getDoc().queryCommandValue(sEditorCommand) &&
						oControl.setSelectedItemId(oControl.getId() + oNativeEditor.getDoc().queryCommandValue(sEditorCommand));
						break;
					default:
						// Synchronize the pressed state of the OverflowToolbarToggleButtons
						oControl.getMetadata().getName() === "sap.m.OverflowToolbarToggleButton" &&
						oControl.setPressed(oFormatter.match(oEditorCommand.style));
				}
			}
		};

		/**
		 * Helper function for creating Button Control configuration
		 *
		 * @param {string} [sCommand] Editor Command
		 * @returns {object} The editor command configuration object
		 * @private
		 */
		ToolbarWrapper.prototype._createButtonConfig = function (sCommand) {
			var oEditorCommands = library.EditorCommands,
				oCommand = oEditorCommands[sCommand],
				oRTE = this.getEditor();


			return {
				id: this._getId(sCommand),
				icon: IconPool.getIconURI(oCommand.icon),
				tooltip: this._oResourceBundle.getText(oCommand.bundleKey),
				text: this._oResourceBundle.getText(oCommand.bundleKey),
				press: function () {
					if (oRTE) {
						oRTE.getNativeApi().execCommand(oCommand.command);
					} else {
						jQuery.sap.log.warning("Cannot execute native command: " + oCommand.command);
					}
				}
			};
		};

		/**
		 * Helper function for creating MenuButtonItem Controls
		 *
		 * @param {string} [sCommand] Editor Command
		 * @returns {Array} An array of menu items which should be included in the menu of the MenuButton
		 * @private
		 */
		ToolbarWrapper.prototype._createMenuButtonItems = function (sCommand) {
			var oEditorHelper = this._helper,
				oEditorCommands = library.EditorCommands,
				aItems = [],
				sItemText,
				oCommand;

			for (var sEditorCommand in oEditorCommands[sCommand]) {
				if (sEditorCommand === 'bundleKey') {
					continue;
				}

				oCommand = oEditorCommands[sCommand][sEditorCommand];
				sItemText = this._oResourceBundle.getText(oCommand.bundleKey) || oCommand.text;
				aItems.push(oEditorHelper.createMenuItem(this._getId(sCommand + sEditorCommand), sItemText, IconPool.getIconURI(oCommand.icon)));
			}

			return aItems;
		};

		/**
		 * Helper function for creating SelectItem Controls for FontStyle Select
		 *
		 * @returns {Array} An array of items for the font style select control
		 * @private
		 */
		ToolbarWrapper.prototype._createFontStyleSelectItems = function () {
			var oEditorCommands = library.EditorCommands,
				oFontFamilies = oEditorCommands["FontFamily"],
				aItems = [],
				oItem;

			for (var sFontStyle in oFontFamilies) {
				oItem = {
					id: this._getId("FontFamily" + sFontStyle),
					text: oFontFamilies[sFontStyle].text
				};

				aItems.push(new Item(oItem));
			}

			return aItems;
		};

		/**
		 * Helper function for finding the command value of a given font style command
		 *
		 * @param {string} [sItemText] Font Family
		 * @returns {string} The command value of the given font style
		 * @private
		 */
		ToolbarWrapper.prototype._getFontStyleCommand = function (sItemText) {
			var oEditorCommands = library.EditorCommands,
				oFontFamilies = oEditorCommands["FontFamily"];

			for (var sFontStyle in oFontFamilies) {
				if (oFontFamilies.hasOwnProperty(sFontStyle) && oFontFamilies[sFontStyle].text === sItemText) {
					return oFontFamilies[sFontStyle].commandValue;
				}
			}
		};

		/**
		 * Helper function for finding the command value of a given format command
		 *
		 * @param {string} [sItemText] Text Item
		 * @returns {string} The command value of the given format
		 * @private
		 */
		ToolbarWrapper.prototype._getFormatBlockCommand = function (sItemText) {
			var oEditorCommands = library.EditorCommands,
				oFormat = oEditorCommands["FormatBlock"];

			for (var sFormat in oFormat) {
				if (oFormat.hasOwnProperty(sFormat) && this._oResourceBundle.getText(oFormat[sFormat].bundleKey) === sItemText) {
					return oFormat[sFormat].commandValue;
				}
			}
		};

		/**
		 * Helper function for creating SelectItem Controls for FontSize Select
		 *
		 * @returns {Array} An array of items for the font size select control
		 * @private
		 */
		ToolbarWrapper.prototype._createFontSizeSelectItems = function () {
			var aItems = [],
				number = 1, //TinyMCE command values for font sizes have a value from 1 to 7
				oItem,
				oEditorCommands = library.EditorCommands;

			oEditorCommands["FontSize"].forEach(function (item) {
				oItem = {
					id: this._getId("FontSize" + number),
					text: item + "pt"
				};
				aItems.push(new Item(oItem));
				number++;
			}, this);
			return aItems;
		};

		/**
		 * Helper function for creating SelectItem controls for FontSize select
		 *
		 * @returns {Array} An array of items for the font size select control
		 * @private
		 */
		ToolbarWrapper.prototype._createFormatBlockItems = function () {
			var oEditorCommands = library.EditorCommands,
				oFormatBlock = oEditorCommands["FormatBlock"],
				aItems = [],
				oItem;

			for (var sFormatStyle in oFormatBlock) {
				oItem = {
					id: this._getId("FormatBlock" + sFormatStyle),
					text: this._oResourceBundle.getText(oFormatBlock[sFormatStyle].bundleKey)
				};

				aItems.push(new Item(oItem));
			}

			return aItems;
		};

		/**
		 * Helper function for getting the color style applied to a current node or at a certain caret position
		 *
		 * @param {string} [sCommand] The Editor Command
		 * @returns {string} The color applied to the current selection or the default value
		 * @private
		 */
		ToolbarWrapper.prototype._getColor = function (sCommand) {
			var oRTE = this.getEditor(),
				oCommandStyle = library.EditorCommands[sCommand].style,
				oNode = oRTE.getNativeApi().selection.getNode(),
				aNodes = oRTE.getNativeApi().dom.getParents(oNode),
				i, aCurrentNode, sColor;

			for (i = 0; i < aNodes.length; i++) {
				aCurrentNode = aNodes[i];
				sColor = aCurrentNode.style[oCommandStyle];

				if (sColor && sColor != "") {
					return sColor;
				}
			}

			// If there is no color style found, return the default color
			return library.EditorCommands[sCommand].defaultValue;
		};


		/**
		 * Helper function for creating SplitButton Control configuration for opening ColorPalettePopovers
		 *
		 * @private
		 * @param {string} [sCommand] Editor Command
		 * @returns {object} The configuration object for the toolbar SplitButton which opens a command specific popover
		 */
		ToolbarWrapper.prototype._createSplitButtonForDialog = function (sCommand) {
			var oCommand = library.EditorCommands[sCommand],
				oToolbar = this,
				oDialog;

			if (!oCommand) {
				return;
			}

			return {
				id: this._getId(sCommand),
				icon: sap.ui.core.IconPool.getIconURI(oCommand.icon),
				tooltip: this._oResourceBundle.getText(oCommand.bundleKey),
				press: function () {
					switch (sCommand) {
						case "TextColor":
							oToolbar._applyColor(sCommand, oCommand.command, oToolbar._sTextColor);
							break;
						case "BackgroundColor":
							oToolbar._applyColor(sCommand, oCommand.command, oToolbar._sBackgroundColor);
							break;
					}
				},
				arrowPress: function () {
					oDialog = oToolbar.getAggregation("_custom" + sCommand + "Dialog");

					this._getArrowButton()._activeButton();
					if (!oDialog) {
						return;
					}

					oDialog.openBy(this);

				}
			};
		};


		/**
		 * Helper function for creating Button Control configuration for opening dialogs
		 *
		 * @private
		 * @param {string} [sCommand] Editor Command
		 * @returns {object} The configuration object for the toolbar button which opens a command specific dialog
		 */
		ToolbarWrapper.prototype._createButtonForDialog = function (sCommand) {
			var oCommand = library.EditorCommands[sCommand],
				oToolbar = this,
				oDialog;

			if (!oCommand) {
				return;
			}

			return {
				id: this._getId(sCommand),
				icon: sap.ui.core.IconPool.getIconURI(oCommand.icon),
				tooltip: this._oResourceBundle.getText(oCommand.bundleKey),
				text: this._oResourceBundle.getText(oCommand.bundleKey),
				press: function () {
					oDialog = oToolbar.getAggregation("_custom" + sCommand + "Dialog");

					if (!oDialog) {
						return;
					}

					switch (sCommand) {
						case "InsertImage":
							this.setPressed(true);
							oToolbar._syncImageDialogData(oDialog);
							break;
						case "InsertLink":
							oToolbar._syncLinkDialogData(oDialog);
							break;
					}
					oDialog.open();
				}
			};
		};

		/**
		 * Helper function for synchronizing dialog data with image values
		 * @private
		 * @param {sap.m.Dialog} [oDialog] The Dialog to be synchronized
		 */
		ToolbarWrapper.prototype._syncImageDialogData = function (oDialog) {
			var oSelection = this.getEditor().getNativeApi().selection,
				oSelectionNode = oSelection && oSelection.getNode(),
				oDialogContent = oDialog && oDialog.getContent(),
				oDialogCheckBox, oHeightInput, oWidthInput, oSelectedNode,
				sURL, sDescription, fWidth, fHeight, oDimensionsFlexBox;

			if (!oDialogContent.length) {
				return;
			}

			oDialogCheckBox = oDialogContent[6];
			oDimensionsFlexBox = oDialogContent[5];

			if (oDimensionsFlexBox.getMetadata().getName() === "sap.m.HBox" && oDimensionsFlexBox.getAggregation("items").length) {
				oHeightInput = oDimensionsFlexBox.getAggregation("items")[2];
				oWidthInput = oDimensionsFlexBox.getAggregation("items")[0];
			}

			if (oSelectionNode.tagName.toLowerCase() === 'img') {
				oSelectedNode = oSelectionNode;
			} else {
				oSelectedNode = oSelectionNode.parentElement;
			}

			// if there isn't a selected img, the ratio checkbox
			// should be disabled and the input values should be reset
			if (oSelectedNode.tagName.toLowerCase() !== "img") {
				oDialogCheckBox.setSelected(false).setEnabled(false);
				oDialogContent[1].resetProperty('value');
				oDialogContent[3].resetProperty('value');
				oHeightInput.resetProperty('value');
				oWidthInput.resetProperty('value');

				return;
			}

			if (!oDialogCheckBox.getEnabled()){
				oDialogCheckBox.setEnabled(true);
			}

			// set the checkbox selecte4d value depending on the attribute for the ratio
			oDialogCheckBox.setSelected(oSelectedNode.getAttribute('data-sap-ui-rte-image-ratio') === 'true' ? true : false);

			// get the image element attributes values
			sURL = oSelectedNode.getAttribute('src');
			sDescription = oSelectedNode.getAttribute('alt');
			fWidth = parseFloat(oSelectedNode.width);
			fHeight = parseFloat(oSelectedNode.height);

			// sync the dialog data with the image tag attributes
			oDialogContent[1].setValue(sURL);
			oDialogContent[3].setValue(sDescription);

			// set the dimensions
			oHeightInput.setValue(fHeight);
			oWidthInput.setValue(fWidth);
		};

		/** Helper function for synchronizing dialog data with link values
		* @private
		* @param {sap.m.Dialog} [oDialog] The Dialog to be synchronized
		*/
		ToolbarWrapper.prototype._syncLinkDialogData = function (oDialog) {
			var aDialogContent = oDialog && oDialog.getContent(),
				oSelection, oSelectedNode, sURL, sDisplayText, sTitle,
				bTarget, oSelectionNode, bLinkPartSelected, bSelection;

			if (!(aDialogContent instanceof Array) || !aDialogContent.length) {
				return;
			}

			oSelection = this.getEditor().getNativeApi().selection;
			oSelectionNode = oSelection.getNode();
			oSelectedNode = this._getSelectionAnchor(oSelection);

			if (!oSelectedNode) {
				oSelectedNode = oSelectionNode.parentElement;
			}

			// if part of the link element is selected
			bLinkPartSelected = oSelection.getContent().length !== 0 &&
				oSelectedNode.textContent &&
				oSelection.getContent().length < oSelectedNode.textContent.length &&
				oSelectedNode.tagName === "A";

			// if there is a selected text
			bSelection = oSelection.getContent().length !== 0;

			// if there isn't a selection or a link is partly selected,
			// the display text should be equal to the text of the selection node
			if (!bSelection || bLinkPartSelected) {
				sDisplayText = oSelectedNode.text;
			} else {
				// prevents displaying the whole anchor element as a display text
				sDisplayText = oSelection.getNode() &&
					oSelection.getNode().tagName.toLowerCase() == 'a' ?
					oSelection.getNode().textContent : oSelection.getContent();
			}

			sURL = oSelectedNode.getAttribute('href');
			sTitle = oSelectedNode.getAttribute('title');
			bTarget = oSelectedNode.getAttribute('target') === "true" ?  true : false;

			aDialogContent[1].setValue(sURL);
			aDialogContent[3].setValue(sDisplayText);
			aDialogContent[5].setValue(sTitle);
			aDialogContent[6].getAggregation('items')[1].setSelectedIndex(bTarget);
		};

		/**
		 * Helper function for creating Color Dialog configuration
		 *
		 * @param {string} [sType] Type of color command.
		 * @returns {object} The configuration object for the color picker dialog
		 * @private
		 */
		ToolbarWrapper.prototype._createColorPalettePopoverConfig = function(sType) {
			var oCommand = library.EditorCommands[sType],
				sColor = oCommand.defaultValue,
				oToolbar = this;

			return {
				defaultColor: sColor,
				colorSelect: function (oEvent) {
					var sColor = oEvent.getParameters().value;
					oToolbar._applyColor(sType, oCommand.command, sColor, oEvent.getParameter("defaultAction"));

					switch (sType) {
						case "TextColor":
							oToolbar._sTextColor = sColor;
							oToolbar._syncColors("TextColor", sColor);
							break;
						case "BackgroundColor":
							oToolbar._sBackgroundColor = sColor;
							oToolbar._syncColors("BackgroundColor", sColor);
							break;
					}
				}
			};
		};

		/**
		 * Helper function for generating image HTML content
		 *
		 * @param {string} [sURL] The URL of the HTML image tag
		 * @param {string} [sText] The alternative text of the HTML image tag
		 * @param {string} [sHeight] The height of the HTML image tag in pixels
		 * @param {string} [sWidth] The width of the HTML image tag in pixels
		 * @param {boolean} [bRatio] True if ratio of the image should be taken into consideration, when height and width are set on the image
		 * @returns {string} String representing HTML tag with the provided parameters
		 * @private
		 */
		ToolbarWrapper.prototype._generateImageHTML = function(sURL, sText, sHeight, sWidth, bRatio) {
			var sURLAttr = sURL ? ' src="' + sURL + '"' : '',
				sAltAttr = sText ? ' alt="' + sText + '"' : '',
				sHeightAttr = sHeight ? ' height="' + sHeight + 'px"' : '',
				sWidthAttr = sWidth ? ' width="' + sWidth + 'px"' : '',
				sDimensions = sHeightAttr + sWidthAttr,
				sRatio = (bRatio !== undefined) ? ' data-sap-ui-rte-image-ratio="' + bRatio + '"' : '';

			return '<img' + sURLAttr + sAltAttr + sDimensions + sRatio + '/>';
		};

		/**
		 * Helper function for creating InsertImage Dialog configuration
		 *
		 * @returns {object} Configuration object of the InsertImage Dialog control
		 * @private
		 */
		ToolbarWrapper.prototype._createInsertImageConfig = function() {
			var iRationCoeff,
				oTitleBundleText = this._oResourceBundle.getText(sap.ui.richtexteditor.EditorCommands["InsertImage"].bundleKey),
				oURLInput = this._helper.createInput(),
					oURLLabel = this._helper.createLabel({
						text: this._oResourceBundle.getText("INSERT_IMAGE_URL"),
						labelFor: oURLInput
					}),
					oTextInput = this._helper.createInput(),
					oTextLabel = this._helper.createLabel({
						text: this._oResourceBundle.getText("INSERT_IMAGE_DESCRIPTION"),
						labelFor: oTextInput
					}),
					oDimensionWidthInput = this._helper.createInput({
						width: '8rem',
						fieldWidth:"6rem",
						description: 'px',
						change: function () {
							fnCalculateRatio(false, true);
						}
					}),
					oTextDimensions = this._helper.createText({
						textAlign: "Center",
						width: '2rem',
						text: 'x'
					}),
					oDimensionHeightInput = this._helper.createInput({
						fieldWidth: "6rem",
						width: '8rem',
						description: 'px',
						change: function () {
							fnCalculateRatio(true, false);
						}
					}),
					oDimensionsFlexBox = this._helper.createHBox({
						wrap: "Wrap",
						alignItems: "Center",
						justifyContent: "SpaceBetween",
						items: [oDimensionWidthInput,
								oTextDimensions,
								oDimensionHeightInput]
					}),
					oDimensionsLabel = this._helper.createLabel({
						text: this._oResourceBundle.getText("INSERT_CONTENT_DIMENSIONS")
					}),
					oRatioCheckBox = this._helper.createCheckBox({
						select: function () {
							fnCalculateRatio(true, true);
						}
					}),
					oRatioLabel = this._helper.createLabel({
						text: this._oResourceBundle.getText("INSERT_IMAGE_RATIO"),
						labelFor: oRatioCheckBox
					}),
					oRTE = this.getEditor(),
					fnCalculateRatio = function(bCheckHeight, bCheckWidth) {
						var oSelection = oRTE.getNativeApi().selection,
							oSelectionNode = oSelection && oSelection.getNode(),
							fWidthInputValue = parseFloat(oDimensionWidthInput.getValue()),
							fHeightInputValue = parseFloat(oDimensionHeightInput.getValue()),
							fImageWidth, fImageHeight;


						if (!oRatioCheckBox.getSelected()) {
							return;
						}

						if (oSelectionNode.tagName.toLowerCase() !== 'img' && !(oSelectionNode.parentElement && oSelectionNode.parentElement.tagName.toLowerCase() === "img")) {
							// if there isn't an selected image, there is no need of calculating values
							return;
						}

						oSelectionNode = oSelectionNode.tagName.toLowerCase() === "img" ? oSelectionNode : oSelectionNode.parentElement;

						fImageWidth = parseFloat(oSelectionNode.width);
						fImageHeight = parseFloat(oSelectionNode.height);
						iRationCoeff = fImageWidth / fImageHeight;

						if (bCheckHeight && (fHeightInputValue !== fImageHeight || fHeightInputValue != oDimensionHeightInput._lastValue)) {
							oDimensionWidthInput.setValue(fHeightInputValue * iRationCoeff);
						} else if (bCheckWidth && (fWidthInputValue !== fImageWidth || fWidthInputValue != oDimensionWidthInput._lastValue)) {
							oDimensionHeightInput.setValue(fWidthInputValue / iRationCoeff);
						}
					},
					oToolbar = this,
					aButtons = [];

				aButtons.push(this._helper.createButton({
					id: this._getId("InsertImageButton"),
					text: this._oResourceBundle.getText("DIALOG_OK_BUTTON"),
					press: function () {
						oRTE.getNativeApi()
							.insertContent(oToolbar._generateImageHTML(oURLInput.getValue(),
																		oTextInput.getValue(),
																		oDimensionHeightInput.getValue(),
																		oDimensionWidthInput.getValue(),
																		oRatioCheckBox.getSelected()));
						oToolbar.getAggregation("_customInsertImageDialog").close();
						oToolbar._syncToolbarStates(oRTE.getNativeApi());
					}
				}));

				aButtons.push(this._helper.createButton({
					id: this._getId("CancelInsertImageButton"),
					text: this._oResourceBundle.getText("DIALOG_CANCEL_BUTTON"),
					press: function () {
						oToolbar.getAggregation("_customInsertImageDialog").close();
						oToolbar._syncToolbarStates(oRTE.getNativeApi());
					}
				}));

				return {
					contentWidth: '320px',
					title: oTitleBundleText,
					buttons: aButtons,
					content: [
						oURLLabel,
						oURLInput,
						oTextLabel,
						oTextInput,
						oDimensionsLabel,
						oDimensionsFlexBox,
						oRatioCheckBox,
						oRatioLabel
					]
				};
		};

		/**
		 * Helper function for finding selected anchor HTML node
		 * @private
		 */
		ToolbarWrapper.prototype._getSelectionAnchor = function (oSelection) {
			var oSelectionNode, oAnchor;

			if (!oSelection) {
				return;
			}

			oSelectionNode = oSelection.getNode();

			if (oSelection.getStart().tagName == 'A') {
				oAnchor = oSelection.getStart();
			} else if (oSelectionNode.tagName == 'A') {
				oAnchor = oSelectionNode;
			}

			return oAnchor;
		};

		/**
		 * Helper function for generating link HTML content
		 *
		 * @param {string} [sURL] The URL of the HTML link tag
		 * @param {string} [sText] The text of the HTML link tag
		 * @param {string} [sTitle] The title of the HTML link tag
		 * @param {boolean} [bTarget] True if the provided link should be opened in a new window
		 * @returns {string} String representing HTML tag with the provided parameters
		 * @private
		 */
		ToolbarWrapper.prototype._generateLinkHTML = function (sURL, sTitle, bTarget, sText) {
			var linkAttrs = {
					href: sURL ? sURL : '',
					target: bTarget ? bTarget : null,
					title: sTitle ? sTitle : ''
				},
				oNativeEditor = this.getEditor().getNativeApi(),
				oSelection = oNativeEditor.selection,
				oAnchor;

			// find the selected anchor element, if present
			oAnchor = this._getSelectionAnchor(oSelection);

			// if there is no url provided and no link selected, do not generate an anchor
			if (sURL === "" && !oAnchor) {
				return;
			}

			// if we delete the href of an existing anchor we should unlink it
			if (sURL === "" && oAnchor) {
				oNativeEditor.execCommand("Unlink");
				return;
			}

			if (!oAnchor) {
				if (sText !== "") {
					oNativeEditor.insertContent(oNativeEditor.dom.createHTML('a', linkAttrs, oNativeEditor.dom.encode(sText)));
				} else {
					oNativeEditor.execCommand('mceInsertLink', false, linkAttrs);
				}

				oAnchor = oNativeEditor.dom.select('a[href="' + linkAttrs.href + '"]')[0];
			}

			// ensure that if an anchor has a inner span (due to different styles applied)
			// the span text should be the same as the anchor text value
			// ensure that the text attribute value is the same as the innerText of the anchor
			if ("innerText" in oAnchor) {
				oAnchor.innerText = sText !== "" ? sText : sURL;
			} else {
				oAnchor.textContent = sText !== "" ? sText : sURL;
			}

			oNativeEditor.dom.setAttribs(oAnchor, linkAttrs);
			oNativeEditor.selection.select(oAnchor);
		};

		/**
		 * Helper function for creating InsertLink Dialog configuration
		 *
		 * @returns {object} Configuration object of the InsertLink Dialog control
		 * @private
		 */
		ToolbarWrapper.prototype._createInsertLinkConfig = function() {
			var oTitleBundleText = this._oResourceBundle.getText(sap.ui.richtexteditor.EditorCommands["InsertLink"].bundleKey),
				oURLInput = this._helper.createInput(),
				oURLLabel = this._helper.createLabel({
					text: this._oResourceBundle.getText("INSERT_LINK_URL"),
					labelFor: oURLInput
				}),
				oTextInput = this._helper.createInput(),
				oTextLabel = this._helper.createLabel({
					text: this._oResourceBundle.getText("INSERT_LINK_DISPLAY_TEXT"),
					labelFor: oTextInput
				}),
				oTitleInput = this._helper.createInput(),
				oTitleLabel = this._helper.createLabel({
					text: this._oResourceBundle.getText("INSERT_LINK_TITLE"),
					labelFor: oTitleInput
				}),
				oTargetSelect = this._helper.createSelect({
					id: this._getId("InsertLinkSelect"),
					items: [
						new Item({
							id: this._getId("InsertLinkSelectNone"),
							text: this._oResourceBundle.getText("INSERT_LINK_TARGET_NONE")
						}),
						new Item({
							id: this._getId("InsertLinkSelectNewWindow"),
							text: this._oResourceBundle.getText("INSERT_LINK_TARGET_NEW_WINDOW")
						})
					]
				}),
				oTargetLabel = this._helper.createLabel({
					text: this._oResourceBundle.getText("INSERT_LINK_TARGET"),
					labelFor: oTargetSelect
				}),
				oTargetFlexBox = this._helper.createVBox({
					direction: "Column",
					alignItems: "Start",
					items: [oTargetLabel,
							oTargetSelect]
				}),
				oRTE = this.getEditor(),
				oToolbar = this,
				aButtons = [];

				aButtons.push(this._helper.createButton({
					id: this._getId("InsertLinkButton"),
					text: this._oResourceBundle.getText("DIALOG_OK_BUTTON"),
					press: function () {
						var bTarget = oTargetSelect.getSelectedItem() === oTargetSelect.getItems()[1] ? true : false;
						oToolbar._generateLinkHTML(oURLInput.getValue(),
							oTitleInput.getValue(),
							bTarget,
							oTextInput.getValue());
						oToolbar.getAggregation("_customInsertLinkDialog").close();
						oToolbar._syncToolbarStates(oRTE.getNativeApi());
					}
				}));

				aButtons.push(this._helper.createButton({
					id: this._getId("CancelInsertLinkButton"),
					text: this._oResourceBundle.getText("DIALOG_CANCEL_BUTTON"),
					press: function () {
						oToolbar.getAggregation("_customInsertLinkDialog").close();
						oToolbar._syncToolbarStates(oRTE.getNativeApi());
					}
				}));

				return {
					contentWidth: '320px',
					title: oTitleBundleText,
					buttons: aButtons,
					content: [
						oURLLabel,
						oURLInput,
						oTextLabel,
						oTextInput,
						oTitleLabel,
						oTitleInput,
						oTargetFlexBox
					]
				};
		};

		/**
		 * Helper function for creating InsertTable Dialog configuration
		 *
		 * @returns {object} Configuration object of the Insert Table Dialog control
		 * @private
		 */
		ToolbarWrapper.prototype._createInsertTableConfig = function() {
			var oTitleBundleText = this._oResourceBundle.getText(sap.ui.richtexteditor.EditorCommands["InsertTable"].bundleKey),
				oRowsInput = this._helper.createStepInput({
					value: 2,
					min: 0,
					width: "50%"
				}),
				oRowsLabel = this._helper.createLabel({
					text: this._oResourceBundle.getText("INSERT_TABLE_ROWS"),
					labelFor: oRowsInput
				}),
				oColsInput = this._helper.createStepInput({
					value: 2,
					min: 0,
					width: "50%"
				}),
				oColsLabel = this._helper.createLabel({
					text: this._oResourceBundle.getText("INSERT_TABLE_COLS"),
					labelFor: oColsInput
				}),
				oDimensionHeightInput = this._helper.createInput({
					width: '8rem',
					fieldWidth:"6rem",
					description: 'px'
				}),
				oTextDimensions = this._helper.createText({
					textAlign: "Center",
					width: '2rem',
					text: 'x'
				}),
				oDimensionWidthInput = this._helper.createInput({
					fieldWidth: "6rem",
					width: '8rem',
					description: 'px'
				}),
				oDimensionsFlexBox = this._helper.createHBox({
					wrap: "Wrap",
					alignItems: "Center",
					justifyContent: "SpaceBetween",
					items: [oDimensionHeightInput,
							oTextDimensions,
							oDimensionWidthInput]
				}),
				oDimensionsLabel = this._helper.createLabel({
					text: this._oResourceBundle.getText("INSERT_CONTENT_DIMENSIONS")
				}),
				oRTE = this.getEditor(),
				oToolbar = this,
				aButtons = [];

				aButtons.push(this._helper.createButton({
					id: this._getId("InsertTableButton"),
					text: this._oResourceBundle.getText("DIALOG_OK_BUTTON"),
					press: function () {
						var tableElm = oRTE.getNativeApi().plugins.table
											.insertTable(oRowsInput.getValue(), oColsInput.getValue()),
							dom = oRTE.getNativeApi().dom;

						dom.setStyle(tableElm, 'width', oDimensionWidthInput.getValue() + "px");
						dom.setStyle(tableElm, 'height', oDimensionHeightInput.getValue() + "px");

						oToolbar.getAggregation("_customInsertTableDialog").close();
					}
				}));

				aButtons.push(this._helper.createButton({
					id: this._getId("CancelInsertTableButton"),
					text: this._oResourceBundle.getText("DIALOG_CANCEL_BUTTON"),
					press: function () {
						oToolbar.getAggregation("_customInsertTableDialog").close();
					}
				}));

				return {
					title: oTitleBundleText,
					buttons: aButtons,
					content: this._helper.createVBox({
						direction: "Column",
						alignItems: "Start",
						items: [oRowsLabel,
								oRowsInput,
								oColsLabel,
								oColsInput,
								oDimensionsLabel,
								oDimensionsFlexBox]
						})
				};
		};

		/**
		 * Helper function for creating a sap.m.OverflowToolbar
		 *
		 * @returns {object} this instance for method chaining
		 * @private
		 */
		ToolbarWrapper.prototype._createCustomToolbar = function () {
			var oEditorHelper = this._helper,
				aContent = [],
				oButtonGroups = library.ButtonGroups,
				aGroupNames = Object.keys(oButtonGroups),
				aGroups = [],
				aGroupObjects = this.getEditor() ? this.getEditor().getButtonGroups() : [];

			// get group object for each groups, which is part of the customToolbar
			aGroupNames.forEach(function(oName){
				aGroupObjects.forEach(function(oGroup){
					if (oGroup.name === oName) {
						aGroups.push(oGroup);
					}
				});
			});

			// sort groups according to customToolbarPriority
			aGroups = this._sortToolbarContent(aGroups);

			aGroups.forEach(function(oGroup){
				aContent = aContent.concat(this.addButtonGroup(oGroup.name));
			}.bind(this));

			return oEditorHelper.createOverflowToolbar(this._getId(), aContent);
		};

		/**
		 * Sets the enablement of the toolbar depending on the "editable" property of the Editor
		 *
		 * @param {boolean} [bEnabled] If true, the toolbar should be enabled
		 * @param {boolean} [bSuppressInvalidate] If true, the control will not be invalidated
		 * @public
		 */
		ToolbarWrapper.prototype.setToolbarEnabled = function (bEnabled, bSuppressInvalidate) {
			var oToolbar = this.getAggregation("_toolbar");

			if (oToolbar && oToolbar.getEnabled() !== bEnabled) {
				oToolbar.setEnabled(bEnabled, bSuppressInvalidate);
			}
		};

		/**
		 * Hides/Shows button group
		 *
		 * @param {string} [sGroupName] Group name
		 * @param {boolean} [bShow] Indicates if the group should be shown or hidden
		 * @public
		 */
		ToolbarWrapper.prototype.setShowGroup = function (sGroupName, bShow) {
			var aObjects = this._findGroupedControls(sGroupName),
				oToolbar = this.getAggregation("_toolbar");

			aObjects.forEach(function (oObject) {
				oObject.setVisible(bShow);
			});

			oToolbar && oToolbar.rerender();
		};

		/**
		 * Adds a Button Group to the Custom Toolbar
		 *
		 * @param {string} [sGroupName] Group name
		 * @returns {Array} An array containing the buttons in the group that should be added to the Custom Toolbar's content
		 * @public
		 */
		ToolbarWrapper.prototype.addButtonGroup = function (sGroupName) {
			var oRTE = this.getEditor(),
				oEditorHelper = this._helper,
				aContent = [],
				oButtonGroups = library.ButtonGroups,
				oCommands = library.EditorCommands,
				oAccessibilityKeys = library.Accessibility,
				bVisibleGroupClipboard,
				bVisibleGroupStructure,
				bVisibleGroupFont,
				bVisibleGroupFontStyle,
				bVisibleGroupUndo,
				bVisibleGroupTextAlign,
				bVisibleGroupFormatBlock,
				bVisibleGroupLink,
				bVisibleGroupInsert;


			switch (sGroupName) {
				case "font-style":
					bVisibleGroupFontStyle = oRTE ? oRTE.getShowGroupFontStyle() : false;

					oButtonGroups["font-style"].forEach(function (oCommand) {
						aContent.push(oEditorHelper.createOverflowToolbarToggleButton(this._createButtonConfig(oCommand)).setVisible(bVisibleGroupFontStyle));
					}, this);
					break;
				case "font":
					bVisibleGroupFont = oRTE ? oRTE.getShowGroupFont() : false;

					var oInvisibleTextFontFamily = oEditorHelper.createInvisibleText({
							text: this._oResourceBundle.getText(oAccessibilityKeys["FontFamily"])
						}).toStatic(),
						oInvisibleTextFontSize = oEditorHelper.createInvisibleText({
							text: this._oResourceBundle.getText(oAccessibilityKeys["FontSize"])
						}).toStatic();
					this._registerAssociatedInvisibleTexts("font", oInvisibleTextFontFamily.getId());
					this._registerAssociatedInvisibleTexts("font", oInvisibleTextFontSize.getId());

					aContent.push(
						oEditorHelper.createSelect({
							id: this._getId("FontFamily"),
							ariaLabelledBy: oInvisibleTextFontFamily,
							items: this._createFontStyleSelectItems(),
							change: function (oEvent) {
								var oItem;

								if (oRTE) {
									oItem = oEvent.getSource().getSelectedItem();
									oRTE.getNativeApi().execCommand('FontName', false, this._getFontStyleCommand(oItem.getText()));
								} else {
									jQuery.sap.log.warning("Cannot execute native command: " + 'FontName');
								}
							}.bind(this)
						}).setVisible(bVisibleGroupFont)
					);

					aContent.push(
						oEditorHelper.createSelect({
							id: this._getId("FontSize"),
							ariaLabelledBy: oInvisibleTextFontSize,
							items: this._createFontSizeSelectItems(),
							change: function (oEvent) {
								var oItem;

								if (oRTE) {
									oItem = oEvent.getSource().getSelectedItem();
									oRTE.getNativeApi().execCommand('FontSize', false, oItem.getText());
								} else {
									jQuery.sap.log.warning("Cannot execute native command: " + 'FontSize');
								}
							}
						}).setVisible(bVisibleGroupFont)
					);
					aContent.push(oEditorHelper.createSplitButton(this._createSplitButtonForDialog("TextColor")).setVisible(bVisibleGroupFont));
					aContent.push(oEditorHelper.createSplitButton(this._createSplitButtonForDialog("BackgroundColor")).setVisible(bVisibleGroupFont));
					break;
				case "text-align":
					bVisibleGroupTextAlign = oRTE ? oRTE.getShowGroupTextAlign() : false;
					var aMenuItems = this._createMenuButtonItems("TextAlign");
					aContent.push(
						oEditorHelper.createMenuButton(
							this._getId("TextAlign"),
							aMenuItems,
							function (oEvent) {
								var oSelectedItem, oEditor;

								if (oRTE) {
									oSelectedItem = oEvent.getParameter("item");
									oEditor = oRTE.getNativeApi();
									if (oSelectedItem.getIcon() === this.getParent().getIcon()) {
										// Text Align commands in TinyMCE have a toggle behavior when you set a
										// certain command twice the default command (text-align-left) will be applied
										oEditor.execCommand('JustifyLeft');
									} else {
										oEditor.execCommand('Justify' + oSelectedItem.getText());
									}
								} else {
									jQuery.sap.log.warning("Cannot execute native command: " + 'Justify');
								}
							},
							aMenuItems[0].getIcon(),
							this._oResourceBundle.getText(oCommands["TextAlign"].bundleKey)
						).setVisible(bVisibleGroupTextAlign)
					);
					break;
				case "formatselect":
					bVisibleGroupFormatBlock = oRTE ? (this._isButtonGroupAdded("styleselect") || this._isButtonGroupAdded("formatselect")) : false;

					if (bVisibleGroupFormatBlock) {
						var oInvisibleTextFormatBlock = oEditorHelper.createInvisibleText({
							text: this._oResourceBundle.getText(oAccessibilityKeys["FormatBlock"])
						}).toStatic();
						this._registerAssociatedInvisibleTexts("formatselect", oInvisibleTextFormatBlock.getId());
						aContent.push(
							oEditorHelper.createSelect({
								id: this._getId("FormatBlock"),
								ariaLabelledBy: oInvisibleTextFormatBlock,
								items: this._createFormatBlockItems(),
								change: function (oEvent) {
									var oSelectedItem;
									if (oRTE) {
										oSelectedItem = oEvent.getSource().getSelectedItem();
										if (oSelectedItem) {
											var currentFormatterCommand = oRTE.getAggregation("_toolbarWrapper")._getFormatBlockCommand(oSelectedItem.getText());
											oRTE.getNativeApi().execCommand('FormatBlock', false, currentFormatterCommand);
										}
									} else {
										jQuery.sap.log.warning("Cannot execute native command: " + 'FormatBlock');
									}
								}
							}).setVisible(bVisibleGroupFormatBlock)
						);
					}
					break;
				case "structure":
					bVisibleGroupStructure = oRTE ? oRTE.getShowGroupStructure() : false;
					oButtonGroups["structure"].forEach(function (oCommand) {
						aContent.push(oEditorHelper.createOverflowToolbarButton(this._createButtonConfig(oCommand)).setVisible(bVisibleGroupStructure));
					}, this);
					break;
				case "clipboard":
					bVisibleGroupClipboard = oRTE ? oRTE.getShowGroupClipboard() : false;
					oButtonGroups["clipboard"].forEach(function (oCommand) {
						aContent.push(oEditorHelper.createOverflowToolbarButton(this._createButtonConfig(oCommand)).setVisible(bVisibleGroupClipboard));
					}, this);
					break;
				case "undo":
					bVisibleGroupUndo = oRTE ? oRTE.getShowGroupUndo() : false;
					oButtonGroups["undo"].forEach(function (oCommand) {
						aContent.push(oEditorHelper.createOverflowToolbarButton(this._createButtonConfig(oCommand)).setVisible(bVisibleGroupUndo));
					}, this);
					break;
				case "insert":
					bVisibleGroupInsert = oRTE ? oRTE.getShowGroupInsert() : false;
					aContent.push(oEditorHelper.createOverflowToolbarToggleButton(this._createButtonForDialog("InsertImage")).setVisible(bVisibleGroupInsert));
					break;
				case "link":
					bVisibleGroupLink = oRTE ? oRTE.getShowGroupLink() : false;
					aContent.push(oEditorHelper.createOverflowToolbarToggleButton(this._createButtonForDialog("InsertLink")).setVisible(bVisibleGroupLink));
					aContent.push(oEditorHelper.createOverflowToolbarButton(this._createButtonConfig("Unlink")).setVisible(bVisibleGroupLink));
					break;
				case "table":
					aContent.push(oEditorHelper.createOverflowToolbarButton(this._createButtonForDialog("InsertTable")));
					break;
			}

			return aContent;
		};

		/**
		 * Adds a Button Group to an existing Toolbar
		 *
		 * @param {map} [mGroup] Group object
		 * @param {boolean} [bFullGroup] If false, the group is generated from a group name
		 * @returns {object} this for method chaining
		 * @public
		 */
		ToolbarWrapper.prototype.addButtonGroupToContent = function (mGroup, bFullGroup) {
			var sGroupName;
			// if the group is generated add it to the button groups object
			// as a custom group (if it contains supported group buttons - ex."table")
			if (!bFullGroup && mGroup.buttons[0] === "table") {
				sGroupName = mGroup.buttons[0];
				sap.ui.richtexteditor.ButtonGroups.custom[mGroup.name] = {
					name: mGroup.buttons[0],
					controls: ["InsertTable"]
				};
			}

			// if the group is supported (ex. "table") add it to the button groups object
			if (bFullGroup && mGroup.name === "table") {
				sGroupName = mGroup.name;
				sap.ui.richtexteditor.ButtonGroups[mGroup.name] = ["InsertTable"];
			}

			// if the group is supported (ex. "formatselect") add it to the button groups object
			if (bFullGroup && (mGroup.name === "formatselect" || mGroup.name === "styleselect")) {
				sGroupName = "formatselect";
				sap.ui.richtexteditor.ButtonGroups[mGroup.name] = ["FormatBlock"];
			}

			// if not supported return and do not add content
			if (!sap.ui.richtexteditor.ButtonGroups[mGroup.name] && !sap.ui.richtexteditor.ButtonGroups.custom[mGroup.name]) {
				return this;
			}

			// if the group is supported and there is still not sGroupName
			// we should take the name of the group that was passed
			if (!sGroupName) {
				sGroupName = mGroup.name;
			}

			var oToolbar = this.getAggregation("_toolbar"),
				aContent = this.addButtonGroup(sGroupName),
				iContentSize = aContent.length,
				i, iStartIndex;

			// find starting index of the grouped content by priority
			iStartIndex = this._findGroupPriorityPosition(mGroup);

			// reverse the buttons' array to keep their order on insertion
			aContent.reverse();
			for (i = 0; i < iContentSize; i++) {
				oToolbar.insertContent(aContent[i], iStartIndex);
			}

			return this;
		};

		ToolbarWrapper.prototype._sortToolbarContent = function (aGroups) {
			aGroups.sort(function (oGroup1, oGroup2) {
					return oGroup1.customToolbarPriority - oGroup2.customToolbarPriority;
				});

			return aGroups;
		};

		/**
		 * Helper function for finding the correct position of a group according to its customToolbarPriority
		 *
		 * @param {Array} [mGroup] Group Object
		 * @returns {Number} The index where the first element of the group should be added
		 * @private
		 */
		ToolbarWrapper.prototype._findGroupPriorityPosition = function (mGroup) {
			var aGroups = this.getEditor().getButtonGroups(),
				aCustomToolbarGroups = library.ButtonGroups,
				iStartIndex = 0;

			// place groups without predefined customToolbarPriority at the end
			if (!jQuery.isNumeric(mGroup.customToolbarPriority)) {
				mGroup.customToolbarPriority = this._getLastGroupPriority(aGroups) + 10;
			}

			// sort groups according to customToolbarPriority
			aGroups = this._sortToolbarContent(aGroups);

			aGroups.forEach(function (oGroup) {
					if (oGroup.customToolbarPriority < mGroup.customToolbarPriority && oGroup.name !== mGroup.name) {
						// if the group exist for the customToolbar, add its button count to the startIndex
						iStartIndex += aCustomToolbarGroups[oGroup.name] ? aCustomToolbarGroups[oGroup.name].length : 0;
					}
				});

			return iStartIndex;
		};

		/**
		 * Helper function for finding the priority of the last group in the toolbar
		 *
		 * @param {Array} [oGroups] Group name
		 * @returns {Number} The priority of the last group in the toolbar
		 * @private
		 */
		ToolbarWrapper.prototype._getLastGroupPriority = function (aGroups) {
			var aPriorities = aGroups.map(function(oGroup){
					return oGroup.customToolbarPriority || 0;
				});

			return Math.max.apply(null, aPriorities);
		};

		/**
		 * Removes a button group from the Custom Toolbar
		 *
		 * @param {string} [sGroupName] Group name
		 * @public
		 */
		ToolbarWrapper.prototype.removeButtonGroup = function (sGroupName) {
			var aObjects = this._findGroupedControls(sGroupName);

			// destroys associated InvisibleTexts for the group
			this._destroyAssociatedInvisibleTexts(sGroupName);

			aObjects.forEach(function (oObject) {
				oObject.destroy();
			});
		};

		/**
		 * Helper function for destroying default accessibility InvisibleTexts per group
		 *
		 * @param {string} [sGroupName] Group name
		 * @private
		 */
		ToolbarWrapper.prototype._destroyAssociatedInvisibleTexts = function (sGroupName) {
			var aIds = this._oAccessibilityTexts[sGroupName] || [];

			aIds.forEach(function(sId){
				sap.ui.getCore().byId(sId).destroy();
			});

			this._oAccessibilityTexts[sGroupName] = [];
		};

		/**
		 * Helper function for storing accessibility InvisibleTexts' ids per group
		 *
		 * @param {string} [sGroupName] Group name
		 * @param {string} [sInvisibleTextId] Control id
		 * @private
		 */
		ToolbarWrapper.prototype._registerAssociatedInvisibleTexts = function (sGroupName, sInvisibleTextId) {
			if (!this._oAccessibilityTexts[sGroupName]){
				this._oAccessibilityTexts[sGroupName] = [];
			}

			this._oAccessibilityTexts[sGroupName].push(sInvisibleTextId);
		};

		/**
		 * Sets the button groups to the Custom Toolbar.
		 *
		 * @param {array} [aNewGroups] Array of names or objects containing the new groups information
		 * @returns {object} Control instance (for method chaining)
		 * @public
		 */
		ToolbarWrapper.prototype.setButtonGroups = function (aNewGroups) {
			var oToolbar =  this.getAggregation("_toolbar"),
				aGroups = this._getGroupsForUpdate(aNewGroups);

			if (!oToolbar) {
				return this;
			}

			aGroups.aRemovedGroups.forEach(function(oGroup){
				this.removeButtonGroup(oGroup.name);
			}.bind(this));

			// sort the groups according to their customToolbarPriority
			// before adding them to the toolbar
			aGroups.aAddedGroups = this._sortToolbarContent(aGroups.aAddedGroups);
			aGroups.aAddedGroups.forEach(function(oGroup){
				this.addButtonGroupToContent(oGroup, true);
			}.bind(this));

			return this;
		};

		/**
		 * Helper function for mapping an array of groups to stringified objects
		 *
		 * @param {Array} [aGroups] Array of groups
		 * @returns {Array} An array
		 * @private
		 */
		ToolbarWrapper.prototype._getJSONStringForGroups = function (aGroups) {
			var aStringifiedObjects = [];

			aGroups.forEach(function(oObject){
				// assure that the relevant objects properties are stringified in correct order
				// by passing an array of properties as second argument for JSON.stringify
				aStringifiedObjects.push(JSON.stringify(oObject, ["name", "visible", "customToolbarPriority", "buttons"]));
			});

			return aStringifiedObjects;
		};

		/**
		 * Helper function for added and removed groups
		 *
		 * @param {Array} [aNewGroups] Array of the new groups
		 * @returns {Object} An object containing removed groups array and added groups array
		 * @private
		 */
		ToolbarWrapper.prototype._getGroupsForUpdate = function (aNewGroups){
			var aNewStringifiedGroups = this._getJSONStringForGroups(aNewGroups),
				aOldStringifiedGroups = this._getJSONStringForGroups(this._initialButtonGroupsState),
				oGroupsForUpdate = {
					aRemovedGroups: [],
					aAddedGroups: []
				};

			aNewStringifiedGroups.forEach(function(oGroup, iIndex){
				if (aOldStringifiedGroups.indexOf(oGroup) === -1) {
					// get the group object by index
					oGroupsForUpdate.aAddedGroups.push(aNewGroups[iIndex]);
				}
			});

			aOldStringifiedGroups.forEach(function(oGroup, iIndex){
				if (aNewStringifiedGroups.indexOf(oGroup) === -1) {
					// get the group object by index
					oGroupsForUpdate.aRemovedGroups.push(this._initialButtonGroupsState[iIndex]);
				}
			}.bind(this));

			return oGroupsForUpdate;
		};

		/**
		 * Helper function for finding controls from a group
		 *
		 * @param {string} [sGroupName] Group name
		 * @returns {Array} An array containing the controls in the specified group or an empty one
		 * @private
		 */
		ToolbarWrapper.prototype._findGroupedControls = function (sGroupName) {
			var oButtonGroups = library.ButtonGroups,
				oToolbar = this.getAggregation("_toolbar"),
				aControls = [];

			if (!oToolbar) {
				return [];
			}

			if (oButtonGroups[sGroupName]) {
				aControls = oButtonGroups[sGroupName];
			} else if (oButtonGroups.custom[sGroupName]) {
				aControls = oButtonGroups.custom[sGroupName].controls;
			}

			var aIds = aControls.map(function (sName) {
				return this._getId(sName);
			}, this);

			return oToolbar.findAggregatedObjects(false, function (oAggregatedObject) {
				return aIds.indexOf(oAggregatedObject.getId()) > -1;
			}) || [];
		};

		/**
		 * Extend Toolbar's content.
		 *
		 * Allows users to add/insert/find/remove/destroy custom buttons from the Toolbar
		 * without modifying the existing content.
		 * All custom buttons are appended to the end of the Toolbar.
		 * Every action is applied *only* on the custom buttons.
		 * For example "insert" with values (new sap.m.Button(), 1) would insert that Object as a second custom button.
		 * but not as a second in the whole Toolbar.
		 *
		 * @param {string} [sModifier] Action. This is the same as aggregations' prefixes e.g. *add*Aggregation, *destroy*Aggregation, etc.
		 * @returns {*} The result of the applied action
		 * @public
		 */
		ToolbarWrapper.prototype.modifyToolbarContent = function (sModifier) {
			var vResult,
				args = Array.prototype.slice.call(arguments);

			args.shift();

			switch (sModifier) {
				case "add":
					vResult = this._proxyToolbarAdd.apply(this, args);
					break;

				case "destroy":
					vResult = this._proxyToolbarDestroy.apply(this, args);
					break;

				case "get":
					vResult = this._proxyToolbarGet.apply(this, args);
					break;

				case "indexOf":
					vResult = this._proxyToolbarIndexOf.apply(this, args);
					break;

				case "insert":
					vResult = this._proxyToolbarInsert.apply(this, args);
					break;

				case "removeAll":
					vResult = this._proxyToolbarRemoveAll.apply(this, args);
					break;

				case "remove":
					vResult = this._proxyToolbarRemove.apply(this, args);
					break;
			}

			return vResult;
		};

		ToolbarWrapper.prototype._isButtonGroupAdded = function (sGroupName) {
			var aGroups = this.getEditor().getButtonGroups(),
				bResult = false,
				i;

			for (i = 0; i < aGroups.length; i++) {
				if (aGroups[i].name === sGroupName) {
					bResult = true;
					break;
				}
			}
			return bResult;
		};

		ToolbarWrapper.prototype._updateCustomToolbarRefIds = function (sId, iInsertionIndex) {
			var aCustomButtonGroup, iItemGroupIndex;

			aCustomButtonGroup = this._customButtons || [];
			iItemGroupIndex = aCustomButtonGroup.indexOf(sId);
			if (iItemGroupIndex > -1) {
				aCustomButtonGroup.splice(iItemGroupIndex, 1);
			}

			if (iInsertionIndex !== -1) {
				iInsertionIndex = iInsertionIndex >= 0 && iInsertionIndex <= aCustomButtonGroup.length ?
					iInsertionIndex : aCustomButtonGroup.length;

				aCustomButtonGroup.splice(iInsertionIndex, 0, sId);
			}

			this._customButtons = aCustomButtonGroup;
		};

		ToolbarWrapper.prototype._proxyToolbarAdd = function (oItem) {
			var oToolbar = this.getAggregation("_toolbar"),
				vResult = oToolbar.addContent(oItem);

			oToolbar.rerender();

			if (vResult) {
				this._updateCustomToolbarRefIds(oItem.getId());
			}

			return vResult;
		};

		ToolbarWrapper.prototype._proxyToolbarGet = function () {
			var oToolbar = this.getAggregation("_toolbar"),
				aCustomButtonGroup = this._customButtons || [];

			return oToolbar.findAggregatedObjects(false, function (oAggregatedObject) {
					return aCustomButtonGroup.indexOf(oAggregatedObject.getId()) > -1;
				}) || [];
		};

		ToolbarWrapper.prototype._proxyToolbarDestroy = function () {
			var aItems = this._proxyToolbarGet();

			aItems.forEach(function (oItem) {
				oItem.destroy();
			});

			this._customButtons = [];
		};

		ToolbarWrapper.prototype._proxyToolbarIndexOf = function (vId) {
			var aCustomButtons = this._customButtons || [],
				sId = typeof vId === "object" ? vId.getId() : vId;

			return aCustomButtons.indexOf(sId);
		};

		ToolbarWrapper.prototype._proxyToolbarInsert = function (oItem, iIndex) {
			var vResult,
				oToolbar = this.getAggregation("_toolbar"),
				aToolbarContent = oToolbar.getContent() || [],
				aCustomButtons = this._customButtons || [],
				iCalculatedIndex = aToolbarContent.length - aCustomButtons.length; // Start the index right after the last not custom item.

			// Align with ManagedObject@insertAggregation
			if (iIndex < 0) { // Out of bounds
				iIndex = 0;
			} else if (iIndex > aCustomButtons.length) { // Out of bounds
				iIndex = aCustomButtons.length;
			} else if (!iIndex && iIndex !== 0) { // iIndex is not defined
				iIndex = aCustomButtons.length;
			}

			iCalculatedIndex += iIndex;

			vResult = oToolbar.insertContent(oItem, iCalculatedIndex);
			oToolbar.rerender();

			if (vResult) {
				this._updateCustomToolbarRefIds(oItem.getId(), iIndex);
			}

			return vResult;
		};

		ToolbarWrapper.prototype._proxyToolbarRemoveAll = function () {
			var aItems = this._proxyToolbarGet();

			aItems.forEach(this._proxyToolbarRemove, this);

			return aItems;
		};

		ToolbarWrapper.prototype._proxyToolbarRemove = function (vItem) {
			var sId, vResult,
				oToolbar = this.getAggregation("_toolbar");

			switch (typeof vItem) {
				case "string":
					sId = vItem;
					break;
				case "object":
					sId = vItem.getId();
					break;
				case "number":
					sId = this._customButtons[vItem];
					break;
			}

			vResult = oToolbar.removeContent(sId);

			if (vResult && sId) {
				this._updateCustomToolbarRefIds(sId, -1);
			}

			return vResult;
		};

		return ToolbarWrapper;
	}, /* bExport= */ true);
