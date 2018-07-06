/* eslint-disable strict */

/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */

// Provides DimeasureController
sap.ui.define([
	'jquery.sap.global', './BaseController', 'sap/m/library', 'sap/ui/comp/library', './ChartWrapper', './Util'
], function(jQuery, BaseController, MLibrary, CompLibrary, ChartWrapper, Util) {
	"use strict";

	/**
	 * The DimeasureController can be used to...
	 *
	 * @class Table Personalization Controller
	 * @extends sap.ui.comp.personalization.BaseController
	 * @author SAP SE
	 * @version 1.54.6
	 * @private
	 * @since 1.34.0
	 * @alias sap.ui.comp.DimeasureController
	 */
	var DimeasureController = BaseController.extend("sap.ui.comp.personalization.DimeasureController", /** @lends sap.ui.comp.personalization.DimeasureController */

		{
			constructor: function(sId, mSettings) {
				BaseController.apply(this, arguments);
			this.setType(sap.m.P13nPanelType.dimeasure);
			this.setItemType(sap.m.P13nPanelType.dimeasure + "Items");
			},
			metadata: {
				events: {
					afterDimeasureModelDataChange: {}
				}
			}
		});

	DimeasureController.prototype.setTable = function(oTable) {
		BaseController.prototype.setTable.apply(this, arguments);

		if (this.getTableType() !== sap.ui.comp.personalization.TableType.ChartWrapper) {
			throw "The provided object is incorrect. 'oTable' has to be an instance of sap.ui.comp.personalization.ChartWrapper. ";
		}

		var oChart = oTable.getChartObject();
		oChart.detachDrilledDown(this._onDrilledDown, this);
		oChart.attachDrilledDown(this._onDrilledDown, this);
		oChart.detachDrilledUp(this._onDrilledUp, this);
		oChart.attachDrilledUp(this._onDrilledUp, this);

		this._monkeyPatchTable(oChart);
	};

	DimeasureController.prototype._monkeyPatchTable = function(oChart) {
		var that = this;
		var fSetChartTypeOrigin = oChart.setChartType.bind(oChart);
		var fSetChartTypeOverwritten = function(sChartType) {
			fSetChartTypeOrigin(sChartType);
			that._onSetChartType(sChartType);
		};
		if (oChart.setChartType.toString() === fSetChartTypeOverwritten.toString()) {
			// Do nothing if due to recursion the method is already overwritten.
			return;
		}
		oChart.setChartType = fSetChartTypeOverwritten;
	};
	DimeasureController.prototype._onSetChartType = function(sChartType) {
		var oControlData = this.getControlData();

		if (!sChartType || sChartType === oControlData.dimeasure.chartTypeKey) {
			return;
		}
		this.fireBeforePotentialTableChange();

		// 1. update 'controlData'
		oControlData.dimeasure.chartTypeKey = sChartType;

		// 2. update 'controlDataBase'
		this.updateControlDataBaseFromJson(oControlData);

		this.fireAfterPotentialTableChange();
		this.fireAfterDimeasureModelDataChange();
	};

	DimeasureController.prototype._onDrilledDown = function(oEvent) {
		this.fireBeforePotentialTableChange();

		this._addVisibleDimensions(oEvent.getParameter("dimensions") || []);

		this.fireAfterPotentialTableChange();
		this.fireAfterDimeasureModelDataChange();
	};
	DimeasureController.prototype._addVisibleDimensions = function(aDimensions) {
		if (!aDimensions.length) {
			return;
		}
		var oControlData = this.getControlData();
		// Determine the count of all visible dimensions ignoring the passed ones.
		var iVisibleDimensionsCount = oControlData.dimeasure.dimeasureItems.filter(function(oMItem) {
			return oMItem.aggregationRole === CompLibrary.personalization.AggregationRole.Dimension && aDimensions.indexOf(oMItem.columnKey) < 0;
		}).reduce(function(iCount, oMItem) {
			return oMItem.visible ? iCount + 1 : iCount;
		}, 0);
		aDimensions.forEach(function(sColumnKey, iIndex) {
			var iIndexTo = iVisibleDimensionsCount + iIndex;
			var iIndexFrom = Util.getIndexByKey("columnKey", sColumnKey, oControlData.dimeasure.dimeasureItems);
			if (iIndexFrom < 0 || iIndexTo < 0 || iIndexFrom > oControlData.dimeasure.dimeasureItems.length - 1 || iIndexTo > oControlData.dimeasure.dimeasureItems.length - 1) {
				return;
			}

			// 1. update 'controlData'
			var aMItem = oControlData.dimeasure.dimeasureItems.splice(iIndexFrom, 1);
			aMItem[0].visible = true;
			oControlData.dimeasure.dimeasureItems.splice(iIndexTo, 0, aMItem[0]);

			var iItemIndex = -1;
			oControlData.dimeasure.dimeasureItems.forEach(function(oMItem) {
				if (oMItem.index !== undefined) {
					oMItem.index = ++iItemIndex;
				}
			});

			// 2. update 'controlDataBase'
			this.updateControlDataBaseFromJson(oControlData);
		}, this);
	};
	DimeasureController.prototype._onDrilledUp = function(oEvent) {
		this.fireBeforePotentialTableChange();

		var oControlData = this.getControlData();
		var aInvisibleDimensions = oEvent.getParameter("dimensions") || [];
		aInvisibleDimensions.forEach(function(sColumnKey) {
			// 1. update dimeasureItem in 'controlData'
			var oMItem = Util.getArrayElementByKey("columnKey", sColumnKey, oControlData.dimeasure.dimeasureItems);
			if (!oMItem) {
				throw "No entry found in 'controlDataBase' for columnKey '" + sColumnKey + "'";
			}
			oMItem.visible = false;

			// 2. update 'controlDataBase'
			this.updateControlDataBaseFromJson(oControlData);
		}, this);

		this.fireAfterPotentialTableChange();
		this.fireAfterDimeasureModelDataChange();
	};

	DimeasureController.prototype.getColumn2Json = function(oColumn, sColumnKey, iIndex) {
		if (!Util.isAggregatable(oColumn)) {
			return null;
		}
		return {
			columnKey: sColumnKey,
			index: iIndex,
			visible: oColumn.getVisible(),
			role: oColumn.getRole(),
			aggregationRole: oColumn.getAggregationRole()
			// this transient data we only keep in order to recognise internally in DimeasureController whether this is a dimension or measure
		};
	};
	DimeasureController.prototype.getAdditionalData2Json = function(oJsonData, oTable) {
		var oChart = oTable.getChartObject();
		oJsonData.dimeasure.chartTypeKey = oChart.getChartType();
	};
	DimeasureController.prototype.getColumn2JsonTransient = function(oColumn, sColumnKey, sText, sTooltip) {
		if (!Util.isAggregatable(oColumn)) {
			return null;
		}
		return {
			columnKey: sColumnKey,
			text: sText,
			tooltip: sTooltip,
			aggregationRole: oColumn.getAggregationRole()
		};
	};
	DimeasureController.prototype.handleIgnore = function(oJson, iIndex) {
		oJson.dimeasure.dimeasureItems[iIndex].visible = false;
	};
	DimeasureController.prototype.syncJson2Table = function(oJson) {
		var oChart = this.getTable().getChartObject();
		var fUpdateSelectedEntities = function(aDimeasureItems, aSelectedEntitiesOld, fSetSelectedEntities, fGetDimeasureByName) {
			var aDimeasureItemsCopy = Util.copy(aDimeasureItems);
			aDimeasureItemsCopy.sort(DimeasureController._sortByIndex);
			var aSelectedEntitiesNew = [];
			aDimeasureItemsCopy.forEach(function(oDimeasureItem) {
				if (oDimeasureItem.visible === true) {
					aSelectedEntitiesNew.push(oDimeasureItem.columnKey);
					var oDimeasure = fGetDimeasureByName(oDimeasureItem.columnKey);
					if (oDimeasure) {
						oDimeasure.setRole(oDimeasureItem.role);
					}
				}
			});
			if (JSON.stringify(aSelectedEntitiesNew) !== JSON.stringify(aSelectedEntitiesOld)) {
				fSetSelectedEntities(aSelectedEntitiesNew);
			}
		};

		// Apply changes to the Chart
		this.fireBeforePotentialTableChange();

		var aDimensionItems = oJson.dimeasure.dimeasureItems.filter(function(oMItem) {
			return oMItem.aggregationRole === sap.ui.comp.personalization.AggregationRole.Dimension;
		});
		var aMeasureItems = oJson.dimeasure.dimeasureItems.filter(function(oMItem) {
			return oMItem.aggregationRole === sap.ui.comp.personalization.AggregationRole.Measure;
		});

		var aVisibleDimensions = oChart.getVisibleDimensions();
		fUpdateSelectedEntities(aDimensionItems, aVisibleDimensions, oChart.setVisibleDimensions.bind(oChart), oChart.getDimensionByName.bind(oChart));
		var aVisibleMeasures = oChart.getVisibleMeasures();
		fUpdateSelectedEntities(aMeasureItems, aVisibleMeasures, oChart.setVisibleMeasures.bind(oChart), oChart.getMeasureByName.bind(oChart));

		oChart.setChartType(oJson.dimeasure.chartTypeKey);

		this.fireAfterPotentialTableChange();
	};

	/**
	 * Similar to 'getTable2Json'
	 */
	DimeasureController.prototype.getDataSuiteFormat2Json = function(oDataSuiteFormat) {
		var oJson = this.createControlDataStructure();
		var fnAddItemProperty = function(sColumnKey, sPropertyName, oPropertyValue) {
			var iIndex = Util.getIndexByKey("columnKey", sColumnKey, oJson.dimeasure.dimeasureItems);
			if (iIndex < 0) {
				iIndex = oJson.dimeasure.dimeasureItems.length;
				oJson.dimeasure.dimeasureItems.splice(iIndex, 0, {
					columnKey: sColumnKey
				});
			}
			oJson.dimeasure.dimeasureItems[iIndex][sPropertyName] = oPropertyValue;
		};

		// Based on 'controlDataInitial' set all 'visible' dimeasures as 'invisible'
		this.getControlDataInitial().dimeasure.dimeasureItems.filter(function(oMItem) {
			return oMItem.visible === true;
		}).forEach(function(oMItem) {
			fnAddItemProperty(oMItem.columnKey, "visible", false);
		});

		// Take over 'Visualizations'
		if (oDataSuiteFormat.Visualizations && oDataSuiteFormat.Visualizations.length) {
			var aChartVisualizations = oDataSuiteFormat.Visualizations.filter(function(oVisualization) {
				return oVisualization.Type === "Chart";
			});
			if (aChartVisualizations.length) {
				var iVisibleDimensionsLength = 0;
				if (aChartVisualizations[0].Content.Dimensions.length) {
					iVisibleDimensionsLength = aChartVisualizations[0].Content.Dimensions.length;
					aChartVisualizations[0].Content.Dimensions.forEach(function(sName, iIndex) {
						var oAttribute = Util.getArrayElementByKey("Dimension", sName, aChartVisualizations[0].Content.DimensionAttributes);
						fnAddItemProperty(sName, "visible", true);
						fnAddItemProperty(sName, "index", iIndex);
						if (oAttribute && oAttribute.Role) {
							fnAddItemProperty(sName, "role", sap.ui.comp.odata.ChartMetadata.getDimensionRole(oAttribute.Role));
						}
						fnAddItemProperty(sName, "aggregationRole", sap.ui.comp.personalization.AggregationRole.Dimension);
					}, this);
				}
				if (aChartVisualizations[0].Content.Measures.length) {
					aChartVisualizations[0].Content.Measures.forEach(function(sName, iIndex) {
						var oAttribute = Util.getArrayElementByKey("Measure", sName, aChartVisualizations[0].Content.MeasureAttributes);
						fnAddItemProperty(sName, "visible", true);
						fnAddItemProperty(sName, "index", iVisibleDimensionsLength + iIndex);
						if (oAttribute && oAttribute.Role) {
							fnAddItemProperty(sName, "role", sap.ui.comp.odata.ChartMetadata.getMeasureRole(oAttribute.Role));
						}
						fnAddItemProperty(sName, "aggregationRole", sap.ui.comp.personalization.AggregationRole.Measure);
					}, this);
				}
			}
			// Note: if runtime error occurs because sap.chart library has not been loaded (there is dependency to sap.chart inside of sap.ui.comp.odata.ChartMetadata) then the caller of DimeasureController has to load the sap.chart library.
			oJson.dimeasure.chartTypeKey = sap.ui.comp.odata.ChartMetadata.getChartType(aChartVisualizations[0].Content.ChartType);
		}
		return oJson;
	};
	/**
	 * Creates, if not already exists, property <code>Visualizations</code> in <code>oDataSuiteFormat</code> object if at least one dimeasure item exists. Adds an object of the current PersistentData snapshot into <code>Visualizations</code> array.
	 * @param {object} oDataSuiteFormat Structure of Data Suite Format
	 */
	DimeasureController.prototype.getDataSuiteFormatSnapshot = function(oDataSuiteFormat) {
		var oControlDataTotal = this.getUnionData(this.getControlDataInitial(), this.getControlData());
		if (!oControlDataTotal.dimeasure || !oControlDataTotal.dimeasure.dimeasureItems || !oControlDataTotal.dimeasure.dimeasureItems.length) {
			return;
		}

		// Fill 'Visualizations'
		var aDimensionItemsVisible = oControlDataTotal.dimeasure.dimeasureItems.filter(function(oMItem) {
			return oMItem.aggregationRole === sap.ui.comp.personalization.AggregationRole.Dimension;
		}).filter(function(oMItem) {
			return oMItem.visible === true;
		});
		var aMeasureItemsVisible = oControlDataTotal.dimeasure.dimeasureItems.filter(function(oMItem) {
			return oMItem.aggregationRole === sap.ui.comp.personalization.AggregationRole.Measure;
		}).filter(function(oMItem) {
			return oMItem.visible === true;
		});
		if (aDimensionItemsVisible.length || aMeasureItemsVisible.length) {
			if (!oDataSuiteFormat.Visualizations) {
				oDataSuiteFormat.Visualizations = [];
			}
			oDataSuiteFormat.Visualizations.push({
				Type: "Chart",
				Content: {
					// Note: if runtime error occurs because sap.chart library has not been loaded (there is dependency to sap.chart inside of sap.ui.comp.odata.ChartMetadata) then the caller of DimeasureController has to load the sap.chart library.
					ChartType: sap.ui.comp.odata.ChartMetadata.getAnnotationChartType(oControlDataTotal.dimeasure.chartTypeKey),
					Dimensions: aDimensionItemsVisible.map(function(oDimensionItem) {
						return oDimensionItem.columnKey;
					}),
					DimensionAttributes: aDimensionItemsVisible.map(function(oDimensionItem) {
						return {
							Dimension: oDimensionItem.columnKey,
							Role: sap.ui.comp.odata.ChartMetadata.getAnnotationDimensionRole(oDimensionItem.role)
						};
					}),
					Measures: aMeasureItemsVisible.map(function(oMeasureItem) {
						return oMeasureItem.columnKey;
					}),
					MeasureAttributes: aMeasureItemsVisible.map(function(oMeasureItem) {
						return {
							Measure: oMeasureItem.columnKey,
							Role: sap.ui.comp.odata.ChartMetadata.getAnnotationMeasureRole(oMeasureItem.role)
						};
					})
				}
			});
		}
	};

	/**
	 * Returns a ColumnsPanel control
	 *
	 * @returns {sap.m.P13nDimMeasurePanel} returns a new created ColumnsPanel
	 */
	DimeasureController.prototype.getPanel = function(oPayload) {

		// Note: in the time where controller gets the panel all table columns are present (also missing columns).
		// Note: in case that all aggregatable columns are excluded we nevertheless have to create the panel for the case that some aggregatable columns will be included.
		if (!Util.hasAggregatableColumns(this.getColumnMap())) {
			return null;
		}

		sap.ui.getCore().loadLibrary("sap.m");
		jQuery.sap.require("sap/m/P13nDimMeasurePanel");
		jQuery.sap.require("sap/m/P13nItem");
		jQuery.sap.require("sap/m/P13nDimMeasureItem");

		var that = this;
		var aAvailableChartTypes = [];
		if (oPayload && oPayload.availableChartTypes) {
			aAvailableChartTypes = oPayload.availableChartTypes;
		}
		return new sap.m.P13nDimMeasurePanel({
					availableChartTypes: aAvailableChartTypes,
					chartTypeKey: "{$sapmP13nPanel>/controlDataReduce/dimeasure/chartTypeKey}",
					items: {
						path: '$sapmP13nPanel>/transientData/dimeasure/dimeasureItems',
				template: new sap.m.P13nItem({
							columnKey: '{$sapmP13nPanel>columnKey}',
							text: '{$sapmP13nPanel>text}',
							tooltip: '{$sapmP13nPanel>tooltip}',
							aggregationRole: '{$sapmP13nPanel>aggregationRole}'
						})
					},
					dimMeasureItems: {
						path: "$sapmP13nPanel>/controlDataReduce/dimeasure/dimeasureItems",
				template: new sap.m.P13nDimMeasureItem({
							columnKey: "{$sapmP13nPanel>columnKey}",
							index: "{$sapmP13nPanel>index}",
							visible: "{$sapmP13nPanel>visible}",
							role: "{$sapmP13nPanel>role}"
						})
					},
					beforeNavigationTo: that.setModelFunction(),
					changeChartType: function(oEvent) {
						var oControlDataReduce = that.getControlDataReduce();
						oControlDataReduce.dimeasure.chartTypeKey = oEvent.getParameter("chartTypeKey");
						that.setControlDataReduce2Model(oControlDataReduce);
					},
					changeDimMeasureItems: function(oEvent) {
						if (!oEvent.getParameter("items")) {
							return;
						}
						var aItemsChanged = oEvent.getParameter("items");
						var oControlDataReduce = that.getControlDataReduce();
						oControlDataReduce.dimeasure.dimeasureItems.forEach(function(oMItemReduce) {
							var oMItemChanged = Util.getArrayElementByKey("columnKey", oMItemReduce.columnKey, aItemsChanged);
							if (!oMItemChanged) {
								return;
							}
					// We can not just take over the 'items' from P13nColumnsPanel and overwrite the 'controlDataReduce' because
							// the 'items' structure does not contain all parameters of 'controlDataReduce' (e.g. 'aggregationRole')
							oMItemReduce.index = oMItemChanged.index;
							oMItemReduce.visible = oMItemChanged.visible;
							oMItemReduce.role = oMItemChanged.role;
						});
						that.setControlDataReduce2Model(oControlDataReduce);
					}
		});
	};

	DimeasureController.prototype._isDimMeasureItemEqual = function(oDimMeasureItemA, oDimMeasureItemB) {
		if (!oDimMeasureItemA && !oDimMeasureItemB) {
			return true;
		}
		if (oDimMeasureItemA && !oDimMeasureItemB) {
			if (oDimMeasureItemA.index === -1 && oDimMeasureItemA.visible === false) {
				return true;
			}
			return false;
		}
		if (oDimMeasureItemB && !oDimMeasureItemA) {
			if (oDimMeasureItemB.index === -1 && oDimMeasureItemB.visible === false) {
				return true;
			}
			return false;
		}
		for ( var property in oDimMeasureItemA) {
			if (oDimMeasureItemB[property] === undefined || oDimMeasureItemA[property] !== oDimMeasureItemB[property]) {
				return false;
			}
		}
		return true;
	};

	DimeasureController.prototype._isSemanticEqual = function(oPersistentDataBase, oPersistentData) {
		if (oPersistentDataBase.dimeasure.chartTypeKey !== oPersistentData.dimeasure.chartTypeKey) {
			return false;
		}
		var fSort = function(a, b) {
			if (a.visible === true && (b.visible === false || b.visible === undefined)) {
				return -1;
			} else if ((a.visible === false || a.visible === undefined) && b.visible === true) {
				return 1;
			} else if (a.visible === true && b.visible === true) {
				if (a.index < b.index) {
					return -1;
				} else if (a.index > b.index) {
					return 1;
				} else {
					return 0;
				}
			} else if ((a.visible === false || a.visible === undefined) && (b.visible === false || b.visible === undefined)) {
				if (a.columnKey < b.columnKey) {
					return -1;
				} else if (a.columnKey > b.columnKey) {
					return 1;
				} else {
					return 0;
				}
			}
		};
		var aDimeasureItemsBase = Util.copy(oPersistentDataBase.dimeasure.dimeasureItems).sort(fSort);
		var aDimeasureItems = Util.copy(oPersistentData.dimeasure.dimeasureItems).sort(fSort);
		// if (aDimeasureItems.length !== aDimeasureItemsBase.length) {
		// return false;
		// }
		var bIsEqual = true;
		aDimeasureItemsBase.some(function(oDimeasureItem, iIndex) {
			if (!this._isDimMeasureItemEqual(oDimeasureItem, aDimeasureItems[iIndex])) {
				bIsEqual = false;
				return true;
			}
		}, this);
		return bIsEqual;
	};

	/**
	 * Operations on columns are processed every time directly at the table. In case that something has been changed via Personalization Dialog or via
	 * user interaction at table, change is applied to the table.
	 *
	 * @param {object} oPersistentDataBase (new) JSON object
	 * @param {object} oPersistentDataCompare (old) JSON object
	 * @returns {object} that represents the change type, like: Unchanged || TableChanged || ModelChanged
	 */
	DimeasureController.prototype.getChangeType = function(oPersistentDataBase, oPersistentDataCompare) {
		if (!oPersistentDataCompare || !oPersistentDataCompare.dimeasure || !oPersistentDataCompare.dimeasure.dimeasureItems) {
			return sap.ui.comp.personalization.ChangeType.Unchanged;
		}
		return this._isSemanticEqual(oPersistentDataBase, oPersistentDataCompare) ? sap.ui.comp.personalization.ChangeType.Unchanged : sap.ui.comp.personalization.ChangeType.TableChanged;
	};

	/**
	 * Result is XOR based difference = oPersistentDataBase - oPersistentDataCompare (new - old)
	 *
	 * @param {object} oPersistentDataBase (new) JSON object which represents the current model state (Restore+PersistentData)
	 * @param {object} oPersistentDataCompare (old) JSON object which represents AlreadyKnown || Restore
	 * @returns {object} JSON object or null
	 */
	DimeasureController.prototype.getChangeData = function(oPersistentDataBase, oPersistentDataCompare) {

		if (!oPersistentDataBase || !oPersistentDataBase.dimeasure || !oPersistentDataBase.dimeasure.dimeasureItems) {
			return this.createControlDataStructure();
		}

		if (!oPersistentDataCompare || !oPersistentDataCompare.dimeasure || !oPersistentDataCompare.dimeasure.dimeasureItems) {
			return {
				chartTypeKey: oPersistentDataBase.dimeasure.chartTypeKey,
				dimeasure: Util.copy(oPersistentDataBase.dimeasure)
			};
		}
		if (!this._isSemanticEqual(oPersistentDataBase, oPersistentDataCompare)) {
			return {
				chartTypeKey: oPersistentDataBase.dimeasure.chartTypeKey,
				dimeasure: Util.copy(oPersistentDataBase.dimeasure)
			};
		}
		return null;
	};

	/**
	 * @param {object} oJsonBase: JSON object to which different properties from oDataNew are added. E.g. Restore
	 * @param {object} oJson: JSON object from where the different properties are added to oDataOld. E.g. CurrentVariant || PersistentData
	 * @returns {object} new JSON object as union result of oDataOld and oPersistentDataCompare
	 */
	DimeasureController.prototype.getUnionData = function(oJsonBase, oJson) {
		if (!oJson || !oJson.dimeasure || !oJson.dimeasure.dimeasureItems) {
			return Util.copy(oJsonBase);
		}
		var oUnion = Util.copy(oJson);

		Object.keys(oJsonBase.dimeasure).forEach(function(sAttribute) {
			if (jQuery.isArray(oJsonBase.dimeasure[sAttribute])) {
				oJsonBase.dimeasure[sAttribute].forEach(function(oMItemBase) {
					var oMItemUnion = Util.getArrayElementByKey("columnKey", oMItemBase.columnKey, oUnion.dimeasure[sAttribute]);
					if (!oMItemUnion) {
						oUnion.dimeasure[sAttribute].push(oMItemBase);
						return;
					}
					if (oMItemUnion.visible === undefined && oMItemBase.visible !== undefined) {
						oMItemUnion.visible = oMItemBase.visible;
					}
					if (oMItemUnion.role === undefined && oMItemBase.role !== undefined) {
						oMItemUnion.role = oMItemBase.role;
					}
					if (oMItemUnion.index === undefined && oMItemBase.index !== undefined) {
						oMItemUnion.index = oMItemBase.index;
					}
					if (oMItemUnion.aggregationRole === undefined && oMItemBase.aggregationRole !== undefined) {
						oMItemUnion.aggregationRole = oMItemBase.aggregationRole;
					}
				});
				return;
			}
			if (oUnion.dimeasure[sAttribute] === undefined && oJsonBase.dimeasure[sAttribute] !== undefined) {
				oUnion.dimeasure[sAttribute] = oJsonBase.dimeasure[sAttribute];
			}
		}, this);

		return oUnion;
	};

	DimeasureController._sortByIndex = function(a, b) {
		if (a.index < b.index) {
			return -1;
		} else if (a.index > b.index) {
			return 1;
		} else {
			return 0;
		}
	};
	/**
	 * Cleans up before destruction.
	 *
	 * @private
	 */
	DimeasureController.prototype.exit = function() {
		BaseController.prototype.exit.apply(this, arguments);

		var oTable = this.getTable();
		if (oTable) {
			var oChart = oTable.getChartObject();
			if (oChart) {
				oChart.detachDrilledDown(this._onDrilledDown, this);
				oChart.detachDrilledUp(this._onDrilledUp, this);
			}
		}
	};

	/* eslint-enable strict */

	return DimeasureController;

}, /* bExport= */true);
