/**
 * @fileOverview Library to Manage rendering of Viz Charts.
 * Reads configuration from config.js.
 */

(function () {
	"use strict";
	jQuery.sap.declare("sap.ovp.cards.charts.SmartAnnotationManager");
	jQuery.sap.require("sap.ovp.cards.charts.Utils");
	sap.ovp.cards.charts.SmartAnnotationManager = sap.ovp.cards.charts.SmartAnnotationManager || {};


	/* All constants feature here */
	sap.ovp.cards.charts.SmartAnnotationManager.constants = {
		LABEL_KEY: "sap:label",
        LABEL_KEY_V4:"com.sap.vocabularies.Common.v1.Label", //as part of supporting V4 annotation
		TEXT_KEY: "sap:text",
        TEXT_KEY_V4:"com.sap.vocabularies.Common.v1.Text", //as part of supporting V4 annotation
		TYPE_KEY: "type",
		DISPLAY_FORMAT_KEY: "sap:display-format",
		SEMANTICS_KEY: "sap:semantics",
		UNIT_KEY: "sap:unit",
        UNIT_KEY_V4_ISOCurrency:"Org.OData.Measures.V1.ISOCurrency", //as part of supporting V4 annotation
        UNIT_KEY_V4_Unit:"Org.OData.Measures.V1.Unit", //as part of supporting V4 annotation
		CURRENCY_CODE: "currency-code",
		NAME_KEY: "name",
		NAME_CAP_KEY: "Name",
		EDM_TYPE: "type",
		EDM_INT32: "Edm.Int32",
		SCATTER_CHARTTYPE:"com.sap.vocabularies.UI.v1.ChartType/Scatter",
		BUBBLE_CHARTTYPE:"com.sap.vocabularies.UI.v1.ChartType/Bubble",
		LINE_CHARTTYPE:"com.sap.vocabularies.UI.v1.ChartType/Line"
	};
	
	/* All constants for error messages feature here */
	sap.ovp.cards.charts.SmartAnnotationManager.errorMessages = {
		CARD_WARNING: "OVP-AC: Analytic card: Warning: ",	
		CARD_ERROR: "OVP-AC: Analytic card Error: ",
		DATA_ANNO_ERROR: "OVP-AC: Analytic card Error:",
		CARD_ANNO_ERROR: "OVP-AC: Analytic card: Error ",
		CHART_ANNO_ERROR: "OVP-AC: Analytic card: Error ",
		INVALID_CHART_ANNO: "OVP-AC: Analytic Cards: Invalid Chart Annotation.",
		ANALYTICAL_CONFIG_ERROR: "Analytic card configuration error",
		CACHING_ERROR: "no model defined while caching OdataMetaData",
		INVALID_MAXITEMS: "maxItems is Invalid. ",
		NO_DATASET: "OVP-AC: Analytic Cards: Could not obtain dataset.",
		SORTORDER_WARNING:"SortOrder is present in PresentationVariant, but it is empty or not well formed.",
		BOOLEAN_ERROR: "Boolean value is not present in PresentationVariant.",
		IS_MANDATORY: "is mandatory.",
		IS_MISSING: "is missing.",
		NOT_WELL_FORMED: "is not found or not well formed)",
		MISSING_CHARTTYPE: "Missing ChartType in ",
		CHART_ANNO: "Chart Annotation.",
		DATA_ANNO: "Data Annotation",
		CARD_ANNO: "card annotation.",
		CARD_CONFIG: "card configuration.",
		CARD_CONFIG_ERROR: "Could not obtain configuration for ",
		CARD_CONTAINER_ERROR: "Could not obtain card container. ",
		DATA_UNAVAIALABLE: "No data available.",
		CONFIG_LOAD_ERROR: "Failed to load config.json. Reason: ",
		INVALID_CHARTTYPE: "Invalid ChartType given for ",
		INVALID_CONFIG: "No valid configuration given for ",
		CONFIG_JSON: "in config.json",
		ENTER_INTEGER: "Please enter an Integer.",
		NO_CARD_MODEL: "Could not obtain Cards model.",
		ANNO_REF: "com.sap.vocabularies.UI.v1 annotation.",
		INVALID_REDUNDANT: "Invalid/redundant role configured for ",
		CHART_IS: "chart is/are ",
		CARD_CONFIG_JSON:"card from config.json",
		ALLOWED_ROLES: "Allowed role(s) for ",
		DIMENSIONS_MANDATORY: "DimensionAttributes are mandatory.",
		MEASURES_MANDATORY: "MeasureAttributes are mandatory.",
		CARD_LEAST: "card: Enter at least ",
		CARD_MOST: "card: Enter at most ",
		FEEDS: "feed(s).",
		MIN_FEEDS: "Minimum number of feeds required for ",
		FEEDS_OBTAINED: "card is not configured. Obtained ",
		FEEDS_REQUIRED: "feed(s), Required: ",
		INVALID_SEMANTIC_MEASURES: "More than one measure is being semantically coloured",
		INVALID_IMPROVEMENT_DIR: "No Improvement Direction Found",
		INVALID_CRITICALITY: "Invalid criticality values",
		INVALID_DIMMEAS: "Invalid number of Measures or Dimensions",
		INVALID_FORECAST: "Invalid/Redundant Datapoint or Forecast measure",
		ERROR_MISSING_AXISSCALES:"Minimum and Maximum values are mandatory for AxisScale MinMax to work"
	};


	/*
	 * Reads filters from annotation and prepares data binding path
	 */
	sap.ovp.cards.charts.SmartAnnotationManager.formatItems = function(iContext, oEntitySet, oSelectionVariant, oPresentationVariant, oDimensions, oMeasures, chartType) {
		var dataModel = iContext.getSetting("dataModel");
		var chartEnumArr;
		if (chartType && chartType.EnumMember) {
			chartEnumArr = chartType.EnumMember.split("/");
			if (chartEnumArr && ( chartEnumArr[1] != 'Donut' ) && (oDimensions === undefined)) {
				return null;
			}
//			if (chartEnumArr && ( chartEnumArr[1] === 'Donut' ) ) {
			if (chartEnumArr) {
				dataModel.setDefaultCountMode(sap.ui.model.odata.CountMode.Inline);
			}
		}
		var ret = "{";
		var dimensionsList = [];
		var measuresList = [];
		var sorterList = [];
		var bFilter = oSelectionVariant && oSelectionVariant.SelectOptions;
		var bParams = oSelectionVariant && oSelectionVariant.Parameters;
		var bSorter = oPresentationVariant && oPresentationVariant.SortOrder;
		var maxItemTerm = oPresentationVariant && oPresentationVariant.MaxItems, maxItems = null;
		var aConfigFilters;
		var tmp;
		var entitySet = null;
		var self = sap.ovp.cards.charts.SmartAnnotationManager;
		var textKey = self.constants.TEXT_KEY;
		var textKeyV4 = self.constants.TEXT_KEY_V4; //as part of supporting V4 annotation
		var unitKey = self.constants.UNIT_KEY;
		var unitKey_v4_isoCurrency = self.constants.UNIT_KEY_V4_ISOCurrency; //as part of supporting V4 annotation
		var unitKey_v4_unit = self.constants.UNIT_KEY_V4_Unit; //as part of supporting V4 annotation

		if (maxItemTerm) {
			maxItems = maxItemTerm.Int32 ? maxItemTerm.Int32 : maxItemTerm.Int;
		}

		if (maxItems) {
			if (maxItems == "0") {
				jQuery.sap.log.error("OVP-AC: Analytic card Error: maxItems is configured as " +
					maxItems);
				ret += "}";
				return ret;
			}
			if (!/^\d+$/.test(maxItems)) {
				jQuery.sap.log.error("OVP-AC: Analytic card Error: maxItems is Invalid. " +
					"Please enter an Integer.");
				ret += "}";
				return ret;
			}
		}

		var reference, config, dataStep,
		allConfig = self.getConfig(),
		ovpCardProperties = iContext.getSetting('ovpCardProperties');
		if (oDimensions) {
			for (var key in allConfig) {
				if ((reference = allConfig[key].reference) &&
						allConfig[reference]) {
					var virtualEntry = jQuery.extend(true, {}, allConfig[reference]);
					allConfig[key] = virtualEntry;
				}
				if (allConfig[key].default.type == chartEnumArr[1].toLowerCase() ||
						(allConfig[key].time && allConfig[key].time.type == chartEnumArr[1].toLowerCase())) {
					config = allConfig[key];
					break;
				}
			}

			var bSupportsTimeSemantics = sap.ovp.cards.charts.VizAnnotationManager.hasTimeSemantics(oDimensions, config, dataModel, entitySet);
			if (bSupportsTimeSemantics) {
				config = config.time;
			} else {
				config = config.default;
			}
			dataStep = ovpCardProperties.getProperty('/dataStep');
			if (!dataStep) {
				if (config.resize && config.resize.hasOwnProperty('dataStep')) {
					dataStep = config.resize.dataStep;
					ovpCardProperties.setProperty('/dataStep', dataStep);
				}
			}
		}

		if (ovpCardProperties.getProperty('/layoutDetail') === 'resizable') {
			var colSpan = ovpCardProperties.getProperty('/cardLayout/colSpan');
			maxItems = +maxItems + +dataStep * (colSpan - 1);
		}

		var aParameters = ovpCardProperties.getProperty('/parameters');
		bParams = bParams || !!aParameters;

		if (bParams) {
			var path = sap.ovp.cards.AnnotationHelper.resolveParameterizedEntitySet(dataModel, oEntitySet, oSelectionVariant, aParameters);
			ret += "path: '" + path + "'";
		} else {
			ret += "path: '/" + oEntitySet.name + "'";
		}

		var filters = [];
		if (!iContext || !iContext.getSetting('ovpCardProperties')) {
			jQuery.sap.log.error(self.errorMessages.ANALYTICAL_CONFIG_ERROR);
			ret += "}";
			return ret;
		}
		entitySet = iContext.getSetting('ovpCardProperties').getProperty("/entitySet");
		if (!dataModel || !entitySet) {
			return ret;
		}
		var oMetadata = self.getMetadata(dataModel, entitySet);
		aConfigFilters = iContext.getSetting('ovpCardProperties').getProperty("/filters");

		if (bFilter) {
			jQuery.each(oSelectionVariant.SelectOptions, function() {
				var prop = this.PropertyName.PropertyPath;
				jQuery.each(this.Ranges, function() {
					if (this.Sign.EnumMember === "com.sap.vocabularies.UI.v1.SelectionRangeSignType/I") {
						var filtervalue = sap.ovp.cards.charts.SmartAnnotationManager.getPrimitiveValue(this.Low);
						var filtervaueHigh = this.High && this.High.String;
						var formatByType = self.formatByType;
						filtervalue = formatByType(oMetadata, prop, filtervalue);
						var filter = {
								path : prop,
								operator : this.Option.EnumMember.split("/")[1],
								value1 : filtervalue
						};
						if (filtervaueHigh) {
							filter.value2 = formatByType(oMetadata, prop, filtervaueHigh);
						}
						filters.push(filter);
					}
				});
			});
		}

		/*
		 * code for ObjectStream
		 */
		if (aConfigFilters && aConfigFilters.length > 0){
			filters = filters.concat(aConfigFilters);
		}

		if (filters.length > 0) {
			ret += ", filters: " + JSON.stringify(filters);
		}

		if (bSorter) {
			var oSortAnnotationCollection = oPresentationVariant.SortOrder;
			if (!oSortAnnotationCollection.length){
				oSortAnnotationCollection = sap.ovp.cards.charts.Utils.getSortAnnotationCollection(dataModel,oPresentationVariant,oEntitySet);
			}
			if (oSortAnnotationCollection.length < 1) {
				jQuery.sap.log.warning(self.errorMessages.CARD_WARNING + self.errorMessages.SORTORDER_WARNING);
			} else {
				var sSorterValue = "";
				var oSortOrder;
				var sSortOrder;
				var sSortBy;
				for (var i = 0; i < oSortAnnotationCollection.length; i++) {
					oSortOrder = oSortAnnotationCollection[i];
					sSortBy = oSortOrder.Property.PropertyPath;
					sorterList.push(sSortBy);
					if (typeof oSortOrder.Descending == "undefined") {
						sSortOrder = 'true';
					} else {
						var checkFlag = oSortOrder.Descending.Bool || oSortOrder.Descending.Boolean;
						if (!checkFlag) {
							jQuery.sap.log.warning(self.errorMessages.CARD_WARNING + self.errorMessages.BOOLEAN_ERROR);
							sSortOrder = 'true';
						} else {
							sSortOrder = checkFlag.toLowerCase() == 'true' ? 'true' : 'false';
						}
					}
					sSorterValue = sSorterValue + "{path: '" + sSortBy + "',descending: " + sSortOrder + "},";
				}
				/* trim the last ',' */
				ret += ", sorter: [" + sSorterValue.substring(0, sSorterValue.length - 1) + "]";
			}
		}

		var entityTypeObject = iContext.getSetting("ovpCardProperties").getProperty("/entityType");

		jQuery.each(oMeasures, function(i, m){
			tmp = m.Measure.PropertyPath;
			if (m.DataPoint && m.DataPoint.AnnotationPath) {
				var datapointAnnotationPath = entityTypeObject[m.DataPoint.AnnotationPath.substring(1)];
				if (datapointAnnotationPath && datapointAnnotationPath.ForecastValue && datapointAnnotationPath.ForecastValue.PropertyPath) {
					measuresList.push(datapointAnnotationPath.ForecastValue.PropertyPath);
				}
				if (datapointAnnotationPath && datapointAnnotationPath.TargetValue && datapointAnnotationPath.TargetValue.PropertyPath) {
					measuresList.push(datapointAnnotationPath.TargetValue.PropertyPath);
				}
			}
			measuresList.push(tmp);
			if (oMetadata && oMetadata[tmp]) {
				if (oMetadata[tmp][textKeyV4]) { //as part of supporting V4 annotation
					if (oMetadata[tmp][textKeyV4].String && tmp != oMetadata[tmp][textKeyV4].String) {
						measuresList.push(oMetadata[tmp][textKeyV4].String ? oMetadata[tmp][textKeyV4].String : tmp);
					} else if (oMetadata[tmp][textKeyV4].Path && tmp != oMetadata[tmp][textKeyV4].Path) {
						measuresList.push(oMetadata[tmp][textKeyV4].Path ? oMetadata[tmp][textKeyV4].Path : tmp);
					}
				} else if (oMetadata[tmp][textKey] && tmp != oMetadata[tmp][textKey]) {
					measuresList.push(oMetadata[tmp][textKey] ? oMetadata[tmp][textKey] : tmp);
				}
			}

			if (oMetadata && oMetadata[tmp]) {
				var unitCode;
				if (oMetadata[tmp][unitKey_v4_isoCurrency]) { //as part of supporting V4 annotation
					unitCode = oMetadata[tmp][unitKey_v4_isoCurrency].Path ? oMetadata[tmp][unitKey_v4_isoCurrency].Path : oMetadata[tmp][unitKey_v4_isoCurrency].String;
				} else if (oMetadata[tmp][unitKey_v4_unit]) {
					unitCode = oMetadata[tmp][unitKey_v4_unit].Path ? oMetadata[tmp][unitKey_v4_unit].Path : oMetadata[tmp][unitKey_v4_unit].String;
				} else if (oMetadata[tmp][unitKey]) {
					unitCode = oMetadata[tmp][unitKey];
				}
				if (unitCode) {
					if (jQuery.inArray(unitCode, measuresList) === -1) {
						measuresList.push(unitCode);
					}
				}
			}
		});
		jQuery.each(oDimensions, function(i, d){
			tmp = d.Dimension.PropertyPath;
			dimensionsList.push(tmp);
			if (oMetadata && oMetadata[tmp]) {
				if (oMetadata[tmp][textKeyV4]) { //as part of supporting V4 annotation
					if (oMetadata[tmp][textKeyV4].String && tmp != oMetadata[tmp][textKeyV4].String) {
						dimensionsList.push(oMetadata[tmp][textKeyV4].String ? oMetadata[tmp][textKeyV4].String : tmp);
					} else if (oMetadata[tmp][textKeyV4].Path && tmp != oMetadata[tmp][textKeyV4].Path) {
						dimensionsList.push(oMetadata[tmp][textKeyV4].Path ? oMetadata[tmp][textKeyV4].Path : tmp);
					}
				} else if (oMetadata[tmp][textKey] && tmp != oMetadata[tmp][textKey]) {
					dimensionsList.push(oMetadata[tmp][textKey] ? oMetadata[tmp][textKey] : tmp);
				}
			}
		});
		ret += ", parameters: {select:'" + [].concat(dimensionsList, measuresList).join(",");
		if (sorterList.length > 0) {
			ret += "," + sorterList.join(",");
		}
		ret += "'";
		
		var expandDim = [];
		
		jQuery.each(dimensionsList, function(i, d){
			var index = d.indexOf("/");
			if (index > 0) {
//				if (!isExpand) {
//					ret += ", expand:'";
//					isExpand = true;
//				}
				
				var dimArr = d.split("/");
				dimArr.splice(-1,1);
				dimArr = dimArr.join("/");
				expandDim.push(dimArr);
			}
            
		});
		
		if (expandDim.length > 0) {
			ret += ", expand:'" + expandDim.join(",") + "'";
		}
		
		/* close `parameters` */
		ret += "}";
		//ret += "'}";


		if (chartEnumArr && ( chartEnumArr[1] === 'Donut' ) && (oDimensions === undefined)) {
			ret += ", length: 1";
		} else if (chartEnumArr && ( chartEnumArr[1] === 'Donut' ) && (oDimensions) && maxItems) {
			ret += ", length: " + (parseInt(maxItems, 10) + 1);
		} else if (maxItems) {
			ret += ", length: " + maxItems;
		}
		ret += "}";
		return ret;
	};
	sap.ovp.cards.charts.SmartAnnotationManager.formatItems.requiresIContext = true;

	sap.ovp.cards.charts.SmartAnnotationManager.formatChartAxes = function() {
		jQuery.sap.require("sap.ui.core.format.NumberFormat");
		var customFormatter = {
				locale: function(){},
				format: function(value, pattern) {
					var patternArr = "";
					if (pattern) {
						patternArr = pattern.split('/');
					}
					if (patternArr.length > 0) {
						var minFractionDigits, shortRef;
						if (patternArr.length == 3) {
							minFractionDigits = Number(patternArr[1]);
							shortRef = Number(patternArr[2]);
							if (isNaN(minFractionDigits)) {
								minFractionDigits = -1;
							}
							if (isNaN(shortRef)) {
								shortRef = 0;
							}
						} else {
							minFractionDigits = 2;
							shortRef = 0;
						}
						if (patternArr[0] == "axisFormatter" || (patternArr[0] == "ShortFloat")) {
							// if (pattern == "axisFormatter") {
							var numberFormat;
							numberFormat = sap.ui.core.format.NumberFormat.getFloatInstance(
								{style: 'short',
//										shortRefNumber: shortRef, //FIORITECHP1-4935Reversal of Scale factor in Chart and Chart title.
//										showScale: false,
										minFractionDigits: minFractionDigits,
										maxFractionDigits: minFractionDigits}
							);
							if (patternArr[0] == "ShortFloat") {
								numberFormat = sap.ui.core.format.NumberFormat.getFloatInstance(
									{style: 'short',
											minFractionDigits: minFractionDigits,
											maxFractionDigits: minFractionDigits}
								);
							}
							if (minFractionDigits === -1) {
								numberFormat = sap.ui.core.format.NumberFormat.getFloatInstance(
										{style: 'short'}
									);
							}
							return numberFormat.format(Number(value)); 
						}else if (patternArr[0] === "tooltipNoScaleFormatter"){//Pattern for tooltip other than Date
                                var tooltipFormat = sap.ui.core.format.NumberFormat.getFloatInstance(
                                {style: 'short',
                                    currencyCode: false,
									shortRefNumber: shortRef,
									showScale: false,
                                    minFractionDigits: minFractionDigits,
                                    maxFractionDigits: minFractionDigits}
                            );
                            if (minFractionDigits === -1) {
                                tooltipFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance(
                                    {style: 'short',
                                        currencyCode: false}
                                );
                            }
                            return tooltipFormat.format(Number(value));
                        } else if (patternArr[0] == "CURR"){
							var currencyFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance(
									{style: 'short',
										currencyCode: false,
//										shortRefNumber: shortRef, //FIORITECHP1-4935Reversal of Scale factor in Chart and Chart title.
//										showScale: false,
										minFractionDigits: minFractionDigits,
										maxFractionDigits: minFractionDigits}
								);
							if (minFractionDigits === -1) {
								currencyFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance(
										{style: 'short',
											currencyCode: false}
									);
							}
							return currencyFormat.format(Number(value));
						} else if ( patternArr[0].search("%") !== -1) {
							//FIORITECHP1-5665 - Donut and Pie charts should be able to show numbers
							var percentFormat = sap.ui.core.format.NumberFormat.getPercentInstance(
									{style: 'short', 
									minFractionDigits: minFractionDigits,
									maxFractionDigits: minFractionDigits
								});
							if (minFractionDigits === -1) {
								percentFormat = sap.ui.core.format.NumberFormat.getPercentInstance(
										{style: 'short', 
											minFractionDigits: 1,
											maxFractionDigits: 1
										});
							}
							value = percentFormat.format(Number(value));
							return value;
						}
					}
					if (value.constructor === Date) {
						jQuery.sap.require("sap.ui.core.format.DateFormat");
						//var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "dd-MMM"});
						//Commented for FIORITECHP1-3963[DEV] OVP-AC – Remove the formatting of the Time Axis
						var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: pattern});
						if (pattern === "YearMonthDay") {
							oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({style: "medium"});
						}
						value = oDateFormat.format(new Date(value));
					}
					return value;
				}
		};
		jQuery.sap.require("sap.viz.ui5.api.env.Format");
		sap.viz.ui5.api.env.Format.numericFormatter(customFormatter);
	};

	/*
	 * Check if annotations exist vis-a-vis manifest
	 * @param {String} term - Annotation with Qualifier
	 * @param {Object} annotation - Annotation Data
	 * @param {String} type - Type of Annotation
	 * @param {Boolean} [bMandatory=false] - Whether the term is mandatory
	 * @param {String} logViewId - Id of the view for log purposes
	 * @param {String} contentFragment - To check whether we're dealing with
	 * generic analytic card or legacy type.
	 * @returns {Boolean}
	 */
	sap.ovp.cards.charts.SmartAnnotationManager.checkExists = function(term, annotation, type, bMandatory, logViewId, contentFragment) {
		var self = sap.ovp.cards.charts.SmartAnnotationManager;
		bMandatory = typeof bMandatory === "undefined" ? false : bMandatory;
		var ret = false;
		var annoTerm;
		if (!term && bMandatory) {
			jQuery.sap.log.error(logViewId + self.errorMessages.CARD_ERROR + type + self.errorMessages.IS_MANDATORY);
			return ret;
		}
		if (!term) {
			/* Optional parameters can be blank */
			jQuery.sap.log.warning(logViewId + self.errorMessagesCARD_WARNING + type + self.errorMessages.IS_MISSING);
			ret = true;
			return ret;
		}
		annoTerm = annotation[term];
		if (!annoTerm || typeof annoTerm !== "object") {
			var logger = bMandatory ? jQuery.sap.log.error : jQuery.sap.log.warning;
			logger(logViewId + self.errorMessages.CARD_ERROR + "in " + type +
					". (" + term + " " + self.errorMessages.NOT_WELL_FORMED);
			return ret;
		}
		/*
		 * For new style generic analytical card, make a check chart annotation
		 * has chart type.
		 */
		if (contentFragment &&
			contentFragment == "sap.ovp.cards.charts.analytical.analyticalChart" &&
			type == "Chart Annotation" &&
			(!annoTerm.ChartType || !annoTerm.ChartType.EnumMember)) {
			jQuery.sap.log.error(logViewId + self.errorMessages.CARD_ERROR + self.errorMessages.MISSING_CHARTTYPE +
					self.errorMessages.CHART_ANNO);
			return ret;
		}
		ret = true;
		return ret;
	};

	/*
	 * Check and log errors/warnings if any.
	 */
	sap.ovp.cards.charts.SmartAnnotationManager.validateCardConfiguration = function(oController) {
		var self = sap.ovp.cards.charts.SmartAnnotationManager;
		var ret = false;
		if (!oController) {
			return ret;
		}
		var selVar;
		var chartAnno;
		var contentFragment;
		var preVar;
		var idAnno;
		var dPAnno;
		var entityTypeData;
		var logViewId = "";
		var oCardsModel;
		var oView = oController.getView();
		if (oView) {
			logViewId = "[" + oView.getId() + "] ";
		}

		if (!(oCardsModel = oController.getCardPropertiesModel())) {
			jQuery.sap.log.error(logViewId + self.errorMessages.CARD_ERROR + "in " + self.errorMessages.CARD_CONFIG +
					self.errorMessages.NO_CARD_MODEL);
			return ret;
		}

		entityTypeData = oCardsModel.getProperty("/entityType");
		if (!entityTypeData || jQuery.isEmptyObject(entityTypeData)) {
			jQuery.sap.log.error(logViewId + self.errorMessages.CARD_ERROR + "in " + self.errorMessages.CARD_ANNO);
			return ret;
		}

		selVar = oCardsModel.getProperty("/selectionAnnotationPath");
		chartAnno = oCardsModel.getProperty("/chartAnnotationPath");
		preVar = oCardsModel.getProperty("/presentationAnnotationPath");
		idAnno = oCardsModel.getProperty("/identificationAnnotationPath");
		dPAnno = oCardsModel.getProperty("/dataPointAnnotationPath");
		contentFragment = oCardsModel.getProperty("/contentFragment");

		ret = this.checkExists(selVar, entityTypeData, "Selection Variant", false, logViewId);
		ret = this.checkExists(chartAnno, entityTypeData, "Chart Annotation", true, logViewId, contentFragment) && ret;
		ret = this.checkExists(preVar, entityTypeData, "Presentation Variant", false, logViewId) && ret;
		ret = this.checkExists(idAnno, entityTypeData, "Identification Annotation", true, logViewId) && ret;
		ret = this.checkExists(dPAnno, entityTypeData, "Data Point", false, logViewId) && ret;
		return ret;
	};


	/*
	 * @param {Object} [oChartType] - Chart Annotation Object
	 * @returns {Object} - Get config object of a particular chart type from
	 * configuration defined in config.json.
	 * If the param is absent, return config of all charts.
	 */
	sap.ovp.cards.charts.SmartAnnotationManager.getConfig = function(oChartType) {
		var self = sap.ovp.cards.charts.SmartAnnotationManager;
		var ret = {};
		var chartAnnoName, chartType, analyticDIR, reference, fullConf = null;
		var bChartType = !!oChartType;
		if (!jQuery.sap.getObject("sap.ovp.cards.charts.config")) {
			analyticDIR = jQuery.sap.getModulePath("sap.ovp.cards.charts");
			sap.ovp.cards = sap.ovp.cards  || {};
			sap.ovp.cards.charts = sap.ovp.cards.charts || {};
			try {
				sap.ovp.cards.charts.config = jQuery.sap.loadResource({
					url: analyticDIR + "/config.json",
					dataType: "json",
					async: false
				});
			} catch (e) {
				jQuery.sap.log.error(self.errorMessages.CONFIG_LOAD_ERROR + e);
			}
			sap.ovp.cards.charts.config = sap.ovp.cards.charts.config || {};
		}
		fullConf = sap.ovp.cards.charts.config;

		if (!bChartType) {
			return fullConf;
		}

		if (!oChartType.EnumMember ||
			!(chartAnnoName = oChartType.EnumMember.split("/")) ||
			chartAnnoName.length < 2) {
			jQuery.sap.log.error(self.errorMessages.CARD_ERROR + self.errorMessages.INVALID_CHARTTYPE +
					self.errorMessages.ANNO_REF);
			return ret;
		}
		chartType = chartAnnoName[1];
		if (!fullConf[chartType]) {
			jQuery.sap.log.error(self.errorMessages.INVALID_CONFIG + chartType + " " +
					self.errorMessages.CONFIG_JSON);
			return ret;
		}
		if ((reference = fullConf[chartType].reference) &&
			fullConf[reference]) {
			var virtualEntry = jQuery.extend(true, {}, fullConf[reference]);
			fullConf[chartType] = virtualEntry;
		}
		ret = fullConf[chartType];
		return ret;
	};


	/*
	 * If there is exactly one dimension with time semantics (according to model metadata),
	 * then instead time type shall be used.
	 */
	sap.ovp.cards.charts.SmartAnnotationManager.hasTimeSemantics = function(aDimensions, config, dataModel, entitySet) {
		var ret = false;
		var oMetadata;
		var dimensionName;
		var dimensionType;
		var displayFormat;
		var sapSemantics;
		var sapSemanticsV4; //as part of supporting V4 annotation
		if (!config.time || jQuery.isEmptyObject(config.time)) {
			return ret;
		}
		if (!aDimensions) {
			return ret;
		}
//		if (aDimensions.length != 1) {
//			return ret;
//		}
		if (!aDimensions[0].Dimension ||
			!(dimensionName = aDimensions[0].Dimension.PropertyPath)) {
			return ret;
		}
		oMetadata = this.getMetadata(dataModel, entitySet);
		
		for (var i = 0; i < aDimensions.length; i++) {
			if (aDimensions[i] && aDimensions[i].Dimension && aDimensions[i].Dimension.PropertyPath) {
				dimensionName = aDimensions[i].Dimension.PropertyPath;
			}
			if (oMetadata && oMetadata[dimensionName]) {
				dimensionType = oMetadata[dimensionName][this.constants.TYPE_KEY];
				displayFormat = oMetadata[dimensionName][this.constants.DISPLAY_FORMAT_KEY];
				sapSemantics = oMetadata[dimensionName][this.constants.SEMANTICS_KEY];
				sapSemanticsV4 = oMetadata[dimensionName]["com.sap.vocabularies.Common.v1.IsCalendarYear"]; //as part of supporting V4 annotation
			}
			if (dimensionType &&
				displayFormat &&
				dimensionType.lastIndexOf("Edm.Date", 0) === 0 &&
				displayFormat.toLowerCase() == "date") {
				ret = true;
				return ret;
			} //as part of supporting V4 annotation
			if (dimensionType == "Edm.String" && (sapSemanticsV4 || sapSemantics && sapSemantics.lastIndexOf("year", 0) === 0)) {
				ret = true;
				return ret;
			}
		}
//		if (oMetadata && oMetadata[dimensionName]) {
//			dimensionType = oMetadata[dimensionName][this.constants.TYPE_KEY];
//			displayFormat = oMetadata[dimensionName][this.constants.DISPLAY_FORMAT_KEY];
//			sapSemantics = oMetadata[dimensionName][this.constants.SEMANTICS_KEY];
//            sapSemanticsV4 = oMetadata[dimensionName]["com.sap.vocabularies.Common.v1.IsCalendarYear"]; //as part of supporting V4 annotation
//		}
//		if (dimensionType &&
//			displayFormat &&
//			dimensionType.lastIndexOf("Edm.Date", 0) === 0 &&
//			displayFormat.toLowerCase() == "date") {
//			ret = true;
//		} //as part of supporting V4 annotation
//		if (dimensionType == "Edm.String" && (sapSemanticsV4 || sapSemantics && sapSemantics.lastIndexOf("year", 0) === 0)) {
//			ret = true;
//		}
		return ret;
	};


	/*
	 * Formatter for VizFrame type.
	 * @param {Object} oChartType - Chart Annotation Object
	 * @returns {String} Valid Enum for Vizframe type
	 */
	sap.ovp.cards.charts.SmartAnnotationManager.getChartType = function(iContext, oChartType, aDimensions) {
		var ret = "";
		var self = sap.ovp.cards.charts.SmartAnnotationManager;
		var config = self.getConfig(oChartType);
		var dataModel, entitySet;
		if (!config) {
			return ret;
		}
		ret = config.default.type;
		dataModel = iContext.getSetting("dataModel");
		entitySet = iContext.getSetting('ovpCardProperties').getProperty("/entitySet");
		if (self.hasTimeSemantics(aDimensions, config, dataModel, entitySet)) {
			ret = config.time.type;
		}
		return ret;
	};
	sap.ovp.cards.charts.SmartAnnotationManager.getChartType.requiresIContext = true;


	/*
	 * Check if roles are valid for dimension/measure for the chart type
	 */
	sap.ovp.cards.charts.SmartAnnotationManager.checkRolesForProperty = function(queue, config, type) {
		var self = sap.ovp.cards.charts.SmartAnnotationManager;
		/* Nothing remains in the queue, all good !!! */
		if (!queue.length) {
			return;
		}
		var feedtype = type == "dimension" ? "Dimension" : "Measure";
		var queuedNames = [];
		jQuery.each(queue, function(i, val) {
			if (!val || !val[feedtype] || !val[feedtype].PropertyPath) {
				jQuery.sap.log.error(self.errorMessages.INVALID_CHART_ANNO);
				return false;
			}
			queuedNames.push(val[feedtype].PropertyPath);
		});
		var allowedRoles = jQuery.map(config.feeds, function(f) {
			if (f.type == type) {
				if (f.role) {
					return f.role.split("|");
				}
				return [];
			}
		});
		allowedRoles = jQuery.grep(allowedRoles, function(role, i) {
			return jQuery.inArray(role, allowedRoles) == i;
		}).join(", ");

		jQuery.sap.log.error(self.errorMessages.CARD_ERROR + self.errorMessages.INVALID_REDUNDANT  +
			type + "(s) " + queuedNames.join(", ") + ". " + self.errorMessages.ALLOWED_ROLES + config.type +
			self.errorMessages.CHART_IS + allowedRoles);
	};


	sap.ovp.cards.charts.SmartAnnotationManager.getPrimitiveValue = function (oValue) {
		var value;

		if (oValue) {
			if (oValue.String) {
				value = oValue.String;
			} else if (oValue.Boolean || oValue.Bool) {
				value = sap.ovp.cards.charts.SmartAnnotationManager.getBooleanValue(oValue);
			} else {
				value = sap.ovp.cards.charts.SmartAnnotationManager.getNumberValue(oValue);
			}
		}
		return value;
	};

	sap.ovp.cards.charts.SmartAnnotationManager.getBooleanValue = function (oValue, bDefault) {
		if (oValue && oValue.Boolean) {
			if (oValue.Boolean.toLowerCase() === "true") {
				return true;
			} else if (oValue.Boolean.toLowerCase() === "false") {
				return false;
			}
		} else if (oValue && oValue.Bool) {
			if (oValue.Bool.toLowerCase() === "true") {
				return true;
			} else if (oValue.Bool.toLowerCase() === "false") {
				return false;
			}
		}

		return bDefault;
	};

	sap.ovp.cards.charts.SmartAnnotationManager.getNumberValue = function(oValue) {
		var value;

		if (oValue) {
			if (oValue.String) {
				value = Number(oValue.String);
			} else if (oValue.Int) {
				value = Number(oValue.Int);
			} else if (oValue.Decimal) {
				value = Number(oValue.Decimal);
			} else if (oValue.Double) {
				value = Number(oValue.Double);
			} else if (oValue.Single) {
				value = Number(oValue.Single);
			}
		}
		return value;
	};

	// Check the numberFormat of the DataPoint for each measure
	sap.ovp.cards.charts.SmartAnnotationManager.checkNumberFormat = function(minValue,val,entityTypeObject) {
		if (val && val.DataPoint && val.DataPoint.AnnotationPath) {
			var oDataPoint = entityTypeObject[val.DataPoint.AnnotationPath.substring(1)];
			var fractionDigits, fractionDigitsVal;
			if (oDataPoint && oDataPoint.ValueFormat) {
				fractionDigits = oDataPoint.ValueFormat;
			} else if (oDataPoint && oDataPoint.NumberFormat) {
				fractionDigits = oDataPoint.NumberFormat;
			}
			
			if (fractionDigits && fractionDigits.NumberOfFractionalDigits && fractionDigits.NumberOfFractionalDigits.Int) {
				fractionDigitsVal = fractionDigits.NumberOfFractionalDigits.Int;
				if (minValue < Number(fractionDigitsVal)) {
					minValue = Number(fractionDigitsVal);
				}
			}
		}
		
		return minValue;
	};
	
	sap.ovp.cards.charts.SmartAnnotationManager.getMaxScaleFactor = function(maxScaleValue,val,entityTypeObject) {
		if (val && val.DataPoint && val.DataPoint.AnnotationPath) {
			var oDataPoint = entityTypeObject[val.DataPoint.AnnotationPath.substring(1)];
			var scaleF, ScaleFVal;
			if (oDataPoint && oDataPoint.ValueFormat) {
				scaleF = oDataPoint.ValueFormat; 
			} else if (oDataPoint && oDataPoint.NumberFormat) {
				scaleF = oDataPoint.NumberFormat;
			}
			
			if (scaleF) {
				if (scaleF.ScaleFactor && scaleF.ScaleFactor.Decimal) {
					ScaleFVal = Number(scaleF.ScaleFactor.Decimal);
				} else if (scaleF.ScaleFactor && scaleF.ScaleFactor.Int) {
					ScaleFVal = Number(scaleF.ScaleFactor.Int);
				}
				
				if (!isNaN(ScaleFVal)) {
					if (maxScaleValue === undefined){
						maxScaleValue = Number(ScaleFVal);
					} else if (maxScaleValue > Number(ScaleFVal)) {
						maxScaleValue = Number(ScaleFVal);
					}
				}
			}
		} 
		return maxScaleValue;
	};
	
	sap.ovp.cards.charts.SmartAnnotationManager.isMeasureCurrency = function(oMetadata, sapUnit) {
		var self = sap.ovp.cards.charts.SmartAnnotationManager;
        //as part of supporting V4 annotation
		if (oMetadata && oMetadata[sapUnit] && (oMetadata[sapUnit]["Org.OData.Measures.V1.ISOCurrency"] || (oMetadata[sapUnit][self.constants.SEMANTICS_KEY] && oMetadata[sapUnit][self.constants.SEMANTICS_KEY] === self.constants.CURRENCY_CODE))) {
			return true;
		}
		return false;
	};
	
	sap.ovp.cards.charts.SmartAnnotationManager.fractionalDigitsExists = function(val,entityTypeObject) {
		if (val.DataPoint && val.DataPoint.AnnotationPath) {
			var oDataPoint = entityTypeObject[val.DataPoint.AnnotationPath.substring(1)];
			if (oDataPoint && oDataPoint.ValueFormat && oDataPoint.ValueFormat.NumberOfFractionalDigits 
					&& oDataPoint.ValueFormat.NumberOfFractionalDigits.Int) {
				return true;
			} else if (oDataPoint && oDataPoint.NumberFormat && oDataPoint.NumberFormat.NumberOfFractionalDigits 
					&& oDataPoint.NumberFormat.NumberOfFractionalDigits.Int) {
				return true;
			} 
		}
		return false;
	};
	
	sap.ovp.cards.charts.SmartAnnotationManager.checkEDMINT32Exists = function(oMetadata,val,feedtype) {
		var self = sap.ovp.cards.charts.SmartAnnotationManager;
		if (oMetadata[val[feedtype].PropertyPath][self.constants.EDM_TYPE] == self.constants.EDM_INT32) {
			return true;
		}
		return false;
	};
	
	/*
	 * Construct VizProperties and Feeds for VizFrame
	 * @param {Object} VizFrame
	 */

	sap.ovp.cards.charts.SmartAnnotationManager.setChartScaleTitle = function(vizFrame,vizData,handler,chartTitle) {
		var oCardsModel, entityTypeObject, chartAnno, chartContext;
		var aMeasures;
		var self = sap.ovp.cards.charts.SmartAnnotationManager;
		var unitKey = self.constants.UNIT_KEY;
		var unitKey_v4_isoCurrency = self.constants.UNIT_KEY_V4_ISOCurrency; //as part of supporting V4 annotation
		var unitKey_v4_unit = self.constants.UNIT_KEY_V4_Unit; //as part of supporting V4 annotation

		//var self = sap.ovp.cards.charts.SmartAnnotationManager;
		
		if (!(oCardsModel = vizFrame.getModel('ovpCardProperties'))) {
			jQuery.sap.log.error(self.errorMessages.CARD_ERROR + "in " + self.errorMessages.CARD_CONFIG +
					self.errorMessages.NO_CARD_MODEL);
			return;
		}
		
		var dataModel = vizFrame.getModel();
		var entitySet = oCardsModel.getProperty("/entitySet");
		if (!dataModel || !entitySet) {
			return;
		}
		entityTypeObject = oCardsModel.getProperty("/entityType");
		if (!entityTypeObject) {
			jQuery.sap.log.error(self.errorMessages.CARD_ANNO_ERROR + "in " + self.errorMessages.CARD_ANNO);
			return;
		}
		var oMetadata = self.getMetadata(dataModel, entitySet);
		chartAnno = oCardsModel.getProperty("/chartAnnotationPath");
		if (!chartAnno || !(chartContext = entityTypeObject[chartAnno])) {
			jQuery.sap.log.error(self.errorMessages.CARD_ANNO_ERROR + "in " + self.errorMessages.CARD_ANNO);
			return;
		}
		
		if (!(aMeasures = chartContext.MeasureAttributes) ||
				!aMeasures.length) {
			jQuery.sap.log.error(self.errorMessages.CHART_ANNO_ERROR + "in " + self.errorMessages.CHART_ANNO + " " +
					self.errorMessages.MEASURES_MANDATORY);
			return;
		}
		
		var result = vizData ? vizData.results : null;
		var property, unitType = "", unitArr = [];
		var isUnitSame = true;
		var feedMeasures = [];
		
		var feeds = vizFrame.getFeeds();
		
		jQuery.each(feeds, function(i, feed){
			if (feed.getType() === "Measure") {
				feedMeasures = feedMeasures.concat(feed.getValues());
			}
		});
		
		var scaleUnit = "";
		
		if (result) {
			jQuery.each(aMeasures, function(i, m){
				var feedName = "";
				property = m.Measure.PropertyPath;
				if (oMetadata && oMetadata[property]) {
					if (oMetadata[property][self.constants.LABEL_KEY_V4]) { //as part of supporting V4 annotation
						feedName = oMetadata[property][self.constants.LABEL_KEY_V4].String ? oMetadata[property][self.constants.LABEL_KEY_V4].String : oMetadata[property][self.constants.LABEL_KEY_V4].Path;
					} else if (oMetadata[property][self.constants.LABEL_KEY]) {
						feedName = oMetadata[property][self.constants.LABEL_KEY];
					} else if (property) {
						feedName = property;
					}
				}
				if (jQuery.inArray(feedName, feedMeasures) != -1) {
					if (oMetadata && oMetadata[property]) {
						var unitCode;
						// if (unitCode && oMetadata[unitCode] && oMetadata[currCode][semanticKey] === currencyCode) {
						if (oMetadata[property][unitKey_v4_isoCurrency]) { //as part of supporting V4 annotation
							unitCode = oMetadata[property][unitKey_v4_isoCurrency].Path ? oMetadata[property][unitKey_v4_isoCurrency].Path : oMetadata[property][unitKey_v4_isoCurrency].String;
						} else if (oMetadata[property][unitKey_v4_unit]) {
							unitCode = oMetadata[property][unitKey_v4_unit].Path ? oMetadata[property][unitKey_v4_unit].Path : oMetadata[property][unitKey_v4_unit].String;
						} else if (oMetadata[property][unitKey]) {
							unitCode = oMetadata[property][unitKey];
						}
						if (unitCode && oMetadata[unitCode] ) {
							for (var i = 0; i < result.length; i++) {
								var objData = result[i];
								if (isUnitSame){
									if (unitType && objData[unitCode] && (objData[unitCode] != "" ) && (unitType != "") && (unitType != objData[unitCode]) ) {
										isUnitSame = false;
									}
								}
								unitType = objData[unitCode];
								if (unitType && unitType != "" ) {
									var unitObj = {};
									unitObj.name = feedName;
									unitObj.value = unitType;
									unitArr.push(unitObj);
									break;
								}
							}
						}
					}
				}
				
			});
		}
		
		var oVizProperties = vizFrame.getVizProperties();
		var chartUnitTitleTxt = "";
		if (handler) {
			scaleUnit = handler.getScale();
		}
		if (isUnitSame) {
			if (isNaN(Number(scaleUnit)) && scaleUnit != undefined) {
				if (unitType != "") {
					chartUnitTitleTxt = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("IN",[scaleUnit,unitType]);
				} else {
					chartUnitTitleTxt = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("IN_NO_SCALE",[scaleUnit]);
				}
			} else if (unitType != "") {
				chartUnitTitleTxt = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("IN_NO_SCALE",[unitType]);
			}
			if (chartTitle) {
				chartTitle.setText(chartUnitTitleTxt);
				chartTitle.data("aria-label",chartUnitTitleTxt,true);
			}
		} else if (!isUnitSame) {
			jQuery.each(oVizProperties, function(i, vizProps) {
				if (vizProps && vizProps.title) {
					var axisTitle = vizProps.title.text;
					for (var i = 0; i < unitArr.length; i++) {
						if (unitArr[i].name === axisTitle ) {
							var axisStr = "";
							if (isNaN(Number(scaleUnit)) && scaleUnit != undefined) {
								if (unitType != "") {
									axisStr = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("AXES_TITLE",[axisTitle,scaleUnit,unitArr[i].value]);
								} else {
									axisStr = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("AXES_TITLE_NO_SCALE",[scaleUnit]);
								}
							} else if (unitType != "") {
								axisStr = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("AXES_TITLE_NO_SCALE",[axisTitle,unitArr[i].value]);
							}
							
							vizProps.title = {
									text:axisStr
							};
						}
					}
				}
			});
			vizFrame.setVizProperties(oVizProperties);
		} 
	};

	/*
	 * Get the (cached) OData metadata information.
	 */
	sap.ovp.cards.charts.SmartAnnotationManager.getMetadata = function(model, entitySet) {
		var map = this.cacheODataMetadata(model);
		if (!map) {
			return undefined;
		}
		return map[entitySet];
	};

	sap.ovp.cards.charts.SmartAnnotationManager.setSmartFormattedChartTitle  = function(measureArr,dimensionArr,smartChart) {
		var txt = "", measureStr = "", dimensionStr = "";
		if (smartChart) {
			txt = smartChart.getHeader();
		}
		
		if (measureArr && (measureArr.length > 1)) {
			for (var i = 0; i < measureArr.length - 1; i++) {
				if (measureStr != "") {
					measureStr += ", ";
				}
				measureStr += measureArr[i];
			}
			measureStr = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("MEAS_DIM_TITLE",[measureStr, measureArr[i]]);
		} else if (measureArr) {
			measureStr = measureArr[0];
		}
		
		if (dimensionArr && (dimensionArr.length > 1) ) {
			for (var i = 0; i < dimensionArr.length - 1; i++) {
				if (dimensionStr != "") {
					dimensionStr += ", ";
				}
				dimensionStr += dimensionArr[i];
			}
			dimensionStr = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("MEAS_DIM_TITLE",[dimensionStr, dimensionArr[i]]);
		} else if (dimensionArr) {
			dimensionStr = dimensionArr[0];
		}
		
		if (smartChart && smartChart.getHeader() == "Dummy") {
			txt = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("NO_CHART_TITLE",[measureStr,dimensionStr]); 
			smartChart.setHeader(txt);
			//smartChart.data("aria-label",txt,true);
		}
		
		return txt;
	};
	
	sap.ovp.cards.charts.SmartAnnotationManager.getScaleUnit  = function(maxScaleValue,isCurrency) {
//	sap.ovp.cards.charts.SmartAnnotationManager.getScaleUnit  = function(maxScaleValue) {
		var num = 1;
		var scaledNum;
		if (isCurrency) {
			var currencyFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance(
					{style: 'short',
						currencyCode: false,
						shortRefNumber: maxScaleValue
					}
				);
			scaledNum = currencyFormat.format(Number(num));
		} else {
			var numberFormat = sap.ui.core.format.NumberFormat.getFloatInstance(
				{style: 'short',
						shortRefNumber: maxScaleValue
				}
			);
			scaledNum = numberFormat.format(Number(num));
		}
		
		var scaleUnit = scaledNum.slice(-1);
		return scaleUnit;
	};

	/*
	 * Cache OData metadata information with key as UI5 ODataModel id.
	 */
	sap.ovp.cards.charts.SmartAnnotationManager.cacheODataMetadata  = function(model) {
		var self = sap.ovp.cards.charts.SmartAnnotationManager;
		if (model){
			if (!jQuery.sap.getObject("sap.ovp.cards.charts.cachedMetaModel")) {
				sap.ovp.cards.charts.cachedMetaModel = {};
			}
		var map = sap.ovp.cards.charts.cachedMetaModel[model.getId()];
		if (!map) {
			var metaModel = model.getMetaModel();
			map = {};
			var container = metaModel.getODataEntityContainer();
			jQuery.each(container.entitySet, function(anIndex,entitySet) {
				var entityType = metaModel.getODataEntityType(entitySet.entityType);
				var entitysetMap = {};
				jQuery.each(entityType.property,function(propertyIndex,property) {
					entitysetMap[property.name] = property;
				});
				map[entitySet.name] = entitysetMap;
			});
			sap.ovp.cards.charts.cachedMetaModel[model.getId()] = map;
		}
		return map;
		} else {
			jQuery.sap.log.error(self.errorMessages.CARD_ERROR + self.errorMessages.CACHING_ERROR );
		}
	};
	sap.ovp.cards.charts.SmartAnnotationManager.getSelectedDataPoint = function(vizFrame, controller) {


		vizFrame.attachSelectData(function(oEvent){

			var self = sap.ovp.cards.charts.SmartAnnotationManager;
			var oCardsModel = vizFrame.getModel('ovpCardProperties');
			var dataModel = vizFrame.getModel();
			var entitySet = oCardsModel.getProperty("/entitySet");
			var oMetadata = self.getMetadata(dataModel, entitySet);			
			var dimensionArrayNames = [], dimensions = [];
			var finalDimensions = {};
			var dimensionsArr = vizFrame.getDataset().getDimensions();
			var contextNumber;

			for (var i = 0; i < dimensionsArr.length; i++){
				dimensionArrayNames.push(dimensionsArr[i].getName());
			}

			var allData = jQuery.map(vizFrame.getDataset()._getDataContexts(), function(x) {return x.getObject();}); //_getDataContexts is a private function, try to find another way!

			if (oEvent.getParameter("data") && oEvent.getParameter("data")[0] && oEvent.getParameter("data")[0].data){
				
				contextNumber = oEvent.getParameter("data")[0].data._context_row_number;
				if (allData[contextNumber].$isOthers && allData[contextNumber].$isOthers == true) {
					var donutIntent = {$isOthers : true};
					var payLoad = {getObject : function(){return donutIntent;}};
					controller.doNavigation(payLoad);
				} else {
				dimensions = Object.keys(oEvent.getParameter("data")[0].data);

				for (var j = 0; j < dimensionArrayNames.length; j++){
					for (var k = 0; k < dimensions.length; k++){
						if (dimensionArrayNames[j] == dimensions[k]){ 
							for (var key in oMetadata) {
								if (oMetadata.hasOwnProperty(key)) {
									var propertyName = oMetadata[key][self.constants.LABEL_KEY] || oMetadata[key][self.constants.NAME_KEY] || oMetadata[key][self.constants.NAME_CAP_KEY];
									if (propertyName == dimensions[k]) {
										finalDimensions[key] = allData[contextNumber][key];
									}
								}
							}
						}
					}
				}
				var payLoad = {getObject : function(){return finalDimensions;}};

				controller.doNavigation(payLoad);
			}
			}
		});
	};
	sap.ovp.cards.charts.SmartAnnotationManager.checkBubbleChart = function(chartType) {
		if (chartType.EnumMember.endsWith("Bubble")) {
			return true;
		} else {
			return false;
		}
	};
	sap.ovp.cards.charts.SmartAnnotationManager.dimensionAttrCheck = function(dimensions) {
		var ret = false;
		var self = sap.ovp.cards.charts.SmartAnnotationManager; 
		if (!dimensions ||
				dimensions.constructor != Array ||
				dimensions.length < 1 ||
				dimensions[0].constructor != Object ||
				!dimensions[0].Dimension ||
				!dimensions[0].Dimension.PropertyPath) {
					jQuery.sap.log.error(self.errorMessages.CHART_ANNO_ERROR + "in " + self.errorMessages.CHART_ANNO + " " +
					self.errorMessages.DIMENSIONS_MANDATORY);
			return ret;
		}
		ret = true;
		return ret;
	};
	sap.ovp.cards.charts.SmartAnnotationManager.measureAttrCheck = function(measures) {
		var ret = false;
		var self = sap.ovp.cards.charts.SmartAnnotationManager; 
		if (!measures ||
				measures.constructor != Array ||
				measures.length < 1 ||
				measures[0].constructor != Object ||
				!measures[0].Measure ||
				!measures[0].Measure.PropertyPath) {
			jQuery.sap.log.error(self.errorMessages.CHART_ANNO_ERROR + "in " + self.errorMessages.CHART_ANNO + " " +
					self.errorMessages.MEASURES_MANDATORY);
			return ret;
		}
		ret = true;
		return ret;
	};
	sap.ovp.cards.charts.SmartAnnotationManager.getEntitySet = function(oEntitySet) {
		return oEntitySet.name;
	};
	
	sap.ovp.cards.charts.SmartAnnotationManager.getAnnotationQualifier = function(annotationPath) {
		if ( annotationPath && annotationPath.indexOf("#") != -1 ) {
			var tokens = annotationPath.split("#");
			if ( tokens.length > 1 ) {
				return tokens[1];
			}
		}
		return "";
	};
	
	sap.ovp.cards.charts.SmartAnnotationManager.buildSmartAttributes = function(smartChart,chartTitle) {
		/**
		 * A function to take a string written in dot notation style, and use it to
		 * find a nested object property inside of an object and also set the value
		 *
		 * @method {Private} getOrSetNestedProperty
		 * @param {Object} object - The object to search
		 * @param {String} path -  A dot notation style parameter reference (ie "name.firstName")
		 * @param {String} valueToSet - (Optional) value to set
		 *
		 * @return {String} the value of the property
		 */
		function getOrSetNestedProperty(object, path, valueToSet) {
			var pList = path.split('.');
			var key = pList.pop();
			var pointer = pList.reduce(function (accumulator, currentValue) {
				if (accumulator[currentValue] === undefined) {
					accumulator[currentValue] = {};
				}
				return accumulator[currentValue];
			}, object);
			if (valueToSet) {
				pointer[key] = valueToSet;
			}
			return pointer[key];
		}

		var oCardsModel, entityTypeObject, chartAnno, chartContext;
		var chartType, allConfig, config, aDimensions, aMeasures, aQueuedMeasures, aQueuedDimensions;
		var bSupportsTimeSemantics;
		var reference;
		var oVizProperties;
		var measureArr = [], dimensionArr = [];
		var self = sap.ovp.cards.charts.SmartAnnotationManager;
		var chart = smartChart.getChart();
		//var vizFrame = smartChart._getVizFrame();
		chartType = chart.getChartType();
		allConfig = this.getConfig();
		
		for (var key in allConfig) {
			if ((reference = allConfig[key].reference) &&
					allConfig[reference]) {
					var virtualEntry = jQuery.extend(true, {}, allConfig[reference]);
					allConfig[key] = virtualEntry;
				}
			if (allConfig[key].default.type == chartType ||
				(allConfig[key].time && allConfig[key].time.type == chartType)) {
				config = allConfig[key];
				break;
			}
		}


		if (!config) {
			jQuery.sap.log.error(self.errorMessages.CARD_ERROR + "in " + self.errorMessages.CARD_CONFIG +
					self.errorMessages.CARD_CONFIG_ERROR + chartType + " " + self.errorMessages.CARD_CONFIG_JSON);
			return;
		}

		if (!(oCardsModel = smartChart.getModel('ovpCardProperties'))) {
			jQuery.sap.log.error(self.errorMessages.CARD_ERROR + "in " + self.errorMessages.CARD_CONFIG +
					self.errorMessages.NO_CARD_MODEL);
			return;
		}
		var dataModel = smartChart.getModel();
		var entitySet = oCardsModel.getProperty("/entitySet");
		if (!dataModel || !entitySet) {
			return;
		}
		entityTypeObject = oCardsModel.getProperty("/entityType");
		if (!entityTypeObject) {
			jQuery.sap.log.error(self.errorMessages.CARD_ANNO_ERROR + "in " + self.errorMessages.CARD_ANNO);
			return;
		}
		
		var oMetadata = self.getMetadata(dataModel, entitySet);
		
		chartAnno = oCardsModel.getProperty("/chartAnnotationPath");
		if (!chartAnno || !(chartContext = entityTypeObject[chartAnno])) {
			jQuery.sap.log.error(self.errorMessages.CARD_ANNO_ERROR + "in " + self.errorMessages.CARD_ANNO);
			return;
		}

		if (!(aDimensions = chartContext.DimensionAttributes) ||
				!aDimensions.length) {
			jQuery.sap.log.error(self.errorMessages.CHART_ANNO_ERROR + "in " + self.errorMessages.CHART_ANNO + " " +
					self.errorMessages.DIMENSIONS_MANDATORY);
			return;
		}
		if (!(aMeasures = chartContext.MeasureAttributes) ||
				!aMeasures.length) {
			jQuery.sap.log.error(self.errorMessages.CHART_ANNO_ERROR + "in " + self.errorMessages.CHART_ANNO + " " +
					self.errorMessages.MEASURES_MANDATORY);
			return;
		}
		
		aQueuedDimensions = aDimensions.slice();
		aQueuedMeasures = aMeasures.slice();
		
		var property, labelDisplay; 
		
		for (var i = 0; i < aQueuedDimensions.length;i++) {
			var dimObj = aQueuedDimensions[i];
			if (dimObj && dimObj.Dimension && dimObj.Dimension.PropertyPath) {
				property = dimObj.Dimension.PropertyPath;
				if (oMetadata && oMetadata[property]) {
					if (oMetadata[property][self.constants.LABEL_KEY_V4]) { //as part of supporting V4 annotation
						labelDisplay = oMetadata[property][self.constants.LABEL_KEY_V4].String ? oMetadata[property][self.constants.LABEL_KEY_V4].String : oMetadata[property][self.constants.LABEL_KEY_V4].Path;
					} else if (oMetadata[property][self.constants.LABEL_KEY]) {
						labelDisplay = oMetadata[property][self.constants.LABEL_KEY];
					} else if (property) {
						labelDisplay = property;
					}
					dimensionArr.push(labelDisplay);
				}
			}
		}
		for (var j = 0; j < aQueuedMeasures.length; j++) {
			var measObj = aQueuedMeasures[j];
			if (measObj && measObj.Measure && measObj.Measure.PropertyPath) {
				property = measObj.Measure.PropertyPath;
				if (oMetadata && oMetadata[property]) {
					if (oMetadata[property][self.constants.LABEL_KEY_V4]) { //as part of supporting V4 annotation
						labelDisplay = oMetadata[property][self.constants.LABEL_KEY_V4].String ? oMetadata[property][self.constants.LABEL_KEY_V4].String : oMetadata[property][self.constants.LABEL_KEY_V4].Path;
					} else if (oMetadata[property][self.constants.LABEL_KEY]) {
						labelDisplay = oMetadata[property][self.constants.LABEL_KEY];
					} else if (property) {
						labelDisplay = property;
					}
					measureArr.push(labelDisplay);
				}
			}
		}
		
		//sap.ovp.cards.charts.SmartAnnotationManager.setFormattedChartTitle(measureArr,dimensionArr,chartTitle);
		
		bSupportsTimeSemantics = self.hasTimeSemantics(aDimensions, config, dataModel, entitySet);
		if (bSupportsTimeSemantics) {
			config = config.time;
		} else {
			config = config.default;
		}

		var bErrors = false;
		
		var oTooltip = new sap.viz.ui5.controls.VizTooltip({formatString: 'tooltipNoScaleFormatter'});
		oTooltip.connect(chart.getVizUid());
		
		if (chart) {
			var vizProperties = chart.getVizProperties();
			
			var bHideAxisTitle = true;
			
			if (config.properties && config.properties.hasOwnProperty("hideLabel") &&
					!config.properties["hideLabel"]) {
				 bHideAxisTitle = false;
			} 
			
//			var bDatapointNavigation = true;
//			var dNav = oCardsModel.getProperty("/navigation");
//			if (dNav == "chartNav") {
//				bDatapointNavigation = false;
//			}
			var bDonutChart = false;
			if (chartType == 'donut') {
				bDonutChart = true;
			}
			
			if (vizProperties && vizProperties.plotArea && vizProperties.plotArea.dataLabel && vizProperties.plotArea.dataLabel.visible) {
				vizProperties.plotArea.dataLabel.visible = bDonutChart;
			}
//			vizProperties.legend.isScrollable = false;
			vizProperties.title.visible = bHideAxisTitle ? false : true;
//			vizProperties.general.groupData = false;
//			vizProperties.general.showAsUTC = true;
			
			oVizProperties = {
					legend: {
						isScrollable: false
					},
					valueAxis: {
						title: {
							visible: bHideAxisTitle ? false : true
						},
						label:{
							formatString: vizProperties.valueAxis.formatString
						}
					},
					categoryAxis: {
						title: {
							visible: bHideAxisTitle ? false : true
						}
					},
					plotArea: {
						window: {
							start: 'firstDataPoint',
							end: 'lastDataPoint'
						},
						dataLabel: {
							visible: bDonutChart,
							type : 'value'
//							formatString: bDonutChart ? '0.0%' : vizProperties.plotArea.dataLabel.formatString
						}
					},
					interaction:{
						selectability: {
							legendSelection: false,
							axisLabelSelection: false,
							mode: 'EXCLUSIVE',
							plotLassoSelection: false,
							plotStdSelection: true
						},
						zoom:{
							enablement: 'disabled'
						}
					}
			};

			/*Check if the Config.json has scale properties set*/
			//var bConsiderAnnotationScales = false;

			if (chartContext.ChartType.EnumMember === sap.ovp.cards.charts.SmartAnnotationManager.constants.SCATTER_CHARTTYPE ||
					chartContext.ChartType.EnumMember === sap.ovp.cards.charts.SmartAnnotationManager.constants.BUBBLE_CHARTTYPE ||
					chartContext.ChartType.EnumMember === sap.ovp.cards.charts.SmartAnnotationManager.constants.LINE_CHARTTYPE){
				if (chartContext && chartContext.AxisScaling && chartContext.AxisScaling.EnumMember) {
					var sScaleType = chartContext.AxisScaling.EnumMember.substring(chartContext.AxisScaling.EnumMember.lastIndexOf('/') + 1, chartContext.AxisScaling.EnumMember.length);
					//bConsiderAnnotationScales are individually set for each case to make sure the scale values are set casewise
					switch (sScaleType) {
					case "AdjustToDataIncluding0":
						oVizProperties.plotArea.adjustScale = false;
						//bConsiderAnnotationScales = true;
						break;
					case "AdjustToData":
						oVizProperties.plotArea.adjustScale = true;
						//bConsiderAnnotationScales = true;
						break;
					case "MinMaxValues":
						var aChartScales = [];
						if (chartContext["MeasureAttributes"][0] && 
								chartContext["MeasureAttributes"][0].DataPoint && 
								chartContext["MeasureAttributes"][0].DataPoint.AnnotationPath){
							var sDataPointAnnotationPath = chartContext["MeasureAttributes"][0].DataPoint.AnnotationPath;
							var sDataPointPath = sDataPointAnnotationPath.substring(sDataPointAnnotationPath.lastIndexOf('@') + 1, sDataPointAnnotationPath.length);
							if (entityTypeObject && entityTypeObject[sDataPointPath]){
								var oMinMaxParams = entityTypeObject[sDataPointPath];
								if (oMinMaxParams && oMinMaxParams.MaximumValue && oMinMaxParams.MaximumValue.Decimal &&
										oMinMaxParams.MinimumValue && oMinMaxParams.MinimumValue.Decimal){
									aChartScales.push({
										feed : "valueAxis",
										max: oMinMaxParams.MaximumValue.Decimal,
										min:oMinMaxParams.MinimumValue.Decimal
									});   
									//bConsiderAnnotationScales = true;
								}else {
									jQuery.sap.log.error(self.errorMessages.ERROR_MISSING_AXISSCALES);
								}

							}

						}
						//LINE_CHARTTYPE donot have valueAxis2
						if (chartContext.ChartType.EnumMember !== sap.ovp.cards.charts.SmartAnnotationManager.constants.LINE_CHARTTYPE &&
								chartContext["MeasureAttributes"][1] &&
								chartContext["MeasureAttributes"][1].DataPoint &&
								chartContext["MeasureAttributes"][1].DataPoint.AnnotationPath){
							var sDataPointAnnotationPath = chartContext["MeasureAttributes"][1].DataPoint.AnnotationPath;
							var sDataPointPath = sDataPointAnnotationPath.substring(sDataPointAnnotationPath.lastIndexOf('@') + 1, sDataPointAnnotationPath.length);
							if (entityTypeObject && entityTypeObject[sDataPointPath]){
								var oMinMaxParams = entityTypeObject[sDataPointPath];
								if (oMinMaxParams && oMinMaxParams.MaximumValue && oMinMaxParams.MaximumValue.Decimal &&
										oMinMaxParams.MinimumValue && oMinMaxParams.MinimumValue.Decimal){      
									aChartScales.push({
										feed : "valueAxis2",
										max: oMinMaxParams.MaximumValue.Decimal,
										min:oMinMaxParams.MinimumValue.Decimal
									});   
									//bConsiderAnnotationScales = true;
								}else {
									jQuery.sap.log.error(self.errorMessages.ERROR_MISSING_AXISSCALES);
								}
							}

						}
						chart.setVizScales(aChartScales);
						break;
					default:
						break;
					}
				}
			}
			var chartProps = oCardsModel.getProperty('/ChartProperties');
			if (config.hasOwnProperty('vizProperties')) {
				var defaultConfigs = config.vizProperties;
				for (var i = 0; i < defaultConfigs.length; i++) {
					if (chartProps && defaultConfigs[i].hasOwnProperty('path')) {
						var chartPropsValue = getOrSetNestedProperty(chartProps, defaultConfigs[i].path);
						if (undefined !== chartPropsValue) {
							getOrSetNestedProperty(oVizProperties, defaultConfigs[i].path, chartPropsValue);
						}
					}
				}
			}

//            this.checkRolesForProperty(aQueuedDimensions, config, "dimension");
//				this.checkRolesForProperty(aQueuedMeasures, config, "measure");
			chart.setVizProperties(oVizProperties);
		}
		/*
		 * Check if given number of dimensions, measures
		 * are valid acc to config's min and max requirements
		 */
		[config.dimensions, config.measures].forEach(function(entry, i) {
			var oProperty = i ? aMeasures : aDimensions;
			var typeCue = i ? "measure(s)" : "dimension(s)";
			if (entry.min && oProperty.length < entry.min) {
				jQuery.sap.log.error(self.errorMessages.CARD_ERROR + "in " + chartType +
					" " + self.errorMessages.CARD_LEAST + entry.min + " " + typeCue);
				bErrors = true;
			}
			if (entry.max && oProperty.length > entry.max) {
				jQuery.sap.log.error(self.errorMessages.CARD_ERROR + "in " + chartType +
						self.errorMessages.CARD_MOST + entry.max + " " + typeCue);
				bErrors = true;
			}
		});

		if (bErrors) {
			return;
		}
		
		sap.ovp.cards.charts.SmartAnnotationManager.setSmartFormattedChartTitle(measureArr,dimensionArr,smartChart);
		
		if (smartChart) {
			if (smartChart._headerText ) {
				//smartChart._headerText.setMaxLines(1);
				smartChart._headerText.setTooltip(smartChart.getHeader());
				smartChart._headerText.addStyleClass("ovpChartTitle");
			}
			//smartChart.setHeader(headerTitle);
			/*smartChart._refreshHeaderText();
			var toolbar = smartChart.getToolbar();
			if (toolbar) {
				toolbar.addStyleClass("smartChartToolBar");
			}
			if (smartChart._oDetailsButton) {
				smartChart._oDetailsButton.addStyleClass("smartDetailsButton");
			}*/
		}

	};
	
	sap.ovp.cards.charts.SmartAnnotationManager.setFormattedChartTitle  = function(measureArr,dimensionArr,chartTitle) {
		var txt = "", measureStr = "", dimensionStr = "";
		if (chartTitle) {
			txt = chartTitle.getText();
		}
		
		if (measureArr && (measureArr.length > 1)) {
			for (var i = 0; i < measureArr.length - 1; i++) {
				if (measureStr != "") {
					measureStr += ", ";
				}
				measureStr += measureArr[i];
			}
			measureStr = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("MEAS_DIM_TITLE",[measureStr, measureArr[i]]);
		} else if (measureArr) {
			measureStr = measureArr[0];
		}
		
		if (dimensionArr && (dimensionArr.length > 1) ) {
			for (var i = 0; i < dimensionArr.length - 1; i++) {
				if (dimensionStr != "") {
					dimensionStr += ", ";
				}
				dimensionStr += dimensionArr[i];
			}
			dimensionStr = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("MEAS_DIM_TITLE",[dimensionStr, dimensionArr[i]]);
		} else if (dimensionArr) {
			dimensionStr = dimensionArr[0];
		}
		
		if (chartTitle && (txt == "")) {
			txt = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("NO_CHART_TITLE",[measureStr,dimensionStr]); 
			chartTitle.setText(txt);
			chartTitle.data("aria-label",txt,true);
		}
	};
	
	sap.ovp.cards.charts.SmartAnnotationManager.onDataReceived = function(vizFrame, chartTotal, data) {
		
		var vizData = data ? data.getParameter('data') : null;

		var length = (vizData && vizData.results) ? vizData.results.length : 0;
		var total = vizData ? vizData.__count : 0;
		var totalText = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("Count_Header",[length,total]);
		chartTotal.setText(totalText);
		chartTotal.data("aria-label",totalText,true);
		
	};
	
	sap.ovp.cards.charts.SmartAnnotationManager.setCustomTitle = function(chartTitle, measures, dimensions) {
		var txt = chartTitle ? chartTitle.String : "";
		return txt;
	};
	
