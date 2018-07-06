/* eslint-disable strict */

/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */

// Provides BaseController
sap.ui.define([
	'sap/ui/base/ManagedObject', './Util', './ColumnHelper'
], function(ManagedObject, Util, ColumnHelper) {
	"use strict";

	/**
	 * The BaseController is a base class for personalization Controller like e.g. FilterController, SortController etc. *
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class An abstract class for personalization Controllers.
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version 1.25.0-SNAPSHOT
	 * @constructor
	 * @private
	 * @abstract
	 * @since 1.28.0
	 * @alias sap.ui.comp.personalization.BaseController
	 */
	var BaseController = ManagedObject.extend("sap.ui.comp.personalization.BaseController", /** @lends sap.ui.comp.personalization.BaseController */
	{
		metadata: {
			"abstract": true,
			library: "sap.ui.comp",
			properties: {
				/**
				 * Controller type for generic use. Due to extensibility reason the type of "type" property should be "string". So it is feasible to
				 * add a custom controller without expanding the type. The type is also used as namespace for Json model.
				 */
				type: {
					type: "string",
					defaultValue: null
				},
				/**
				 * The itemType is used in Json model.
				 */
				itemType: {
					type: "string",
					defaultValue: null
				},
				/**
				 * @since 1.32.0
				 */
				ignoreColumnKeys: {
					type: "object",
					defaultValue: []
				},
				/**
				 * @since 1.54.0
				 */
				additionalIgnoreColumnKeys: {
					type: "object",
					defaultValue: []
				},
				/**
				 * ColumnHelper object.
				 */
				columnHelper: {
					type: "sap.ui.comp.personalization.ColumnHelper",
					defaultValue: null
				},
				/**
				 * Once the <code>columnKeys</code> is passed it must contain all possible column keys. The order of the column keys is taken into account.
				 * <bold>Note</bold>: this property is not allowed to be changed afterwards.
				 */
				columnKeys: {
					type: "string[]",
					defaultValue: []
				},
				tableType: {
					type: "string",
					defaultValue: null
				}
			},
			associations: {
				/**
				 * Table for which settings are applied.
				 */
				table: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			events: {
				/**
				 * Event is raised before potential change on table will be applied.
				 */
				beforePotentialTableChange: {},
				/**
				 * Event is raised after potential change on table has be applied.
				 */
				afterPotentialTableChange: {}
			}
		}
	});

	BaseController.prototype.exit = function() {
		if (this.getModel()) {
			this.getModel().destroy();
		}
	};

	/**
	 * Load data - used for lazy loading
	 *
	 * @protected
	 * @returns {function} to set the model data
	 */
	BaseController.prototype.setModelFunction = function() {
		var that = this;
		return function() {
			if (!this.getModel("$sapmP13nPanel")) {
				this.setModel(that.getInternalModel(), "$sapmP13nPanel");
			}
		};
	};
	BaseController.prototype.setTable = function(oTable) {
		this.setAssociation("table", oTable);
		this.setTableType(Util.getTableType(this.getTable()));
		return this;
	};
	BaseController.prototype.getTable = function() {
		var oTable = this.getAssociation("table");
		if (typeof oTable === "string") {
			oTable = sap.ui.getCore().byId(oTable);
		}
		return oTable;
	};
	BaseController.prototype.getColumnMap = function() {
		return this.getColumnHelper().getColumnMap();
	};
	BaseController.prototype.createControlDataStructure = function(aItems) {
		aItems = aItems || [];
		var oJson = {};
		oJson[this.getType()] = {};
		oJson[this.getType()][this.getItemType()] = aItems;
		return oJson;
	};
	BaseController.prototype.createColumnKeysStructure = function(aColumnKeys) {
		aColumnKeys = aColumnKeys || [];
		var oJsonColumnKeys = {};
		oJsonColumnKeys[this.getType()] = {};
		oJsonColumnKeys[this.getType()][this.getItemType()] = aColumnKeys.map(function(sColumnKey) {
			return {
				columnKey: sColumnKey
			};
		});
		return oJsonColumnKeys;
	};
	BaseController.prototype.checkConsistencyOfIgnoreColumnKeys = function() {
		var oColumnKey2ColumnMap = this.getColumnMap();
		this.getIgnoreColumnKeys().some(function(sColumnKey) {
			if (oColumnKey2ColumnMap[sColumnKey] && oColumnKey2ColumnMap[sColumnKey].getVisible()) {
				throw "The provided 'ignoreColumnKeys' for '" + this.getType() + "' are inconsistent. No columns specified as ignored is allowed to be visible.";
			}
		}, this);
	};

	BaseController.prototype.initializeInternalModel = function(oModel) {
		// 'controlDataInitial' is equivalent to the metadata
		// 'controlDataBase'    table data before ignore was called
		// 'controlData'        table data with visible=false for ignored(runtime data)
		// 'controlDataReduce'  'controlData' without ignored columns, relevant only during the P13nDialog is opened
		// 'transientData'      'controlData' without ignored columns
		// 'ignoreData'         the sum of ignoreColumnKeys and additionalIgnoreColumnKeys
		// 'alreadyKnownRuntimeData'
		// 'alreadyKnownPersistentData'
		// 'beforeOpenData'
		// 'variantDataInitial'  'controlDataInitial' + 'variantData'
		// 'variantData'         variant passed to controller (setPersonalizationData) - set in controller

		// Create property with controlDataStructure
		[
			"controlDataInitial", "controlDataBase", "controlData", "alreadyKnownRuntimeData", "alreadyKnownPersistentData"
		].forEach(function(sPropertyName) {
			if (!oModel.getProperty("/" + sPropertyName)) {
				oModel.setProperty("/" + sPropertyName, {});
			}
			oModel.setProperty("/" + sPropertyName + "/" + this.getType(), this.createControlDataStructure()[this.getType()]);
		}, this);

		// Create property with columnKeysStructure
		[
			"ignoreData"
		].forEach(function(sPropertyName) {
			if (!oModel.getProperty("/" + sPropertyName)) {
				oModel.setProperty("/" + sPropertyName, {});
			}
			oModel.setProperty("/" + sPropertyName + "/" + this.getType(), this.createColumnKeysStructure()[this.getType()]);
		}, this);

		// Create property with 'undefined' value
		[
			"controlDataReduce", "transientData", "beforeOpenData", "variantDataInitial"
		].forEach(function(sPropertyName) {
			if (!oModel.getProperty("/" + sPropertyName)) {
				oModel.setProperty("/" + sPropertyName, undefined);
			}
		});
		this.setModel(oModel, "$sapuicomppersonalizationBaseController");
	};
	BaseController.prototype._extendPropertyWithControlDataStructure = function(sPropertyName) {
		var oModel = this.getInternalModel();
		if (oModel.getProperty("/" + sPropertyName)) {
			return;
		}
		oModel.setProperty("/" + sPropertyName, {});
		oModel.setProperty("/" + sPropertyName + "/" + this.getType(), this.createControlDataStructure()[this.getType()]);
	};
	BaseController.prototype.getInternalModel = function() {
		return this.getModel("$sapuicomppersonalizationBaseController");
	};

	// -------------------- Calculate -----------------------------------------------------------

	BaseController.prototype.calculateIgnoreData = function() {
		var aIgnoreColumnKeysTotal = this.getIgnoreColumnKeys().concat(this.getAdditionalIgnoreColumnKeys());
		aIgnoreColumnKeysTotal = aIgnoreColumnKeysTotal.filter(function(sColumnKey, iIndex) {
			// Avoid duplicate columnKeys
			return aIgnoreColumnKeysTotal.indexOf(sColumnKey) === iIndex;
		});
		var oJsonColumnKeys = this.createColumnKeysStructure(aIgnoreColumnKeysTotal);
		this.setIgnoreData2Model(oJsonColumnKeys);
	};
	BaseController.prototype.calculateControlData = function() {
		var oJson = Util.copy(this.getControlDataBase());
		this._deselectIgnoreDataFromJson(oJson);
		this.setControlData2Model(oJson);
	};
	BaseController.prototype.calculateControlDataReduce = function() {
		var oJson = Util.copy(this.getControlDataBase());
		this._removeIgnoreDataFromJson(oJson);
		this.setControlDataReduce2Model(oJson);
	};
	BaseController.prototype.calculateTransientData = function(oJson) {
		oJson = Util.copy(oJson);
		this._removeIgnoreDataFromJson(oJson);
		this.setTransientData2Model(oJson);
	};
	BaseController.prototype._removeIgnoreDataFromJson = function(oJson) {
		if (!this.getIgnoreData()[this.getType()]) {
			return;
		}
		this.getIgnoreData()[this.getType()][this.getItemType()].forEach(function(oIgnoreItem) {
			var iIndex = Util.getIndexByKey("columnKey", oIgnoreItem.columnKey, oJson[this.getType()][this.getItemType()]);
			if (iIndex > -1) {
				oJson[this.getType()][this.getItemType()].splice(iIndex, 1);
			}
		}, this);
	};
	BaseController.prototype._deselectIgnoreDataFromJson = function(oJson) {
		if (!this.getIgnoreData()[this.getType()]) {
			return;
		}
		this.getIgnoreData()[this.getType()][this.getItemType()].forEach(function(oIgnoreItem) {
			var iIndex = Util.getIndexByKey("columnKey", oIgnoreItem.columnKey, oJson[this.getType()][this.getItemType()]);
			if (iIndex > -1) {
				this.handleIgnore(oJson, iIndex);
			}
		}, this);
	};

	// -------------------- Update -----------------------------------------------------------

	/**
	 * Filtering out all ignored items from oJson and updating the not ignored items of 'controlDataBase'. The ignored items of 'controlDataBase' remain untouched.
	 *
	 * In case of ColumnsController we assume that the number of the columns can not increase.
	 * In case of SortController we assume that sort items can be overwritten. So if column A and B is sorted and user sorts column C
	 * then 'controlDataBase' will contain at the end only C.
	 *
	 * In ignore case we do not want to remove ignore items from 'controlDataBase'.
	 *
	 * oJson:           |-not ignore-|-ignore-|
	 * controlDataBase: |---not ignore---|---ignore---|
	 * ------------------------------------------------------
	 * controlDataBase: |-not ignore-|---ignore---|
	 *                        |            |
	 *                        v            |
	 *                take not ignore      |
	 *                from 'oJson'         v
	 *                                take ignore from
	 *                                'controlDataBase'
	 * @param oJson
	 */
	BaseController.prototype.updateControlDataBaseFromJson = function(oJson) {
		var oIgnoreData = this.getIgnoreData();
		var oBaseOnlyIgnore = Util.copy(this.getControlDataBase());
		var oBaseWithoutIgnore = Util.copy(this.getControlDataBase());
		var oJsonWithoutIgnore = Util.copy(oJson);

		oBaseOnlyIgnore[this.getType()][this.getItemType()] = this.getControlDataBase()[this.getType()][this.getItemType()].filter(function(oItem) {
			return Util.getIndexByKey("columnKey", oItem.columnKey, oIgnoreData[this.getType()][this.getItemType()]) > -1;
		}, this);

		oJsonWithoutIgnore[this.getType()][this.getItemType()] = oJson[this.getType()][this.getItemType()].filter(function(oItem) {
			return Util.getIndexByKey("columnKey", oItem.columnKey, oIgnoreData[this.getType()][this.getItemType()]) < 0;
		}, this);

		oBaseWithoutIgnore[this.getType()][this.getItemType()] = oJsonWithoutIgnore[this.getType()][this.getItemType()];

		// Check consistency
		if (this.getType() === "columns") {
			if (oBaseWithoutIgnore[this.getType()][this.getItemType()].length !== oJsonWithoutIgnore[this.getType()][this.getItemType()].length) {
				throw "the updated columns are inconsistent with 'controlDataBase'";
			}
			oBaseWithoutIgnore[this.getType()][this.getItemType()].some(function(oItem) {
				if (Util.getIndexByKey("columnKey", oItem.columnKey, oJsonWithoutIgnore[this.getType()][this.getItemType()]) < 0) {
					throw "the columnKey '" + oItem.columnKey + "' is not contained in 'controlDataBase'";
				}
			}, this);
		}

		var oBase = Util.copy(this.getControlDataBase());
		oBase[this.getType()][this.getItemType()] = oBaseWithoutIgnore[this.getType()][this.getItemType()].concat(oBaseOnlyIgnore[this.getType()][this.getItemType()]);
		Object.keys(oBase[this.getType()]).forEach(function(sAttribute) {
			if (!jQuery.isArray(oBase[this.getType()][sAttribute])) {
				oBase[this.getType()][sAttribute] = oJson[this.getType()][sAttribute];
			}
		}, this);

		this.setControlDataBase2Model(oBase);
	};

	// -------------------- Extend -----------------------------------------------------------

	BaseController.prototype.extendControlDataInitial = function(oJson) {
		this._extendData("controlDataInitial", oJson);
	};
	BaseController.prototype.extendControlDataBase = function(oJson) {
		this._extendData("controlDataBase", oJson);
	};
	BaseController.prototype.extendVariantDataInitial = function(oJson) {
		this._extendData("variantDataInitial", oJson);
	};
	BaseController.prototype.extendAlreadyKnownRuntimeData = function(oJson) {
		this._extendData("alreadyKnownRuntimeData", oJson);
	};
	BaseController.prototype.extendAlreadyKnownPersistentData = function(oJson) {
		this._extendData("alreadyKnownPersistentData", oJson);
	};
	BaseController.prototype._extendData = function(sPropertyName, oJson) {
		if (!oJson || !oJson[this.getType()] || !this._getInternalModelData(sPropertyName)) {
			return;
		}
		var oJsonCopy = Util.copy(oJson);
		var oModel = this.getInternalModel();
		Object.keys(oJsonCopy[this.getType()]).forEach(function(sAttribute) {
			if (jQuery.isArray(oJsonCopy[this.getType()][sAttribute])) {
				oJsonCopy[this.getType()][sAttribute].forEach(function(oItem) {
					var aItems = this._getInternalModelData(sPropertyName)[this.getType()][sAttribute];
					if (Util.getIndexByKey("columnKey", oItem.columnKey, aItems) > -1) {
						throw "columnKey '" + oItem.columnKey + "' does already exist in internal model";
					}
					oModel.setProperty("/" + sPropertyName + "/" + this.getType() + "/" + sAttribute + "/" + aItems.length + "/", oItem);
				}, this);
				return;
			}
			oModel.setProperty("/" + sPropertyName + "/" + this.getType() + "/" + sAttribute + "/", oJsonCopy[this.getType()][sAttribute]);
		}, this);
	};

	// -------------------- Setter -----------------------------------------------------------

	BaseController.prototype.setControlDataInitial2Model = function(oJson) {
		this._setModelData("controlDataInitial", oJson);
	};
	BaseController.prototype.setControlDataBase2Model = function(oJson) {
		this._setModelData("controlDataBase", oJson);
	};
	BaseController.prototype.setControlData2Model = function(oJson) {
		this._setModelData("controlData", oJson);
	};
	BaseController.prototype.setAlreadyKnownRuntimeData2Model = function(oJson) {
		this._setModelData("alreadyKnownRuntimeData", oJson);
	};
	BaseController.prototype.setAlreadyKnownPersistentData2Model = function(oJson) {
		this._setModelData("alreadyKnownPersistentData", oJson);
	};
	BaseController.prototype.setVariantDataInitial2Model = function(oJson) {
		this._extendPropertyWithControlDataStructure("variantDataInitial");
		this._setModelData("variantDataInitial", oJson);
	};
	BaseController.prototype.setIgnoreData2Model = function(oJson) {
		this._setModelData("ignoreData", oJson);
	};
	BaseController.prototype.setControlDataReduce2Model = function(oJson) {
		this._extendPropertyWithControlDataStructure("controlDataReduce");
		this._setModelData("controlDataReduce", oJson);
	};
	BaseController.prototype.setTransientData2Model = function(oJson) {
		this._extendPropertyWithControlDataStructure("transientData");
		this._setModelData("transientData", oJson);
	};
	BaseController.prototype.setBeforeOpenData2Model = function(oJson) {
		this._extendPropertyWithControlDataStructure("beforeOpenData");
		this._setModelData("beforeOpenData", oJson);
	};
	BaseController.prototype._setModelData = function(sPropertyName, oJson) {
		// sPropertyName is name of model property e.g. 'transientData', 'controlDataBase', 'controlData', 'controlDataReduce'
		this.getInternalModel().setProperty("/" + sPropertyName + "/" + this.getType(), (oJson ? Util.copy(oJson)[this.getType()] : undefined));
	};

	// -------------------- Getter -----------------------------------------------------------

	BaseController.prototype.getControlDataInitial = function() {
		return this._getInternalModelData("controlDataInitial");
	};
	BaseController.prototype.getControlDataBase = function() {
		return this._getInternalModelData("controlDataBase");
	};
	BaseController.prototype.getControlData = function() {
		return this._getInternalModelData("controlData");
	};
	BaseController.prototype.getAlreadyKnownRuntimeData = function() {
		return this._getInternalModelData("alreadyKnownRuntimeData");
	};
	BaseController.prototype.getAlreadyKnownPersistentData = function() {
		return this._getInternalModelData("alreadyKnownPersistentData");
	};
	BaseController.prototype.getVariantDataInitial = function() {
		return this._getInternalModelData("variantDataInitial");
	};
	BaseController.prototype.getIgnoreData = function() {
		return this._getInternalModelData("ignoreData");
	};
	BaseController.prototype.getControlDataReduce = function() {
		return this._getInternalModelData("controlDataReduce");
	};
	BaseController.prototype.getTransientData = function() {
		return this._getInternalModelData("transientData");
	};
	BaseController.prototype.getBeforeOpenData = function() {
		return this._getInternalModelData("beforeOpenData");
	};
	BaseController.prototype._getInternalModelData = function(sPropertyName) {
		return this.getInternalModel().getProperty("/" + sPropertyName);
	};

	// -------------------- ------ -----------------------------------------------------------

	BaseController.prototype.determineMissingColumnKeys = function(oJson) {
		if (!oJson || !oJson[this.getType()] || !oJson[this.getType()][this.getItemType()]) {
			return this.createColumnKeysStructure();
		}
		var oColumnKey2ColumnMap = this.getColumnMap();
		var oIgnoreData = this.getIgnoreData();

		// Take all missing columnKeys based on 'columnKey2ColumnMap'.
		// Then remove columnKeys which are part of ignoreData.
		var aMissingColumnKeys = oJson[this.getType()][this.getItemType()].filter(function(oItem) {
			return !oColumnKey2ColumnMap[oItem.columnKey];
		}).filter(function(oItem) {
			return Util.getIndexByKey("columnKey", oItem.columnKey, oIgnoreData[this.getType()][this.getItemType()]) < 0;
		}, this).map(function(oItem) {
			return oItem.columnKey;
		});
		return this.createColumnKeysStructure(aMissingColumnKeys);
	};

	BaseController.prototype.extractIgnoreDataFromJson = function(oJson) {
		if (!oJson || !oJson[this.getType()] || !oJson[this.getType()][this.getItemType()]) {
			return null;
		}
		var oJsonWithIgnoreData = this.createControlDataStructure();
		var oIgnoreData = this.getIgnoreData();
		oJsonWithIgnoreData[this.getType()][this.getItemType()] = oJson[this.getType()][this.getItemType()].filter(function(oMItem) {
			return Util.getIndexByKey("columnKey", oMItem.columnKey, oIgnoreData[this.getType()][this.getItemType()]) > -1;
		}, this);
		return oJsonWithIgnoreData;
	};

	/**
	 * this method will make a complete json snapshot of the current table instance ("original") from the perspective of the columns controller; the
	 * json snapshot can later be applied to any table instance to recover all columns related infos of the "original" table TODO: This really only
	 * works for when max 1 sort criteria is defined since otherwise potentially order of sort criteria is destroyed
	 */
	BaseController.prototype.getTable2Json = function(oJsonColumnKeys) {
		var oJsonData = this.createControlDataStructure();
		var oColumnKey2ColumnMap = this.getColumnMap(); // We have to include ignored fields into 'controlData'
		var aColumnKeys = this.getColumnKeys();

		oJsonColumnKeys[this.getType()][this.getItemType()].forEach(function(oColumnKey) {
			var oColumn = oColumnKey2ColumnMap[oColumnKey.columnKey];
			if (!oColumn) {
				// cf. incident 1880156806 - when a column was in a variant but this column was not in the specified columnKeys
				// and not part of ignored then we would run into this condition - however, throwing an exception is a bit hard
				// since existing / previous variants would then no longer be usable - therefore, we change an exception to a
				// warning.
				jQuery.sap.log.warning("Column with columnKey '" + oColumnKey.columnKey + "' does not exist.");
				return;
			}
			var oMItem = this.getColumn2Json(oColumn, oColumnKey.columnKey, aColumnKeys.indexOf(oColumnKey.columnKey));
			if (oMItem) {
				oJsonData[this.getType()][this.getItemType()].push(oMItem);
			}
		}, this);
		this.getAdditionalData2Json(oJsonData, this.getTable());
		return oJsonData;
	};
	BaseController.prototype.getTable2JsonTransient = function(oJsonColumnKeys) {
		var oJsonData = this.createControlDataStructure();
		var oColumnKey2ColumnMap = this.getColumnMap(); // We have to include ignored fields into 'controlData'
		var sText, sTooltip;

		oJsonColumnKeys[this.getType()][this.getItemType()].forEach(function(oColumnKey) {
			var oColumn = oColumnKey2ColumnMap[oColumnKey.columnKey];
			if (!oColumn) {
				return;
				// throw "Column with columnKey '" + oColumnKey.columnKey + "' does not exist.";
			}
			var sColumnBaseType = Util.getColumnBaseType(oColumn);
			if (sColumnBaseType === sap.ui.comp.personalization.ColumnType.TableColumn) {
				if (!oColumn.getLabel()) {
					throw "The column '" + oColumnKey.columnKey + "' should have a 'label' aggregation otherwise the column can not be identified in the personalization dialog.";
				}
				sText = oColumn.getLabel().getText();
				sTooltip = (oColumn.getTooltip() instanceof sap.ui.core.TooltipBase) ? oColumn.getTooltip().getTooltip_Text() : oColumn.getTooltip_Text();
			}
			if (sColumnBaseType === sap.ui.comp.personalization.ColumnType.ResponsiveColumn) {
				if (!oColumn.getHeader()) {
					throw "The column '" + oColumnKey.columnKey + "' should have a 'header' aggregation otherwise the column can not be identified in the personalization dialog.";
				}
				sText = oColumn.getHeader().getText();
				sTooltip = (oColumn.getHeader().getTooltip() instanceof sap.ui.core.TooltipBase) ? oColumn.getHeader().getTooltip().getTooltip_Text() : oColumn.getHeader().getTooltip_Text();
			}
			if (sColumnBaseType === sap.ui.comp.personalization.ColumnType.ColumnWrapper) {
				if (!oColumn.getLabel()) {
					throw "The column '" + oColumnKey.columnKey + "' should have a 'label' aggregation otherwise the column can not be identified in the personalization dialog.";
				}
				sText = oColumn.getLabel();
				sTooltip = (oColumn.getTooltip() instanceof sap.ui.core.TooltipBase) ? oColumn.getTooltip().getTooltip_Text() : oColumn.getTooltip_Text();
			}
			var oMItem = this.getColumn2JsonTransient(oColumn, oColumnKey.columnKey, sText, sTooltip);
			if (oMItem) {
				oJsonData[this.getType()][this.getItemType()].push(oMItem);
			}
		}, this);
		Util.sortItemsByText(oJsonData[this.getType()][this.getItemType()], "text");
		return oJsonData;
	};
	BaseController.prototype.getColumn2Json = function(oColumn, sColumnKey, iIndex) {
	};
	BaseController.prototype.getAdditionalData2Json = function(oJsonData, oTable) {
	};
	BaseController.prototype.getColumn2JsonTransient = function(oColumn, sColumnKey) {
	};
	BaseController.prototype.handleIgnore = function(oJson, iIndex) {
	};
	/**
	 * In case that an ignore column has same index as another column we have to resolve this conflict situation. We do it
	 * by moving the ignore column directly behind the other column. oJson can contain conflicting indices - to resolve these
	 * we assume that only columnKeys of oJsonIgnore are relevant (performance optimization) and we assume that whatever index
	 * we find in oJsonBase should be left as is. Furthermore, we assume that there are no conflicts in oJsonBase.
	 *
	 * @param {object} oJson
	 * @param {object} oJsonIgnore
	 */
	BaseController.prototype.fixConflictWithIgnore = function(oJson, oJsonIgnore) {
	};

	BaseController.prototype.syncJson2Table = function(oJson) {
	};
	BaseController.prototype.getPanel = function() {
	};
	BaseController.prototype.getChangeType = function(oControlDataReduceBase, oControlDataReduceCompare) {
	};
	BaseController.prototype.getChangeData = function(oControlDataReduceBase, oControlDataReduceCompare) {
	};
	BaseController.prototype.getUnionData = function(oControlDataReduceBase, oControlDataReduceCompare) {
	};

	/* eslint-enable strict */

	return BaseController;

}, /* bExport= */true);
