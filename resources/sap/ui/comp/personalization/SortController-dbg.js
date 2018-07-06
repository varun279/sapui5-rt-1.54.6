/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */

// Provides SortController
sap.ui.define([
	'jquery.sap.global', './BaseController', 'sap/m/library', './Util'
], function(jQuery, BaseController, library, Util) {
	"use strict";

	/**
	 * The SortController can be used to...
	 *
	 * @class Table Personalization Controller
	 * @extends sap.ui.comp.personalization.BaseController
	 * @author SAP
	 * @version 1.25.0-SNAPSHOT
	 * @private
	 * @alias sap.ui.comp.personalization.SortController
	 */
	var SortController = BaseController.extend("sap.ui.comp.personalization.SortController", /** @lends sap.ui.comp.personalization.SortController */
	{
		constructor: function(sId, mSettings) {
			BaseController.apply(this, arguments);
			this.setType(sap.m.P13nPanelType.sort);
			this.setItemType(sap.m.P13nPanelType.sort + "Items");
		},
		metadata: {
			events: {
				afterSortModelDataChange: {}
			}
		}
	});

	SortController.prototype.setTable = function(oTable) {
		BaseController.prototype.setTable.apply(this, arguments);

		if (this.getTable() && (this.getTableType() === sap.ui.comp.personalization.TableType.AnalyticalTable || this.getTableType() === sap.ui.comp.personalization.TableType.Table || this.getTableType() === sap.ui.comp.personalization.TableType.TreeTable)) {
			oTable.detachSort(this._onSort, this);
			oTable.attachSort(this._onSort, this);
		}
	};

	SortController.prototype.getColumn2Json = function(oColumn, sColumnKey, iIndex) {
		if (!Util.isSortable(oColumn)) {
			return null;
		}
		if (!oColumn.getSorted || (oColumn.getSorted && !oColumn.getSorted())) {
			return null;
		}
		return {
			columnKey: sColumnKey,
			operation: oColumn.getSortOrder()
		};
	};

	SortController.prototype.getColumn2JsonTransient = function(oColumn, sColumnKey, sText, sTooltip) {
		if (!Util.isSortable(oColumn)) {
			return null;
		}
		return {
			columnKey: sColumnKey,
			text: sText,
			tooltip: sTooltip
		// maxLength: "",
		// type: ""
		};
	};

	SortController.prototype.handleIgnore = function(oJson, iIndex) {
		oJson.sort.sortItems.splice(iIndex, 1);
	};

	SortController.prototype.syncJson2Table = function(oJson) {
		var oColumnKey2ColumnMap = this.getColumnMap();
		var oColumnKey2ColumnMapUnsorted = jQuery.extend(true, {}, oColumnKey2ColumnMap);

		this.fireBeforePotentialTableChange();

		if (this.getTableType() === sap.ui.comp.personalization.TableType.AnalyticalTable || this.getTableType() === sap.ui.comp.personalization.TableType.Table || this.getTableType() === sap.ui.comp.personalization.TableType.TreeTable) {
			oJson.sort.sortItems.forEach(function(oMSortItem) {
				var oColumn = oColumnKey2ColumnMap[oMSortItem.columnKey];
				if (!oColumn) {
					return;
				}
				if (oMSortItem.operation === undefined) {
					return;
				}
				if (!oColumn.getSorted()) {
					oColumn.setSorted(true);
				}
				if (oColumn.getSortOrder() !== oMSortItem.operation) {
					oColumn.setSortOrder(oMSortItem.operation);
				}
				delete oColumnKey2ColumnMapUnsorted[oMSortItem.columnKey];
			});

			for ( var sColumnKey in oColumnKey2ColumnMapUnsorted) {
				var oColumn = oColumnKey2ColumnMapUnsorted[sColumnKey];
				if (oColumn && oColumn.getSorted()) {
					oColumn.setSorted(false);
				}
			}
		}

		this.fireAfterPotentialTableChange();
	};

	SortController.prototype.getDataSuiteFormat2Json = function(oDataSuiteFormat) {
		var oJson = this.createControlDataStructure();

		if (!oDataSuiteFormat.SortOrder || !oDataSuiteFormat.SortOrder.length) {
			return oJson;
		}

		// var aIgnoreColumnKeys = this.getIgnoreColumnKeys();
		oJson.sort.sortItems = oDataSuiteFormat.SortOrder.
		// filter(function(oSortOrder) {
		// 	return aIgnoreColumnKeys.indexOf(oSortOrder.Property) < 0;
		// }).
		map(function(oSortOrder) {
			return {
				columnKey: oSortOrder.Property,
				operation: oSortOrder.Descending ? "Descending" : "Ascending"
			};
		});
		return oJson;
	};

	/**
	 * Creates property <code>SortOrder</code> in <code>oDataSuiteFormat</code> object if at least one sort item exists. The <code>SortOrder</code> contains the current PersistentData snapshot.
	 * @param {object} oDataSuiteFormat Structure of Data Suite Format
	 */
	SortController.prototype.getDataSuiteFormatSnapshot = function(oDataSuiteFormat) {
		var oControlDataTotal = this.getUnionData(this.getControlDataInitial(), this.getControlData());
		if (!oControlDataTotal.sort || !oControlDataTotal.sort.sortItems || !oControlDataTotal.sort.sortItems.length) {
			return;
		}
		oDataSuiteFormat.SortOrder = oControlDataTotal.sort.sortItems.map(function(oSortItem) {
			return {
				Property: oSortItem.columnKey,
				Descending: oSortItem.operation === "Descending"
			};
		});
	};

	SortController.prototype._onSort = function(oEvent) {
		oEvent.preventDefault();

		// this.fireBeforePotentialTableChange();

		this._updateInternalModel(Util.getColumnKey(oEvent.getParameter("column")), oEvent.getParameter("sortOrder"), oEvent.getParameter("columnAdded"));
		this.syncJson2Table(this.getControlData());

		// this.fireAfterPotentialTableChange();
		this.fireAfterSortModelDataChange();
	};

	SortController.prototype._updateInternalModel = function(sColumnKey, sOperation, bAddNewSort) {
		if (!sColumnKey || (sOperation !== "Descending" && sOperation !== "Ascending")) {
			return;
		}

		// 1. Prepare 'controlData'
		if (!bAddNewSort) {
			this.getInternalModel().setProperty("/controlData/sort/sortItems", []);
		}
		var oControlData = this.getControlData();

		// 2. update / insert sortItem in 'controlData'
		var iIndex = Util.getIndexByKey("columnKey", sColumnKey, oControlData.sort.sortItems);
		iIndex = (iIndex > -1) ? iIndex : oControlData.sort.sortItems.length;
		this.getInternalModel().setProperty("/controlData/sort/sortItems/" + iIndex + "/", {
			columnKey: sColumnKey,
			operation: sOperation
		});

		// 3. update 'controlDataBase'
		this.updateControlDataBaseFromJson(oControlData);
	};

	SortController.prototype.getPanel = function() {
		sap.ui.getCore().loadLibrary("sap.m");
		jQuery.sap.require("sap/m/P13nSortPanel");
		jQuery.sap.require("sap/m/P13nItem");
		jQuery.sap.require("sap/m/P13nSortItem");

		// Note: in the time where controller gets the panel all table columns are present (also missing columns).
		// Note: in case that all sortable columns are excluded we nevertheless have to create the panel for the case that some sortable columns will be included.
		if (!Util.hasSortableColumns(this.getColumnMap())) {
			return null;
		}

		var that = this;
		return new sap.m.P13nSortPanel({
			containerQuery: true,
			items: {
				path: "$sapmP13nPanel>/transientData/sort/sortItems",
				template: new sap.m.P13nItem({
					columnKey: "{$sapmP13nPanel>columnKey}",
					text: "{$sapmP13nPanel>text}",
					tooltip: "{$sapmP13nPanel>tooltip}"
				// maxLength: "{$sapmP13nPanel>maxlength}",
				// type: "{$sapmP13nPanel>type}"
				})
			},
			sortItems: {
				path: "$sapmP13nPanel>/controlDataReduce/sort/sortItems",
				template: new sap.m.P13nSortItem({
					columnKey: "{$sapmP13nPanel>columnKey}",
					operation: "{$sapmP13nPanel>operation}"
				})
			},
			beforeNavigationTo: this.setModelFunction(),
			addSortItem: function(oEvent) {
				if (!oEvent.getParameter("sortItemData")) {
					return;
				}
				var iIndex = oEvent.getParameter("index");
				var oSortItemData = oEvent.getParameter("sortItemData");
				var oSortItem = {
					columnKey: oSortItemData.getColumnKey(),
					operation: oSortItemData.getOperation()
				};
				var oControlDataReduce = that.getControlDataReduce();

				if (iIndex > -1) {
					oControlDataReduce.sort.sortItems.splice(iIndex, 0, oSortItem);
				} else {
					oControlDataReduce.sort.sortItems.push(oSortItem);
				}
				that.setControlDataReduce2Model(oControlDataReduce);
			},
			removeSortItem: function(oEvent) {
				var iIndex = oEvent.getParameter("index");
				if (iIndex < 0) {
					return;
				}
				var oJson = that.getControlDataReduce();
				oJson.sort.sortItems.splice(iIndex, 1);
				that.setControlDataReduce2Model(oJson);
			}
		});
	};

	/**
	 * Operations on sorting are processed sometime directly at the table and sometime not. In case that something has been changed via
	 * Personalization Dialog the consumer of the Personalization Dialog has to apply sorting at the table. In case that sorting has been changed via
	 * user interaction at table, the change is instantly applied at the table.
	 *
	 * @returns {sap.ui.comp.personalization.ChangeType}
	 */
	SortController.prototype.getChangeType = function(oPersistentDataBase, oPersistentDataCompare) {
		if (!oPersistentDataCompare || !oPersistentDataCompare.sort || !oPersistentDataCompare.sort.sortItems) {
			return sap.ui.comp.personalization.ChangeType.Unchanged;
		}
		var bIsDirty = JSON.stringify(oPersistentDataBase.sort.sortItems) !== JSON.stringify(oPersistentDataCompare.sort.sortItems);

		return bIsDirty ? sap.ui.comp.personalization.ChangeType.ModelChanged : sap.ui.comp.personalization.ChangeType.Unchanged;
	};

	/**
	 * Result is XOR based difference = oPersistentDataBase - oPersistentDataCompare
	 *
	 * @param {object} oPersistentDataCompare JSON object. Note: if sortItems is [] then it means that all sortItems have been deleted
	 * @returns {object} JSON object or empty object
	 */
	SortController.prototype.getChangeData = function(oPersistentDataBase, oPersistentDataCompare) {

		if (!oPersistentDataBase || !oPersistentDataBase.sort || !oPersistentDataBase.sort.sortItems) {
			return {
				sort: {
					sortItems: []
				}
			};
		}

		if (!oPersistentDataCompare || !oPersistentDataCompare.sort || !oPersistentDataCompare.sort.sortItems) {
			return {
				sort: Util.copy(oPersistentDataBase.sort)
			};
		}

		if (JSON.stringify(oPersistentDataBase.sort.sortItems) !== JSON.stringify(oPersistentDataCompare.sort.sortItems)) {
			return {
				sort: Util.copy(oPersistentDataBase.sort)
			};
		}
		return null;
	};

	/**
	 * @param {object} oJsonBase: JSON object to which different properties from JSON oJson are added
	 * @param {object} oJson: JSON object from where the different properties are added to oJsonBase. Note: if sortItems is []
	 *        then it means that all sortItems have been deleted
	 * @returns {object} new JSON object as union result of oJsonBase and oJson
	 */
	SortController.prototype.getUnionData = function(oJsonBase, oJson) {
		if (!oJson || !oJson.sort || !oJson.sort.sortItems) {
			return {
				sort: Util.copy(oJsonBase.sort)
			};
		}

		return {
			sort: Util.copy(oJson.sort)
		};
	};

	/**
	 * Cleans up before destruction.
	 *
	 * @private
	 */
	SortController.prototype.exit = function() {
		BaseController.prototype.exit.apply(this, arguments);
		if (this.getTable() && (this.getTableType() === sap.ui.comp.personalization.TableType.AnalyticalTable || this.getTableType() === sap.ui.comp.personalization.TableType.Table || this.getTableType() === sap.ui.comp.personalization.TableType.TreeTable)) {
			this.getTable().detachSort(this._onSort, this);
		}
	};

	return SortController;

}, /* bExport= */true);
