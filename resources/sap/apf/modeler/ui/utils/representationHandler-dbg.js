/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(function(){
	'use strict';
	var representationHandler = function(oRepresentation, oRepresentationTypeHandler, oTextReader) {
		this.oRepresentation = oRepresentation;
		this.oRepresentationTypeHandler = oRepresentationTypeHandler;
		this.oTextReader = oTextReader;
	};
	function getKindDefinition(aKindDefinitions, sKind){
		var oKindDefinition;
		aKindDefinitions.forEach(function(oKind){
			if(oKind.kind === sKind){
				oKindDefinition = oKind;
			}
		});
		return oKindDefinition;
	}
	function _formPropertiesToBeCreated(aAggregationRoleKinds, aSupportedPropertiesKinds, aAllProperties, sMethodNametoFetchKind, sDefaultPropertyValue) {
		var aPropertiesToBeCreated = [], bKindSet;
		aSupportedPropertiesKinds.forEach(function(sKind) {
			var oKindDefinition = getKindDefinition(aAggregationRoleKinds, sKind);
			var numberOfMandatoryFields = oKindDefinition.min;
			bKindSet = false;
			aAllProperties.forEach(function(sProperty) {
				if (sMethodNametoFetchKind === undefined || (sMethodNametoFetchKind && sMethodNametoFetchKind(sProperty) === sKind)) {
					bKindSet = true;
					aPropertiesToBeCreated.push({
						sProperty : sProperty,
						sContext : sKind,
						bMandatory : numberOfMandatoryFields > 0 ? true : false
					});
					numberOfMandatoryFields--;
				}
			});
			if (!bKindSet) {
				aPropertiesToBeCreated.push({
					sProperty : sDefaultPropertyValue,
					sContext : sKind,
					bMandatory : numberOfMandatoryFields > 0 ? true : false
				});
			}
		});
		return aPropertiesToBeCreated;
	}
	function _findRepresentation(aRepTypes, sRepTypeId){
		var result;
		aRepTypes.forEach(function(repType){
			if (repType["id"] === sRepTypeId){
				result = repType;
			}
		});
		return result;
	}
	representationHandler.prototype.getActualDimensions = function() {
		var sRepresentationType = this.oRepresentation.getRepresentationType();
		var oRepresentationType = _findRepresentation(this.oRepresentationTypeHandler.aRepresentationTypes, sRepresentationType);
		var aAllDimensions = this.oRepresentation.getDimensions();
		var aSupportedDimensionKinds = this.oRepresentationTypeHandler.getKindsForDimensionPropertyType(sRepresentationType);
		return _formPropertiesToBeCreated(oRepresentationType.metadata.dimensions.supportedKinds, aSupportedDimensionKinds, aAllDimensions, this.oRepresentation.getDimensionKind, "");
	};
	representationHandler.prototype.getActualLegends = function() {
		var sRepresentationType = this.oRepresentation.getRepresentationType();
		var oRepresentationType = _findRepresentation(this.oRepresentationTypeHandler.aRepresentationTypes, sRepresentationType);
		var aAllDimensions = this.oRepresentation.getDimensions();
		var aSupportedLegendKinds = this.oRepresentationTypeHandler.getKindsForLegendPropertyType(sRepresentationType);
		return _formPropertiesToBeCreated(oRepresentationType.metadata.dimensions.supportedKinds, aSupportedLegendKinds, aAllDimensions, this.oRepresentation.getDimensionKind, this.oTextReader("none"));
	};
	representationHandler.prototype.getActualMeasures = function() {
		var sRepresentationType = this.oRepresentation.getRepresentationType();
		var oRepresentationType = _findRepresentation(this.oRepresentationTypeHandler.aRepresentationTypes, sRepresentationType);
		var aAllMeasures = this.oRepresentation.getMeasures();
		var aSupportedMeasureKinds = this.oRepresentationTypeHandler.getKindsForMeasurePropertyType(sRepresentationType);
		return _formPropertiesToBeCreated(oRepresentationType.metadata.measures.supportedKinds, aSupportedMeasureKinds, aAllMeasures, this.oRepresentation.getMeasureKind, "");
	};
	representationHandler.prototype.getActualProperties = function() {
		var sRepresentationType = this.oRepresentation.getRepresentationType();
		var oRepresentationType = _findRepresentation(this.oRepresentationTypeHandler.aRepresentationTypes, sRepresentationType);
		var aAllProperties = this.oRepresentation.getProperties();
		var sPropertyToBeAppended = sRepresentationType === "TreeTableRepresentation" ? this.oTextReader("none") : "";
		var aSupportedPropertyKind = this.oRepresentationTypeHandler.getKindsForPropertyType(sRepresentationType);
		return _formPropertiesToBeCreated(oRepresentationType.metadata.properties.supportedKinds, aSupportedPropertyKind, aAllProperties, this.oRepresentation.getPropertyKind, sPropertyToBeAppended);
	};
	representationHandler.prototype.getHierarchicalProperty = function() {
		var sRepresentationType = this.oRepresentation.getRepresentationType();
		var oRepresentationType = _findRepresentation(this.oRepresentationTypeHandler.aRepresentationTypes, sRepresentationType);
		var aAllProperties = [];
		aAllProperties.push(this.oRepresentation.getHierarchyProperty());
		var aSupportedPropertyKind = this.oRepresentationTypeHandler.getKindsForHierarchicalPropertyType(sRepresentationType);
		return _formPropertiesToBeCreated(oRepresentationType.metadata.hierarchicalColumn.supportedKinds, aSupportedPropertyKind, aAllProperties, undefined, "");
	};
	return representationHandler;
}, true /* GLOBAL_EXPORT*/ );