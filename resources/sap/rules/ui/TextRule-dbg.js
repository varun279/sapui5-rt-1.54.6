/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */

// Provides this._validatecontrol sap.rules.ui.
sap.ui.define(["jquery.sap.global",
	"./library",
	"sap/m/Label",
	"sap/rules/ui/RuleBase",
	"sap/m/Panel",
	"sap/ui/core/Title",
	"sap/ui/layout/form/Form",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Text",
	"sap/m/Button",
	"sap/ui/layout/Grid",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/rules/ui/ExpressionAdvanced",
	"sap/m/Link",
	"sap/m/FlexBox",
	"sap/m/Dialog",
	"sap/rules/ui/TextRuleSettings",
	"sap/rules/ui/ast/lib/AstYamlConverter"
], function(jQuery, library, Label, RuleBase, Panel, Title, Form, Toolbar, ToolbarSpacer, Text, Button, Grid, FormContainer, FormElement,
	ExpressionAdvanced, Link, FlexBox, Dialog, TextRuleSettings, AstYamlConverter) {
	"use strict";

	/**
	 * Constructor for a new TextRule Control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Some class description goes here.
	 * @extends  Control
	 *
	 * @author SAP SE
	 * @version 1.54.8
	 *
	 * @constructor
	 * @private
	 * @alias sap.rules.ui.TextRule
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) design time meta model
	 */

	var TextRule = RuleBase.extend("sap.rules.ui.TextRule", {
		metadata: {
			properties: {
				enableSettings: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},
				enableElse: {
					type: "boolean",
					defaultValue: true
				},
				enableElseIf: {
					type: "boolean",
					defaultValue: true
				}
			},
			aggregations: {
				"_toolbar": {
					type: "sap.m.Toolbar",
					multiple: false,
					singularName: "_toolbar"
				},
				"_verticalLayout": {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "visible",
					singularName: "_verticalLayout"
				}
			}
		},

		/*
		 *  Create Odata call for TextRuleBranch or TextRuleDefaultBranch based on type of condition
		 */
		_addConditionBlock: function(oEvent, sType) {
			var that = this;
			var oDataModel = this._getModel();
			var oSource = oEvent.getSource();
			var oPanel = oSource.getParent();
			if (sType === this.typeElseIf && !(oPanel instanceof Panel)) {
				oPanel = oSource.getParent().getParent(); //When Add button is selected it's parent is Toolbar
			}
			var oVerticalLayout = oPanel.getParent();
			var nIndex = oVerticalLayout.indexOfContent(oPanel);
			var sRuleId = this._internalModel.getProperty("/ruleId");
			var sRuleVersion = this._internalModel.getProperty("/ruleVersion");
			var nCurrentSequence = nIndex + 1;
			var bFirst = false;
			var nNewSequence;
			var sKeytext;
			var oTextRuleConditon = {
				RuleId: sRuleId,
				RuleVersion: sRuleVersion
			};
			if (sType === that.typeElse) {
				sKeytext = "/TextRuleDefaultBranches";
				bFirst = true;
			} else {
				sKeytext = "/TextRuleBranches";
				if (oSource.getParent() instanceof Panel) {
					nNewSequence = nCurrentSequence;
					bFirst = true;
				} else {
					nNewSequence = nCurrentSequence + 1;
				}
				oTextRuleConditon.Sequence = nNewSequence;
			}
			this._updateBusyState(true);
			var mParameters = {};
			mParameters.properties = oTextRuleConditon;
			mParameters.success = function(newCondition) {
				var data = {};
				data.verticalLayout = oVerticalLayout;
				data.nIndex = nIndex;
				data.bfirst = bFirst;
				that._addConditionSuccess(newCondition, that, data);
				if (bFirst) {
					oSource.destroy();
				}
			};
			mParameters.error = function() {
				jQuery.sap.log.info("Error creating " + sKeytext + "entity");
			};
			oDataModel.createEntry(sKeytext, mParameters);
		},

		/*
		 *  Reads the index of panel to determine the new condition panel position.
		 *  For Else, Add Else panel is removed and Else Condition is added in its place
		 *  For Else If, if add is pressed from Add Else If button, bFirst is true, and
		 *  Add Else If panel is removed and Else If Condition is added in its place
		 *  Else bFirst is false, and Else IF condition is inserted after the panel from which
		 *  Add is added
		 */
		// eslint-disable-next-line
		_addConditionSuccess: function(newCondition, that, data) {
			var sConditionId = newCondition.Id;
			var oDataModel = that._getModel();
			var oHeaderKey = {
				RuleId: newCondition.RuleId,
				Id: sConditionId,
				RuleVersion: newCondition.RuleVersion
			};
			var sPath = oDataModel.createKey("/TextRuleConditions", oHeaderKey);
			var oContext = new sap.ui.model.Context(oDataModel, sPath);

			oDataModel.read(sPath, {
				urlParameters: {
					"$expand": "TextRuleResultExpressions"
				},
				success: function(response) {
					var oVerticalLayout = data.verticalLayout;
					that.getModel("displayModel").getProperty("/textRuleConditions").push(response);
					that._resetContent = true;
					if (response.Type === that.typeElse) {
						that.getModel("displayModel").getProperty("/textRuleConditions/Else").push(response);
						var oElsePanel = that._createElseFormLayout(oContext, that.oBundle.getText("titleElse"), true);
						oVerticalLayout.removeContent(data.nIndex);
						oVerticalLayout.insertContent(oElsePanel, data.nIndex);
					} else if (response.Type === that.typeElseIf) {
						that.getModel("displayModel").getProperty("/textRuleConditions/ElseIf").push(response);
						var oElseIfPanel = that._createFormLayout(oContext, that.oBundle.getText("titleElseIf"), true);
						if (data.bfirst) {
							oVerticalLayout.removeContent(data.nIndex);
							oVerticalLayout.insertContent(oElseIfPanel, data.nIndex);
						} else {
							oVerticalLayout.insertContent(oElseIfPanel, data.nIndex + 1);
						}
					}
					that._updateBusyState(false);
				},
				error: function() {
					jQuery.sap.log.info("Error reading TextRuleResultExpressions");
				}
			});

		},

		/*
		 * @private
		 */
		_addToolBar: function() {
			var oToolbar = new Toolbar({
				design: "Transparent",
				enabled: "{TextRuleModel>/editable}"
			});

			var oTitle = new sap.m.Title({
				text: this.oBundle.getText("textRule")
			});

			var oSettingsButton = new Button({
				text: "",
				press: this._openTextRuleSettings.bind(this),
				visible: {
					parts: [{
						path: "TextRuleModel>/enableSettings"
					}, {
						path: "TextRuleModel>/editable"
					}],
					formatter: this._decideSettingsEnablement
				},
				enabled: {
					parts: [{
						path: "TextRuleModel>/enableSettings"
					}, {
						path: "TextRuleModel>/editable"
					}],
					formatter: this._decideSettingsEnablement
				}
			}).setTooltip(this.oBundle.getText("settings"));
			oSettingsButton.setIcon("sap-icon://action-settings");

			oToolbar.addContent(oTitle);
			oToolbar.addContent(new ToolbarSpacer({}));
			oToolbar.addContent(oSettingsButton);
			oToolbar.addContent(new ToolbarSpacer({
				width: "1em"
			}));
			this.setAggregation("_toolbar", oToolbar, true);
		},

		_addTextRuleControl: function() {
			this.verticalLayout = new sap.ui.layout.VerticalLayout({
				width: "100%"
			});
			this.setAggregation("_verticalLayout", this.verticalLayout, true);
		},

		/*
		 * Reads TextRule, Conditions and Results and updates data received status
		 */
		_bindRule: function() {
			var that = this;
			var oModel = this._getModel();
			var sBindingPath = [this._getBindModelName(), this.getBindingContextPath()].join("");
			if (sBindingPath && oModel) {
				oModel.setDeferredGroups(["read"]);
				oModel.read(sBindingPath, {
					groupId: "read",
					urlParameters: {
						"$expand": "TextRule"
					}
				});
				var headerPath = [sBindingPath, "/TextRule/TextRuleResults"].join("");
				oModel.read(headerPath, {
					groupId: "read"
				});
				headerPath = [sBindingPath, "/TextRule/TextRuleConditions"].join("");
				oModel.read(headerPath, {
					groupId: "read",
					urlParameters: {
						"$expand": "TextRuleResultExpressions"
					}
				});

				oModel.submitChanges({
					groupId: "read",
					success: function(data) {
						that._handleVerticalLayoutDataReceived(data);
					},
					error: function() {
						jQuery.sap.log.info("Error reading TextRule data from backend");
					}
				});
			}

		},

		/*
		 * Returns panels for If, Else If and Else conditions
		 */
		_bindVerticalLayout: function() {
			//If panel
			var oIfPanel = this._getIfPanel();
			this.verticalLayout.addContent(oIfPanel);
			//ElseIf panels
			if (this.getEnableElseIf() === true) {
				var oElseIfPanel = this._getElseIfPanel();
				for (var i = 0; i < oElseIfPanel.length; i++) {
					this.verticalLayout.addContent(oElseIfPanel[i]);
				}
			}
			//Else Layout
			if (this.getEnableElse() === true) {
				var oElsePanel = this._getElsePanel();
				this.verticalLayout.addContent(oElsePanel[0]);
			}
		},

		/*
		 * Returns panel with If and Then sections for If and ElseIf conditions
		 */
		_createFormLayout: function(oContext, sTitle, bExpanded) {
			var that = this;
			var oPanel = new Panel({
				expandable: true,
				expanded: bExpanded,
				headerText: sTitle,
				height: "100%",
				backgroundDesign: "Translucent",
				content: new Form({
					editable: true,
					layout: new sap.ui.layout.form.ResponsiveGridLayout({
						labelSpanXL: 2,
						labelSpanL: 2,
						labelSpanM: 2,
						labelSpanS: 12,
						adjustLabelSpan: false,
						emptySpanXL: 4,
						emptySpanL: 4,
						emptySpanM: 4,
						emptySpanS: 4,
						columnsL: 1,
						columnsM: 1
					}),
					formContainers: [
						// If form container
						that._createIfBlockFormContainer(oContext, sTitle),
						// Then form container
						that._createThenFormContainer(oContext, this.oBundle.getText("then"))
					]
				})
			}).addStyleClass("sapTextRulePanel");

			if (sTitle === this.typeIf) {
				oPanel.setHeaderText(sTitle);
			} else {
				var oToolbar = new Toolbar({
					design: "Transparent"
				});

				var oTitle = new sap.m.Title({
					text: sTitle
				});

				var oAddButton = new Button({
					visible: {
						parts: [{
							path: "TextRuleModel>/enableSettings"
						}, {
							path: "TextRuleModel>/editable"
						}],
						formatter: this._decideSettingsEnablement
					},
					text: this.oBundle.getText("addButton"),
					tooltip: this.oBundle.getText("addNewElseIf"),
					press: function(oEvent) {
						that._addConditionBlock(oEvent, that.typeElseIf);
					}
				}).setBindingContext(oContext);

				var oDeleteButton = new Button({
					text: this.oBundle.getText("deleteButton"),
					tooltip: this.oBundle.getText("deleteElseIf"),
					visible: {
						parts: [{
							path: "TextRuleModel>/enableSettings"
						}, {
							path: "TextRuleModel>/editable"
						}],
						formatter: this._decideSettingsEnablement
					},
					press: function(oEvent) {
						that._deleteConditionBlock(oEvent);
					}
				}).setBindingContext(oContext);

				oToolbar.addContent(oTitle);
				oToolbar.addContent(new ToolbarSpacer({
					width: "900px"
				}));
				oToolbar.addContent(oAddButton);
				oToolbar.addContent(new ToolbarSpacer({
					width: "0.5px"
				}));
				oToolbar.addContent(oDeleteButton);
				oPanel.setHeaderToolbar(oToolbar);
			}

			return oPanel;
		},

		/*
		 * Returns panel with Then section for Else condition
		 */
		_createElseFormLayout: function(oContext, sTitle, bExpanded) {
			var that = this;
			var oToolbar = new Toolbar({
				design: "Transparent"
			});

			var oTitle = new sap.m.Title({
				text: sTitle
			});

			var oDeleteButton = new Button({
				text: this.oBundle.getText("deleteButton"),
				tooltip: this.oBundle.getText("deleteElse"),
				visible: {
					parts: [{
						path: "TextRuleModel>/enableSettings"
					}, {
						path: "TextRuleModel>/editable"
					}],
					formatter: this._decideSettingsEnablement
				},
				press: function(oEvent) {
					that._deleteConditionBlock(oEvent);
				}
			}).setBindingContext(oContext);

			oToolbar.addContent(oTitle);
			oToolbar.addContent(new ToolbarSpacer({
				width: "965px"
			}));
			oToolbar.addContent(oDeleteButton);

			var oPanel = new Panel({
				expandable: true,
				expanded: bExpanded,
				height: "100%",
				backgroundDesign: "Translucent",
				content: new Form({
					editable: true,
					layout: new sap.ui.layout.form.ResponsiveGridLayout({
						labelSpanXL: 2,
						labelSpanL: 2,
						labelSpanM: 2,
						labelSpanS: 12,
						adjustLabelSpan: false,
						emptySpanXL: 4,
						emptySpanL: 4,
						emptySpanM: 4,
						emptySpanS: 4,
						columnsL: 1,
						columnsM: 1
					}),
					formContainers: [
						this._createThenFormContainer(oContext, sTitle)
					]
				})
			}).addStyleClass("sapTextRulePanel");

			oPanel.setHeaderToolbar(oToolbar);

			return oPanel;
		},

		/*
		 * Returns If form container
		 */
		_createIfBlockFormContainer: function(oContext, sTitle) {
			var expression = oContext.getProperty("Expression");
			var formContainer = new FormContainer({
				//title: title,
				formElements: [
					new FormElement({
						label: new Label({
							text: ""
						}), // Empty label is needed
						fields: [this._getExpressionAdvancedText(oContext, expression)]
							//layoutData: new sap.ui.layout.ResponsiveFlowLayoutData({linebreak: true, margin: false})
					})
				]
			});
			return formContainer;
		},

		/*
		 * Returns Then form container
		 */
		_createThenFormContainer: function(oContext, sTitle) {
			var formContainer = new FormContainer({
				visible: false
			});

			if (oContext.getProperty("Type") !== this.typeElse) {
				var oToolbar = new Toolbar({
					content: [new ToolbarSpacer({
						width: "2em"
					}), new Label({
						text: sTitle
					}).addStyleClass("sapTextRuleFontSize")]
				});
				formContainer.setToolbar(oToolbar);
			}

			var sConditionId = oContext.getProperty("Id");
			var oTextRuleConditions = this.getModel("displayModel").getProperty("/textRuleConditions");
			for (var i = 0; i < oTextRuleConditions.length; i++) {
				if (sConditionId === oTextRuleConditions[i].Id) {
					var oResultExpressions = oTextRuleConditions[i].TextRuleResultExpressions.results;
					if (oResultExpressions) {
						for (var j = 0; j < oResultExpressions.length; j++) {
							var oHeaderKey = {
								RuleId: oResultExpressions[j].RuleId,
								ConditionId: oResultExpressions[j].ConditionId,
								ResultId: oResultExpressions[j].ResultId,
								RuleVersion: oResultExpressions[j].RuleVersion
							};
							var sPath = this._getModel().createKey("/TextRuleResultExpressions", oHeaderKey);
							var oExpressionContext = new sap.ui.model.Context(this._getModel(), sPath);

							formContainer.addFormElement(this._formElementsFactory(sTitle + "result" + j, oExpressionContext));
						}
					}
				}
			}

			var oFormElements = formContainer.getFormElements();
			for (var element in oFormElements) {
				if (oFormElements[element].getVisible()) {
					formContainer.setVisible(true);
					break;
				}
			}

			return formContainer;
		},

		/*
		 * Returns TextRuleSettings control with model set
		 */
		_createTextRuleSettings: function() {
			var oModel = this._getModel();
			var oContext = this.getBindingContext();
			var oTextRuleSettings = new TextRuleSettings({
				expressionLanguage: this.getExpressionLanguage(),
				newTextRule: this._internalModel.getProperty("/newTextRule")
			});
			//Create a copy of the setting model.
			var settingModelDataStr = JSON.stringify(this._settingsModel.getData());
			var settingModelData = JSON.parse(settingModelDataStr);
			var settingModel = new sap.ui.model.json.JSONModel(settingModelData);
			oTextRuleSettings.setModel(settingModel);

			//Set configuration model
			oTextRuleSettings.setModel(this._internalModel, "TextRuleModel");

			//Set OdataModel + context  (needed for apply button)
			oTextRuleSettings.setModel(oModel, "oDataModel");
			oTextRuleSettings.setBindingContext(oContext, "dummy");

			return oTextRuleSettings;
		},

		_decideSettingsEnablement: function(enableSettings, editable) {
			return enableSettings && editable;
		},

		/*
		 * Handles delete for Else and Else If condition
		 * Deletes based on Binding path
		 * Vertical layout content deleted based on its index
		 */
		_deleteConditionBlock: function(oEvent) {
			var that = this;
			var oDataModel = this._getModel();
			var oSource = oEvent.getSource();
			var oPanel = oSource.getParent().getParent();
			var oVerticalLayout = oPanel.getParent();
			var nIndex = oVerticalLayout.indexOfContent(oPanel);
			var oBindingContext = oSource.getBindingContext();
			var sConditionId = oBindingContext.getProperty("Id");
			var sType = oBindingContext.getProperty("Type");
			var sKeyText;
			if (sType === that.typeElse) {
				sKeyText = "/TextRuleDefaultBranches";
			} else if (sType === that.typeElseIf) {
				sKeyText = "/TextRuleBranches";
			}

			var oHeaderKey = {
				RuleId: oBindingContext.getProperty("RuleId"),
				Id: sConditionId,
				RuleVersion: oBindingContext.getProperty("RuleVersion")
			};
			var sPath = oDataModel.createKey(sKeyText, oHeaderKey);

			var _deleteSuccess = function() {
				that._resetContent = true;
				var oPanel;
				oVerticalLayout.removeContent(nIndex);
				if (sType === that.typeElse) {
					that.getModel("displayModel").setProperty("/textRuleConditions/Else", []);
					oPanel = that._getElsePanel();
					oVerticalLayout.insertContent(oPanel[0], nIndex);
				} else { /* eslint-disable */
					if (nIndex === 1 && oVerticalLayout.getContent().length <= 2) {
						that.getModel("displayModel").setProperty("/textRuleConditions/ElseIf", []);
						oPanel = that._getElseIfPanel();
						oVerticalLayout.insertContent(oPanel[0], nIndex);
					} else {
						var oElseIf = that.getModel("displayModel").getProperty("/textRuleConditions/ElseIf");
						for (var condition in oElseIf) {
							if (oElseIf[condition].Id === sConditionId) {
								oElseIf.splice(condition, 1);
								that.getModel("displayModel").setProperty("/textRuleConditions/ElseIf", oElseIf);
								break;
							}
						}
					}
				} /* eslint-enable */
				that._updateBusyState(false);
			};

			this._updateBusyState(true);
			oDataModel.remove(sPath, {
				success: function(data) {
					_deleteSuccess();
				},
				error: function() {
					jQuery.sap.log.info("Error deleting " + sKeyText + "entity");
				}
			});
		},

		// Add Decision table specific data for converting the data to code to display and viceVersa.
		_formRuleData: function(oContext, expression) {
			var bindingContext = this.getBindingContextPath();
			var rulePath = bindingContext.split("/")[2];
			var oRuleId = oContext.getProperty("RuleId");
			var oVersion = oContext.getProperty("Version");

			var oRuleData = jQuery.extend({}, this.getModel().oData);

			oRuleData = oRuleData[rulePath];

			if (!oRuleData) {
				oRuleData = {};
			}
			// Add dummy tags
			if (!oRuleData.DecisionTable) {
				oRuleData.DecisionTable = {};
			}
			oRuleData.Type = "DT";

			oRuleData.DecisionTable.metadata = {};
			// HardCoding values to DT because rule body validator and tags expects these tags
			oRuleData.DecisionTable.RuleID = oRuleId;
			oRuleData.DecisionTable.version = oVersion;
			oRuleData.DecisionTable.HitPolicy = "FM";

			// Add dummy tags
			oRuleData.DecisionTable.DecisionTableColumns = {};
			oRuleData.DecisionTable.DecisionTableColumns.results = [];
			oRuleData.DecisionTable.DecisionTableColumns.results.push({
				"metadata": {},
				"RuleId": oRuleId,
				"Id": 1,
				"Version": oVersion,
				"Sequence": 1,
				"Type": "CONDITION",
				"Condition": {
					"metadata": {},
					"RuleId": oRuleId,
					"Id": 1,
					"Version": oVersion,
					"Expression": expression,
					"Description": null,
					"ValueOnly": false,
					"FixedOperator": null
				},
				"Result": null
			});

			oRuleData.DecisionTable.DecisionTableRows = {};
			oRuleData.DecisionTable.DecisionTableRows.results = [];

			oRuleData.DecisionTable.DecisionTableColumnsCondition = {};
			oRuleData.DecisionTable.DecisionTableColumnsCondition.results = [];

			oRuleData.DecisionTable.DecisionTableColumnsResult = {};
			oRuleData.DecisionTable.DecisionTableColumnsResult.results = [];

			return oRuleData;
		},

		/*
		 * Returns form elements with Expression fields for Then form container
		 */
		_formElementsFactory: function(sId, oContext) {
			var resultId = oContext.getProperty("ResultId"),
				ruleId = oContext.getProperty("RuleId"),
				version = oContext.getProperty("RuleVersion"),
				bVisible = true;

			var oHeaderKey = {
				RuleId: ruleId,
				Id: resultId,
				RuleVersion: version
			};

			var expression = oContext.getProperty("Expression");

			var headerPath = oContext.getModel().createKey("/TextRuleResults", oHeaderKey);
			this._internalModel.getProperty("/textRuleResults").push(oContext.getModel().getProperty(headerPath));
			this._internalModel.getProperty("/textRuleResultExpressions").push(oContext.getModel().getProperty(oContext.getPath()));

			var businessDataType = oContext.getModel().getProperty(headerPath + "/BusinessDataType");
			var sDataObjectAttributeName = oContext.getModel().getProperty(headerPath + "/DataObjectAttributeName");
			var sAccessMode = oContext.getModel().getProperty(headerPath + "/AccessMode");

			if (sAccessMode === "Editable") {
				bVisible = true;
			} else if (sAccessMode === "Hidden") {
				bVisible = false;
			}

			var formElement = new FormElement({
				visible: bVisible,
				label: new Label({
					text: sDataObjectAttributeName,
					tooltip: sDataObjectAttributeName
				}),
				//layoutData: new sap.ui.layout.form.GridElementData({hCells: "2"})
				fields: [this._getExpressionAdvancedText(oContext, expression, businessDataType)]
					//layoutData: new sap.ui.layout.ResponsiveFlowLayoutData({linebreak: true, margin: false})
			});
			return formElement;
		},

		_getBindModelName: function() {
			var path = "";
			var modelName = this.getModelName();
			if (modelName) {
				path = modelName + ">";
			}
			return path;
		},

		_getBlankContent: function() {
			var oLabelContent = new Label({
				text: this.oBundle.getText("startTextRule")
			});
			var oSpaceTextContent = new Text();

			oSpaceTextContent.setText("\u00a0");

			var oLinkToSettingsFromBlank = new Link({
				enabled: {
					parts: [{
						path: "TextRuleModel>/enableSettings"
					}, {
						path: "TextRuleModel>/editable"
					}],
					formatter: this._decideSettingsEnablement
				},
				text: " " + this.oBundle.getText("settings"),
				press: [this._openTextRuleSettings, this]
			}).addStyleClass("sapTextRuleLink");

			var oFlexBox = new FlexBox({
				justifyContent: "Center",
				items: [oLabelContent, oSpaceTextContent, oLinkToSettingsFromBlank],
				visible: {
					parts: [{
						path: "TextRuleModel>/enableSettings"
					}, {
						path: "TextRuleModel>/editable"
					}],
					formatter: this._decideSettingsEnablement
				}
			}).addStyleClass("sapUiMediumMargin");
			return oFlexBox;
		},

		//TODO : Remove after Ast Implementation
		_getConvertedExpression: function(expression, isCodeText, oContext) {
			var oExpressionLanguage = sap.ui.getCore().byId(this.getExpressionLanguage());
			var oRuleData = this._formRuleData(oContext, expression);
			var oResult;
			if (isCodeText) {
				// Convert to code Text
				oResult = oExpressionLanguage.convertRuleToCodeValues(oRuleData);
			} else {
				// Convert to display Text
				oResult = oExpressionLanguage.convertRuleToDisplayValues(oRuleData);
			}
			return oResult;
		},

		_getDataLoadedPromise: function() {
			if (!this._dataLoaded) {
				this._setDataLoadedPromise();
			}
			return this._dataLoaded.promise();
		},

		_getElseButton: function() {
			var that = this;
			this.oElseButton = new sap.m.Button({
				id: "_elseButton",
				text: this.oBundle.getText("addElse"),
				tooltip: this.oBundle.getText("addElse"),
				enabled: "{TextRuleModel>/editable}",
				press: function(oEvent) {
					that._addConditionBlock(oEvent, that.typeElse);
				}
			});

			return this.oElseButton;
		},

		_getElseIfButton: function() {
			var that = this;
			this.oElseIfButton = new sap.m.Button({
				id: "_elseIfButton",
				text: this.oBundle.getText("addElseIf"),
				tooltip: this.oBundle.getText("addElseIf"),
				enabled: "{TextRuleModel>/editable}",
				press: function(oEvent) {
					that._addConditionBlock(oEvent, that.typeElseIf);
				}
			});

			return this.oElseIfButton;
		},

		/*
		 * Returns array of Else If panels, if Else If conditions exist.
		 * Else returns a panel with "add Else If" button
		 */
		_getElseIfPanel: function() {
			var sTitle = this.oBundle.getText("titleElseIf");
			var oControls = [];
			var oElseIfData = this._displayModel.getProperty("/textRuleConditions/ElseIf");
			if (oElseIfData.length > 0) {
				for (var i = 0; i < oElseIfData.length; i++) {
					var oHeaderKey = {
						RuleId: oElseIfData[i].RuleId,
						Id: oElseIfData[i].Id,
						RuleVersion: oElseIfData[i].RuleVersion
					};
					var sPath = this._getModel().createKey("/TextRuleConditions", oHeaderKey);
					var oContext = new sap.ui.model.Context(this._getModel(), sPath);

					oControls.push(this._createFormLayout(oContext, sTitle), false);
				}
			} else {
				var oPanel = new Panel({
					headerText: sTitle,
					visible: {
						parts: [{
							path: "TextRuleModel>/enableSettings"
						}, {
							path: "TextRuleModel>/editable"
						}],
						formatter: this._decideSettingsEnablement
					},
					content: this._getElseIfButton()
				});
				oControls.push(oPanel);
			}

			return oControls;
		},

		/*
		 * Returns Else panel, if Else condition exist.
		 * Else returns a panel with "add Else" button
		 */
		_getElsePanel: function() {
			var sTitle = this.oBundle.getText("titleElse");
			var oControls = [];
			var oElseData = this._displayModel.getProperty("/textRuleConditions/Else");
			if (oElseData.length > 0) {
				var oHeaderKey = {
					RuleId: oElseData[0].RuleId,
					Id: oElseData[0].Id,
					RuleVersion: oElseData[0].RuleVersion
				};
				var sPath = this._getModel().createKey("/TextRuleConditions", oHeaderKey);
				var oContext = new sap.ui.model.Context(this._getModel(), sPath);

				oControls.push(this._createElseFormLayout(oContext, sTitle), false);
			} else {
				var oPanel = new Panel({
					headerText: sTitle,
					visible: {
						parts: [{
							path: "TextRuleModel>/enableSettings"
						}, {
							path: "TextRuleModel>/editable"
						}],
						formatter: this._decideSettingsEnablement
					},
					content: this._getElseButton()
				});
				oControls.push(oPanel);
			}

			return oControls;
		},

		/*
		 * Returns ExpressionAdvanced control
		 */
		_getExpressionAdvancedText: function(oContext, expression, businessDataType) {
			var that = this;
			var oExpressionLanguage = sap.ui.getCore().byId(this.getExpressionLanguage());
			var sType = businessDataType ? businessDataType : sap.rules.ui.ExpressionType.NonComparison;

			//TODO: Rebase to this change once vocabulary fixed from ui BUG FIX: 1880107212
			var oResult = that._getConvertedExpression(expression, false, oContext);
			var displayExpression = that._getExpressionFromParseResults(expression, oResult);

			return new ExpressionAdvanced({
				expressionLanguage: oExpressionLanguage,
				placeholder: this.oBundle.getText("expressionPlaceHolder"),
				validateOnLoad: true,
				type: sType,
				value: displayExpression,
				editable: "{TextRuleModel>/editable}",
				change: function(oEvent) {
					var oSource = oEvent.getSource();
					oContext = oSource.getBindingContext();
					var sPath = oContext.getPath();
					//TODO: Rebase to this change once vocabulary fixed from ui BUG FIX: 1880107212
					oResult = that._getConvertedExpression(oSource.getValue(), true, oContext);
					// Transform to DT model and use
					var expressionConverted = that._getExpressionFromParseResults(oSource.getValue(), oResult);
					that._updateModelExpression(sPath, oContext, expressionConverted);
					that._resetContent = true;
					var parserResults = oResult.output.decisionTableData.DecisionTable.DecisionTableColumns.results["0"].Condition.parserResults;
					if (parserResults.status !== "Error") {
						that._astUtils.Id = 0;
						var astOutput = parserResults.converted.ASTOutput;
						try {
							var astString = JSON.stringify(that._astUtils.parseConditionStatement(astOutput));
							var aTextRuleConditionModelPropertyList = oContext.oModel.oMetadata.mEntityTypes["/TextRuleConditions"].property;
							var nASTMaxLength = 0;
							if (aTextRuleConditionModelPropertyList) {
								for (var nPropertyPos = 0; nPropertyPos < aTextRuleConditionModelPropertyList.length; nPropertyPos++) {
									if (aTextRuleConditionModelPropertyList[nPropertyPos].name === "AST") {
										nASTMaxLength = aTextRuleConditionModelPropertyList[nPropertyPos].maxLength;
									}
								}
								if (astString && astString.length <= nASTMaxLength) {
									that._updateModelExpressionModelAst(sPath, oContext, astString);
								} 
							}

						} catch (e) {
							console.log("Exception while converting ast for expression" + oSource.getValue() + " :" + e.message);
						}

					}
				}.bind(this)
			}).setBindingContext(oContext);
		},

		_getExpressionFromParseResults: function(expression, oResult) {
			if (oResult && oResult.output.decisionTableData.DecisionTable.DecisionTableColumns.results[0].Condition.parserResults.converted) {
				return oResult.output.decisionTableData.DecisionTable.DecisionTableColumns.results[0].Condition.parserResults.converted.Expression;
			} else {
				return expression;
			}
		},

		/*
		 * Returns If panel
		 */
		_getIfPanel: function() {
			var sTitle = this.oBundle.getText("titleIf");
			var oIfData = this._displayModel.getProperty("/textRuleConditions/If");
			var oHeaderKey = {
				RuleId: oIfData[0].RuleId,
				Id: oIfData[0].Id,
				RuleVersion: oIfData[0].RuleVersion
			};
			var sPath = this._getModel().createKey("/TextRuleConditions", oHeaderKey);
			var oContext = new sap.ui.model.Context(this._getModel(), sPath);

			return this._createFormLayout(oContext, sTitle, true);
		},

		_getModel: function() {
			var modelName = this.getModelName();
			if (modelName) {
				return this.getModel(modelName);
			}
			return this.getModel();
		},

		/*
		 * Updates TextRuleCondition Data status as received
		 */
		_handleVerticalLayoutDataReceived: function(response) {
			//2 as response is read is order Rule, TextRuleResults and TextRuleConditions
			var conditionData = response.__batchResponses[2].data;
			var blankContent;
			if (!conditionData) {
				return;
			}
			var oVerticalLayout = this.getAggregation("_verticalLayout");
			if (conditionData.results && conditionData.results.length === 0) {
				blankContent = this._getBlankContent();
				oVerticalLayout.addContent(blankContent);
				this._internalModel.setProperty("/newTextRule", true);
				this._updateBusyState(false);
			} else {
				//In case TextRuleConditions do not have If condition, settings dialog is loaded
				this._segregateTextRuleData(conditionData.results);
				if (this._displayModel.getProperty("/textRuleConditions/If").length === 0) {
					blankContent = this._getBlankContent();
					oVerticalLayout.addContent(blankContent);
					this._internalModel.setProperty("/newTextRule", true);
					this._updateBusyState(false);
				} else {
					this._bindVerticalLayout();
					this._internalModel.setProperty("/newTextRule", false);
				}
			}
		},

		/*
		 * JSON model to update array of TextRuleConditions, If, ElseIf and Else
		 */
		_initDisplayModel: function() {
			var data = {};
			data.textRuleConditions = [];
			data.textRuleConditions.If = [];
			data.textRuleConditions.ElseIf = [];
			data.textRuleConditions.Else = [];
			this._displayModel = new sap.ui.model.json.JSONModel(data);
			this.setModel(this._displayModel, "displayModel");
		},

		/*
		 * JSON model for properties such as editable, new rule
		 * and Ids of Project and Rule etc
		 */
		_initInternalModel: function() {
			var data = {};
			data.editable = this.getEditable();
			data.newTextRule = true;
			data.enableSettings = true;
			data.projectId = "";
			data.projectVersion = "";
			data.ruleId = "";
			data.ruleVersion = "";
			data.ruleBindingPath = "";
			data.textRuleResults = [];
			data.textRuleResultExpressions = [];
			this._internalModel = new sap.ui.model.json.JSONModel(data);
			this.setModel(this._internalModel, "TextRuleModel");
		},

		/*
		 * JSON model for settings
		 */
		_initSettingsModel: function() {
			this._settingsModel = new sap.ui.model.json.JSONModel();
			this.setModel(this._settingsModel, "settingModel");
		},

		/*
		 * Creates and opens a dialog with TextRuleSettings control as content
		 */
		_openTextRuleSettings: function() {
			var textRuleSettings = this._createTextRuleSettings();
			var oDialog = new Dialog({
				contentWidth: "70%",
				title: this.oBundle.getText("textRuleSettings")
			});
			oDialog.addContent(textRuleSettings);
			var aButtons = textRuleSettings.getButtons(oDialog);
			for (var i = 0; i < aButtons.length; i++) {
				oDialog.addButton(aButtons[i]);
			}
			oDialog.attachBeforeClose(function(oData) {
				var dialogState = oDialog.getState();
				if (dialogState === sap.ui.core.ValueState.Success) {
					if (this._internalModel.getProperty("/resultChanged")) {
						var oEventBus = sap.ui.getCore().getEventBus();
						oEventBus.publish("sap.ui.rules", "refreshTextRuleModel");
					}
					this._resetControl();
				}
				oDialog.destroy();
			}, this);
			oDialog.open();
		},

		/*
		 * Resets the models, unbinds and rebinds the TextRule
		 */
		_resetControl: function() {
			this._unbindVerticalLayout();
			this._initInternalModel();
			this._initSettingsModel();
			this._initDisplayModel();
			this._updateBusyState(true);

			var oModel = this._getModel();
			var bindingContextPath = this.getBindingContextPath();
			/*
			 * onBeforeRendering is called twice. The first time oModel and bindingContextPath is null
			 * return statement gets executed.
			 * Only second time both variables have values and proceeds to bindRule
			 * Hence settigs resetContent to false only if return statement not executed
			 */
			if (!bindingContextPath || !oModel) {
				return;
			}
			this._resetContent = false;
			var sString = bindingContextPath.split("'");
			this._internalModel.setProperty("/projectId", sString[1]);
			this._internalModel.setProperty("/projectVersion", sString[3]);
			this._internalModel.setProperty("/ruleId", sString[5]);
			this._internalModel.setProperty("/ruleVersion", sString[7]);
			this._internalModel.setProperty("/ruleBindingPath", bindingContextPath);

			var oContext = new sap.ui.model.Context(oModel, bindingContextPath);
			this.setBindingContext(oContext);

			this._bindRule();
		},

		/*
		 * Method to segregate TextRuleConditions into If, ElseIf and Else arrays
		 */
		_segregateTextRuleData: function(conditionData) {
			var oConditions = [];
			oConditions.If = [];
			oConditions.ElseIf = [];
			oConditions.Else = [];
			for (var i = 0; i < conditionData.length; i++) {
				oConditions.push(conditionData[i]);
				if (conditionData[i].Type === this.typeIf) {
					oConditions.If.push(conditionData[i]);
				} else if (conditionData[i].Type === this.typeElseIf) {
					oConditions.ElseIf.push(conditionData[i]);
				} else if (conditionData[i].Type === this.typeElse) {
					oConditions.Else.push(conditionData[i]);
				}
			}
			this.getModel("displayModel").setProperty("/textRuleConditions", oConditions);
		},
		/*
		 * Updates busy state of Rule based on data received
		 */
		_updateBusyState: function(busy) {
			if (busy) {
				sap.ui.core.BusyIndicator.show(0);
			} else {
				//TO_DO : Remove this after finding better solution to hide the busy indicator
				setTimeout(function() {
					sap.ui.core.BusyIndicator.hide();
				}, 1500);
			}
		},

		_unbindVerticalLayout: function() {
			var oVerticalLayout = this.getAggregation("_verticalLayout");
			oVerticalLayout.destroyContent();
		},

		_updateModelExpression: function(sPath, oContext, expressionConverted) {
			oContext.getModel().setProperty(sPath + "/Expression", expressionConverted, oContext, true);
		},

		_updateModelExpressionModelAst: function(sPath, oContext, astString) {
			if (oContext.getModel().getProperty(sPath + "/AST")) {
				oContext.getModel().setProperty(sPath + "/AST", astString, oContext, true);
			}
		},

		init: function() {
			this.oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.rules.ui.i18n");
			this.typeIf = "If";
			this.typeElseIf = "ElseIf";
			this.typeElse = "Else";
			this._resetContent = true;
			this._initInternalModel();
			this._initDisplayModel();
			this._initSettingsModel();
			this._addToolBar();
			this._addTextRuleControl();
			this._astUtils = AstYamlConverter;
		},

		onAfterRendering: function() {
			var oVerticalLayout = this.getAggregation("_verticalLayout");
			var that = this;
			oVerticalLayout.addEventDelegate({
				"onAfterRendering": function() {
					that._updateBusyState(false);
				}
			}, this);
		},

		onBeforeRendering: function() {
			if (this._resetContent) {
				this._resetControl();
			}
		},

		/** Control's properties getters/setters */

		setEnableSettings: function(value) {
			//value = true;
			this.setProperty("enableSettings", value, true);
			this._internalModel.setProperty("/enableSettings", value);
			return this;
		},

		setModelName: function(value) {
			this.setProperty("modelName", value);
			this._resetContent = true;
			return this;
		},

		setExpressionLanguage: function(value) {
			this.setAssociation("expressionLanguage", value, true);
			var expressionLanguage = (value instanceof Object) ? value : sap.ui.getCore().byId(value);
			if (!expressionLanguage) {
				return this;
			}
			// if panel has been built already - refresh it
			var oVerticalLayout = this.getAggregation("_verticalLayout");
			if (oVerticalLayout) {
				var contentBinding = oVerticalLayout.getBinding("content");
				if (contentBinding) {
					contentBinding.refresh();
				}
			}
			return this;
		},

		setEditable: function(value) {
			this.setProperty("editable", value, true);
			this._internalModel.setProperty("/editable", value);
			return this;
		},

		setBindingContextPath: function(value) {
			var oldValue = this.getBindingContextPath();
			if (value && (oldValue !== value)) {
				this._unbindVerticalLayout();
				this.setProperty("bindingContextPath", value);
				this._resetContent = true;
			}
			return this;
		}

	});

	return TextRule;

}, /* bExport= */ true);
