/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */

// Provides GroupController
sap.ui.define([
	'jquery.sap.global', './BaseController', 'sap/m/library', './Util', 'sap/m/P13nConditionPanel'
], function(jQuery, BaseController, library, Util, P13nConditionPanel /*Needed for Enum sap.m.P13nConditionOperation */) {
	"use strict";

	/**
	 * The GroupController can be used to handle the grouping of the Analytical and sap.m.Table. The grouping of the sap.ui.table.Table is not
	 * supported and the existing coding is only for testing and finding the limitations integrated.
	 *
	 * @class Table Personalization Controller
	 * @extends sap.ui.comp.personalization.BaseController
	 * @author SAP
	 * @version 1.25.0-SNAPSHOT
	 * @private
	 * @alias sap.ui.comp.personalization.GroupController
	 */
	var GroupController = BaseController.extend("sap.ui.comp.personalization.GroupController", /** @lends sap.ui.comp.personalization.GroupController */
	{
		constructor: function(sId, mSettings) {
			BaseController.apply(this, arguments);
			this.setType(sap.m.P13nPanelType.group);
			this.setItemType(sap.m.P13nPanelType.group + "Items");
		},
		metadata: {
			events: {
				afterGroupModelDataChange: {}
			}
		}
	});

	GroupController.prototype.setTable = function(oTable) {
		BaseController.prototype.setTable.apply(this, arguments);

		if (this.getTableType() === sap.ui.comp.personalization.TableType.AnalyticalTable || this.getTableType() === sap.ui.comp.personalization.TableType.Table || this.getTableType() === sap.ui.comp.personalization.TableType.TreeTable) {
			oTable.detachGroup(this._onGroup, this);
			oTable.attachGroup(this._onGroup, this);
		}
	};

	GroupController.prototype.getColumn2Json = function(oColumn, sColumnKey, iIndex) {
		if (this.getTableType() !== sap.ui.comp.personalization.TableType.AnalyticalTable) {
			return null;
		}
		// Collect first grouped columns
		if (!oColumn.getGrouped()) {
			return null;
		}
		return {
			columnKey: sColumnKey,
			isGrouped: oColumn.getGrouped(),
			operation: oColumn.getSortOrder && oColumn.getSortOrder() === sap.ui.table.SortOrder.Ascending ? sap.m.P13nConditionOperation.GroupAscending : sap.m.P13nConditionOperation.GroupDescending,
			showIfGrouped: oColumn.getShowIfGrouped ? oColumn.getShowIfGrouped() : false
		};
	};
	GroupController.prototype.getAdditionalData2Json = function(oJson, oTable) {
		if (this.getTableType() !== sap.ui.comp.personalization.TableType.AnalyticalTable) {
			return;
		}
		if (!oJson.group.groupItems.length) {
			return;
		}
		// Move collected grouped columns respectively there orders
		oTable.getGroupedColumns().forEach(function(oColumn, iIndexNew) {
			if (typeof oColumn === "string") {
				oColumn = sap.ui.getCore().byId(oColumn);
			}
			var iIndexOld = Util.getIndexByKey("columnKey", Util.getColumnKey(oColumn), oJson.group.groupItems);
			if (iIndexOld > -1 && iIndexNew === iIndexOld) {
				return;
			}
			var oItem = oJson.group.groupItems.splice(iIndexOld, 1);
			oJson.group.groupItems.splice(iIndexNew, 0, oItem);
		});
	};
	GroupController.prototype.getColumn2JsonTransient = function(oColumn, sColumnKey, sText, sTooltip) {
		if (!Util.isGroupable(oColumn)) {
			return null;
		}
		return {
			columnKey: sColumnKey,
			text: sText,
			tooltip: sTooltip
		};
	};

	GroupController.prototype.handleIgnore = function(oJson, iIndex) {
		oJson.sort.sortItems.splice(iIndex, 1);
	};

	GroupController.prototype.syncJson2Table = function(oJson) {
		var oColumnKey2ColumnMap = this.getColumnMap();
		var oTable = this.getTable();
		var oColumn;

		this.fireBeforePotentialTableChange();

		if (this.getTableType() === sap.ui.comp.personalization.TableType.TreeTable) {
			return;

		} else if (this.getTableType() === sap.ui.comp.personalization.TableType.AnalyticalTable) {
			// we have to set all columns first to unGrouped
			for ( var sColumnKey in oColumnKey2ColumnMap) {
				oColumn = oColumnKey2ColumnMap[sColumnKey];
				if (!oColumn) {
					return;
				}
				if (oColumn.getGrouped()) {
					oColumn.setGrouped(false);
					oColumn.setShowIfGrouped(false);
				}
			}

			oJson.group.groupItems.forEach(function(oMGroupItem) {
				oColumn = oColumnKey2ColumnMap[oMGroupItem.columnKey];
				if (!oColumn) {
					return;
				}
				oColumn.setGrouped(true);
				oColumn.setShowIfGrouped(oMGroupItem.showIfGrouped);
			});

		} else if (this.getTableType() === sap.ui.comp.personalization.TableType.Table || this.getTableType() === sap.ui.comp.personalization.TableType.AnalyticalTable || this.getTableType() === sap.ui.comp.personalization.TableType.TreeTable) {
			if (oJson.group.groupItems.length > 0) {
				oJson.group.groupItems.some(function(oMGroupItem) {
					oColumn = oColumnKey2ColumnMap[oMGroupItem.columnKey];
					if (oColumn) {
						oTable.setGroupBy(oColumn);
						return true;
					}
				});
			} else {
				// TODO removing the grouping does not work. we need a correction on the ui.table cf. commit Ifda0dbbfd22a586415f53aa99cbe6663577fe847
				oTable.setGroupBy(null);
			}
		}

		this.fireAfterPotentialTableChange();
	};

	/**
	 * Note: the DataSuiteFormate does not support group sort order and 'showIfGrouped'.
	 * @param oDataSuiteFormat
	 * @returns {Object}
	 */
	GroupController.prototype.getDataSuiteFormat2Json = function(oDataSuiteFormat) {
		var oJson = this.createControlDataStructure();

		if (!oDataSuiteFormat.GroupBy || !oDataSuiteFormat.GroupBy.length) {
			return oJson;
		}
		oJson.group.groupItems = oDataSuiteFormat.GroupBy.map(function(sGroupBy) {
			return {
				columnKey: sGroupBy,
				operation: sap.m.P13nConditionOperation.GroupAscending,
				showIfGrouped: false
			};
		});
		return oJson;
	};
	/**
	 * Creates property <code>GroupBy</code> in <code>oDataSuiteFormat</code> object if at least one group item exists. The <code>GroupBy</code> contains the current PersistentData snapshot.
	 * @param {object} oDataSuiteFormat Structure of Data Suite Format
	 */
	GroupController.prototype.getDataSuiteFormatSnapshot = function(oDataSuiteFormat) {
		var oControlDataTotal = this.getUnionData(this.getControlDataInitial(), this.getControlData());
		if (!oControlDataTotal.group || !oControlDataTotal.group.groupItems || !oControlDataTotal.group.groupItems.length) {
			return;
		}
		oDataSuiteFormat.GroupBy = oControlDataTotal.group.groupItems.map(function(oMGroupItem) {
			return oMGroupItem.columnKey;
		});
	};

	GroupController.prototype._onGroup = function(oEvent) {
		this.fireBeforePotentialTableChange();

		this._updateInternalModel(oEvent.getParameter("groupedColumns"));

		this.fireAfterPotentialTableChange();
		this.fireAfterGroupModelDataChange();
	};

	GroupController.prototype._updateInternalModel = function(aGroupedColumns) {

		// 1. Prepare 'controlData'
		this.getInternalModel().setProperty("/controlData/group/groupItems", []);

		// 2. update / insert groupItem in 'controlData'
		var oControlData = this.getControlData();
		aGroupedColumns.forEach(function(oColumn) {
			if (typeof oColumn === "string") {
				oColumn = sap.ui.getCore().byId(oColumn);
			}
			var sColumnKey = Util.getColumnKey(oColumn);
			var iIndex = Util.getIndexByKey("columnKey", sColumnKey, oControlData.group.groupItems);
			iIndex = (iIndex > -1) ? iIndex : oControlData.group.groupItems.length;
			this.getInternalModel().setProperty("/controlData/group/groupItems/" + iIndex + "/", {
				columnKey: sColumnKey,
				showIfGrouped: oColumn.getShowIfGrouped ? oColumn.getShowIfGrouped() : false
			});
		}, this);

		// 3. update 'controlDataBase'
		this.updateControlDataBaseFromJson(oControlData);
	};

	GroupController.prototype.getPanel = function() {
		sap.ui.getCore().loadLibrary("sap.m");
		jQuery.sap.require("sap/m/P13nGroupPanel");
		jQuery.sap.require("sap/m/P13nItem");
		jQuery.sap.require("sap/m/P13nGroupItem");

		// Note: in the time where controller gets the panel all table columns are present (also missing columns).
		// Note: in case that all groupable columns are excluded we nevertheless have to create the panel for the case that some groupable columns will be included.
		if (!Util.hasGroupableColumns(this.getColumnMap())) {
			return null;
		}

		var that = this;
		return new sap.m.P13nGroupPanel({
			maxGroups: this.getTableType() === sap.ui.comp.personalization.TableType.AnalyticalTable ? "-1" : "1",
			containerQuery: true,
			items: {
				path: "$sapmP13nPanel>/transientData/group/groupItems",
				template: new sap.m.P13nItem({
					columnKey: "{$sapmP13nPanel>columnKey}",
					text: "{$sapmP13nPanel>text}",
					tooltip: "{$sapmP13nPanel>tooltip}"
				})
			},
			groupItems: {
				path: "$sapmP13nPanel>/controlDataReduce/group/groupItems",
				template: new sap.m.P13nGroupItem({
					columnKey: "{$sapmP13nPanel>columnKey}",
					operation: "{$sapmP13nPanel>operation}",
					showIfGrouped: "{$sapmP13nPanel>showIfGrouped}"
				})
			},
			beforeNavigationTo: this.setModelFunction(),
			addGroupItem: function(oEvent) {
				if (!oEvent.getParameter("groupItemData")) {
					return;
				}
				var iIndex = oEvent.getParameter("index");
				var oGroupItemData = oEvent.getParameter("groupItemData");
				var oGroupItem = {
					columnKey: oGroupItemData.getColumnKey(),
					operation: oGroupItemData.getOperation(),
					showIfGrouped: oGroupItemData.getShowIfGrouped()
				};
				var oControlDataReduce = that.getControlDataReduce();
				if (iIndex > -1) {
					oControlDataReduce.group.groupItems.splice(iIndex, 0, oGroupItem);
				} else {
					oControlDataReduce.group.groupItems.push(oGroupItem);
				}
				that.setControlDataReduce2Model(oControlDataReduce);
			},
			removeGroupItem: function(oEvent) {
				var iIndex = oEvent.getParameter("index");
				if (iIndex < 0) {
					return;
				}
				var oControlDataReduce = that.getControlDataReduce();
				oControlDataReduce.group.groupItems.splice(iIndex, 1);
				that.setControlDataReduce2Model(oControlDataReduce);
			}
		});
	};

	/**
	 * Operations on group are processed every time directly at the table. In case that something has been changed via Personalization Dialog or via
	 * user interaction at table, the change is instantly applied at the table.
	 */
	GroupController.prototype.getChangeType = function(oPersistentDataBase, oPersistentDataCompare) {
		if (!oPersistentDataCompare || !oPersistentDataCompare.group || !oPersistentDataCompare.group.groupItems) {
			return sap.ui.comp.personalization.ChangeType.Unchanged;
		}
		var bIsDirty = JSON.stringify(oPersistentDataBase.group.groupItems) !== JSON.stringify(oPersistentDataCompare.group.groupItems);

		return bIsDirty ? sap.ui.comp.personalization.ChangeType.ModelChanged : sap.ui.comp.personalization.ChangeType.Unchanged;
	};

	/**
	 * Result is XOR based difference = CurrentModelData - oPersistentDataCompare
	 *
	 * @param {object} oPersistentDataCompare JSON object
	 * @returns {object} JSON object or empty object
	 */
	GroupController.prototype.getChangeData = function(oPersistentDataBase, oPersistentDataCompare) {

		if (!oPersistentDataBase || !oPersistentDataBase.group || !oPersistentDataBase.group.groupItems) {
			return this.createControlDataStructure();
		}

		if (!oPersistentDataCompare || !oPersistentDataCompare.group || !oPersistentDataCompare.group.groupItems) {
			return {
				group: Util.copy(oPersistentDataBase.group)
			};
		}

		if (JSON.stringify(oPersistentDataBase.group.groupItems) !== JSON.stringify(oPersistentDataCompare.group.groupItems)) {
			return {
				group: Util.copy(oPersistentDataBase.group)
			};
		}
		return null;
	};

	/**
	 * @param {object} oJsonBase: JSON object to which different properties from JSON oJson are added
	 * @param {object} oJson: JSON object from where the different properties are added to oJsonBase. Note: if groupItems
	 *        is [] then it means that all groupItems have been deleted
	 * @returns {object} new JSON object as union result of oJsonBase and oJson
	 */
	GroupController.prototype.getUnionData = function(oJsonBase, oJson) {
		if (!oJson || !oJson.group || !oJson.group.groupItems) {
			return {
				group: Util.copy(oJsonBase.group)
			};
		}

		return {
			group: Util.copy(oJson.group)
		};
	};

	/**
	 * Determines whether a grouping has been selected for specific column or not.
	 *
	 * @param {object} oPayload structure about the current selection coming from panel
	 * @param {string} sColumnKey column key of specific column
	 * @returns {boolean} true if grouping for a specific column is selected, false if not
	 */
	GroupController.prototype.isGroupSelected = function(oPayload, oPersistentData, sColumnKey) {
		var iIndex;
		if (!oPayload) {
			oPersistentData.groupItems.some(function(oMGroupItem, iIndex_) {
				if (oMGroupItem.columnKey === sColumnKey) {
					iIndex = iIndex_;
					return true;
				}
			});
			return iIndex > -1;
		}

		// oPayload has been passed...
		if (!oPayload.selectedColumnKeys) {
			return false;
		}
		if (oPayload.selectedColumnKeys) {
			oPayload.selectedColumnKeys.some(function(sSelectedColumnKey, iIndex_) {
				if (sSelectedColumnKey === sColumnKey) {
					iIndex = iIndex_;
					return true;
				}
			});
		}
		return iIndex > -1;
	};

	/**
	 * Cleans up before destruction.
	 */
	GroupController.prototype.exit = function() {
		BaseController.prototype.exit.apply(this, arguments);

		if (this.getTable() && (this.getTableType() === sap.ui.comp.personalization.TableType.AnalyticalTable || this.getTableType() === sap.ui.comp.personalization.TableType.Table || this.getTableType() === sap.ui.comp.personalization.TableType.TreeTable)) {
			this.getTable().detachGroup(this._onGroup, this);
		}
	};

	return GroupController;

}, /* bExport= */true);
