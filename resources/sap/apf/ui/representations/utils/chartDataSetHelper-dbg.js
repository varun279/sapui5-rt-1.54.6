/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
/* global jQuery, sap */
jQuery.sap.declare("sap.apf.ui.representations.utils.chartDataSetHelper");
jQuery.sap.require("sap.apf.ui.representations.utils.displayOptionHandler");
(function() {
	"use strict";
	sap.apf.ui.representations.utils.ChartDataSetHelper = function(oFormatter, oTimeAxisDateConverter) {
		this.oFormatter = oFormatter;
		this.aDataResponseWithDisplayValue = [];
		this.oDisplayOptionHandler = new sap.apf.ui.representations.utils.DisplayOptionHandler();
		this.oTimeAxisDateConverter = oTimeAxisDateConverter;
		this.oChartDataSet = {};
	};
	sap.apf.ui.representations.utils.ChartDataSetHelper.getFieldNameForOriginalContentOfProperty = function(propertyName) {
		return "original_" + propertyName;
	};
	function _bIsRequiredFilterNotPlottedInChart(aProperties, sRequiredFilter) {
		var aPropertyFieldName = aProperties.map(function(sProperty) {
			return sProperty.fieldName;
		});
		return aPropertyFieldName.indexOf(sRequiredFilter) === -1 ? true : false;
	}
	function _modifyFlattenDataSetParameter(oFlattenDataSet) {
		var aProperties = oFlattenDataSet.dimensions.concat(oFlattenDataSet.measures), sPropertyName;
		aProperties.forEach(function(oProperty) {
			for(sPropertyName in oProperty) {
				if ((sPropertyName !== 'name') && (sPropertyName !== 'value') && (sPropertyName !== 'dataType') && (sPropertyName !== 'displayValue') && (sPropertyName !== 'identity')) {
					delete oProperty[sPropertyName];
				}
			}
		});
	}
	/**
	 * @description  new columns added to the data response based on the display options
	 * @returns modified array of data response
	**/
	function _modifyDataResponseForDisplayOption(oChartDataSetHelperInstance, oParamter, oMetadata, aDataResponse) {
		var aDataResponseWithDisplayValue = jQuery.extend([], true, aDataResponse);
		var sColumnNameToBeCreated, convertedDates = {};
		oChartDataSetHelperInstance.oTimeAxisDateConverter.createPropertyInfo(oParamter.dimensions);
		var aProperties = oParamter.dimensions.concat(oParamter.requiredFilters);
		aProperties.forEach(function(property, nPropertyIndex) {
			var sLabelDisplayOptionForRequiredFilter = oParamter.requiredFilterOptions ? oParamter.requiredFilterOptions.labelDisplayOption : undefined;
			var sLabelDisplayOption = property.labelDisplayOption ? property.labelDisplayOption : sLabelDisplayOptionForRequiredFilter;
			var sPropertyFieldName = property.fieldName ? property.fieldName : property;
			if (sLabelDisplayOption === undefined || sLabelDisplayOption === sap.apf.core.constants.representationMetadata.labelDisplayOptions.TEXT) {
				return aDataResponseWithDisplayValue;
			}
			aDataResponseWithDisplayValue.forEach(function(dataRow, nDataRowIndex) {
				dataRow[sPropertyFieldName] = (dataRow[sPropertyFieldName] === null || dataRow[sPropertyFieldName] === undefined) ? dataRow[sPropertyFieldName] : dataRow[sPropertyFieldName].toString();
				if (sLabelDisplayOption === sap.apf.core.constants.representationMetadata.labelDisplayOptions.KEY) {
					sColumnNameToBeCreated = "formatted_" + sPropertyFieldName;
					if (!aDataResponseWithDisplayValue[nDataRowIndex][sColumnNameToBeCreated]) {
						aDataResponseWithDisplayValue[nDataRowIndex][sColumnNameToBeCreated] = oChartDataSetHelperInstance.oFormatter.getFormattedValue(sPropertyFieldName, aDataResponseWithDisplayValue[nDataRowIndex][sPropertyFieldName]);	
					}
				}
				if (sLabelDisplayOption === sap.apf.core.constants.representationMetadata.labelDisplayOptions.KEY_AND_TEXT) {
					var sPropertyText = oMetadata.getPropertyMetadata(sPropertyFieldName).text;
					sColumnNameToBeCreated = sPropertyFieldName + "_" + sPropertyText;
					var oTextToBeFormatted = {
						text : aDataResponseWithDisplayValue[nDataRowIndex][sPropertyText],
						key : aDataResponseWithDisplayValue[nDataRowIndex][sPropertyFieldName]
					};
					aDataResponseWithDisplayValue[nDataRowIndex][sColumnNameToBeCreated] = oChartDataSetHelperInstance.oFormatter.getFormattedValueForTextProperty(sPropertyFieldName, oTextToBeFormatted);
				}
				if (oChartDataSetHelperInstance.oTimeAxisDateConverter.bIsConversionToDateRequired(property.fieldName, oMetadata)) {
					var originalValue = dataRow[sPropertyFieldName];
					var fieldForOriginalValue = sap.apf.ui.representations.utils.ChartDataSetHelper.getFieldNameForOriginalContentOfProperty(sPropertyFieldName);
					if (dataRow[fieldForOriginalValue]) {
						// conversion already took place this is the case, when
						// data response already has been modified
						convertedDates[originalValue] = dataRow[fieldForOriginalValue];
					} else {
						var convertedValue = sap.apf.utils.convertFiscalYearMonthDayToDateString(originalValue) + "";
						convertedDates[convertedValue] = originalValue;
						dataRow[sPropertyFieldName] = convertedValue;
						dataRow[fieldForOriginalValue] = originalValue;	
					}
				}
			});
		});
		oChartDataSetHelperInstance.oTimeAxisDateConverter.setConvertedDateLookUp(convertedDates);
		return aDataResponseWithDisplayValue;
	}
	sap.apf.ui.representations.utils.ChartDataSetHelper.prototype.constructor = sap.apf.ui.representations.utils.ChartDataSetHelper;
	/**
	 * @param - oApi, oParameter, oMetadata, aDataResponse.
	 * @description Creates dataset needed for charts in the form (name, value pair) of dimensions, measures, context etc. Also calls a method to modify the data response in order to append extra columns which has 
	 * the values based on display option of a property. 
	**/
	sap.apf.ui.representations.utils.ChartDataSetHelper.prototype.createFlattenDataSet = function(oParameter, oMetadata, aDataResponse, oApi) {
		var self = this;
		this.aDataResponseWithDisplayValue = _modifyDataResponseForDisplayOption(this, oParameter, oMetadata, aDataResponse);
		oParameter.dimensions.forEach(function(dimension, index) {
			dimension.name = self.oDisplayOptionHandler.getDisplayNameForDimension(dimension, oMetadata, oApi);
			dimension.value = '{' + dimension.fieldName + '}';
			dimension.identity = dimension.fieldName;
			dimension.displayValue = '{' + self.oDisplayOptionHandler.getColumnNameBasedOnDisplayOption(dimension.fieldName, dimension.labelDisplayOption, oMetadata) + '}';
		});
		oParameter.measures.forEach(function(measure) {
			measure.name = self.oDisplayOptionHandler.getDisplayNameForMeasure(measure, oMetadata, aDataResponse, oApi);
			measure.value = '{' + measure.fieldName + '}';
			measure.identity = measure.fieldName;
		});
		var oChartParameter = {
			dimensions : oParameter.dimensions,
			measures : oParameter.measures
		};
		var sRequiredProperty = oParameter.requiredFilters[0];
		this.oChartDataSet = jQuery.extend(true, {}, oChartParameter);
		_modifyFlattenDataSetParameter(this.oChartDataSet);
		if (sRequiredProperty && _bIsRequiredFilterNotPlottedInChart(oParameter.dimensions, sRequiredProperty)) {
			this.oChartDataSet.context = [ sRequiredProperty ];
			this.oChartDataSet.dimensions.push({
				name : sRequiredProperty,
				value : "{" + sRequiredProperty + "}",
				identity: sRequiredProperty
			});
		}
		this.oChartDataSet.data = {
			path : "/data"
		};
	};
	sap.apf.ui.representations.utils.ChartDataSetHelper.prototype.getFlattenDataSet = function() {
		return new sap.viz.ui5.data.FlattenedDataset(this.oChartDataSet);
	};
	sap.apf.ui.representations.utils.ChartDataSetHelper.prototype.getModel = function() {
		var oModelForChart = new sap.ui.model.json.JSONModel({
			data : this.aDataResponseWithDisplayValue
		});
		return oModelForChart;
	};
}());