/*	sap.ovp.cards.charts.SmartAnnotationManager.setVizScale = function(vizFrame,vizData,chartScaleTitle) {
		var vizProperties = vizFrame.getVizProperties();
		var vizFeeds = vizFrame.getFeeds();
		var dataSet = vizFrame.getDataset();
		var feedObjs = {}, oCardsModel, entityTypeObject, chartAnno, chartContext;
		var self = sap.ovp.cards.charts.SmartAnnotationManager;
		
		if (!(oCardsModel = vizFrame.getModel('ovpCardProperties'))) {
			jQuery.sap.log.error(self.errorMessages.CARD_ERROR + "in " + self.errorMessages.CARD_CONFIG +
					self.errorMessages.NO_CARD_MODEL);
			return;
		}
		//var entitySet = oCardsModel.getProperty("/entitySet");
		
		entityTypeObject = oCardsModel.getProperty("/entityType");
		if (!entityTypeObject) {
			jQuery.sap.log.error(self.errorMessages.CARD_ANNO_ERROR + "in " + self.errorMessages.CARD_ANNO);
			return;
		}

		chartAnno = oCardsModel.getProperty("/chartAnnotationPath");
		if (!chartAnno || !(chartContext = entityTypeObject[chartAnno])) {
			jQuery.sap.log.error(self.errorMessages.CARD_ANNO_ERROR + "in " + self.errorMessages.CARD_ANNO);
			return;
		}
		
		var measureArr = [], dimensionArr = [];
		
		jQuery.each(vizFeeds, function(i,feed) { 
			
			if (feed.getType() === "Dimension") {
				dimensionArr = feed.getValues();
			}
			
			if (feed.getType() === "Measure") {
				measureArr = feed.getValues();
				var propertyArr = [];
				
				feedObjs[feed.getUid()] = {};
				
				//jQuery.each(values, function(i,value) { 
				for (var i in measureArr) {
					jQuery.each(dataSet.getMeasures(), function(j,measure) { 
						if (measure.getName() === measureArr[i]) {
							var val = measure.getBindingInfo("value");
							if (val && val.binding && val.binding.sPath) {
								var property = val.binding.sPath;
								propertyArr.push(property);
								return false;
							}
						}
					});
				}
				//});
				
				if (propertyArr && propertyArr.length > 0) {
					feedObjs[feed.getUid()].measValues = propertyArr;
					feedObjs[feed.getUid()].measNames = measureArr;
					feedObjs[feed.getUid()].dimNames = dimensionArr;
					feedObjs[feed.getUid()].min = null;
					feedObjs[feed.getUid()].max = null;
					feedObjs[feed.getUid()].scale = null;
				}
				
				if (vizData && vizData.results) {
					jQuery.each(vizData.results, function(i,data) {
						jQuery.each(feedObjs[feed.getUid()].measValues, function(i,value) {
							var val = data[value];
							var min = parseFloat(val) >= 0 ? parseFloat(val) : -(parseFloat(val));
							var max = parseFloat(val) >= 0 ? parseFloat(val) : -(parseFloat(val));
							
							if (feedObjs[feed.getUid()].min === null) {
								feedObjs[feed.getUid()].min = min;
							} else if (feedObjs[feed.getUid()].min > min) {
								feedObjs[feed.getUid()].min = min;
							}
							
							if (feedObjs[feed.getUid()].max === null) {
								feedObjs[feed.getUid()].max = max;
							} else if (feedObjs[feed.getUid()].max < max) {
								feedObjs[feed.getUid()].max = max;
							}
						});
					});
				}
			
				
				var K = 3;
				var M = 6;
				var B = 9;
				var T = 12;
				var Q = 15;
				var scale = 0;
				var vizObj = vizProperties ? vizProperties[feed.getUid()] : null;
				
				if (feedObjs[feed.getUid()] && feedObjs[feed.getUid()].max) {
					var max = (parseInt(feedObjs[feed.getUid()].max,10)).toString();
					if (feedObjs[feed.getUid()].min < 1000 && feedObjs[feed.getUid()].max < 1000) {
						scale = 0;
					} else if (max.length - 1 >= K && max.length - 1 < M) {
						scale = Math.pow(10,K);
					} else if (max.length - 1 >= M && max.length - 1 < B) {
						scale = Math.pow(10,M);
					} else if (max.length - 1 >= B && max.length - 1 < T) {
						scale = Math.pow(10,B);
					} else if (max.length - 1 >= T && max.length - 1 < Q) {
						scale = Math.pow(10,T);
					} else if (max.length - 1 >= Q) {
						scale = Math.pow(10,Q);
					}
					
					if (vizObj && vizObj.label && vizObj.label.formatString) {
						var patternArr = "";
						if (vizObj.label.formatString) {
							patternArr = vizObj.label.formatString.split('/');
							patternArr.splice(-1,1);
							patternArr = patternArr.join("/");
						}
						vizObj.label.formatString = patternArr;
						vizObj.label.formatString = vizObj.label.formatString + "/" + scale;
					}
					
					var scaleUnit = sap.ovp.cards.charts.SmartAnnotationManager.getScaleUnit(scale);
					feedObjs[feed.getUid()].scale = scaleUnit;
					
				}
			
			}
		});
		
		vizFrame.setVizProperties(vizProperties);
		
		var txt = chartContext.Title ? chartContext.Title.String : "";
		//chartScaleTitle.setText(txt);
		//sap.ovp.cards.charts.SmartAnnotationManager.setFormattedChartTitle(measureArr,dimensionArr,chartScaleTitle);
		
		sap.ovp.cards.charts.SmartAnnotationManager.setChartScaleTitleNew(vizFrame,vizData,feedObjs,chartScaleTitle, txt);
		
	};*/
	
	sap.ovp.cards.charts.SmartAnnotationManager.setChartScaleTitleNew = function(vizFrame,vizData,feedObjs,chartTitle,txt) {
		var oCardsModel, entityTypeObject, chartAnno, chartContext;
		var aMeasures;
		var self = sap.ovp.cards.charts.SmartAnnotationManager;
		var unitKey = self.constants.UNIT_KEY;
		var unitKey_v4_isoCurrency = self.constants.UNIT_KEY_V4_ISOCurrency; //as part of supporting V4 annotation
		var unitKey_v4_unit = self.constants.UNIT_KEY_V4_Unit; //as part of supporting V4 annotation

		//var self = sap.ovp.cards.charts.SmartAnnotationManager;

		if (vizFrame.getVizType() === 'donut') {
			return;
		}
		
		if (!(oCardsModel = vizFrame.getModel('ovpCardProperties'))) {
			jQuery.sap.log.error(self.errorMessages.CARD_ERROR + "in " + self.errorMessages.CARD_CONFIG +
					self.errorMessages.NO_CARD_MODEL);
			return;
		}
		
		var dataModel = vizFrame.getModel();
		var entitySet = oCardsModel.getProperty("/entitySet");
		if (!dataModel || !entitySet) {
			return;
		}
		entityTypeObject = oCardsModel.getProperty("/entityType");
		if (!entityTypeObject) {
			jQuery.sap.log.error(self.errorMessages.CARD_ANNO_ERROR + "in " + self.errorMessages.CARD_ANNO);
			return;
		}
		var oMetadata = self.getMetadata(dataModel, entitySet);
		chartAnno = oCardsModel.getProperty("/chartAnnotationPath");
		if (!chartAnno || !(chartContext = entityTypeObject[chartAnno])) {
			jQuery.sap.log.error(self.errorMessages.CARD_ANNO_ERROR + "in " + self.errorMessages.CARD_ANNO);
			return;
		}
		
		if (!(aMeasures = chartContext.MeasureAttributes) ||
				!aMeasures.length) {
			jQuery.sap.log.error(self.errorMessages.CHART_ANNO_ERROR + "in " + self.errorMessages.CHART_ANNO + " " +
					self.errorMessages.MEASURES_MANDATORY);
			return;
		}
		
		var result = vizData ? vizData.results : null;
		var property, unitType = "", unitArr = [];
		var isUnitSame = true;
		var isScaleSame = true;
		var feedMeasures = [];
		
		var feeds = vizFrame.getFeeds();
		
		jQuery.each(feeds, function(i, feed){
			if (feed.getType() === "Measure") {
				feedMeasures = feedMeasures.concat(feed.getValues());
			}
		});
		
		var scaleUnit = "";
		
		jQuery.each(feedObjs, function(i, feed){
			if (scaleUnit === "") {
				scaleUnit = feed.scale;
			}
			
			if (scaleUnit != feed.scale && ( i != "bubbleWidth")) {
				isScaleSame = false;
				return false;
			}
			
		});
		
		if (result) {
			jQuery.each(aMeasures, function(i, m){
				var feedName = "";
				property = m.Measure.PropertyPath;
				if (oMetadata && oMetadata[property]) {
					if (oMetadata[property][self.constants.LABEL_KEY_V4]) { //as part of supporting V4 annotation
						feedName = oMetadata[property][self.constants.LABEL_KEY_V4].String ? oMetadata[property][self.constants.LABEL_KEY_V4].String : oMetadata[property][self.constants.LABEL_KEY_V4].Path;
					} else if (oMetadata[property][self.constants.LABEL_KEY]) {
						feedName = oMetadata[property][self.constants.LABEL_KEY];
					} else if (property) {
						feedName = property;
					}
				}
				if (jQuery.inArray(feedName, feedMeasures) != -1) {
					if (oMetadata && oMetadata[property]) {
						var unitCode;
						// if (unitCode && oMetadata[unitCode] && oMetadata[currCode][semanticKey] === currencyCode) {
						if (oMetadata[property][unitKey_v4_isoCurrency]) { //as part of supporting V4 annotation
							unitCode = oMetadata[property][unitKey_v4_isoCurrency].Path ? oMetadata[property][unitKey_v4_isoCurrency].Path : oMetadata[property][unitKey_v4_isoCurrency].String;
						} else if (oMetadata[property][unitKey_v4_unit]) {
							unitCode = oMetadata[property][unitKey_v4_unit].Path ? oMetadata[property][unitKey_v4_unit].Path : oMetadata[property][unitKey_v4_unit].String;
						} else if (oMetadata[property][unitKey]) {
							unitCode = oMetadata[property][unitKey];
						}
						if (unitCode && oMetadata[unitCode] ) {
							for (var i = 0; i < result.length; i++) {
								var objData = result[i];
								if (isUnitSame){
									if (unitType && objData[unitCode] && (objData[unitCode] != "" ) && (unitType != "") && (unitType != objData[unitCode]) ) {
										isUnitSame = false;
									}
								}
								unitType = objData[unitCode];
								if (unitType && unitType != "" ) {
									var unitObj = {};
									unitObj.name = feedName;
									unitObj.value = unitType;
									unitArr.push(unitObj);
									break;
								}
							}
						}
					}
				}
				
			});
		}
		
		var oVizProperties = vizFrame.getVizProperties();
		var chartUnitTitleTxt = chartTitle.data("chartTitle"); //chartTitle.getText();
		
		if (isUnitSame && isScaleSame) {
			if (isNaN(Number(scaleUnit)) && scaleUnit != undefined) {
				if (unitType != "") {
					chartUnitTitleTxt = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("IN",[chartUnitTitleTxt,scaleUnit,unitType]);
				} else {
					chartUnitTitleTxt = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("IN_NO_SCALE",[chartUnitTitleTxt,scaleUnit]);
				}
			} else if (unitType != "") {
				chartUnitTitleTxt = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("IN_NO_SCALE",[chartUnitTitleTxt,unitType]);
			}
			if (chartTitle) {
				chartTitle.setText(chartUnitTitleTxt);
				chartTitle.data("aria-label",chartUnitTitleTxt,true);
			}
//			jQuery.each(oVizProperties, function(i, vizProps) {
//				var prop = i;
//				jQuery.each(feedObjs, function(j, feed){
//					if (prop === j) {
//						if (vizProps && vizProps.title) {
//							//var axisTitle = vizProps.title.text;
//							var axisTitle = feed.measNames.join(" & ");
//									
//							vizProps.title = {
//									text:axisTitle
//							};
//						}
//					}
//				});
//			});
			vizFrame.setVizProperties(oVizProperties);
		} else if (!isUnitSame || !isScaleSame) {
			jQuery.each(oVizProperties, function(i, vizProps) {
				var prop = i;
				jQuery.each(feedObjs, function(j, feed){
					if (prop === j) {
						if (vizProps && vizProps.title) {
							//var axisTitle = vizProps.title.text;
							var axisTitle = feed.measNames.join(" & ");
							for (var i = 0; i < unitArr.length; i++) {
								if (unitArr[i].name === axisTitle ) {
									var axisStr = "";
									if (isNaN(Number(feed.scale)) && feed.scale != undefined) {
										if (unitType != "") {
											axisStr = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("AXES_TITLE",[axisTitle,feed.scale,unitArr[i].value]);
										} else {
											axisStr = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("AXES_TITLE_NO_SCALE",[feed.scale]);
										}
									} else if (unitType != "") {
										axisStr = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("AXES_TITLE_NO_SCALE",[axisTitle,unitArr[i].value]);
									}
									
									vizProps.title = {
											text:axisStr
									};
								}
							}
						}
					}
				});
			});
			vizFrame.setVizProperties(oVizProperties);
		} 
	};
	
	sap.ovp.cards.charts.SmartAnnotationManager.getSapLabel = function(aMeasure, oMetadata) {
		var value;
		jQuery.each(oMetadata, function(i,v) {
			if (v.name == aMeasure) {
				if (v["com.sap.vocabularies.Common.v1.Label"]) { //as part of supporting V4 annotation
					value = v["com.sap.vocabularies.Common.v1.Label"].String ? v["com.sap.vocabularies.Common.v1.Label"].String : v["com.sap.vocabularies.Common.v1.Label"].Path;
				} else if (v["sap:label"]) {
					value = v["sap:label"];
				}
				return false;
			}
		});
		return value;
	};
	
	sap.ovp.cards.charts.SmartAnnotationManager.formatByType = function(oMetadata, sProp, sVal) {
		var self = sap.ovp.cards.charts.SmartAnnotationManager;
		var typeKey = self.constants.TYPE_KEY;
		if (!oMetadata || !oMetadata[sProp] || !oMetadata[sProp][typeKey]) {
			return sVal;
		}
		var aNumberTypes = [
			"Edm.Int",
			"Edmt.Int16",
			"Edm.Int32",
			"Edm.Int64",
			"Edm.Decimal"
		];
		var currentType = oMetadata[sProp][typeKey];
		if (jQuery.inArray(currentType, aNumberTypes) !== -1){
			return Number(sVal);
		}
		return sVal;
	};

	/*
	 * Method to calculate the initial items mentioned in presentation annotation and data step
	 * @method getMaxItems
	 * @param {Object} oSmartChart - smart chart object
	 * @return {Object} object - object containing maxitems and data step
	 */
	sap.ovp.cards.charts.SmartAnnotationManager.getMaxItems = function (oSmartChart) {
		var oCardsModel = oSmartChart.getModel('ovpCardProperties'),
		entityTypeObject = oCardsModel.getProperty("/entityType"),
		presentationAnno = oCardsModel.getProperty("/presentationAnnotationPath"),
		presentationContext = entityTypeObject.hasOwnProperty(presentationAnno) && entityTypeObject[presentationAnno],
		maxItemTerm = presentationContext && presentationContext.MaxItems;
		//var entitySet = oCardsModel.getProperty("/entitySet");
		if (maxItemTerm) {
			return {
				itemsLength: +(maxItemTerm.Int32 ? maxItemTerm.Int32 : maxItemTerm.Int),
				dataStep: +oCardsModel.getProperty("/dataStep")
			};
		}
	};
	
	sap.ovp.cards.charts.SmartAnnotationManager.attachDataReceived = function (oSmartChart, oContext) {
		oSmartChart.attachDataReceived(function (oEvent) {

			var self = sap.ovp.cards.charts.SmartAnnotationManager;
			//var chartTitle = oContext.getView().byId("ovpCT1");
			var chartTitle = oSmartChart.getHeader();
			var vizFrame = oSmartChart._getVizFrame();
			//To set the bubble width text after the data is received
			var bubbleText = oContext.getView().byId("bubbleText");
			var bubbleSizeText = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("BUBBLESIZE");
			if (vizFrame) {
				if (bubbleText != undefined) {
					var feeds = vizFrame.getFeeds();
					jQuery.each(feeds,function(i,v){
						if (feeds[i].getUid() == "bubbleWidth") {
							var entitySetName = oContext.getEntitySet() && oContext.getEntitySet().name;
							var dataModel = vizFrame.getModel();
							var oMetadata = self.getMetadata(dataModel, entitySetName);
							var feedName = feeds[i].getValues() && feeds[i].getValues()[0] && feeds[i].getValues()[0].getName();
							var bubbleSizeValue = self.getSapLabel(feedName, oMetadata);
							bubbleText.setText(bubbleSizeText + " " + bubbleSizeValue);
						}
					});
				}
			}
			
			sap.ovp.cards.charts.SmartAnnotationManager.buildSmartAttributes(oSmartChart, chartTitle);
			
		});
	};
		
	
}());
