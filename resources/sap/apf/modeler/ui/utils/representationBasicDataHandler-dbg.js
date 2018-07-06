/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define([
	"sap/apf/modeler/ui/utils/constants"
], function(modelerUiConstants){
	'use strict';
	var oPropertyTypes = modelerUiConstants.propertyTypes;
	var RepresentationBasicDataHandler = function(oRepresentationView, oStepPropertyMetadataHandler, oRepresentationHandler, oViewValidator) {
		this.oRepresentationView = oRepresentationView;
		this.oRepresentation = oRepresentationHandler.oRepresentation;
		this.oStepPropertyMetadataHandler = oStepPropertyMetadataHandler;
		this.oRepresentationTypeHandler = oRepresentationHandler.oRepresentationTypeHandler;
		this.oRepresentationHandler = oRepresentationHandler;
		this.nCounter = 0;
		this.oViewValidator = oViewValidator;
		this.propertyTypeHandlerPromises = [];
	};
	function _prepareCommonView(oRepresentationBasicDataHandler, sPropertyType, aPropertiesToBeCreated) {
		var oView, oViewData = {}, oViewDataForPropertyType = {};
		if (aPropertiesToBeCreated.length === 0) {
			return;
		}
		oViewDataForPropertyType.oConfigurationEditor = oRepresentationBasicDataHandler.oRepresentationView.getViewData().oConfigurationEditor;
		oViewDataForPropertyType.oParentObject = oRepresentationBasicDataHandler.oRepresentation;
		oViewDataForPropertyType.oCoreApi = oRepresentationBasicDataHandler.oRepresentationView.getViewData().oCoreApi;
		oViewDataForPropertyType.oConfigurationHandler = oRepresentationBasicDataHandler.oRepresentationView.getViewData().oConfigurationHandler;
		oViewDataForPropertyType.oRepresentationTypeHandler = oRepresentationBasicDataHandler.oRepresentationTypeHandler;
		oViewDataForPropertyType.oRepresentationHandler = oRepresentationBasicDataHandler.oRepresentationHandler;
		oViewDataForPropertyType.oStepPropertyMetadataHandler = oRepresentationBasicDataHandler.oStepPropertyMetadataHandler;
		oViewDataForPropertyType.sPropertyType = sPropertyType;
		oViewDataForPropertyType.oBasicDataLayout = oRepresentationBasicDataHandler.oRepresentationView.getController().byId("idBasicDataLayout");
		oViewDataForPropertyType.oTextPool = oRepresentationBasicDataHandler.oRepresentationView.getViewData().oConfigurationHandler.getTextPool();
		oViewDataForPropertyType.oViewValidator = oRepresentationBasicDataHandler.oViewValidator;
		oViewData.oViewDataForPropertyType = oViewDataForPropertyType;
		oViewData.aPropertiesToBeCreated = aPropertiesToBeCreated;
		oView = new sap.ui.view({
			viewName : "sap.apf.modeler.ui.view.propertyTypeHandler",
			type : sap.ui.core.mvc.ViewType.XML,
			id : oRepresentationBasicDataHandler.oRepresentationView.getController().createId("id" + sPropertyType),
			viewData : oViewData
		});
		oRepresentationBasicDataHandler.oRepresentationView.getController().byId("idBasicDataLayout").insertItem(oView, oRepresentationBasicDataHandler.nCounter);
		oRepresentationBasicDataHandler.nCounter++;
		oRepresentationBasicDataHandler.oRepresentationView.attachEvent(modelerUiConstants.events.REMOVEALLPROPERTIESFROMPARENTOBJECT, oView.getController().handleRemoveOfProperty.bind(oView.getController()));
		oRepresentationBasicDataHandler.propertyTypeHandlerPromises.push(oView.getController().initPromise);
	}
	function _instantiateDimensionView(oRepresentationBasicDataHandler) {
		_prepareCommonView(oRepresentationBasicDataHandler, oPropertyTypes.DIMENSION, oRepresentationBasicDataHandler.oRepresentationHandler.getActualDimensions());
	}
	function _instantiateLegendView(oRepresentationBasicDataHandler) {
		_prepareCommonView(oRepresentationBasicDataHandler, oPropertyTypes.LEGEND, oRepresentationBasicDataHandler.oRepresentationHandler.getActualLegends());
	}
	function _instantiateMeasureView(oRepresentationBasicDataHandler) {
		_prepareCommonView(oRepresentationBasicDataHandler, oPropertyTypes.MEASURE, oRepresentationBasicDataHandler.oRepresentationHandler.getActualMeasures());
	}
	function _instantiatePropertyView(oRepresentationBasicDataHandler) {
		_prepareCommonView(oRepresentationBasicDataHandler, oPropertyTypes.PROPERTY, oRepresentationBasicDataHandler.oRepresentationHandler.getActualProperties());
	}
	function _instantiateHierarchicalPropertyView(oRepresentationBasicDataHandler) {
		_prepareCommonView(oRepresentationBasicDataHandler, oPropertyTypes.HIERARCHIALCOLUMN, oRepresentationBasicDataHandler.oRepresentationHandler.getHierarchicalProperty());
	}
	RepresentationBasicDataHandler.prototype.instantiateBasicDataAsPromise = function() {
		this.destroyBasicData();
		if (this.oRepresentation.getRepresentationType() === "TreeTableRepresentation") {
			_instantiateHierarchicalPropertyView(this);
			_instantiatePropertyView(this);
		} else if (this.oRepresentation.getRepresentationType() === "TableRepresentation" ) {
			_instantiatePropertyView(this);
		} else {
			_instantiateDimensionView(this);
			_instantiateLegendView(this);
			_instantiateMeasureView(this);
		}
		return jQuery.when.apply(jQuery, this.propertyTypeHandlerPromises);
	};
	RepresentationBasicDataHandler.prototype.destroyBasicData = function() {
		this.oViewValidator.clearFields();
		this.nCounter = 0;
		this.oRepresentationView.getController().byId("idBasicDataLayout").destroyItems();
	};
	return RepresentationBasicDataHandler;
});