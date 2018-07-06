/* global $ */
sap.ui.define([
		"sap/ui/base/EventProvider",
		"sap/ui/comp/personalization/Util",
		"sap/ui/table/AnalyticalTable",
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/FilterType",
		"sap/suite/ui/generic/template/AnalyticalListPage/util/FilterUtil","sap/m/Table"
	],
    function(EventProvider, PersonalizationControllerUtil, AnalyticalTable, Controller, FilterType, FilterUtil, ResponsiveTable) {
		"use strict";
		var eventProvider = new EventProvider();

		var tController = Controller.extend("sap.suite.ui.generic.template.AnalyticalListPage.controller.DetailController", {
			setState: function(oState) {
				//var me = this;
				this.oState = oState;
				this._enableExpandByFilter = true;
				this._enableUpdateExpandLevelInfo = false;
				
				var smartTable = this.oState.oSmartTable;
				//todo : commenting out row update method since we are trying to achieve CSS highlightin formatter
				//var table = smartTable.getTable();
				/*table.attachEvent("_rowsUpdated", function(ev) {
					if (me.oState.oSmartChart) {
						me._updateRows("_rowsUpdated");
					}
				});*/

				var oComponent = this.oState.oController.getOwnerComponent();
				//Default to filter behavior instead of highlight
				var oTemplatePrivate = this.oState.oController.getOwnerComponent().getModel("_templPriv");
				oTemplatePrivate.setProperty('/alp/autoHide', oComponent.getAutoHide() ? "filter" : "highlight");

				smartTable.attachInitialise(this._onSmartTableInit, this);
				smartTable.attachBeforeRebindTable(this._onBeforeRebindTable, this);

				// Since the SmartTable in this detail area is not directly connected to the SmartFilterBar, we need to intercept some of the regular events which
				// would cause an overlay to show on the SmartTable and simulate a direct connection.
				/*var origTableShowOverlay = this.oState.oSmartTable._showOverlay;
				this.oState.oSmartTable._showOverlay = function() {
					origTableShowOverlay.apply(me.oState.oSmartTable, arguments);
					smartTable._showOverlay.apply(smartTable, arguments);
				};*/
			},
			_onSmartTableInit: function() {
				var smartTable = this.oState.oSmartTable,
					toolbar = smartTable.getCustomToolbar(),
					oToolBarcontent = toolbar.getContent(),
					nSettingsLength ;
				//To check if navigation targets are supported of the toolbar buttons are supported
				this.oState.oTemplateUtils.oCommonUtils.checkToolbarIntentsSupported(smartTable);
				//Adding view switch button to smart table toolbar
				//BUttons added here as opposed to XML because of maintaining their position in toolbar
				if (this.oState._pendingTableToolbarInit) {
					if (!this.oState.oSmartFilterableKPI){
						toolbar.insertContent(this.oState.alr_viewSwitchButtonOnTable, oToolBarcontent.length);
					}
				}

				// Add to the SmartTable's toolbar to the left of the settings button.
				if ( this.oState._pendingTableToolbarInit ){
						// this block gets the position of the eye icon in the toolbar i.e just before the settins icon
						for (var i = 0; i < oToolBarcontent.length ;  i++) {
							if (oToolBarcontent[i].mProperties.text === "Settings") {
								nSettingsLength = i ;
                                                        }
						}
						toolbar.insertContent(this.oState._autoHideToggleBtn, nSettingsLength);
				}
				delete this.oState._pendingTableToolbarInit;
				//Disable the toolbars once search is triggered
				this.oState.oSmartTable.attachShowOverlay(function(oEvent){
					this.oState.oSmartTable.getCustomToolbar().setEnabled(!oEvent.getParameter("overlay").show);
				}, this);
				var tableHighlightModel = new sap.ui.model.json.JSONModel({"highlightMode":"rebindTable"});
				this.oState.oSmartTable.setModel(tableHighlightModel,"_tableHighlight");
			},
			//todo: remove this function if the table highlight logic works for all the tables 
			_onBindingDataReceived: function() {
				var table = this.oState.oSmartTable.getTable();

				// check if table is analytical
				if (table instanceof AnalyticalTable) {
					// new data has arrived, expand if needed
					this._expandByFilter("bindingDataReceived");
				}
				if (!this.isFilter() && this.oState.oSmartChart ) {
					//this._applyParamsToTableAsHighlight("bindingDataReceived");
				}
			},
			/**
			 * Called before rebinding table
			 * @param  {Object} oEvent Event Object
			 */
			_onBeforeRebindTable: function(oEvent) {
				var variant = this.oState.oSmartTable.fetchVariant(),
					lastVariant = variant,
					changeObject = {};
				if (!variant) {
					return;
				}
				var oTemplatePrivateModel = this.oState.oController.getOwnerComponent().getModel("_templPriv");
				//Ignore chart selections when there are fresh filters from SmartFilterBar
				var _ignoreChartSelections = oTemplatePrivateModel.getProperty('/alp/_ignoreChartSelections');
				//To apply chart selections on the table without using _applyParamToTableAsFilters()
				if (this.isFilter() && this.oState.oSmartChart && !_ignoreChartSelections) {
					this._applyChartSelectionOnTableAsFilter(oEvent);
				}

				// Update the chart with the personalization state
				// Get the list of grouped columns
				var groupList = [];
				var colList = this.oState.oSmartTable.getTable().getColumns();
				for (var i = 0; i < colList.length; i++) {
					var col = colList[i];
					//getGrouped is only available for Analytical Table
					if (col.getGrouped && col.getGrouped()) {
						groupList.push(col.getLeadingProperty ? col.getLeadingProperty() : PersonalizationControllerUtil.getColumnKey(col));
					}
				}

				this._updateExpandLevelInfo(groupList);

				var sortList = [];
				if (variant.sort && variant.sort.sortItems) {
					for (var i = 0; i < variant.sort.sortItems.length; i++) {
						var isDescending = variant.sort.sortItems[i].operation === "Descending" ? true : false;
						sortList.push(new sap.ui.model.Sorter(variant.sort.sortItems[i].columnKey, isDescending));
					}
				} else if (!lastVariant.sort) { // check if last variant had sort, if not -> all sort removed from table
					changeObject.allTableSortRemoved = true;
				}
				//Reset _ignoreChartSelections so SmartChart slection is not ignored during Table personalization change
				oTemplatePrivateModel.setProperty('/alp/_ignoreChartSelections',false);

				//Make sure views with paramters are working and change the tableBindingPath to the pattern parameterSet(params)/resultNavProp
				if (this.oState.oSmartFilterbar && this.oState.oSmartFilterbar.getAnalyticBindingPath && this.oState.oSmartFilterbar.getConsiderAnalyticalParameters()) {
					//catching an exception if no values are yet set.
					//TODO: This event actually shoudn't be called before mandatory fields are populated
					try {
						var sAnalyticalPath = this.oState.oSmartFilterbar.getAnalyticBindingPath();
						if (sAnalyticalPath) {
							this.oState.oSmartTable.setTableBindingPath(sAnalyticalPath);
						}
					} catch (e) {
						jQuery.sap.log.warning("Mandatory parameters have no values", "", "AnalyticalListPage");
					}
				}

				//Setting the provideTotalResultSize in binding parameters to improve performance for Analytical Table
				if (this.oState.oController.getOwnerComponent().getModel().getDefaultCountMode() === "None" && this.oState.oSmartTable._isAnalyticalTable){
					oEvent.mParameters.bindingParams.parameters.provideTotalResultSize = false;
					this.oState.oSmartTable.setShowRowCount(false);
				}
				var numberOfExpandedLevels = this._getValueFromCustomData(this.oState.oSmartTable, "InitialExpansionLevel");
				if (numberOfExpandedLevels) {
					oEvent.mParameters.bindingParams.parameters.numberOfExpandedLevels = parseInt(numberOfExpandedLevels, 10);
				}
				//Call controller extension
				this.oState.oController.onBeforeRebindTableExtension(oEvent);
				this.oState.oSmartTable.getModel("_tableHighlight").setProperty("/highlightMode","rebindTable");
				this._applyCriticalityInfo(oEvent, this.oState.oSmartTable);
			},
			///////////////////////
			// EVENT: TableChange
			///////////////////////
			attachTableChange: function(oData, fnFunction, oListener) {
				return eventProvider.attachEvent("TableChange", oData, fnFunction, oListener);
			},
			detachTableChange: function(fnFunction, oListener) {
				return eventProvider.detachEvent("TableChange", fnFunction, oListener);
			},
			/**
			 * Checks and confirm if autoHide mode is set for filter, if it is set for highlight then it will return false
			 * @return {Boolean} true for filter, false for highlight
			 */
			isFilter: function() {
				var oTemplatePrivate = this.oState.oController.getOwnerComponent().getModel("_templPriv");
				return oTemplatePrivate.getProperty("/alp/autoHide") === "filter";
			},
			applyParamsToTable: function() {
				var drillFiltersFromChart = this.oState.oSmartChart && this.oState.oSmartChart.getChart() && this.oState.oSmartChart.getDrillStackFilters(),
					bIsDrillStackExist = drillFiltersFromChart && drillFiltersFromChart.length,
					oChart = this.oState.oSmartChart.getChart(),
					oCharSelection;
				if (oChart && oChart._getVizFrame().vizSelection()) {
					var tableHighlightModel = this.oState.oSmartTable.getModel("_tableHighlight");
					oCharSelection = this.oState.oTemplateUtils.oCommonUtils.getSelectionPoints(oChart);
					// SmartChart has additional filters , added to SmartTable in _onBeforeRebindTable
					// oCharSelection && oCharSelection.count can be removed for highlight mode where there rebind is not required, but there are issues related to formatter called multiple times and CSS getting reset
					this.oState.oController.getOwnerComponent().getModel("_templPriv").setProperty('/alp/_ignoreChartSelections', false);
					if (this.isFilter() || (oCharSelection && oCharSelection.count) || tableHighlightModel.getProperty("/highlightMode") === "eyeModeSwitch" || bIsDrillStackExist) {
						this.oState.oSmartTable.rebindTable(true);
					} else {
						// rebind not required , no need to enhance the select query so sending undefined for oEvent
						this._applyCriticalityInfo(undefined, this.oState.oSmartTable);
						tableHighlightModel.refresh(true);
					}
				}
			},
			_getValueFromCustomData : function(smartTable, sPropertyName) {
				var _customData = smartTable.getCustomData();
				for (var i = 0; i < _customData.length; i++) {
					if (_customData[i].mProperties.key === sPropertyName) {
						if (sPropertyName === "lineItemCriticality") {
							return _customData[i].mProperties.value && JSON.parse(_customData[i].mProperties.value);
						} else {
							return _customData[i].mProperties.value;
						}
					}
				}
				return "";
			},
			_applyCriticalityInfo: function(oEvent, smartTable){

				var oTable = smartTable.getTable(),
				aBindingParts = [],
				oRowObject = [],
				me = this,
				oCriticality = this._getValueFromCustomData(smartTable, "lineItemCriticality");

				var chart = this.oState.oSmartChart && this.oState.oSmartChart.getChart();
				// on the initial load , the SmartChart is not yet rendered if the content view mode is table only view
				// or when the master view extension is present
				if (chart) {
					var aParamList = this._getSelParamsFromChart(chart);
					if (aParamList && aParamList.length > 0) {
						aParamList.forEach(function(element) {
							if (element) {
								var aKeys = Object.keys(element);
								if (aKeys) {
									aKeys.forEach(function(singleKey) {
										if (singleKey !== "__metadata" && oRowObject.indexOf(singleKey) < 0) {
											aBindingParts.push({
												path: singleKey
											});
											oRowObject.push(singleKey);
										}
									});
								}
							}
						});
					}
					this._setParamMap(chart);
				}
				// Criticality can come from path and as Enum from the annotation
				var sCriticalityPath = oCriticality && oCriticality.Path;
				if (sCriticalityPath) {
					aBindingParts.push({
						path: sCriticalityPath
					});
					// adding criticality to the select query of table - works only for 
					// if criticality is a dimension then it works only for GridTable and ResponsiveTable
					// Analytical table has a limitation and only properties can be added to the select query and others will be ignored
					if (oEvent && oEvent.mParameters) {
						oEvent.mParameters.bindingParams.parameters.select.indexOf(sCriticalityPath) === -1 ? oEvent.mParameters.bindingParams.parameters.select += "," + sCriticalityPath : "";
					}
				} else if (oCriticality && oCriticality.EnumMember) {
					aBindingParts.push({
						path : "EnumMember"
					});
				}// Criticality added to the aBindingParts

				me.isFilterMode = this.isFilter();
				me.isResponsive = oTable instanceof ResponsiveTable;
				// if the highlight mode is not rebindTable or eyeSwitch then add the highlightMode property
				// to the binding parts. Now the update of _tableHighlight model will re-trigger the formatter without triggering a batch
				if (!me.isFilterMode && smartTable.getModel("_tableHighlight").getProperty("/highlightMode") !== "eyeModeSwitch") {
					// adding a binding path from _tableHighlight model, refreshing or rebinding the main model attached to the table will trigger batch request which is not required for the highlight mode
					// the refresh of _tableHighlight model will re-trigger the formatter
					aBindingParts.push({
						path:"_tableHighlight>/highlightMode"
					});
				}
				// if there is no criticality or chart selection then the formatter is not necessary
				if (aBindingParts && aBindingParts.length > 0) {
					
					var highlightFormatter = function() {
						var paramMap = me._paramMap,
						_isFilterMode = me.isFilterMode;
						var _row = me.isResponsive ? this : this._getRow();
						if (!_row) {
							return;
						}
						
						if (_row.getBindingContext()) {
							var _isHighlight;
							var oRowContext = this.getBindingContext();

							//apply chart selection as highlight
							if (paramMap && !jQuery.isEmptyObject(paramMap)) {
								for (var name in paramMap) { // all parameters must match
									if (!oRowContext.getObject(name)) {// support for node level highlighting
										continue;
									}
									for (var i = 0 ; i < paramMap[name].length ; i++) {//handling multi chart selections
										if (paramMap[name][i] === oRowContext.getObject(name)) {
											_isHighlight = true;
											break;
										} else {
											_isHighlight = false;
										}
									}
								}
							} else {
								// non-data rows should not be highlighted
								_isHighlight = false;
							}
							// highlight is determined now , so apply to the row
							me._applyCSSHighlight(_row, _isFilterMode, _isHighlight);
							// handling criticality at the end
							// return will exit the formatter and CSS cannot be applied if called earlier
							if (sCriticalityPath) {
								var sRowCriticalityValue = oRowContext.getObject(sCriticalityPath);
								switch (sRowCriticalityValue && sRowCriticalityValue.toString()) {
									case "0":
										return "None";
									case "1":
										return "Error";
									case "2":
										return "Warning";
									case "3":
										return "Success";
									default :
										return "None";
								}
							} else if (oCriticality && oCriticality.EnumMember) {
								switch (oCriticality.EnumMember) {
									case "com.sap.vocabularies.UI.v1.CriticalityType/Neutral":
										return "None";
									case "com.sap.vocabularies.UI.v1.CriticalityType/Negative":
										return "Error";
									case "com.sap.vocabularies.UI.v1.CriticalityType/Critical":
										return "Warning";
									case "com.sap.vocabularies.UI.v1.CriticalityType/Positive":
										return "Success";
									default:
										return "None";
								}
							} else {
								return "None";
							}
						} else {
							me._applyCSSHighlight(_row, _isFilterMode, false);
							return "None";
						}
					};// END of highlight formatter
									
					if (me.isResponsive) {
						this.oState.alp_ColumnListItem.bindProperty("highlight", {
							parts: aBindingParts,
							formatter: highlightFormatter
						});
					} else {
						var oRowSettings = new sap.ui.table.RowSettings({
							highlight: {
								parts: aBindingParts,
								formatter: highlightFormatter
							}
						});
						oTable.setRowSettingsTemplate(oRowSettings);
					}
				} else {
					if (me.isResponsive){
						this.oState.alp_ColumnListItem.bindProperty("highlight",{
							path: "{_tableHighlight>/highlightMode}",
							formatter: function(){
								var _row = me.isResponsive ? this : this._getRow();
								if (!_row) {
									return;
								}
								// resetting CSS highlight as a fall back
								me._applyCSSHighlight(_row, false, false);
								return "None";
							}
						});
					} else {
						var oRowSettings = new sap.ui.table.RowSettings({
							highlight: {
								path: "{_tableHighlight>/highlightMode}",
								formatter:  function(){
									return "None";
								}
							}
						});
						oTable.setRowSettingsTemplate(oRowSettings);
					}
				}
			},
			/**
			 * Called for each row in the table to apply CSS highlight
			 * toggleClass is used for AnalyticalTable and GridTable , toggleStyleClass is used for ResponsiveTable
			 * @param  {Object} row object
			 * @param  {boolean} isFilterMode
			 * @param  {boolean} _isHighlight - true to apply highlight , false to remove highlight on the row
			 */
			_applyCSSHighlight : function(row, isFilterMode, isHighlight) {
				if (isHighlight === undefined) {
					return;
				}
				var domRef = row.getDomRefs ? row.getDomRefs(true) : row.getDomRef();
				if (domRef && domRef.row) {
					domRef.row.toggleClass("sapSmartTemplatesAnalyticalListPageRowHighlighted",(isFilterMode && isHighlight) ? isFilterMode : isHighlight);
				} else {
					row.toggleStyleClass("sapSmartTemplatesAnalyticalListPageRowHighlighted",(isFilterMode && isHighlight) ? isFilterMode : isHighlight);
				}
			},
			_getBindingProperty: function(binding, name) {
				if (binding.getProperty) {
					return binding.getProperty(name);
				} else {
					var propList = binding.oEntityType.property;
					for (var i = 0; i < propList.length; i++) {
						if (propList[i].name == name) {
							return propList[i];
						}
					}
					return null;
				}
			},
			_getPageFilters: function(oBinding) {
				var pageFilterList = this.oState.oSmartFilterbar.getFilters();

				for (var i = 0; i < pageFilterList.length; i++) {
					// in case there are more than one value in the filter
					// or the filter property is sap:filter-restriction="multi-value"
					if (pageFilterList[i].aFilters !== undefined) {

						var filterList = pageFilterList[i].aFilters;

						for (var j = 0; j < filterList.length; j++) {
							var filter = filterList[j];
							var name = filter.sPath;

							// Check if the filter exits
							if (!oBinding.getProperty(name)) {
								jQuery.sap.log.warning("Could not apply filter with name \"" + name + "\" as that field does not exist in the entity type");
								continue;
							}

							filter.sPath = name;
						}
					} else {
						// in case property with sap:filter-restriction="single-value" is the only value in the filter
						// if there are multiple properties with sap:filter-restriction="single-value" then it goes to if condition above
						var filter = pageFilterList[i];
						var name = filter.sPath;

						// Check if the filter exits
						if (!oBinding.getProperty(name)) {
							jQuery.sap.log.warning("Could not apply filter with name \"" + name + "\" as that field does not exist in the entity type");
							continue;
						}

						filter.sPath = name;

					}
				}

				return pageFilterList;
			},
			//todo: remove this function if the table highlight logic works for all the tables
			_applyParamsToTableAsHighlight: function(updateType) {
				if (!this.oState) {
					return;
				}
				var chart = this.oState.oSmartChart.getChart();
				if (!chart) {
					return;
				}
				var paramList = this._getSelParamsFromChart(chart);
				var dimNameList = chart.getVisibleDimensions();
				var lastSelected = this.oState.oSmartChart._lastSelected;
				var table = this.oState.oSmartTable.getTable();
				var binding = this._getTableBinding(table);
				if (!binding) { // if columns haven't been choosen then binding is undefined
					jQuery.sap.log.error("No table binding to apply the selection(s) to");
					return;
				}

				// get only those with actual binding values, filter out those without matching properties
				var paramListFiltered = [];
				for (var i = 0; i < paramList.length; i++) {
					var param = paramList[i];
					var paramMap = {};
					for (var name in param) { // all parameters must match
						// parameter must exist in the binding and the name must be in the dimension list
						if (dimNameList.indexOf(name) == -1 || !this._getBindingProperty(binding, name)) {
							continue;
						}
						paramMap[name] = param[name];
					}
					paramListFiltered.push(paramMap);
				}

				//Add drill down filters for highlight
				var drillFiltersFromChart = this.oState.oSmartChart.getDrillStackFilters();
				drillFiltersFromChart.forEach(function(oFilter) {
					var name = oFilter.sPath,
						obj = {};
					obj[name] = oFilter.oValue1;
					paramListFiltered.push(obj);
				});


				//Creating map from paramFilterList array.
				var paramMap = {};
				paramListFiltered.forEach(function(obj){
					for (var key in obj){
						//Checking for existing key in the map if not exist then add it and value is the array of 
						//all the value of same filter name e.g. paramListFiltered = [{'CompanyCode':'EASI'},{'CompanyCode':'0001'}]
						//gets Converted to paramMap = {CompanyCode = ['EASI','0001']}
						if (!paramMap.hasOwnProperty(key)){
							paramMap[key] = [obj[key]];
						} else {
							paramMap[key].push(obj[key]);
						}
					}
				});

				this._paramListFiltered = paramListFiltered;
				this._lastSelected = lastSelected;
				this._paramMap = paramMap;

				this._updateRows(updateType);
			},
			
			//SmartChart selections and drilldown stack is combined as a param map
			_setParamMap: function(chart) {
				var paramList = this._getSelParamsFromChart(chart);
				var dimNameList = chart.getVisibleDimensions();
				var drillFiltersFromChart = this.oState.oSmartChart.getDrillStackFilters();
				var paramMap = {} ;
				paramList.forEach( function(obj){
					for (var key in obj) {
						// ignore values not present in visible dimension list
						if (dimNameList.indexOf(key) == -1) {
							continue;
						}
						if (!paramMap.hasOwnProperty(key)) {
							paramMap[key] = [obj[key]];
						} else {
							paramMap[key].push(obj[key]);
						}
					}
				});
				drillFiltersFromChart.forEach(function(oFilter) {
					if (!paramMap.hasOwnProperty(oFilter.sPath)) {
							paramMap[oFilter.sPath] = [oFilter.oValue1];
					} else {
						// if the dimension value is already pushed by the selected params then do not add it again
						paramMap[oFilter.sPath].indexOf(oFilter.oValue1) === -1 ? paramMap[oFilter.sPath].push(oFilter.oValue1) : "";
					}
				});
				this._paramMap = paramMap;
			},
			
			//todo: remove this function if the table highlight logic works for all the tables
			_expandByFilter: function(updateType) {
				if (!this._enableExpandByFilter) {
					return;
				}

				var table = this.oState.oSmartTable.getTable();

				var binding = this._getTableBinding(table);
				if (binding && this._lastBinding != binding) {
					var me = this;

					binding.attachDataReceived(this._onBindingDataReceived, this);
					binding.attachEvent("change", function(ev) {
						if (me._expandingProgrammatically) {// then expansion triggered through the chart selection or data load, keep the current mode
							return;
						}

						var reason = ev.getParameter("reason");
						if (reason == "expand" ||  reason == "collapse") {// User triggered expansion, so don't sync Chart+Table
							me._inUserChartSelectMode = false;
						}
					});
					this._lastBinding = binding;
				}

				// no way to distinquish rowUpdate events that are data driven or user driven, but these must be distinquished in order to properly handle setting the first visible row of the table.
				// For example, the two events of end user scrolling, or the expansion completion cannot be distinguished.  But the first visible row should only be set if the expansion operation has completed (may require a backend call).
				if (updateType == "selection" || updateType == "bindingDataReceived") {
					this._firstVisibleRelevantEventTS = new Date().getTime();
				}

				if (updateType == "selection") {// User triggered selection in the chart, so sync Chart+Table
					this._inUserChartSelectMode = true;
				}

				if (!this._inUserChartSelectMode) {
					return;
				}

				var rowList = this._getTableRows();
				for (var i = 0; i < rowList.length; i++) {
					var row = rowList[i];

					// see if the row should be expanded
					var bindingCtxt = row.getBindingContext();
					if (!bindingCtxt) {
						continue;
					}

					var rowIndex = table.getFirstVisibleRow() + i;
					if (this._isRowHighlighted(bindingCtxt.getObject())) { // Row should be expanded
						if (table.isExpanded(rowIndex)) {// already expanded
							continue;
						}

						// Row should be expanded and is currently not expanded.
						if (!row._bHasChildren) {// not expandable
							continue;
						}

						if (!binding.findNode(rowIndex)) {// Not ready yet
							continue;
						}

						this._expandingProgrammatically = true;
						table.expand(rowIndex);
						this._expandingProgrammatically = false;
					} else { // Row should be collapsed
						if (!table.isExpanded(rowIndex)) {// already collapsed
							continue;
						}

						// Row should be collapsed and is currently not expanded.
						if (!row._bHasChildren) {// not collapsible
							continue;
						}

						if (!binding.findNode(rowIndex)) {// Not ready yet
							continue;
						}

						this._expandingProgrammatically = true;
						table.collapse(rowIndex);
						this._expandingProgrammatically = false;
					}
				}

				// determine the first visible row, find the first highlightable row
				this._updateFirstVisibleRow(updateType);
			},
			_updateFirstVisibleRow: function(updateType) {
				var table = this.oState.oSmartTable.getTable();

				var binding = this._getTableBinding(table);
				var count = binding.getTotalSize();
				if (count == 0 || (new Date().getTime() - this._firstVisibleRelevantEventTS) > 250) {
					return;
				}

				var table = this.oState.oSmartTable.getTable();
				if (updateType == "selection" && (!this._paramListFiltered || this._paramListFiltered.length == 0)) { // deselect all
					table.setFirstVisibleRow(0);
					return;
				}

				var bindingCtxtList = binding.getContexts(0, count);
				for (var i = 0; i < bindingCtxtList.length; i++) {
					// see if the row should be expanded
					var rowObj = bindingCtxtList[i].getObject();

					if (!this._isRowHighlighted(rowObj)) {
						continue;
					}

					if (this._lastSelected && !this._rowMatch(this._lastSelected, rowObj)) {// if a lastSelected, then use that to determine the firstVisibleRow
						continue;
					}

					var lastIndex = table.getFirstVisibleRow();
					if (updateType == "selection" || this.isFilter()) {
						table.setFirstVisibleRow(i);
					} else {
						if (i > lastIndex) {
							table.setFirstVisibleRow(i);
						}
					}

					break;
				}
			},
			_rowMatch: function(selObj, rowObj) {
				for (var name in selObj) {
					if (name.indexOf("__") != -1) {
						continue;
					}

					if (!rowObj.hasOwnProperty(name)) {// support for node level highlighting
						continue;
					}

					if (selObj[name] != rowObj[name]) {
						return false;
					}
				}

				return true;
			},
			_updateExpandLevelInfo: function(groupList) {
				if (!this._enableUpdateExpandLevelInfo) {// New design: don't autoexpand, keep code in case this is re-enabled
					return false;
				}

				var oTable = this.oState.oSmartTable.getTable();
				if (!oTable.getNumberOfExpandedLevels) {
					return false;
				}

				var oBinding = oTable.getBinding();
				if (!oBinding) {
					return false;
				}

				var expandLevels = groupList.length;

				var bLevelUpdate = false;
				if (expandLevels >= oBinding.aMaxAggregationLevel.length) {
					bLevelUpdate = true;
					expandLevels = oBinding.aMaxAggregationLevel.length - 1; // else null pointer exception
					this.wasAtMaxLevel = true;
				} else {
					bLevelUpdate = oTable.getNumberOfExpandedLevels() != expandLevels || this.wasAtMaxLevel;
					this.wasAtMaxLevel = false;
				}
				if (bLevelUpdate) {
					if (expandLevels >= 0) {
						oTable.setNumberOfExpandedLevels(expandLevels);
						oTable.bindRows(oTable.getBindingInfo("rows")); // trigger an update of the AnalyticalBinding's numberOfExpandedLevels property
					}

					// Firing the group event updates the personalization dialog, without this the table grouping state and personalization state would become inconsistent
					var groupedColList = oTable.getGroupedColumns();
					oTable.fireGroup({column: groupedColList[0], groupedColumns: groupedColList, type: sap.ui.table.GroupEventType.group});
				}

				return bLevelUpdate;
			},
			//todo: remove this function if the table highlight logic works for all the tables
			_updateRows: function(updateType) {
				//var chart = this.oState.oSmartChart.getChart();
				//var paramList = this._getSelParamsFromChart(chart);
				//this._latestUpdateRow(paramList.length);

				var table = this.oState.oSmartTable.getTable();

				// check if table is analytical
				if (table instanceof AnalyticalTable) {
					// expand corresponding nodes
					this._expandByFilter(updateType);
				}
			},
			_getTableRows: function() {
				var table = this.oState.oSmartTable.getTable();
				if (table.getRows) {
					return table.getRows();
				} else {
					return table.getItems();
				}
			},
			_isRowHighlighted: function(rowObj) {

				var paramMap = this._paramMap;
				//Checks if paramMap exist and should not have blank object
				if (!paramMap || jQuery.isEmptyObject(paramMap)) {
					return false;
				}

				var bMatch = true;
				// perform this operation for the number of data records present
				for (var name in paramMap) { // all parameters must match
					if (!rowObj.hasOwnProperty(name)) {// support for node level highlighting
						continue;
					}

					if (paramMap[name].indexOf(rowObj[name]) == -1) { // if one doesnt' match then skip to the next segement
						bMatch = false;
					}
				}

				return bMatch;

			},
			_getTableBinding: function (table) {
				//In case of ResponsiveTable, the aggregation is items, else it is either rows or blank
				return table.getBinding() ? table.getBinding() : table.getBinding("items");
			},
			/**
			 * To apply chart selection to Table as filters from_onBeforeRebindTable()
			 * @param  {Object} oEvent Event Object
			 */
			_applyChartSelectionOnTableAsFilter: function(oEvent) {
				//Apply drill down filters if available
				var filtersFromChart = this.oState.oSmartChart.getDrillStackFilters();
				oEvent.mParameters.bindingParams.filters.push.apply(oEvent.mParameters.bindingParams.filters, filtersFromChart);

				//This needs to be revisit when SmartChart provide direct Api for getting selected params.
				var chart = this.oState.oSmartChart.getChart();
				if (!chart) {
					return;
				}
				var paramList = this._getSelParamsFromChart(chart);

				if (paramList.length > 0){
					var dimNameList = chart.getVisibleDimensions();

					for (var i = 0; i < paramList.length; i++) {
						var param = paramList[i];

						for (var name in param) {
							// Check if the filter exits
							if (dimNameList.indexOf(name) == -1) {
								jQuery.sap.log.warning("Could not apply filter with name \"" + name + "\" as that field does not exist in the entity type");
								continue;
							}
							var bPreventDuplicateFilter = false;
							var oFilterList = oEvent.mParameters.bindingParams.filters;
							// only if there are filters then check for duplicate filters
							if (oFilterList.length > 0) {
								var oFilterList = oFilterList[0].aFilters ? oFilterList[0].aFilters : oFilterList;
								for (var j = 0; j < oFilterList.length; j++) {
									//aFilters are not present if there is only one filter applied in the SmartFilterBar
									//the structure of oFilterList changes accordingly
									var oDimensionFilter = oFilterList[j].aFilters ? oFilterList[j].aFilters : oFilterList;
									//check only if the dimension has only one filter , below cases are considered
									//case one : single-value filter
									//case two : multi-value with one filter
									//if more then one filters are present then simply ignore
									if (oDimensionFilter.length == 1) {
										//assuming the data always is present in the zero index for single filters
										if (oDimensionFilter[0].sPath === name && oDimensionFilter[0].oValue1 === param[name]) {
											bPreventDuplicateFilter = true;
										}
									}
								}
							}
							if (!bPreventDuplicateFilter) {
								//Pushing the chart selection in to oEvent filter list
								oEvent.mParameters.bindingParams.filters.push(new sap.ui.model.Filter({
										path: name,
										operator: sap.ui.model.FilterOperator.EQ,
										value1: param[name]
								}));
							}
						}
					}

				}
				//this._latestUpdateRow(paramList.length);
			},
			/**
			 * latest refactored update row code.
			 * @param  isHighlighted, boolean true/false.
			 */
			_latestUpdateRow: function(paramListLength){
				var isFilterMode = this.isFilter();
				var rowList = this._getTableRows();
				var isHighlighted = false;

				for (var i = 0; i < rowList.length; i++) {
					var row = rowList[i];

					if (!isFilterMode){
						if (row.getBindingContext()) {
							var rowObj = row.getBindingContext().getObject();
							isHighlighted = this._isRowHighlighted(rowObj);
						}
					}

					var domRef = row.getDomRefs ? row.getDomRefs(true) : row.getDomRef();
					if (!domRef) {
						continue;
					}
					if (domRef.row) {
						domRef.row.toggleClass("sapSmartTemplatesAnalyticalListPageRowHighlighted", (isFilterMode && paramListLength) ? isFilterMode : isHighlighted);
					} else {
						$(domRef).toggleClass("sapSmartTemplatesAnalyticalListPageRowHighlighted", (isFilterMode && paramListLength) ? isFilterMode : isHighlighted);
					}
				}
			},
			/**
			 * To extract selected param list from chart.
			 * @param  {Object} chart object
			 */
			_getSelParamsFromChart: function(chart) {
				var dpList = [];

				if (chart._getVizFrame().vizSelection()) {// workaround for bug in chart, will get null pointer exception if vizSelection is not checked
					dpList = this.oState.oTemplateUtils.oCommonUtils.getSelectionPoints(chart).dataPoints;
				}
				return this._getSelParamsFromDPList(dpList);
			},
			/**
			 * To extract selected param list from selected datapoints list from chart.
			 * @param  {Object} dpList datapoint list
			 */
			_getSelParamsFromDPList: function(dpList) {
				if (!dpList) {
					return [];
				}
				var paramList = [];
				for (var i = 0; i < dpList.length; i++) {
					var dp = dpList[i];
					var ctxt = dp.context;
					if (!ctxt) {// happens when drill down state has changed, chart is inconsistent at this point
						if (dp.dimensions){
							paramList.push(dp.dimensions);
						}
						continue;
					}
					var ctxtObj = ctxt.getProperty(ctxt.sPath);
					var param = {};
					if (this._selectFilterByMeasure) {
						for (var j = 0; j < dp.measures.length; j++) {
							var name = dp.measures[j];
							var val = ctxtObj[name];
							param[name] = val;
						}
					} else { // Filter by all measures/dimensions at the context path of the selected data point
						for (var name in ctxtObj) {
							param[name] = ctxtObj[name];
						}
					}
					paramList.push(param);
				}

				return paramList;
			}
		});

		return tController;
	});