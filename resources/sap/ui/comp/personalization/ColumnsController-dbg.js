/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */

// Provides ColumnsController
sap.ui.define([
	'jquery.sap.global', './BaseController', 'sap/m/library', './Util'
], function(jQuery, BaseController, library, Util) {
	"use strict";

	/**
	 * The ColumnsController can be used to...
	 *
	 * @class Table Personalization Controller
	 * @extends sap.ui.comp.personalization.BaseController
	 * @author SAP SE
	 * @version 1.54.6
	 * @private
	 * @since 1.26.0
	 * @alias sap.ui.comp.personalization.ColumnsController
	 */
	var ColumnsController = BaseController.extend("sap.ui.comp.personalization.ColumnsController", /** @lends sap.ui.comp.personalization.ColumnsController */
	{
		constructor: function(sId, mSettings) {
			BaseController.apply(this, arguments);
			this.setType(sap.m.P13nPanelType.columns);
			this.setItemType(sap.m.P13nPanelType.columns + "Items");
		},
		metadata: {
			properties: {
				/**
				 * @since 1.36.5
				 */
				triggerModelChangeOnColumnInvisible: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				}
			},

			/**
			 * Event is raised after columns data has been changed in data model
			 *
			 * @since 1.26.0
			 */
			events: {
				afterColumnsModelDataChange: {}
			}
		}
	});

	ColumnsController.prototype.setTable = function(oTable) {
		BaseController.prototype.setTable.apply(this, arguments);

		if (this.getTableType() === sap.ui.comp.personalization.TableType.AnalyticalTable || this.getTableType() === sap.ui.comp.personalization.TableType.Table || this.getTableType() === sap.ui.comp.personalization.TableType.TreeTable) {
			oTable.detachColumnMove(this._onColumnMove, this);
			oTable.detachColumnVisibility(this._onColumnVisibility, this);
			oTable.detachColumnResize(this._onColumnResize, this);
			oTable.attachColumnMove(this._onColumnMove, this);
			oTable.attachColumnVisibility(this._onColumnVisibility, this);
			oTable.attachColumnResize(this._onColumnResize, this);
		}

		this._monkeyPatchTable(oTable);
	};

	/**
	 * Does a complete JSON snapshot of the current table instance ("original") from the perspective of the columns controller; the JSON snapshot can
	 * later be applied to any table instance to recover all columns related infos of the "original" table
	 *
	 * @returns {object} JSON objects with meta data from existing table columns
	 */
	ColumnsController.prototype.getColumn2Json = function(oColumn, sColumnKey, iIndex) {
		return {
			columnKey: sColumnKey,
			index: iIndex,
			visible: oColumn.getVisible(),
			width: oColumn.getWidth ? oColumn.getWidth() : undefined,
			total: oColumn.getSummed ? oColumn.getSummed() : undefined
		};
	};
	ColumnsController.prototype.getAdditionalData2Json = function(oJsonData, oTable) {
		oJsonData.columns.fixedColumnCount = oTable && oTable.getFixedColumnCount ? oTable.getFixedColumnCount() : undefined;
	};
	ColumnsController.prototype.getColumn2JsonTransient = function(oColumn, sColumnKey, sText, sTooltip) {
		return {
			columnKey: sColumnKey,
			text: sText,
			tooltip: sTooltip
		};
	};

	ColumnsController.prototype.handleIgnore = function(oJson, iIndex) {
		oJson.columns.columnsItems[iIndex].visible = false;
	};

	ColumnsController.prototype.syncJson2Table = function(oJson) {
		var oTable = this.getTable();
		var oColumnKey2ColumnMap = this.getColumnMap();

		this.fireBeforePotentialTableChange();

		if (this.getTable() && (this.getTableType() === sap.ui.comp.personalization.TableType.AnalyticalTable || this.getTableType() === sap.ui.comp.personalization.TableType.Table || this.getTableType() === sap.ui.comp.personalization.TableType.TreeTable)) {
			this._applyChangesToUiTableType(oTable, oJson, oColumnKey2ColumnMap);
		} else if (this.getTableType() === sap.ui.comp.personalization.TableType.ResponsiveTable) {
			this._applyChangesToMTableType(oTable, oJson, oColumnKey2ColumnMap);
		}

		this.fireAfterPotentialTableChange();
	};

	/**
	 * Similar to 'getTable2Json'.
	 * Note: 1. If more than one 'LineItem' exists in <code>oDataSuiteFormat</code> the first one will taken over.
	 *       2. 'Width' is not supported by Data Suite Format yet
	 * @param {object} oDataSuiteFormat DataSuiteFormat
	 * @returns {object}
	 * @private
	 */
	ColumnsController.prototype.getDataSuiteFormat2Json = function(oDataSuiteFormat) {
		var oJson = this.createControlDataStructure();
		var fnAddProperty = function(sColumnKey, sPropertyName, oPropertyValue) {
			var iIndex = Util.getIndexByKey("columnKey", sColumnKey, oJson.columns.columnsItems);
			if (iIndex < 0) {
				iIndex = oJson.columns.columnsItems.length;
				oJson.columns.columnsItems.splice(iIndex, 0, {
					columnKey: sColumnKey
				});
			}
			oJson.columns.columnsItems[iIndex][sPropertyName] = oPropertyValue;
		};

		// Based on 'controlDataInitial' set all 'visible' columns as 'invisible'
		this.getControlDataInitial().columns.columnsItems.filter(function(oMItem) {
			return oMItem.visible === true;
		}).forEach(function(oMItem) {
			fnAddProperty(oMItem.columnKey, "visible", false);
		});

		// Take over 'Visualizations'
		if (oDataSuiteFormat.Visualizations && oDataSuiteFormat.Visualizations.length) {
			var aLineItemVisualizations = oDataSuiteFormat.Visualizations.filter(function(oVisualization) {
				return oVisualization.Type === "LineItem";
			});
			if (aLineItemVisualizations.length) {
				aLineItemVisualizations[0].Content.forEach(function(oContent, iIndex) {
					fnAddProperty(oContent.Value, "visible", true);
					fnAddProperty(oContent.Value, "index", iIndex);
				}, this);
			}
		}

		// Take over 'Total'
		if (oDataSuiteFormat.Total && oDataSuiteFormat.Total.length) {
			oDataSuiteFormat.Total.forEach(function(sColumnKey) {
				fnAddProperty(sColumnKey, "total", true);
			});
		}
		return oJson;
	};
	/**
	 * Creates, if not already exists, property <code>Visualizations</code> in <code>oDataSuiteFormat</code> object if at least one column item exists. Adds an entry for in <code>Visualizations</code> for each visible column of the current ControlDataReduce snapshot.
	 * Additionally creates property <code>Total</code> in <code>oDataSuiteFormat</code> object if at least one column item with 'total=true' exists. The <code>Total</code> contains the current ControlDataReduce snapshot.
	 * <b>Note:</b> the 'Label' property is not filled because it is translated text. For example if person 'A' sends via email the DataSuiteFormat in language 'a' the recipient person 'B' will be see the data in language 'a' instead of 'b'.
	 * @param {object} oDataSuiteFormat Structure of Data Suite Format
	 */
	ColumnsController.prototype.getDataSuiteFormatSnapshot = function(oDataSuiteFormat) {
		var oControlDataTotal = this.getUnionData(this.getControlDataInitial(), this.getControlData());
		if (!oControlDataTotal.columns || !oControlDataTotal.columns.columnsItems || !oControlDataTotal.columns.columnsItems.length) {
			return;
		}

		// Fill 'Total'
		var aColumnsItemsContainingTotal = oControlDataTotal.columns.columnsItems.filter(function(oColumnsItem) {
			return !!oColumnsItem.total;
		});
		if (aColumnsItemsContainingTotal.length) {
			oDataSuiteFormat.Total = aColumnsItemsContainingTotal.map(function(oColumnsItem) {
				return oColumnsItem.columnKey;
			});
		}

		// Fill 'Visualizations'
		// Filter all visible columnsItems and sort them by 'index'
		var aColumnsItemsVisible = oControlDataTotal.columns.columnsItems.filter(function(oColumnsItem) {
			return !!oColumnsItem.visible;
		});
		if (aColumnsItemsVisible.length) {
			if (!oDataSuiteFormat.Visualizations) {
				oDataSuiteFormat.Visualizations = [];
			}
			aColumnsItemsVisible.sort(this._sortByIndex);

			oDataSuiteFormat.Visualizations.push({
				Type: "LineItem",
				Content: aColumnsItemsVisible.map(function(oColumnsItem) {
					return {
						Value: oColumnsItem.columnKey,
						Label: undefined
					};
				})
			});
		}
	};

	ColumnsController.prototype._onColumnMove = function(oEvent) {
		var iIndexTo = oEvent.getParameter("newPos");
		var sColumnKey = Util.getColumnKey(oEvent.getParameter("column"));
		var oControlData = this.getControlData();
		var iIndexFrom = Util.getIndexByKey("columnKey", sColumnKey, oControlData.columns.columnsItems);

		if (iIndexFrom < 0 || iIndexTo < 0 || iIndexFrom > oControlData.columns.columnsItems.length - 1 || iIndexTo > oControlData.columns.columnsItems.length - 1) {
			return;
		}

		this.fireBeforePotentialTableChange();

		// 1. update 'controlData'
		var aMItem = oControlData.columns.columnsItems.splice(iIndexFrom, 1);
		oControlData.columns.columnsItems.splice(iIndexTo, 0, aMItem[0]);

		var iItemIndex = -1;
		oControlData.columns.columnsItems.forEach(function(oMItem) {
			if (oMItem.index !== undefined) {
				oMItem.index = ++iItemIndex;
			}
		});

		// 2. update 'controlDataBase'
		this.updateControlDataBaseFromJson(oControlData);

		this.fireAfterPotentialTableChange();
		this.fireAfterColumnsModelDataChange();
	};
	ColumnsController.prototype._onColumnVisibility = function(oEvent) {
		this.fireBeforePotentialTableChange();

		this._updateInternalModel(Util.getColumnKey(oEvent.getParameter("column")), "visible", oEvent.getParameter("newVisible"));

		this.fireAfterPotentialTableChange();
		this.fireAfterColumnsModelDataChange();
	};
	ColumnsController.prototype._onColumnTotal = function(oParams) {
		this.fireBeforePotentialTableChange();

		this._updateInternalModel(Util.getColumnKey(oParams.column), "total", oParams.isSummed);

		this.fireAfterPotentialTableChange();
		this.fireAfterColumnsModelDataChange();
	};
	ColumnsController.prototype._onColumnResize = function(oEvent) {
		this.fireBeforePotentialTableChange();

		this._updateInternalModel(Util.getColumnKey(oEvent.getParameter("column")), "width", oEvent.getParameter("width"));

		this.fireAfterPotentialTableChange();
		this.fireAfterColumnsModelDataChange();
	};
	ColumnsController.prototype._onColumnFixedCount = function(iFixedColumnCount) {
		this.fireBeforePotentialTableChange();

		// 1. update 'controlData'
		var oControlData = this.getControlData();
		this.getInternalModel().setProperty("/controlData/columns/fixedColumnCount", iFixedColumnCount);

		// 2. update 'controlDataBase'
		this.updateControlDataBaseFromJson(oControlData);

		this.fireAfterPotentialTableChange();
		this.fireAfterColumnsModelDataChange();
	};
	ColumnsController.prototype._updateInternalModel = function(sColumnKey, sPropertyName, vPropertyValue) {
		if (!sColumnKey || !sPropertyName) {
			return;
		}

		// 1. update / insert columnsItem in 'controlData'
		var oControlData = this.getControlData();
		var iIndex = Util.getIndexByKey("columnKey", sColumnKey, oControlData.columns.columnsItems);
		if (iIndex < 0) {
			throw "No entry found in 'controlDataBase' for columnKey '" + sColumnKey + "'";
		}
		this.getInternalModel().setProperty("/controlData/columns/columnsItems/" + iIndex + "/" + sPropertyName, vPropertyValue);

		// 2. update 'controlDataBase'
		this.updateControlDataBaseFromJson(oControlData);
	};

	/**
	 * Returns a ColumnsPanel control
	 *
	 * @returns {sap.m.P13nColumnsPanel} returns a new created ColumnsPanel
	 */
	ColumnsController.prototype.getPanel = function(oPayload) {

		sap.ui.getCore().loadLibrary("sap.m");
		jQuery.sap.require("sap/m/P13nColumnsPanel");
		jQuery.sap.require("sap/m/P13nItem");
		jQuery.sap.require("sap/m/P13nColumnsItem");

		var that = this;
		var iVisibleItemsThreshold = -1;
		if (oPayload && oPayload.visibleItemsThreshold) {
			iVisibleItemsThreshold = oPayload.visibleItemsThreshold;
		}
		return new sap.m.P13nColumnsPanel({
			visibleItemsThreshold: iVisibleItemsThreshold,
			items: {
				path: '$sapmP13nPanel>/transientData/columns/columnsItems',
				template: new sap.m.P13nItem({
					columnKey: '{$sapmP13nPanel>columnKey}',
					text: '{$sapmP13nPanel>text}',
					tooltip: '{$sapmP13nPanel>tooltip}'
				})
			},
			columnsItems: {
				path: "$sapmP13nPanel>/controlDataReduce/columns/columnsItems",
				template: new sap.m.P13nColumnsItem({
					columnKey: "{$sapmP13nPanel>columnKey}",
					index: "{$sapmP13nPanel>index}",
					visible: "{$sapmP13nPanel>visible}",
					width: "{$sapmP13nPanel>width}",
					total: "{$sapmP13nPanel>total}"
				})
			},
			beforeNavigationTo: this.setModelFunction(),
			changeColumnsItems: function(oEvent) {
				if (!oEvent.getParameter("items")) {
					return;
				}
				// We can not just take over the 'items' from P13nColumnsPanel and overwrite the 'controlDataReduce' because we
				// would lost information on 'columns' branch like 'fixedColumnCount'.
				// Note: the 'items' structure is equal to the 'controlDataReduce' so we can take over 'items' at once (different in DimeasureController).
				var oControlDataReduce = that.getControlDataReduce();
				oControlDataReduce.columns.columnsItems = oEvent.getParameter("items");
				that.setControlDataReduce2Model(oControlDataReduce);
			}
		});
	};

	/**
	 * Note: Attribute <code>index</code> can be undefined.
	 */
	ColumnsController.prototype._sortByIndex = function(a, b) {
		if (a.index !== undefined && b.index === undefined) {
			return -1;
		}
		if (b.index !== undefined && a.index === undefined) {
			return 1;
		}
		if (a.index < b.index) {
			return -1;
		}
		if (a.index > b.index) {
			return 1;
		}
		return 0;
	};

	/**
	 * Applies changes to a table of type UI table
	 *
	 * @param {object} oTable The table where all personalization changes shall be allied to
	 * @param {object} oJson An object with changes that shall be applied to oTable
	 * @param {object} oColumnKey2ColumnMap An object with columnKey as key and column as value
	 */
	ColumnsController.prototype._applyChangesToUiTableType = function(oTable, oJson, oColumnKey2ColumnMap) {
		var oColumn = null;
		var oColumnsItemsMap = {};
		var that = this;

		var fSetOrderArray = function(aColumnsItems, aColumnKeys) {
			// organize columnsItems by it's index to apply them in the right order
			aColumnsItems.forEach(function(oColumnsItem) {
				oColumnsItemsMap[oColumnsItem.columnKey] = oColumnsItem;
			});

			aColumnsItems.sort(that._sortByIndex);
			var aColumnsItemsSortedByIndex = aColumnsItems.map(function(oColumnsItem) {
				return oColumnsItem.columnKey;
			});

			aColumnKeys.forEach(function(sColumnKey, iIndex) {
				if (aColumnsItemsSortedByIndex.indexOf(sColumnKey) < 0) {
					aColumnsItemsSortedByIndex.splice(iIndex, 0, sColumnKey);
				}
			});
			return aColumnsItemsSortedByIndex;
		};

		var fSetVisibility = function(sColumnKey, oColumn) {
			// Apply column visibility
			var oColumnsItem = oColumnsItemsMap[sColumnKey];
			if (oColumnsItem && oColumnsItem.visible !== undefined && oColumn.getVisible() !== oColumnsItem.visible) {
				oColumn.setVisible(oColumnsItem.visible, true);
			}
		};

		var fSetOrder = function(iIndex, sColumnKey, oColumn) {
			// Apply column order
			var iTableColumnIndex = oTable.indexOfColumn(oColumn); // -1
			var iModelColumnIndex = iIndex;
			if (iModelColumnIndex !== undefined && iTableColumnIndex !== iModelColumnIndex) {

				if (iTableColumnIndex > -1) {
					// column exists
					oTable.removeColumn(oColumn, true);
				}
				oTable.insertColumn(oColumn, iModelColumnIndex, true);
			}
		};

		var fSetWidth = function(sColumnKey, oColumn) {
			// Apply column width
			var oColumnsItem = oColumnsItemsMap[sColumnKey];
			if (oColumnsItem && oColumnsItem.width !== undefined && oColumn.getWidth() !== oColumnsItem.width) {
				oColumn.setWidth(oColumnsItem.width, true);
			}
		};

		var fSetTotal = function(sColumnKey, oColumn) {
			// Apply column summed
			var oColumnsItem = oColumnsItemsMap[sColumnKey];
			if (oColumnsItem && oColumnsItem.total !== undefined && oColumn.getSummed && oColumn.getSummed() !== oColumnsItem.total) {
				oColumn.setSummed(oColumnsItem.total, true);
			}
		};

		if (oJson.columns.columnsItems.length) {
			// apply columnsItems
			var aColumnsItemsArray = fSetOrderArray(oJson.columns.columnsItems, this.getColumnKeys());
			aColumnsItemsArray.forEach(function(sColumnKey, iIndex) {
				oColumn = oColumnKey2ColumnMap[sColumnKey];
				if (oColumn) {
					fSetVisibility(sColumnKey, oColumn);
					fSetOrder(iIndex, sColumnKey, oColumn);
					fSetWidth(sColumnKey, oColumn);
					fSetTotal(sColumnKey, oColumn);
				}
			});
		}

		// Apply table 'fixedColumnCount'
		var iFixedColumnCount = oJson.columns.fixedColumnCount || 0;
		if (oTable.getFixedColumnCount && oTable.getFixedColumnCount() !== iFixedColumnCount) {
			oTable.setFixedColumnCount(iFixedColumnCount, true);
		}
	};

	/**
	 * Applies changes to a table of type M table
	 *
	 * @param {object} oTable The table where all personalization changes shall be allied to
	 * @param {object} oJson An object with changes that shall be applied to oTable
	 * @param {object} oColumnKey2ColumnMap An object with columnKey as key and column as value
	 */
	ColumnsController.prototype._applyChangesToMTableType = function(oTable, oJson, oColumnKey2ColumnMap) {
		var bTableInvalidateNeeded = false;

		var fSetOrder = function(oColumnsItem, oColumn) {
			// Apply column order
			var iModelColumnIndex = oColumnsItem.index;
			if (iModelColumnIndex !== undefined) {
				oColumn.setOrder(iModelColumnIndex, true);
				bTableInvalidateNeeded = true;
			}
		};

		var fSetVisibility = function(oColumnsItem, oColumn) {
			// Apply column visibility
			if (oColumnsItem.visible !== undefined && oColumn.getVisible() !== oColumnsItem.visible) {
				oColumn.setVisible(oColumnsItem.visible, true);
				bTableInvalidateNeeded = true;
			}
		};

		// organize columnsItems by it's index to apply them in the right order
		if (oJson.columns.columnsItems.length) {
			oJson.columns.columnsItems.sort(function(a, b) {
				if (a.index < b.index) {
					return -1;
				}
				if (a.index > b.index) {
					return 1;
				}
				return 0;
			});

			// apply columnsItems
			oJson.columns.columnsItems.forEach(function(oColumnsItem) {
				var oColumn = oColumnKey2ColumnMap[oColumnsItem.columnKey];
				if (oColumn) {
					fSetOrder(oColumnsItem, oColumn);
					fSetVisibility(oColumnsItem, oColumn);
				}
			}, this);
		}
		// TODO: Check why table rerendering is needed for m.table when column is moved; change of visibility works fine
		if (bTableInvalidateNeeded) {
			oTable.invalidate();
		}
	};

	/**
	 * Operations on columns are processed every time directly at the table. In case that something has been changed via Personalization Dialog or via
	 * user interaction at table, change is applied to the table.
	 *
	 * @param {object} oControlDataReduceBase (new) JSON object
	 * @param {object} oControlDataReduceCompare (old) JSON object
	 * @returns {object} that represents the change type, like: Unchanged || TableChanged || ModelChanged
	 */
	ColumnsController.prototype.getChangeType = function(oControlDataReduceBase, oControlDataReduceCompare) {
		var oChangeData = this.getChangeData(oControlDataReduceBase, oControlDataReduceCompare);
		// analytical table needs to re-read data from backend even in case a column was made invisible !
		var bNeedModelChange = this.getTableType() === sap.ui.comp.personalization.TableType.AnalyticalTable || this.getTriggerModelChangeOnColumnInvisible();
		if (oChangeData) {
			var oChangeType = sap.ui.comp.personalization.ChangeType.TableChanged;
			oChangeData.columns.columnsItems.some(function(oItem) {
				if (oItem.visible || (oItem.visible === false && bNeedModelChange)) {
					oChangeType = sap.ui.comp.personalization.ChangeType.ModelChanged;
					return true;
				}
				if (oItem.total === false || oItem.total === true) {
					oChangeType = sap.ui.comp.personalization.ChangeType.ModelChanged;
					return true;
				}
			});
			return oChangeType;
		}
		return sap.ui.comp.personalization.ChangeType.Unchanged;
	};

	/**
	 * Result is XOR based difference = oControlDataReduceBase - oControlDataReduceCompare (new - old)
	 *
	 * @param {object} oControlDataReduceBase (new) JSON object which represents the current model state (Restore+ControlDataReduce)
	 * @param {object} oControlDataReduceCompare (old) JSON object which represents AlreadyKnown || Restore
	 * @returns {object} JSON object or null
	 */
	ColumnsController.prototype.getChangeData = function(oControlDataReduceBase, oControlDataReduceCompare) {
		// not valid
		if (!oControlDataReduceCompare || !oControlDataReduceCompare.columns || !oControlDataReduceCompare.columns.columnsItems) {
			return null;
		}

		var oChangeData = {
			columns: Util.copy(oControlDataReduceBase.columns)
		};

		// If no changes inside of columns.columnsItems array, return null.
		// Note: the order inside of columns.columnsItems array is irrelevant.
		var bIsEqual = true;
		bIsEqual = (oControlDataReduceBase.columns.fixedColumnCount === oControlDataReduceCompare.columns.fixedColumnCount);
		oControlDataReduceBase.columns.columnsItems.some(function(oItem) {
			var oItemCompare = Util.getArrayElementByKey("columnKey", oItem.columnKey, oControlDataReduceCompare.columns.columnsItems);
			if (!Util.semanticEqual(oItem, oItemCompare)) {
				// Leave forEach() as there are different items
				bIsEqual = false;
				return true;
			}
		});
		if (bIsEqual) {
			return null;
		}

		// If same items are different then delete equal properties and return the rest of item
		var aToBeDeleted = [];
		oChangeData.columns.columnsItems.forEach(function(oItem, iIndex) {
			var oItemCompare = Util.getArrayElementByKey("columnKey", oItem.columnKey, oControlDataReduceCompare.columns.columnsItems);
			if (Util.semanticEqual(oItem, oItemCompare)) {
				// Condenser: remove items which are not changed in a chain
				aToBeDeleted.push(oItem);
				return;
			}
			for ( var property in oItem) {
				if (property === "columnKey" || !oItemCompare) {
					if (oItemCompare && oItemCompare[property] === undefined) {
						delete oItem[property];
					} else {
						continue;
					}
				}
				if (oItem[property] === oItemCompare[property]) {
					delete oItem[property];
				}
			}
			if (Object.keys(oItem).length < 2) {
				aToBeDeleted.push(oItem);
			}
		});
		aToBeDeleted.forEach(function(oItem) {
			var iIndex = Util.getIndexByKey("columnKey", oItem.columnKey, oChangeData.columns.columnsItems);
			oChangeData.columns.columnsItems.splice(iIndex, 1);
		});

		// If 'fixedColumnCount' is default then delete it
		if (oChangeData.columns.fixedColumnCount === 0) {
			delete oChangeData.columns.fixedColumnCount;
		}
		return oChangeData;
	};

	/**
	 * This method sorts a given ARRAY by a well defined property name of it's included objects. If it is required the array will be copied before.
	 *
	 * @param {array} aArrayToBeSorted is the array that shall be sorted by the given property
	 * @param {string} sPropertyName is the property name that shall be taken as sorting criteria
	 * @param {Boolean} bTakeACopy is optional and desides whether the given arry shall be copied before its content will be sorted
	 * @returns {object[]} aSortedArray is the sorted array
	 */
	ColumnsController.prototype._sortArrayByPropertyName = function(aArrayToBeSorted, sPropertyName, bTakeACopy) {
		var aSortedArray = [];

		if (bTakeACopy === null || bTakeACopy === undefined) {
			bTakeACopy = false;
		}

		if (aArrayToBeSorted && aArrayToBeSorted.length > 0 && sPropertyName !== undefined && sPropertyName !== null && sPropertyName !== "") {

			if (bTakeACopy) {
				aSortedArray = jQuery.extend(true, [], aArrayToBeSorted);
			} else {
				aSortedArray = aArrayToBeSorted;
			}

			aSortedArray.sort(function(a, b) {
				var propertyA = a[sPropertyName];
				var propertyB = b[sPropertyName];
				if (propertyA < propertyB || (propertyA !== undefined && propertyB === undefined)) {
					return -1;
				}
				if (propertyA > propertyB || (propertyA === undefined && propertyB !== undefined)) {
					return 1;
				}
				return 0;
			});
		}
		return aSortedArray;
	};

	/**
	 * Returns copy of 'updated' oJsonBase from oJson (update on attribute level). If an item of oJson does not exist in
	 * oJsonBase then we take over complete oJson item.
	 * @param {object} oJsonBase: JSON object to which different properties from JSON oJson are added
	 * @param {object} oJson: JSON object from where the different properties are added to oJsonBase
	 * @returns {object} new JSON object as union result of oJsonBase and oJson
	 */
	ColumnsController.prototype.getUnionData = function(oJsonBase, oJson) {
		if (!oJson || !oJson.columns || !oJson.columns.columnsItems) {
			return Util.copy(oJsonBase);
		}
		var oUnion = Util.copy(oJson);

		Object.keys(oJsonBase.columns).forEach(function(sAttribute) {
			if (jQuery.isArray(oJsonBase.columns[sAttribute])) {
				oJsonBase.columns[sAttribute].forEach(function(oMItemBase) {
					var oMItemUnion = Util.getArrayElementByKey("columnKey", oMItemBase.columnKey, oUnion.columns[sAttribute]);
					if (!oMItemUnion) {
						oUnion.columns[sAttribute].push(oMItemBase);
						return;
					}
					if (oMItemUnion.visible === undefined && oMItemBase.visible !== undefined) {
						oMItemUnion.visible = oMItemBase.visible;
					}
					if (oMItemUnion.width === undefined && oMItemBase.width !== undefined) {
						oMItemUnion.width = oMItemBase.width;
					}
					if (oMItemUnion.total === undefined && oMItemBase.total !== undefined) {
						oMItemUnion.total = oMItemBase.total;
					}
					if (oMItemUnion.index === undefined && oMItemBase.index !== undefined) {
						oMItemUnion.index = oMItemBase.index;
					}
				});
				return;
			}
			if (oUnion.columns[sAttribute] === undefined && oJsonBase.columns[sAttribute] !== undefined) {
				oUnion.columns[sAttribute] = oJsonBase.columns[sAttribute];
			}
		}, this);

		return oUnion;
	};

	ColumnsController.prototype.fixConflictWithIgnore = function(oJson, oJsonIgnore) {
		if (!oJson || !oJson.columns || !oJson.columns.columnsItems || !oJsonIgnore || !oJsonIgnore.columns || !oJsonIgnore.columns.columnsItems || !oJsonIgnore.columns.columnsItems.length) {
			return oJson;
		}

		this._sortArrayByPropertyName(oJson.columns.columnsItems, "index");

		var bIsConflictSituation = false;
		oJsonIgnore.columns.columnsItems.forEach(function(oMItemIgnore) {
			var iIndex = Util.getIndexByKey("columnKey", oMItemIgnore.columnKey, oJson.columns.columnsItems);
			if (iIndex < 0 || oJson.columns.columnsItems[iIndex].index === undefined) {
				return;
			}
			if ((iIndex + 1 <= oJson.columns.columnsItems.length - 1 && oJson.columns.columnsItems[iIndex + 1].index === oJson.columns.columnsItems[iIndex].index) || (iIndex - 1 >= 0 && oJson.columns.columnsItems[iIndex - 1].index === oJson.columns.columnsItems[iIndex].index)) {
				bIsConflictSituation = true;
			}
			if (iIndex + 1 <= oJson.columns.columnsItems.length - 1 && oJson.columns.columnsItems[iIndex + 1].index === oJson.columns.columnsItems[iIndex].index) {
				var oMItem = oJson.columns.columnsItems.splice(iIndex, 1);
				oJson.columns.columnsItems.splice(iIndex + 1, 0, oMItem[0]);
			}
		});

		if (bIsConflictSituation) {
			var iItemIndex = -1;
			oJson.columns.columnsItems.forEach(function(oMItem) {
				if (oMItem.index !== undefined) {
					oMItem.index = ++iItemIndex;
				}
			});
		}
	};

	/**
	 * Determines whether a specific column is selected or not.
	 *
	 * @param {object} oPayload structure about the current selection coming from panel
	 * @param {object} oControlDataReduce structure about the current selection coming from model
	 * @param {string} sColumnKey column key of specific column
	 * @returns {boolean} true if specific column is selected, false if not
	 */
	ColumnsController.prototype.isColumnSelected = function(oPayload, oControlDataReduce, sColumnKey) {
		var iIndex;
		if (!oPayload) {
			iIndex = Util.getIndexByKey("columnKey", sColumnKey, oControlDataReduce.columnsItems);
			return (iIndex > -1) ? oControlDataReduce.columnsItems[iIndex].visible : false;
		}

		// oPayload has been passed...
		if (!oPayload.selectedItems) {
			return false;
		}
		iIndex = Util.getIndexByKey("columnKey", sColumnKey, oPayload.selectedItems);
		return iIndex > -1;
	};

	ColumnsController.prototype._monkeyPatchTable = function(oTable) {
		if (this.getTableType() !== sap.ui.comp.personalization.TableType.AnalyticalTable && this.getTableType() !== sap.ui.comp.personalization.TableType.Table && this.getTableType() !== sap.ui.comp.personalization.TableType.TreeTable) {
			return;
		}

		var that = this;
		var fSetFixedColumnCountOrigin = oTable.setFixedColumnCount.bind(oTable);
		var fSetFixedColumnCountOverwritten = function(iFixedColumnCount, bSuppressInvalidate) {
			that._onColumnFixedCount(iFixedColumnCount);
			fSetFixedColumnCountOrigin(iFixedColumnCount, bSuppressInvalidate);
		};
		if (oTable.setFixedColumnCount.toString() === fSetFixedColumnCountOverwritten.toString()) {
			// Do nothing if due to recursion the method is already overwritten.
			return;
		}
		oTable.setFixedColumnCount = fSetFixedColumnCountOverwritten;
	};

	/**
	 * Cleans up before destruction.
	 *
	 * @private
	 */
	ColumnsController.prototype.exit = function() {
		BaseController.prototype.exit.apply(this, arguments);

		var oTable = this.getTable();
		if (this.getTable() && (this.getTableType() === sap.ui.comp.personalization.TableType.AnalyticalTable || this.getTableType() === sap.ui.comp.personalization.TableType.Table || this.getTableType() === sap.ui.comp.personalization.TableType.TreeTable)) {
			oTable.detachColumnMove(this._onColumnMove, this);
			oTable.detachColumnVisibility(this._onColumnVisibility, this);
			oTable.detachColumnResize(this._onColumnResize, this);
		}
	};

	/* eslint-enable strict */

	return ColumnsController;

}, /* bExport= */true);
