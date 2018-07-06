/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2018 SAP SE. All rights reserved
 */

/**
 * Initialization Code and shared classes of library sap.ui.richtexteditor.
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Core', 'sap/ui/core/library'],
	function (jQuery, Core, library1) {
		"use strict";

		/**
		 * A rich text editor (RTE) control. Requires installation of an additional rich text editor library.
		 *
		 * @namespace
		 * @name sap.ui.richtexteditor
		 * @public
		 */


		// library dependencies

		// delegate further initialization of this library to the Core
		sap.ui.getCore().initLibrary({
			name : "sap.ui.richtexteditor",
			dependencies : ["sap.ui.core"],
			types: [
				"sap.ui.richtexteditor.EditorType"
			],
			interfaces: [
				"sap.ui.richtexteditor.IToolbar"
			],
			controls: [
				"sap.ui.richtexteditor.RichTextEditor",
				"sap.ui.richtexteditor.ToolbarWrapper"
			],
			elements: [],
			version: "1.54.6"
		});

		/**
		 *
		 * Interface for controls which are suitable as a Toolbar for RichTextEditor.
		 *
		 * @since 1.50
		 * @name sap.ui.richtexteditor.IToolbar
		 * @interface
		 * @public
		 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
		 */

		/**
		 * Determines which editor component should be used for editing the text.
		 *
		 * @enum {string}
		 * @public
		 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
		 */
		sap.ui.richtexteditor.EditorType = {

			/**
			 * Uses TinyMCE version 3 as editor (default)
			 * @public
			 */
			TinyMCE: "TinyMCE",

			/**
			 * Uses TinyMCE version 4 as editor
			 * @public
			 */
			TinyMCE4: "TinyMCE4"

		};

		/**
		 * Provides command for CustomToolbar in RichTextEditor control. Only
		 * relevant for TinyMCE4
		 *
		 * @enum {string}
		 * @private
		 */
		sap.ui.richtexteditor.EditorCommands = {
			Bold: {
				icon: "bold-text",
				command: "Bold",
				style: "bold",
				bundleKey: "BOLD_BUTTON_TOOLTIP"
			},
			Italic: {
				icon: "italic-text",
				command: "Italic",
				style: "italic",
				bundleKey: "ITALIC_BUTTON_TOOLTIP"
			},
			Underline: {
				icon: "underline-text",
				command: "Underline",
				style: "underline",
				bundleKey: "UNDERLINE_BUTTON_TOOLTIP"
			},
			Strikethrough: {
				icon: "strikethrough",
				command: "Strikethrough",
				style: "strikethrough",
				bundleKey: "STRIKETHROUGH_BUTTON_TOOLTIP"
			},
			Copy: {
				icon: "copy",
				command: "Copy",
				bundleKey: "COPY_BUTTON_TOOLTIP"
			},
			Cut: {
				icon: "scissors",
				command: "Cut",
				bundleKey: "CUT_BUTTON_TOOLTIP"
			},
			Paste: {
				icon: "paste",
				command: "Paste",
				bundleKey: "PASTE_BUTTON_TOOLTIP"
			},
			UnorderedList: {
				icon: "list",
				command: "InsertUnorderedList",
				bundleKey: "UNORDERED_LIST_BUTTON_TOOLTIP"
			},
			OrderedList: {
				icon: "numbered-text",
				command: "InsertOrderedList",
				bundleKey: "ORDERED_LIST_BUTTON_TOOLTIP"
			},
			Outdent: {
				icon: "outdent",
				command: "Outdent",
				bundleKey: "OUTDENT_BUTTON_TOOLTIP"
			},
			Indent: {
				icon: "indent",
				command: "Indent",
				bundleKey: "INDENT_BUTTON_TOOLTIP"
			},
			Undo: {
				icon: "undo",
				command: "Undo",
				bundleKey: "UNDO_BUTTON_TOOLTIP"
			},
			Redo: {
				icon: "redo",
				command: "Redo",
				bundleKey: "REDO_BUTTON_TOOLTIP"
			},
			TextAlign: {
				Left: {
					text: "Left",
					icon: "text-align-left",
					style: "alignleft",
					bundleKey: "TEXTALIGH_LEFT"
				},
				Center: {
					text: "Center",
					icon: "text-align-center",
					style: "aligncenter",
					bundleKey: "TEXTALIGH_CENTER"
				},
				Right: {
					text: "Right",
					icon: "text-align-right",
					style: "alignright",
					bundleKey: "TEXTALIGH_RIGHT"
				},
				Full: {
					text: "Full",
					icon: "text-align-justified",
					style: "alignjustify",
					bundleKey: "TEXTALIGH_FULL"
				},
				bundleKey: "TEXTALIGN_BUTTON_TOOLTIP"
			},
			FontFamily: {
				AndaleMono: {
					text: "Andale Mono",
					commandValue: '"andale mono",monospace'
				},
				Arial: {
					text: "Arial",
					commandValue: "arial, helvetica, sans-serif"
				},
				ArialBlack: {
					text: "Arial Black",
					commandValue: '"arial black", sans-serif'
				},
				BookAntiqua: {
					text: "Book Antiqua",
					commandValue: '"book antiqua", palatino, serif'
				},
				ComicSansMS: {
					text: "Comic Sans MS",
					commandValue: '"comic sans ms", sans-serif'
				},
				CourierNew: {
					text: "Courier New",
					commandValue: '"courier new", couriret, monospace'
				},
				Georgia: {
					text: "Georgia",
					commandValue: "georgia, palatino, serif"
				},
				Helvetica: {
					text: "Helvetica",
					commandValue: 'helvetica, arial, sans-serif'
				},
				Impact: {
					text: "Impact",
					commandValue: "impact, sans-serif"
				},
				Symbol: {
					text: "Symbol",
					commandValue: '"symbol"'
				},
				Tahoma: {
					text: "Tahoma",
					commandValue: "tahoma, arial, helvetica, sans-serif"
				},
				Terminal: {
					text: "Terminal",
					commandValue: "terminal, monaco, monospace"
				},
				TimesNewRoman: {
					text: "Times New Roman",
					commandValue: '"times new roman", times, sans-serif'
				},
				TrebuchetMS: {
					text: "Trebuchet MS",
					commandValue: '"trebuchet ms", geneva, sans-serif'
				},
				Verdana: {
					text: "Verdana",
					commandValue: "verdana, geneva, sans-serif"
				},
				Webdings: {
					text: "Webdings",
					commandValue: '"webdings"'
				},
				Wingings: {
					text: "Wingings",
					commandValue: 'wingings, "zapf dingbats"'
				}
			},
			FontSize: [8, 10, 12, 14, 18, 24, 36],
			TextColor: {
				icon: "text-color",
				command: "ForeColor",
				style: "color",
				defaultValue: "#000000",
				bundleKey: "TEXT_COLOR_BUTTON_TOOLTIP"
			},
			BackgroundColor: {
				icon: "color-fill",
				command: "HiliteColor",
				style: "background-color",
				defaultValue: "#ffffff",
				bundleKey: "BACKGROUND_COLOR_BUTTON_TOOLTIP"
			},
			InsertImage: {
				icon: "picture",
				bundleKey: "IMAGE_BUTTON_TOOLTIP"
			},
			InsertLink: {
				icon: "chain-link",
				bundleKey: "LINK_BUTTON_TOOLTIP"
			},
			Unlink: {
				icon: "broken-link",
				command: "unlink",
				bundleKey: "UNLINK_BUTTON_TOOLTIP"
			},
			InsertTable: {
				icon: "table-view",
				bundleKey: "TABLE_BUTTON_TOOLTIP"
			},
			FormatBlock: {
				Paragraph: {
					text: "Paragraph",
					commandValue: "p",
					bundleKey: "PARAGRAPH_BUTTON_TEXT"
				},
				Heading1: {
					text: "Heading 1",
					commandValue: "h1",
					bundleKey: "HEADING1_BUTTON_TEXT"
				},
				Heading2: {
					text: "Heading 2",
					commandValue: "h2",
					bundleKey: "HEADING2_BUTTON_TEXT"
				},
				Heading3: {
					text: "Heading 3",
					commandValue: "h3",
					bundleKey: "HEADING3_BUTTON_TEXT"
				},
				Heading4: {
					text: "Heading 4",
					commandValue: "h4",
					bundleKey: "HEADING4_BUTTON_TEXT"
				},
				Heading5: {
					text: "Heading 5",
					commandValue: "h5",
					bundleKey: "HEADING5_BUTTON_TEXT"
				},
				Heading6: {
					text: "Heading 6",
					commandValue: "h6",
					bundleKey: "HEADING6_BUTTON_TEXT"
				}
			}
		};

		sap.ui.richtexteditor.Accessibility = {
			FontFamily: "FONT_FAMILY_TEXT",
			FontSize: "FONT_SIZE_TEXT",
			FormatBlock: "FORMAT_BUTTON_TOOLTIP"
		};
		/**
		 * Provides ButtonGroups for CustomToolbar in RichTextEditor control. Only
		 * relevant for TinyMCE4
		 *
		 * @enum {string}
		 * @private
		 */
		sap.ui.richtexteditor.ButtonGroups = {
			"font-style": ["Bold", "Italic", "Underline", "Strikethrough"],
			"text-align": ["TextAlign"],
			"formatselect": ["FormatBlock"],
			"font": ["FontFamily", "FontSize", "TextColor", "BackgroundColor"],
			"structure": ["UnorderedList", "OrderedList", "Outdent", "Indent"],
			"link": ["InsertLink", "Unlink"],
			"insert": ["InsertImage"],
			"undo": ["Undo", "Redo"],
			"clipboard": ["Cut", "Copy", "Paste"],
			"custom" : []
		};

		var setSapMDependencies = function () {
			sap.ui.require(["sap/m/MenuItem", "sap/m/Button", "sap/m/OverflowToolbarButton",
							"sap/m/OverflowToolbarToggleButton",
							"sap/m/SplitButton", "sap/m/MenuButton",
							"sap/m/Menu", "sap/m/Select",
							"sap/m/ToolbarSeparator", "sap/m/OverflowToolbar",
							"sap/m/OverflowToolbarLayoutData", "sap/m/Dialog",
							"sap/m/Label", "sap/m/CheckBox", "sap/m/Input",
							"sap/m/HBox", "sap/m/VBox",
							"sap/m/Text", "sap/m/StepInput", "sap/ui/core/InvisibleText",
							"sap/m/ColorPalettePopover"],
				function (oMenuItem, oButton, oOverflowToolbarButton,
							oOverflowToolbarToggleButton, oSplitButton, oMenuButton, oMenu,
							oSelect, oToolbarSeparator, oOverflowToolbar,
							oOverflowToolbarLayoutData, oDialog, oLabel,
							oCheckBox, oInput, oHBox, oVBox,
							oText, oStepInput, oInvisibleText, oColorPalettePopover) {

					sap.ui.richtexteditor.RichTextEditorHelper.bSapMLoaded = true;
					_oCustomToolbarControls.Button = oButton;
					_oCustomToolbarControls.OverflowToolbarButton = oOverflowToolbarButton;
					_oCustomToolbarControls.OverflowToolbarToggleButton = oOverflowToolbarToggleButton;
					_oCustomToolbarControls.SplitButton = oSplitButton;
					_oCustomToolbarControls.MenuButton = oMenuButton;
					_oCustomToolbarControls.Menu = oMenu;
					_oCustomToolbarControls.Select = oSelect;
					_oCustomToolbarControls.ToolbarSeparator = oToolbarSeparator;
					_oCustomToolbarControls.OverflowToolbar = oOverflowToolbar;
					_oCustomToolbarControls.OverflowToolbarLayoutData = oOverflowToolbarLayoutData;
					_oCustomToolbarControls.MenuItem = oMenuItem;
					_oCustomToolbarControls.Dialog = oDialog;
					_oCustomToolbarControls.Label = oLabel;
					_oCustomToolbarControls.CheckBox = oCheckBox;
					_oCustomToolbarControls.Input = oInput;
					_oCustomToolbarControls.HBox = oHBox;
					_oCustomToolbarControls.VBox = oHBox;
					_oCustomToolbarControls.Text = oText;
					_oCustomToolbarControls.StepInput = oStepInput;
					_oCustomToolbarControls.InvisibleText = oInvisibleText;
					_oCustomToolbarControls.ColorPalettePopover = oColorPalettePopover;
				});
		};

		var _oCustomToolbarControls = {};
		var _fProxy = function (sControlName, oSettings) {
			if (_oCustomToolbarControls[sControlName]) {
				return new _oCustomToolbarControls[sControlName](oSettings);
			}
		};

		// Define the helper
		jQuery.sap.setObject("sap.ui.richtexteditor.RichTextEditorHelper", {
			bSapMLoaded: false,
			createOverflowToolbar: function (sId, oContent) {
				return _fProxy("OverflowToolbar", {id: sId, content: oContent});
			}, /* must return an OverflowToolbar control */
			createInvisibleText: function (mConfig) {
				return _fProxy("InvisibleText", mConfig);
			}, /* must return an InvisibleText control */
			createButton: function (mConfig) {
				mConfig.type = sap.m.ButtonType.Transparent;
				return _fProxy("Button", mConfig);
			}, /* must return a Button control */
			createOverflowToolbarButton: function (mConfig) {
				mConfig.type = sap.m.ButtonType.Transparent;
				return _fProxy("OverflowToolbarButton", mConfig);
			}, /* must return a OverflowToolbarButton control */
			createSplitButton: function (mConfig) {
				mConfig.type = sap.m.ButtonType.Default;
				return _fProxy("SplitButton", mConfig);
			}, /* must return a SplitButton control */
			createOverflowToolbarToggleButton: function (mConfig) {
				mConfig.type = sap.m.ButtonType.Transparent;
				return _fProxy("OverflowToolbarToggleButton", mConfig);
			}, /* must return a OverflowToolbarToggleButton control */
			createMenuButton: function (sId, oItems, fItemSelected, sIcon, sTooltip) {
				return _fProxy("MenuButton", {
					layoutData: _fProxy("OverflowToolbarLayoutData", {
						priority: sap.m.OverflowToolbarPriority.NeverOverflow
					}),
					type: sap.m.ButtonType.Transparent,
					id: sId,
					menu: _fProxy("Menu", {
						itemSelected: fItemSelected,
						items: oItems
					}),
					icon: sIcon,
					tooltip: sTooltip
				});
			}, /* must return a MenuButton control */
			createMenuItem: function (sId, sText, sIcon) {
				return _fProxy("MenuItem", {
					id: sId,
					icon: sIcon,
					text: sText
				});
			}, /* must return a MenuItem control */
			createToggleButton: function (mConfig) {
				mConfig.layoutData = _fProxy("OverflowToolbarLayoutData", {
					priority: sap.m.OverflowToolbarPriority.NeverOverflow
				});
				mConfig.type = sap.m.ButtonType.Transparent;
				return _fProxy("ToggleButton", mConfig);
			}, /* must return a ToggleButton control */
			createToolbarSeparator: function () {
				return _fProxy("ToolbarSeparator");
			}, /* must return a ToolbarSeparator control */
			createSelect: function (mConfig) {
				return _fProxy("Select", mConfig);
			}, /* must return a Select control */
			createInput: function (mConfig) {
				return _fProxy("Input", mConfig);
			}, /* must return an Input control */
			createLabel: function (mConfig) {
				return _fProxy("Label", mConfig);
			}, /* must return a Label control */
			createCheckBox: function(mConfig) {
				return _fProxy("CheckBox", mConfig);
			},
			createDialog: function(mConfig) {
				// ensure that the dialogs have padding
				return _fProxy("Dialog", mConfig).addStyleClass("sapUiPopupWithPadding");
			} /* must return a Dialog control */,
			createText: function(mConfig) {
				return _fProxy("Text", mConfig);
			} /* must return a Text control */,
			createHBox: function(mConfig) {
				return _fProxy("HBox", mConfig);
			} /* must return a HBox control */,
			createVBox: function(mConfig) {
				return _fProxy("VBox", mConfig);
			} /* must return a HBox control */,
			createStepInput: function(mConfig) {
				return _fProxy("StepInput", mConfig);
			} /* must return a StepInput control */,
			createColorPalettePopover: function(mConfig) {
				return _fProxy("ColorPalettePopover", mConfig);
			} /* must return a ColorPalettePopover control */
		});

		// Check for sap.m library and set the RichTextEditorHelper
		if (sap.ui.getCore().getLoadedLibraries()["sap.m"]) {
			setSapMDependencies();
		} else {
			var libraryChangedListener = function (oEvent) {
				var oEventParams = oEvent.getParameters();

				if (oEventParams.stereotype === "library" && oEventParams.name === "sap.m") {
					jQuery.sap.delayedCall(0, null, setSapMDependencies);
					jQuery.sap.delayedCall(0, sap.ui.getCore(), 'detachLibraryChanged', [libraryChangedListener]);
				}
			};

			sap.ui.getCore().attachLibraryChanged(libraryChangedListener);
		}

		return sap.ui.richtexteditor;

	}, /* bExport= */ false);
