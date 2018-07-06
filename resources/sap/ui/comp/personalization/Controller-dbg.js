/* eslint-disable strict */

/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */

// Provides Controller
sap.ui.define([
	'jquery.sap.global', 'sap/ui/base/ManagedObject', './ColumnsController', './FilterController', './GroupController', './SortController', './DimeasureController', './SelectionController', './Util', 'sap/ui/comp/library', './ChartWrapper', './SelectionWrapper', './ColumnHelper', 'sap/ui/core/MessageType', 'sap/m/P13nDialog', './Validator', 'sap/ui/model/json/JSONModel'
], function(jQuery, ManagedObject, ColumnsController, FilterController, GroupController, SortController, DimeasureController, SelectionController, Util, CompLibrary, ChartWrapper, SelectionWrapper, ColumnHelper, MessageType, P13nDialog, Validator, JSONModel) {
	"use strict";

	/**
	 * The controller represents the central communication hub with respect to personalisation. It makes sure to present the right user interface, do
	 * the necessary communication with this user interface and to provide events with which the consumer can require additional information needed,
	 * e.g. when an additional column is chosen via the user interface. It also exposes methods to set personalisation data 'from outside' and to
	 * revert to a latest clean state (with different definitions of "clean"). It is important to notice that the controller in general exposes
	 * changes as delta to a "baseline state". The "baseline state" is first and foremost the state defined via the table instance used to instantiate
	 * the controller. (We use the phrase "first and foremost" since the controller also exposes json objects which represents deltas to the last
	 * personalisation data set 'from outside' - this can be used by the consumer to handle dirty state.) This table instance, and thus the "baseline
	 * state", cannot be changed at a later point in time. As a consequence, the consumer should instantiate the controller with exactly the table
	 * instance on which she wishes the deltas to be calculated.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The personalization Controller provides capabilities in order to orchestrate the P13nDialog.
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version 1.54.6
	 * @constructor
	 * @experimental This module is only for internal/experimental use!
	 * @private
	 * @since 1.26.0
	 * @alias sap.ui.comp.personalization.Controller
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Controller = ManagedObject.extend("sap.ui.comp.personalization.Controller", /** @lends sap.ui.comp.personalization.Controller */
	{
		constructor: function(sId, mSettings) {
			ManagedObject.apply(this, arguments);
		},
		metadata: {
			library: "sap.ui.comp",
			properties: {

				/**
				 * For each panel type, the <code>setting</code> property can contain <code>visible</code>, <code>controller</code>,
				 * <code>payload</code> and <code>ignoreColumnKeys</code> attributes. The <code>setting</code> property is used
				 * in a black list, meaning that specific panels can be overwritten. In this example, the Group panel will not be shown, and for the
				 * Columns panel the <code>visibleItemsThreshold</code> is set to 10. The attribute <code>ignoreColumnKeys</code> provides an
				 * array of column keys which should be ignored in the Columns panel. Additionally, a new controller instance can be defined.
				 * <bold>Note</bold>: this property should be passed into constructor and is not allowed to be changed afterwards.
				 *
				 * <pre><code>
				 * {
				 * 	group: {
				 * 		visible: false,
				 * 		ignoreColumnKeys: []
				 * 	},
				 * 	columns: {
				 * 		visible: true,
				 * 	    ignoreColumnKeys: [],
				 * 		payload: {
				 * 			visibleItemsThreshold: 10
				 * 		},
				 * 		controller: new sap.ui.comp.personalization.TestController(&quot;TestController&quot;)
				 * 	},
				 * 	dimeasure: {
				 * 		visible: true,
				 * 	    ignoreColumnKeys: [],
				 * 		payload: {
				 * 			availableChartTypes: [
				 * 				&quot;pie&quot;, &quot;column&quot;, &quot;line&quot;, &quot;donut&quot;
				 * 			]
				 * 		}
				 * 	},
				 * 	selection: {
				 * 		visible: true,
				 * 	    ignoreColumnKeys: [],
				 * 		payload: {
				 * 			callbackSaveChanges: function
				 * 		}
				 * 	}
				 * }
				 * </code></pre>
				 */
				setting: {
					type: "object",
					defaultValue: {}
				},
				/**
				 * The current state can be set back either to the state of initial table (ResetFull) or to the specific state of the table
				 * (ResetPartial) which has been set via <code>setPersonalizationData</code> method
				 */
				resetToInitialTableState: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Once the <code>columnKeys</code> is passed it must contain all possible column keys. The order of the column keys is taken into account.
				 * <bold>Note</bold>: this property should be passed into constructor and is not allowed to be changed afterwards.
				 */
				columnKeys: {
					type: "string[]",
					defaultValue: []
				}
			},
			associations: {
				/**
				 * Table on which the personalization will be performed. <bold>Note</bold>: this property is mandatory and should be passed into
				 * constructor and is not allowed to be changed afterwards.
				 */
				table: {
					type: "object",
					multiple: false
				}
			},
			events: {
				/**
				 * If a table is manipulated directly, such as column move, column resize etc., this event is raised <b>before</b> the action has
				 * been finished. However, that does not mean that the table is really changed. For example, the column touched could be moved to a
				 * new position or could also be dropped at the old position.
				 */
				beforePotentialTableChange: {},
				/**
				 * If a table is manipulated directly, such as column move, column resize etc., this event is raised <b>after</b> the action has been
				 * finished. However, that does not mean that the table is really changed. For example, the column touched could be moved to a new
				 * position or could also be dropped at the old position.
				 */
				afterPotentialTableChange: {},

				/**
				 * Event is fired if the personalization model data is changed
				 */
				afterP13nModelDataChange: {
					parameters: {
						/**
						 * JSON object that is relevant for persistence.
						 */
						persistentData: {
							type: "object"
						},
						/**
						 * Information about what has been changed since last variant (including the standard variant) was set.
						 * Consumers of the personalization dialog have to react on it in order to show dirty flag.
						 */
						persistentDataChangeType: {
							type: "sap.ui.comp.personalization.ChangeType"
						},
						/**
						 * JSON object that has been changed since last <code>afterP13nModelDataChange</code> event was
						 * raised. Consumers of the personalization dialog have to react on it in order to sort or filter the table.
						 */
						runtimeDeltaData: {
							type: "object"
						},
						/**
						 * Information about what has been changed with respect to the restore point. This "restore point" is dependent upon
						 * resetToInitialTableState; if "true" then this restore point is equal to initial state of the table
						 * (controlDataInitial), if "false" then the restore point is equal to the current variant
						 * (this.getVariantDataInitial).
						 */
						runtimeDeltaDataChangeType: {
							type: "sap.ui.comp.personalization.ChangeType"
						}
					}
				},
				/**
				 * Event is fired in order to request columns which were not passed together with table in constructor.
				 *
				 * @since 1.38.0
				 */
				requestColumns: {
					parameters: {
						columnKeys: {
							type: "string"
						}
					}
				},
				/**
				 * Event is fired after the dialog has been closed.
				 *
				 * @since 1.46.0
				 */
				dialogAfterClose: {},
				/**
				 * Event is fired after the dialog has been opened.
				 *
				 * @since 1.56.0
				 */
				dialogAfterOpen: {},
				/**
				 * Event is fired after the Restore button has been pressed and, at the same time, after it has been confirmed by pressing the OK
				 * button in the dialog.
				 *
				 * @since 1.46.0
				 */
				dialogConfirmedReset: {}
			}
		}
	});

	Controller.prototype.applySettings = function(mSettings) {
		ManagedObject.prototype.applySettings.apply(this, arguments);
		this._initialize();
	};
	Controller.prototype._initialize = function() {
		this._bInitCalled = true;

		var oTable = this.getTable();
		if (!oTable) {
			throw "The table instance should be passed into constructor.";
		}

		// 1. Instantiate Sub-Controllers based on <code>setting</code> property
		this._createSettingCurrent(this.getSetting());

		// 2. Store 'columnKeys' of current columns
		var aColumns = oTable.getColumns();
		if (!this.getColumnKeys().length) {
			this.setProperty("columnKeys", Util.getColumnKeys(aColumns), true);
		}

		// 3. Instantiate internal model
		var oModel = this._createInternalModel(this.getColumnKeys());
		this._callControllers(this._oSettingCurrent, "initializeInternalModel", oModel);

		// 4. Propagate some properties to Sub-Controllers
		this._oColumnHelper = new ColumnHelper({
			callbackOnSetVisible: this._onSetVisible.bind(this),
			callbackOnSetSummed: this._onSetSummed.bind(this)
		});
		this._oColumnHelper.addColumns(aColumns);
		this._callControllers(this._oSettingCurrent, "setColumnHelper", this._oColumnHelper);

		this._callControllers(this._oSettingCurrent, "setTriggerModelChangeOnColumnInvisible");

		this._callControllers(this._oSettingCurrent, "setTable", oTable);
		this._callControllers(this._oSettingCurrent, "setColumnKeys", this.getColumnKeys());

		this._callControllers(this._oSettingCurrent, "setIgnoreColumnKeys");
		this._callControllers(this._oSettingCurrent, "checkConsistencyOfIgnoreColumnKeys");
		this._callControllers(this._oSettingCurrent, "calculateIgnoreData");

		// Take initial snapshot of table so that we can restore this state later. Is based on
		// columnKeys (complete amount of columns with predefined order).
		// Contains ignored columns and not yet created columns.
		this._extendModelStructure(Object.keys(this._oColumnHelper.getColumnMap()));

		// As interaction is also possible direct with the table we have to prepare 'controlData' as well
		this._callControllers(this._oSettingCurrent, "calculateControlData");
	};
	Controller.prototype.init = function() {
		this._oDialog = null;
		this._aColumnKeysOfDateType = [];
		this._aColumnKeysOfBooleanType = [];
		this._aColumnKeysOfTimeType = [];
		this._bIsDirty = false;
		this._bInitCalled = false;
		this._bSuspend = false;
		this._bUnconfirmedResetPressed = false;
		this._oColumnHelper = null;
		this._oSettingCurrent = {};
	};
	Controller.prototype.setSetting = function(oSetting) {
		if (this._bInitCalled) {
			throw "The setting instance should be passed only into constructor.";
		}
		oSetting = this.validateProperty("setting", oSetting);
		this.setProperty("setting", oSetting, true); // no rerendering
		return this;
	};
	Controller.prototype.setResetToInitialTableState = function(bResetToInitialTableState) {
		if (this._bInitCalled) {
			throw "The resetToInitialTableState property should be passed only into constructor.";
		}
		bResetToInitialTableState = this.validateProperty("resetToInitialTableState", bResetToInitialTableState);
		this.setProperty("resetToInitialTableState", bResetToInitialTableState, true); // no rerendering
		return this;
	};
	Controller.prototype.setColumnKeys = function(aColumnKeys) {
		if (this._bInitCalled) {
			throw "The columnKeys array should be passed only into constructor.";
		}
		aColumnKeys = this.validateProperty("columnKeys", aColumnKeys);
		this.setProperty("columnKeys", aColumnKeys, true); // no rerendering
		return this;
	};
	Controller.prototype.setTable = function(oTable) {
		if (this._bInitCalled) {
			throw "The table instance should be passed only into constructor.";
		}
		this.setAssociation("table", oTable);
		return this;
	};

	Controller.prototype._createSettingCurrent = function(oSetting) {
		// NOTE: instantiating the sub-Controllers only when opening the dialog is too late since this data could be set before (e.g. via column menu)
		// and we expect sub-Controllers to handle these data
		var sTableType = Util.getTableType(this.getTable());
		var aSettingCurrent, sType;
		switch (sTableType) {
			case sap.ui.comp.personalization.TableType.ChartWrapper:
				aSettingCurrent = [
					sap.m.P13nPanelType.dimeasure, sap.m.P13nPanelType.sort, sap.m.P13nPanelType.filter
				];
				break;
			case sap.ui.comp.personalization.TableType.SelectionWrapper:
				aSettingCurrent = [
					sap.m.P13nPanelType.selection
				];
				break;
			default:
				aSettingCurrent = [
					sap.m.P13nPanelType.columns, sap.m.P13nPanelType.sort, sap.m.P13nPanelType.filter, sap.m.P13nPanelType.group
				];
		}

		// Take over 'setting'. Default: all panels are set to visible.
		for (sType in oSetting) {
			// Remove types which are set to 'visible=false' via 'setting'
			if (oSetting[sType].visible === false && aSettingCurrent.indexOf(sType) > -1) {
				aSettingCurrent.splice(aSettingCurrent.indexOf(sType), 1);
			}
			// Enrich customer types coming via 'setting'
			if (oSetting[sType].visible === true) {
				aSettingCurrent.push(sType);
			}
		}

		aSettingCurrent.forEach(function(sType) {
			this._oSettingCurrent[sType] = {
				visible: true,
				controller: (oSetting[sType] && oSetting[sType].controller) ? oSetting[sType].controller : this._controllerFactory(sType),
				payload: (oSetting[sType] && oSetting[sType].payload) ? oSetting[sType].payload : undefined,
				ignoreColumnKeys: (oSetting[sType] && oSetting[sType].ignoreColumnKeys) ? oSetting[sType].ignoreColumnKeys : [],
				triggerModelChangeOnColumnInvisible: (oSetting[sType] && oSetting[sType].triggerModelChangeOnColumnInvisible) ? oSetting[sType].triggerModelChangeOnColumnInvisible : undefined
			};
		}, this);
	};

	Controller.prototype._mixSetting = function(oSettingGlobal, oSetting) {
		if (!oSetting) {
			return oSettingGlobal;
		}
		for ( var sType in oSetting) {
			if (oSetting[sType].visible === true && oSettingGlobal[sType] && oSettingGlobal[sType].visible === true) {
				// Take over the oSettingGlobal controller
				oSetting[sType].controller = oSettingGlobal[sType].controller;
				// Payload on oSetting has higher priority then payload on oSettingGlobal
				oSetting[sType].payload = oSetting[sType].payload || oSettingGlobal[sType].payload;
			}
		}
		return oSetting;
	};

	// ----------------------------------------------------------- Public API -----------------------------------------------------------------------------------

	/**
	 * Opens the personalization dialog
	 *
	 * @param {object} oSettingsForOpen contains additional settings information for opening the dialog with its panels. Settings information is used
	 *        in the manner of white list, meaning that only specified panels are considered. Example for a dialog with sort and filter panels:
	 *
	 * <pre><code>
	 * {
	 * 	contentWidth: CSSSize,
	 * 	contentHeight: CSSSize,
	 * 	styleClass: <string>,
	 * 	showReset: <boolean>,
	 * 	sort: {
	 * 		visible: true
	 * 	},
	 * 	filter: {
	 * 		visible: true
	 * 	},
	 * 	dimeasure: {
	 * 		visible: true,
	 * 		payload: {
	 * 			availableChartTypes: [
	 * 				new sap.ui.core.Item({
	 * 					key: sap.chart.ChartType.Column,
	 * 					text: 'Column'
	 * 				}), new sap.ui.core.Item({
	 * 					key: sap.chart.ChartType.Donut,
	 * 					text: 'Donut'
	 * 				})
	 * 			]
	 * 		}
	 * 	},
	 * 	selection: {
	 * 		visible: true
	 * 	}
	 * }
	 * </code></pre>
	 */
	Controller.prototype.openDialog = function(oSettingsForOpen) {

		this._suspendTable();

		this._prepareDialogUi();

		var oSettingForOpen = this._mixSetting(this._oSettingCurrent, oSettingsForOpen);

		this._oDialog = new P13nDialog({
			stretch: sap.ui.Device.system.phone,
			showReset: (oSettingsForOpen && oSettingsForOpen.showReset !== undefined) ? oSettingsForOpen.showReset : true,
			showResetEnabled: this._bIsDirty,
			initialVisiblePanelType: this._oInitialVisiblePanelType,
			validationExecutor: function(oPayload) {
				var sTableType = Util.getTableType(this.getTable());
				var oColumnKey2ColumnMap = this._oColumnHelper.getColumnMap();
				var oControlDataReduceTotal = this._callControllers(oSettingForOpen, "getUnionData", this._getControlDataInitial(), this._getControlDataReduce());
				return Validator.checkGroupAndColumns(sTableType, oSettingForOpen, oPayload, oColumnKey2ColumnMap, oControlDataReduceTotal, []).then(function(aResultTotal) {
					return Validator.checkSaveChanges(sTableType, oSettingForOpen, oPayload, aResultTotal).then(function(aResultTotal) {
						return aResultTotal;
					});
				});
			}.bind(this)
		});
		// Set compact style class if the table is compact too
		this._oDialog.toggleStyleClass("sapUiSizeCompact", !!jQuery(this.getTable().getDomRef()).closest(".sapUiSizeCompact").length);

		if (oSettingsForOpen && oSettingsForOpen.contentWidth) {
			this._oDialog.setContentWidth(oSettingsForOpen.contentWidth);
		}
		if (oSettingsForOpen && oSettingsForOpen.contentHeight) {
			this._oDialog.setContentHeight(oSettingsForOpen.contentHeight);
		}
		if (oSettingsForOpen && oSettingsForOpen.styleClass) {
			this._oDialog.addStyleClass(oSettingsForOpen.styleClass);
		}

		var oPanels = this._callControllers(oSettingForOpen, "getPanel");
		for ( var sType in oSettingForOpen) {
			if (oPanels[sType]) {
				this._oDialog.addPanel(oPanels[sType]);
			}
		}

		this._oDialog.attachOk(this._handleDialogOk, this);
		this._oDialog.attachCancel(this._handleDialogCancel, this);
		this._oDialog.attachReset(this._handleDialogReset, this);
		this._oDialog.attachAfterClose(this._handleDialogAfterClose, this);

		this._oDialog.open();
		this.fireDialogAfterOpen();
	};

	/**
	 * Adds all requested columns.
	 * @param {object} oColumnKey2ColumnMap Format: {<path>: oColumn}
	 */
	Controller.prototype.addColumns = function(oColumnKey2ColumnMap) {
		var oTable = this.getTable();
		Object.keys(oColumnKey2ColumnMap).forEach(function(sColumnKey) {
			if (!oColumnKey2ColumnMap[sColumnKey].getParent()) {
				oTable.addDependent(oColumnKey2ColumnMap[sColumnKey]);
			}
		});

		this._oColumnHelper.addColumnMap(oColumnKey2ColumnMap);
	};

	/**
	 * Returns a current snapshot of controlData data in DataSuiteFormat.
	 * @returns {Object} DataSuiteFormat
	 */
	Controller.prototype.getDataSuiteFormatSnapshot = function() {
		this._callControllers(this._oSettingCurrent, "calculateControlData");

		var oRuntimeDataSuiteFormat = {};
		this._callControllers(this._oSettingCurrent, "getDataSuiteFormatSnapshot", oRuntimeDataSuiteFormat);
		return oRuntimeDataSuiteFormat;
	};

	/**
	 * Replaces the current snapshot with the controlData data represented in Data Suite Format <code>oRuntimeDataSuiteFormat</code>.
	 * The <code>oControlDataReduceVariant</code> defines the base line of restore.
	 * @param {object} oRuntimeDataSuiteFormat
	 * @param {object} oPersonalizationData
	 */
	Controller.prototype.setDataSuiteFormatSnapshot = function(oRuntimeDataSuiteFormat, oPersonalizationData) {
		// Note: oRuntimeData is a complete snapshot (and not delta to the controlDataInitial)!!!
		// Note: we have also to 'turn back' columns which are visible in controlDataInitial but do not occur in oRuntimeDataSuiteFormat!!!
		var oRuntimeData = this._callControllers(this._oSettingCurrent, "getDataSuiteFormat2Json", oRuntimeDataSuiteFormat);
		this._setRuntimeAndPersonalizationData(oRuntimeData, oPersonalizationData);
	};
	Controller.prototype.setPersonalizationDataAsDataSuiteFormat = function(oRuntimeDataSuiteFormat) {
		// Note: oRuntimeData is a complete snapshot (and not delta to the controlDataInitial)!!!
		// Note: we have also to 'turn back' columns which are visible in controlDataInitial but do not occur in oRuntimeDataSuiteFormat!!!
		var oRuntimeData = this._callControllers(this._oSettingCurrent, "getDataSuiteFormat2Json", oRuntimeDataSuiteFormat);
		this._setRuntimeAndPersonalizationData(oRuntimeData, oRuntimeData);
	};
	/**
	 * Setter for personalization model. Note: for data of type Date the object instance is expected and not string representation.
	 * Example:
	 * { sort: sortItems:[{columnKey: "A", operation: "Ascending"}]}
	 *
	 * @param{object} oPersonalizationData Contains personalization data that is taken over into the model
	 */
	Controller.prototype.setPersonalizationData = function(oPersonalizationData) {
		// Note: oPersonalizationData is delta to the controlDataInitial!!!
		this._setRuntimeAndPersonalizationData(oPersonalizationData, oPersonalizationData);
	};
	/**
	 * Notice that the dirty calculation and hence intrinsic restore handling is based exclusively on the property "resetToInitialTableState", the
	 * parameter sResetType is ignored !! TODO: not quite clear if there are use cases in which this (the above statement) is a problem --> maybe
	 * remove the parameter sResetType.
	 *
	 * @param {sap.ui.comp.personalization.ResetType} sResetType is optional.
	 */
	Controller.prototype.resetPersonalization = function(sResetType) {
		sResetType = this._determineResetType(sResetType);
		// preReset
		if (sResetType === sap.ui.comp.personalization.ResetType.ResetFull) {
			this._resetFull();
		} else {
			this._resetPartial();
		}

		// commit
		this._suspendTable();
		this._syncTableUi();
		this._resumeTable(true);

		this._fireChangeEvent(sResetType);
	};

	/**
	 * if types are present which are defined as ignored these types are not taken into account !
	 *
	 * @param {string[]} aColumnKeys Array of columnKeys
	 * @returns {sap.ui.comp.personalization.Controller} Controller
	 */
	Controller.prototype.addToSettingIgnoreColumnKeys = function(aColumnKeys) {

		this._callControllers(this._oSettingCurrent, "setAdditionalIgnoreColumnKeys", aColumnKeys);
		this._callControllers(this._oSettingCurrent, "calculateIgnoreData");

		this._requestMissingColumnsWithoutIgnore(this._getControlDataBase());

		this._suspendTable();
		this._syncTableUi();
		this._resumeTable(true);

		this._fireChangeEvent();
		return this;
	};

	// ----------------------------------------------------------------------------------------------------------------------------------------------------

	Controller.prototype._handleDialogReset = function() {

		this._bUnconfirmedResetPressed = true;

		var sResetType = this._determineResetType();
		if (sResetType === sap.ui.comp.personalization.ResetType.ResetFull) {
			this._resetFull();
		} else {
			this._resetPartial();
		}

		// update UI
		this._syncDialogUi();
	};

	Controller.prototype._handleDialogOk = function() {
		this._oDialog.detachOk(this._handleDialogOk, this);

		if (this._bUnconfirmedResetPressed) {
			this.fireDialogConfirmedReset();
		}
		setTimeout(function() {
			// 'controlDataReduce' is up-to-date due to the binding.
			this._postDialogUi(this._getControlDataReduce());
			this._syncTableUi();
			this._resumeTable(true);

			this._fireChangeEvent();
		}.bind(this), 0);

		this._oDialog.close();
	};
	Controller.prototype._handleDialogCancel = function() {
		this._oDialog.detachCancel(this._handleDialogCancel, this);
		setTimeout(function() {
			this._postDialogUi(this._getBeforeOpenData());
			this._resumeTable(false);
		}.bind(this), 0);

		this._oDialog.close();
	};
	Controller.prototype._handleDialogAfterClose = function() {
		// Store the latest open panel
		this._oInitialVisiblePanelType = this._oDialog.getVisiblePanel() ? this._oDialog.getVisiblePanel().getType() : this._getInitialVisiblePanelType();

		// Initialize '_bUnconfirmedResetPressed'
		this._bUnconfirmedResetPressed = false;

		if (this._oDialog) {
			this._oDialog.destroy();
			this._oDialog = null;
		}

		this.fireDialogAfterClose();
	};

	/**
	 * Get first property of current setting object
	 *
	 * @returns {string} that represents the panel type
	 */
	Controller.prototype._getInitialVisiblePanelType = function() {
		for ( var sType in this._oSettingCurrent) {
			return sType;
		}
	};
	Controller.prototype._suspendTable = function() {
		if (Util.getTableBaseType(this.getTable()) === sap.ui.comp.personalization.TableType.Table) {
			this._bSuspend = true;
		}
	};
	Controller.prototype._resumeTable = function(bInvalidate) {
		// default is to invalidate table
		bInvalidate = (bInvalidate === undefined) ? true : bInvalidate;
		var oTable = this.getTable();
		if (this._bSuspend) {
			if (oTable) {
				if (bInvalidate) {
					oTable.invalidate();
				}
			}
			this._bSuspend = false;
		}
	};

	Controller.prototype._requestMissingColumnsWithoutIgnore = function(oJsonNew) {
		var oJsonMissingColumnKeys = this._callControllers(this._oSettingCurrent, "determineMissingColumnKeys", oJsonNew);
		var aMissingColumnKeys = Util.getUnionOfColumnKeys(oJsonMissingColumnKeys);
		if (!aMissingColumnKeys.length) {
			return [];
		}
		this.fireRequestColumns({
			columnKeys: aMissingColumnKeys
		});
		return aMissingColumnKeys;
	};
	Controller.prototype._extendModelStructure = function(aColumnKeys) {
		if (!aColumnKeys.length) {
			return;
		}
		var oJsonColumnKeys = this._callControllers(this._oSettingCurrent, "createColumnKeysStructure", aColumnKeys);
		var oJson = this._callControllers(this._oSettingCurrent, "getTable2Json", oJsonColumnKeys); // keep the metadata order
		this._callControllers(this._oSettingCurrent, "extendControlDataInitial", oJson);
		this._callControllers(this._oSettingCurrent, "extendVariantDataInitial", oJson);
		this._callControllers(this._oSettingCurrent, "extendControlDataBase", oJson);
		this._callControllers(this._oSettingCurrent, "extendAlreadyKnownRuntimeData", oJson);
		this._callControllers(this._oSettingCurrent, "extendAlreadyKnownPersistentData", oJson);
	};

	Controller.prototype._setRuntimeAndPersonalizationData = function(oRuntimeData, oPersonalizationData) {
		oRuntimeData = (oRuntimeData === null ? {} : oRuntimeData);
		if (!this._sanityCheck(oRuntimeData)) {
			return;
		}
		oPersonalizationData = (oPersonalizationData === null ? {} : oPersonalizationData);
		if (!this._sanityCheck(oPersonalizationData)) {
			return;
		}
		this._setVariantData(oPersonalizationData);

		// extend controlDataInitial with missing (if any)
		this._extendModelStructure(this._requestMissingColumnsWithoutIgnore(oRuntimeData));

		// update variant
		var oJson = this._callControllers(this._oSettingCurrent, "getUnionData", this._getControlDataInitial(), oPersonalizationData);
		this._callControllers(this._oSettingCurrent, "setVariantDataInitial2Model", oJson);

		// now deal with runtime data ... i.e. controlDataBase

		// We have to build total data because otherwise the information like e.g. 'visible' gets lost (in case that the variant does not have 'visible').
		// The binding of the table of the dialog assumes that 'visible' should exist
		var oRuntimeDataTotal = this._callControllers(this._oSettingCurrent, "getUnionData", this._getControlDataInitial(), oRuntimeData);

		// we now make sure that any conflicts in oRuntimeDataTotal are fixed
		this._callControllers(this._oSettingCurrent, "fixConflictWithIgnore", oRuntimeDataTotal, this._getIgnoreData());
		this._callControllers(this._oSettingCurrent, "setControlDataBase2Model", oRuntimeDataTotal);

		this._suspendTable();
		this._syncTableUi();
		this._resumeTable(true);

		this._fireChangeEvent();
	};
	Controller.prototype._prepareDialogUi = function() {
		var oJsonColumnKeys = this._callControllers(this._oSettingCurrent, "createColumnKeysStructure", this.getColumnKeys());
		this._extendModelStructure(this._requestMissingColumnsWithoutIgnore(oJsonColumnKeys));

		this._callControllers(this._oSettingCurrent, "setBeforeOpenData2Model", this._getControlDataBase());
		// controlData-> controlDataReduce
		this._callControllers(this._oSettingCurrent, "calculateControlDataReduce");

		// we assume at this point that the binding is done !!
		var oJson = this._callControllers(this._oSettingCurrent, "getTable2JsonTransient", oJsonColumnKeys);
		this._callControllers(this._oSettingCurrent, "calculateTransientData", oJson);
	};
	Controller.prototype._postDialogUi = function(oJsonNew) {
		// 'controlDataReduce' is up-to-date due to the binding. Distribute now the new data to dependent data.
		this._callControllers(this._oSettingCurrent, "updateControlDataBaseFromJson", oJsonNew);

		this._callControllers(this._oSettingCurrent, "setBeforeOpenData2Model", undefined);
		this._callControllers(this._oSettingCurrent, "setControlDataReduce2Model", undefined);
		this._callControllers(this._oSettingCurrent, "setTransientData2Model", undefined);
	};
	Controller.prototype._syncDialogUi = function() {
		this._callControllers(this._oSettingCurrent, "calculateControlDataReduce");
	};
	Controller.prototype._syncTableUi = function() {
		this._callControllers(this._oSettingCurrent, "calculateControlData");
		// notice we need to update the Table directly since the metadata is not bound
		this._callControllers(this._oSettingCurrent, "syncJson2Table", this._getControlData());
	};
	Controller.prototype._resetFull = function() {
		this._setVariantData(undefined);
		this._callControllers(this._oSettingCurrent, "setControlDataBase2Model", this._getControlDataInitial());
	};
	Controller.prototype._resetPartial = function() {
		this._callControllers(this._oSettingCurrent, "setControlDataBase2Model", this._getVariantDataInitial());
	};

	/**
	 * Fire 'afterP13nModelDataChange' event with model data and change information.
	 *
	 * @param {sap.ui.comp.personalization.ResetType} sResetType is optional. Contains the reason why it has been changed
	 */
	Controller.prototype._fireChangeEvent = function(sResetType) {
		sResetType = this._determineResetType(sResetType);

		var oChangeInformation = {};
		// note that oControlDataTotal semantically equals 'oRuntimeDataTotal' ! (i.e. table / chart ...)
		var oControlDataTotal = this._callControllers(this._oSettingCurrent, "getUnionData", this._getControlDataInitial(), this._getControlData());
		// Note that .runtimeDeltaDataChangeType is also really semantically .changeTypeAlreadyKnown
		oChangeInformation.runtimeDeltaDataChangeType = this._callControllers(this._oSettingCurrent, "getChangeType", oControlDataTotal, this._getAlreadyKnownRuntimeData());
		var oControlDataBaseTotal = this._callControllers(this._oSettingCurrent, "getUnionData", this._getControlDataInitial(), this._getControlDataBase());
		oChangeInformation.persistentDeltaDataChangeType = this._callControllers(this._oSettingCurrent, "getChangeType", oControlDataBaseTotal, this._getAlreadyKnownPersistentData());

		// note that dirty means if there are changes to the last set 'clean' state
		if (sResetType === sap.ui.comp.personalization.ResetType.ResetFull) {
			// we care about the change compared to initial
			oChangeInformation.persistentDataChangeType = this._callControllers(this._oSettingCurrent, "getChangeType", this._getControlDataBase(), this._getControlDataInitial());
		} else if (sResetType === sap.ui.comp.personalization.ResetType.ResetPartial) {
			// we care about the change compared to the current active variant (could also be STANDARD)
			oChangeInformation.persistentDataChangeType = this._callControllers(this._oSettingCurrent, "getChangeType", this._getControlDataBase(), this._getVariantDataInitial());
		}
		this._bIsDirty = Util.hasChangedType(oChangeInformation.persistentDataChangeType);

		if (!Util.hasChangedType(oChangeInformation.runtimeDeltaDataChangeType) && !Util.hasChangedType(oChangeInformation.persistentDeltaDataChangeType)) {
			return;
		}

		this._aColumnKeysOfDateType = Util.getColumnKeysOfType("date", this._oColumnHelper.getColumnMap());
		this._aColumnKeysOfTimeType = Util.getColumnKeysOfType("time", this._oColumnHelper.getColumnMap());
		this._aColumnKeysOfBooleanType = Util.getColumnKeysOfType("boolean", this._oColumnHelper.getColumnMap());

		// New data compare to the last AlreadyKnown
		// note that oControlDataDelta semantically equals 'oRuntimeDataTotal' ! (i.e. table / chart ...)
		var oControlDataDelta = this._callControllers(this._oSettingCurrent, "getChangeData", oControlDataTotal, this._getAlreadyKnownRuntimeData());
		oChangeInformation.runtimeDeltaData = Util.removeEmptyProperty(Util.copy(oControlDataDelta));
		Util.recoverPersonalisationDateData(oChangeInformation.runtimeDeltaData, this._aColumnKeysOfDateType);
		Util.recoverPersonalisationTimeData(oChangeInformation.runtimeDeltaData, this._aColumnKeysOfTimeType);
		Util.recoverPersonalisationBooleanData(oChangeInformation.runtimeDeltaData, this._aColumnKeysOfBooleanType);

		// oPersistentData = oPersistentDataTotal - oControlDataInitial, oPersistentDataTotal = oControlDataBase + oControlDataInitial
		var oPersistentData = this._callControllers(this._oSettingCurrent, "getChangeData", this._getControlDataBase(), this._getControlDataInitial());
		oChangeInformation.persistentData = Util.removeEmptyProperty(oPersistentData);
		Util.recoverPersonalisationDateData(oChangeInformation.persistentData, this._aColumnKeysOfDateType);
		Util.recoverPersonalisationTimeData(oChangeInformation.persistentData, this._aColumnKeysOfTimeType);
		Util.recoverPersonalisationBooleanData(oChangeInformation.persistentData, this._aColumnKeysOfBooleanType);

		// at the moment we do not expose this information !
		delete oChangeInformation.persistentDeltaDataChangeType;

		this.fireAfterP13nModelDataChange(oChangeInformation);

		// the below call can be safely replaced with
		// this._callControllers(this._oSettingCurrent, "setAlreadyKnownRuntimeData2Model", oControlDataTotal);
		// since oControlDataTotal only contains additional stuff that the consumer initially know and use
		// to instantiate the personalization controller
		this._callControllers(this._oSettingCurrent, "setAlreadyKnownRuntimeData2Model", this._getControlData());
		this._callControllers(this._oSettingCurrent, "setAlreadyKnownPersistentData2Model", this._getControlDataBase());
	};

	Controller.prototype._onSetVisible = function(bVisible, sColumnKey) {
		if (bVisible) {
			var aIgnoredColumnKeys = Util.getUnionOfAttribute(this._oSettingCurrent, "ignoreColumnKeys");
			if (aIgnoredColumnKeys.indexOf(sColumnKey) > -1) {
				throw "The provided 'ignoreColumnKeys' are inconsistent. No column specified as ignored is allowed to be visible. " + this;
			}
		}
	};
	Controller.prototype._onSetSummed = function(bIsSummed, oColumn) {
		this._oSettingCurrent.columns.controller._onColumnTotal({
			column: oColumn,
			isSummed: bIsSummed
		});
	};

	/**
	 * Gets arguments of corresponding type.
	 *
	 * @param {array} aArgs contains all arguments in which the search for type is done
	 * @param {string} sType is the type for which the search is done
	 * @returns {array} aResult contains the identified arguments
	 */
	Controller.prototype._getArgumentsByType = function(aArgs, sType) {
		var aResult = [], oObject = null;
		if (aArgs && aArgs.length && sType) {
			aArgs.forEach(function(oArg) {
				if (oArg && oArg[sType] && typeof oArg[sType] !== "function") {
					oObject = {};
					oObject[sType] = oArg[sType];
					aResult.push(oObject);
				} else {
					aResult.push(oArg);
				}
			});
		}
		return aResult;
	};

	/**
	 * Calls a method "sMethodName" of all controllers in generic way.
	 *
	 * @param {string} oSettings contains additional setting for execution of mini-controller methods
	 * @param {string} sMethodName that is executed in the mini-controller
	 * @returns {object} oResult contains the result of the called mini-controller method packaged into mini-controller specific namespace.
	 */
	Controller.prototype._callControllers = function(oSettings, sMethodName) {
		var oSetting, oController, aArgsPartially;
		var oResults = {}, aArgs = Array.prototype.slice.call(arguments, 2);

		for ( var sType in oSettings) {
			oSetting = oController = aArgsPartially = null;

			oSetting = oSettings[sType];
			oController = oSetting.controller;
			if (!oController || !oSetting.visible || !oController[sMethodName]) {
				continue;
			}
			aArgsPartially = this._getArgumentsByType(aArgs, sType);
			if (sMethodName === "getPanel") {
				aArgsPartially.push(oSetting.payload);
			} else if (sMethodName === "setIgnoreColumnKeys") {
				aArgsPartially.push(oSetting.ignoreColumnKeys);
			} else if (sMethodName === "setTriggerModelChangeOnColumnInvisible") {
				aArgsPartially.push(oSetting.triggerModelChangeOnColumnInvisible);
			}
			var oResult = oController[sMethodName].apply(oController, aArgsPartially);
			if (oResult !== null && oResult !== undefined && oResult[sType] !== undefined) {
				oResults[sType] = oResult[sType];
			} else {
				oResults[sType] = oResult;
			}
		}
		return oResults;
	};

	Controller.prototype._sanityCheck = function(oJsonNew) {
		// TODO: sanity check
		// Only allow the right format e.g. "sort.sortItems" but not "sort".
		// {} is also allowed i.e. all personalization data are deleted.
		// null is also allowed i.e. go back to restore
		return true;
	};

	Controller.prototype._createInternalModel = function(aColumnKeys) {
		var oModel = new JSONModel();
		oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		if (aColumnKeys.length) {
			oModel.setSizeLimit(aColumnKeys.length);
		}
		this.setModel(oModel, "$sapuicomppersonalizationBaseController");
		return oModel;
	};
	Controller.prototype._getInternalModel = function() {
		return this.getModel("$sapuicomppersonalizationBaseController");
	};
	Controller.prototype._getInternalModelData = function(sDataName) {
		return this._getInternalModel().getProperty("/" + sDataName);
	};
	Controller.prototype._getControlDataInitial = function() {
		return this._getInternalModelData("controlDataInitial");
	};
	Controller.prototype._getControlDataBase = function() {
		return this._getInternalModelData("controlDataBase");
	};
	Controller.prototype._getIgnoreData = function() {
		return this._getInternalModelData("ignoreData");
	};
	Controller.prototype._getControlData = function() {
		return this._getInternalModelData("controlData");
	};
	Controller.prototype._getControlDataReduce = function() {
		return this._getInternalModelData("controlDataReduce");
	};
	Controller.prototype._getTransientData = function() {
		return this._getInternalModelData("transientData");
	};
	Controller.prototype._getAlreadyKnownRuntimeData = function() {
		return this._getInternalModelData("alreadyKnownRuntimeData");
	};
	Controller.prototype._getAlreadyKnownPersistentData = function() {
		return this._getInternalModelData("alreadyKnownPersistentData");
	};
	Controller.prototype._getVariantDataInitial = function() {
		return this._getInternalModelData("variantDataInitial");
	};
	Controller.prototype._getBeforeOpenData = function() {
		return this._getInternalModelData("beforeOpenData");
	};

	Controller.prototype._setVariantData = function(oJson) {
		this._getInternalModel().setProperty("/variantData", oJson ? Util.copy(oJson) : undefined);
	};

	Controller.prototype._getVariantData = function() {
		return this._getInternalModel().getProperty("/variantData");
	};

	Controller.prototype._getControllers = function() {
		return this._oSettingCurrent;
	};

	Controller.prototype._controllerFactory = function(sType) {
		var that = this;
		switch (sType) {
			case sap.m.P13nPanelType.columns:
				return new ColumnsController({
					afterColumnsModelDataChange: function() {
						that._fireChangeEvent();
					},
					beforePotentialTableChange: function() {
						that.fireBeforePotentialTableChange();
					},
					afterPotentialTableChange: function() {
						that.fireAfterPotentialTableChange();
					}
				});
			case sap.m.P13nPanelType.sort:
				return new SortController({
					afterSortModelDataChange: function() {
						that._fireChangeEvent();
					},
					beforePotentialTableChange: function() {
						that.fireBeforePotentialTableChange();
					},
					afterPotentialTableChange: function() {
						that.fireAfterPotentialTableChange();
					}
				});
			case sap.m.P13nPanelType.filter:
				return new FilterController({
					afterFilterModelDataChange: function() {
						that._fireChangeEvent();
					},
					beforePotentialTableChange: function() {
						that.fireBeforePotentialTableChange();
					},
					afterPotentialTableChange: function() {
						that.fireAfterPotentialTableChange();
					}
				});
			case sap.m.P13nPanelType.group:
				return new GroupController({
					afterGroupModelDataChange: function() {
						that._fireChangeEvent();
					},
					beforePotentialTableChange: function() {
						that.fireBeforePotentialTableChange();
					},
					afterPotentialTableChange: function() {
						that.fireAfterPotentialTableChange();
					}
				});
			case sap.m.P13nPanelType.dimeasure:
				return new DimeasureController({
					afterDimeasureModelDataChange: function() {
						that._fireChangeEvent();
					},
					beforePotentialTableChange: function() {
						that.fireBeforePotentialTableChange();
					},
					afterPotentialTableChange: function() {
						that.fireAfterPotentialTableChange();
					}
				});
			case sap.m.P13nPanelType.selection:
				return new SelectionController({
					afterSelectionModelDataChange: function() {
						that._fireChangeEvent();
					},
					beforePotentialTableChange: function() {
						that.fireBeforePotentialTableChange();
					},
					afterPotentialTableChange: function() {
						that.fireAfterPotentialTableChange();
					}
				});
			default:
				throw "Panel type '" + sType + "' is not valid";
		}
	};
	Controller.prototype.getTable = function() {
		var oTable = this.getAssociation("table");
		if (typeof oTable === "string") {
			oTable = sap.ui.getCore().byId(oTable);
		}
		return oTable;
	};

	/**
	 * Cleans up before destruction.
	 */
	Controller.prototype.exit = function() {
		var sType;

		// if for some reason we exit when suspended we should put table back into resume mode
		this._resumeTable(false);

		// destroy dialog
		if (this._oDialog) {
			this._oDialog.destroy();
			this._oDialog = null;
		}

		// destroy controllers
		this._callControllers(this._oSettingCurrent, "destroy");
		for (sType in this._oSettingCurrent) {
			this._oSettingCurrent[sType] = null;
		}
		this._oSettingCurrent = null;
		this._oColumnHelper = null;
	};

	Controller.prototype._determineResetType = function(sResetType) {
		sResetType = sResetType || this.getResetToInitialTableState() ? sap.ui.comp.personalization.ResetType.ResetFull : sap.ui.comp.personalization.ResetType.ResetPartial;
		if (sResetType === sap.ui.comp.personalization.ResetType.ResetFull || this._getVariantData() === undefined) {
			return sap.ui.comp.personalization.ResetType.ResetFull;
		}
		return sap.ui.comp.personalization.ResetType.ResetPartial;

	};

	Controller.SyncReason = {
		ResetFull: 14,
		ResetPartial: 15,

		NewModelDataMixedWithVariant: 7
	};

	/* eslint-enable strict */

	return Controller;

}, /* bExport= */true);
